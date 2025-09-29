package br.com.ruana.mediaflix.principal;

import br.com.ruana.mediaflix.model.DadosSerie;
import br.com.ruana.mediaflix.model.DadosTemporada;
import br.com.ruana.mediaflix.model.Episodio;
import br.com.ruana.mediaflix.model.Serie;
import br.com.ruana.mediaflix.repository.SerieRepository;
import br.com.ruana.mediaflix.service.ConsumoAPI;
import br.com.ruana.mediaflix.service.ConverteDados;

import java.util.*;
import java.util.stream.Collectors;

public class Principal {

    private Scanner leitura = new Scanner(System.in);
    private ConsumoAPI consumo = new ConsumoAPI();
    private ConverteDados conversor = new ConverteDados();

    private final String ENDERECO = "https://www.omdbapi.com/?t=";
    private final String API_KEY = "&apikey=344cd69c";

    private final List<DadosSerie> dadosSeries = new ArrayList<>();
    private SerieRepository repositorio;
    private List<Serie> series = new ArrayList<>();

    public Principal(SerieRepository repositorio) {
        this.repositorio = repositorio;
    }

    public void menu() {
        var opcao = -1;
        while (opcao != 0) {
            var menu = """
                    1 - Serien suchen (Search series)
                    2 - Episoden suchen (Fetch episodes)
                    3 - Serienliste anzeigen (List saved series)
                    0 - Beenden (Exit)
                    """;
            System.out.println(menu);
            System.out.print("Option wählen (Choose an option): ");
            opcao = leitura.nextInt();
            leitura.nextLine();
            switch (opcao) {
                case 1 -> buscarSerieWeb();
                case 2 -> buscarEpisodioPorSerie();
                case 3 -> listarSeriesBuscadas();
                case 0 -> System.out.println("Beenden... (Exiting...)");
                default -> System.out.println("Ungültige Option (Invalid option)");
            }
        }
    }

    private void buscarSerieWeb() {
        var dados = getDadosSerie();
        if (dados == null) return;
        var serie = new Serie(dados);
        repositorio.save(serie);
        System.out.println("Gespeichert (Saved):");
        System.out.println(serie);
    }

    @org.jetbrains.annotations.Nullable
    private DadosSerie getDadosSerie() {
        System.out.print("Serienname eingeben (Enter series name): ");
        var nomeSerie = leitura.nextLine();
        var json = consumo.obterDados(ENDERECO + nomeSerie.replace(" ", "+") + API_KEY);
        if (json == null || json.isBlank()) {
            System.out.println("Keine Daten gefunden (No data found).");
            return null;
        }
        return conversor.obterDados(json, DadosSerie.class);
    }

    private void buscarEpisodioPorSerie() {
        // lädt die Liste aus der DB (load list from DB)
        series = repositorio.findAll();

        System.out.print("Wählen Sie eine Serie nach Name (Choose a series by name): ");
        var nomeSerie = leitura.nextLine();

        // versucht zuerst via Repo (tries repository first)
        var serieOpt = repositorio.findByTituloContainingIgnoreCase(nomeSerie);

        Optional<Serie> serie = serieOpt.isPresent()
                ? serieOpt
                : series.stream()
                .filter(s -> s.getTitulo().toLowerCase().contains(nomeSerie.toLowerCase()))
                .findFirst();

        if (serie.isPresent()) {
            var serieEncontrada = serie.get();
            List<DadosTemporada> temporadas = new ArrayList<>();

            for (int i = 1; i <= serieEncontrada.getTotalTemporadas(); i++) {
                var json = consumo.obterDados(
                        ENDERECO + serieEncontrada.getTitulo().replace(" ", "+") + "&season=" + i + API_KEY
                );
                var dadosTemporada = conversor.obterDados(json, DadosTemporada.class);
                temporadas.add(dadosTemporada);
            }
            System.out.println("Gefundene Staffeln (Found seasons):");
            temporadas.forEach(System.out::println);

            List<Episodio> episodios = temporadas.stream()
                    .flatMap(d -> d.episodios().stream()
                            .map(e -> new Episodio(d.numero(), e)))
                    .collect(Collectors.toList());

            // set owner relation
            episodios.forEach(ep -> ep.setSerie(serieEncontrada));

            serieEncontrada.setEpisodios(episodios);
            repositorio.save(serieEncontrada);

            System.out.println("Episoden gespeichert für (Episodes saved for): " + serieEncontrada.getTitulo());
        } else {
            System.out.println("Serie nicht gefunden (Series not found).");
        }
    }

    private void listarSeriesBuscadas() {
        series = repositorio.findAll();
        if (series.isEmpty()) {
            System.out.println("Keine gespeicherten Serien (No saved series).");
            return;
        }
        System.out.println("Gespeicherte Serien (Saved series):");
        series.stream()
                .sorted(Comparator.comparing(Serie::getGenero))
                .forEach(System.out::println);
    }
}
