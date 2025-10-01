package br.com.ruana.mediaflix.principal;

import br.com.ruana.mediaflix.model.*;
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

    private Optional<Serie> serieBusca;

    public Principal(SerieRepository repositorio) {
        this.repositorio = repositorio;
    }

    public void menu() {
        var opcao = -1;
        while (opcao != 0) {
            var menu = """
                    1 - Serien suchen (Search series)
                    2 - Episoden abrufen (Fetch episodes)
                    3 - Gespeicherte Serien anzeigen (List saved series)
                    4 - Serie nach Titel suchen (Search by title)
                    5 - Nach Schauspieler suchen (Search by actor)
                    6 - Top 5 Serien anzeigen (Top 5 series)
                    7 - Serien nach Kategorie suchen (Search by category)
                    8 - Serien filtern (Filter series)
                    9 - Nach Serien per Episodentext suchen (Search series by episode snippet)
                    10 - Top-Episoden pro Serie (Top episodes per series)
                    11 - Episoden nach Veröffentlichungsjahr filtern (Episodes after a given year)
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
                case 4 -> buscarSeriePorTitulo();
                case 5 -> buscarSeriePorAtor();
                case 6 -> buscarTop5Series();
                case 7 -> buscarSeriesPorCategoria();
                case 8 -> filtrarSeriesPorTemporadaEAvaliacao();
                case 9 -> ProcurarSerieportrecho();
                case 10 -> TopEpisodiosPorSerie();
                case 11 -> buscarEpisodiosDepoisDeUmaData();
                case 0 -> System.out.println("Beenden... (Exiting...)");
                default -> System.out.println("Ungültige Option (Invalid option).");
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
        series = repositorio.findAll();

        System.out.print("Serie nach Namen auswählen (Choose a series by name): ");
        var nomeSerie = leitura.nextLine();

        Optional<Serie> serie = repositorio.findByTituloContainingIgnoreCase(nomeSerie);

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

    private void buscarSeriePorTitulo() {
        System.out.print("Serientitel eingeben (Enter the series title): ");
        var nomeSerie = leitura.nextLine();

        serieBusca = repositorio.findByTituloContainingIgnoreCase(nomeSerie);

        if (serieBusca.isPresent()) {
            System.out.println("Seriendaten (Series data): " + serieBusca.get());
        } else {
            System.out.println("Serie nicht gefunden (Series not found).");
        }
    }

    private void buscarSeriePorAtor() {
        System.out.print("Schauspielername eingeben (Enter actor name): ");
        var nomeAtor = leitura.nextLine();
        System.out.print("Bewertung ab welchem Wert? (Minimum rating?): ");
        var avaliacao = leitura.nextDouble();
        leitura.nextLine(); // limpa o \n

        List<Serie> serieEncontradas = repositorio
                .findByAtoresContainingIgnoreCaseAndAvaliacaoGreaterThanEqual(nomeAtor, avaliacao);

        System.out.println("Serien mit " + nomeAtor + " (Series featuring " + nomeAtor + "):");
        serieEncontradas.forEach(s ->
                System.out.println(s.getTitulo() + " - Bewertung/Rating: " + s.getAvaliacao()));
    }

    private void buscarTop5Series() {
        List<Serie> seriesTop = repositorio.findTop5ByOrderByAvaliacaoDesc();
        System.out.println("Top 5 Serien (Top 5 series):");
        seriesTop.forEach(s ->
                System.out.println(s.getTitulo() + " - Bewertung/Rating: " + s.getAvaliacao()));
    }

    private void buscarSeriesPorCategoria() {
        System.out.print("Welche Kategorie/Gattung? (Which category/genre?): ");
        var nomeGenero = leitura.nextLine();
        Categoria categoria = Categoria.fromPortugues(nomeGenero);
        List<Serie> seriesPorCategoria = repositorio.findByGenero(categoria);
        System.out.println("Serien der Kategorie " + nomeGenero + " (Series in category " + nomeGenero + "):");
        seriesPorCategoria.forEach(System.out::println);
    }

    private void filtrarSeriesPorTemporadaEAvaliacao() {
        System.out.print("Filtern bis zu wie vielen Staffeln? (Filter up to how many seasons?): ");
        var totalTemporadas = leitura.nextInt();
        leitura.nextLine();
        System.out.print("Mit Bewertung ab welchem Wert? (Minimum rating?): ");
        var avaliacao = leitura.nextDouble();
        leitura.nextLine();

        List<Serie> filtroSeries = repositorio.seriesPorTemporadaEAValiacao(totalTemporadas, avaliacao);
        System.out.println("*** Gefilterte Serien (Filtered series) ***");
        filtroSeries.forEach(s ->
                System.out.println(s.getTitulo() + " - Bewertung/Rating: " + s.getAvaliacao()));
    }

    private void ProcurarSerieportrecho() {
        System.out.print("Episoden-Text/Snippet eingeben (Enter episode snippet): ");
        var trechoEpisodio = leitura.nextLine();
        List<Episodio> episodiosEncontrados = repositorio.episodioPorTrecho(trechoEpisodio);
        episodiosEncontrados.forEach(e ->
                System.out.printf("Serie/Series: %s | Staffel/Season %s | Episode %s | Titel/Title: %s%n",
                        e.getSerie().getTitulo(), e.getTemporada(),
                        e.getNumeroEpisodio(), e.getTitulo()));
    }

    private void TopEpisodiosPorSerie() {
        buscarSeriePorTitulo();
        if (serieBusca.isPresent()) {
            Serie serie = serieBusca.get();
            List<Episodio> topEpisodio = repositorio.topEpisodiosPorSerie(serie);
            topEpisodio.forEach(e ->
                    System.out.printf("Serie/Series: %s | Staffel/Season %s | Episode %s | Titel/Title: %s | Bewertung/Rating: %s%n",
                            e.getSerie().getTitulo(), e.getTemporada(),
                            e.getNumeroEpisodio(), e.getTitulo(), e.getAvaliacao()));
        }
    }

    private void buscarEpisodiosDepoisDeUmaData() {
        buscarSeriePorTitulo();
        if (serieBusca.isPresent()) {
            Serie serie = serieBusca.get();
            System.out.print("Grenzjahr eingeben (Enter cutoff year): ");
            var anoDeLancamento = leitura.nextInt();
            leitura.nextLine();

            List<Episodio> episodiosAno = repositorio.episodiosPorSerieEAno(serie, anoDeLancamento);
            System.out.println("Episoden nach " + anoDeLancamento + " (Episodes after " + anoDeLancamento + "):");
            episodiosAno.forEach(System.out::println);
        }
    }
}
