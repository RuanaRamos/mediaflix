package br.com.ruana.mediaflix.principal;

import br.com.ruana.mediaflix.model.DadosSerie;
import br.com.ruana.mediaflix.model.DadosTemporada;
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

    public Principal(SerieRepository repositorio) {
        this.repositorio = repositorio;
    }

    public void menu() {
        var opcao = -1;
        while (opcao != 0) {

            var menu = """
                    1 - Serien suchen
                    2 - Episoden suchen
                    3 - Serienliste anzeigen
                    0 - Beenden
                    """;

            System.out.println(menu);
            opcao = leitura.nextInt();
            leitura.nextLine();
            switch (opcao) {
                case 1:
                    buscarSerieWeb();
                    break;
                case 2:
                    buscarEpisodioPorSerie();
                    break;
                case 3:
                    listarSeriesBuscadas();
                    break;
                case 0:
                    System.out.println("Beenden...");
                    break;
                default:
                    System.out.println("Ungültige Option");
            }
        }
    }

    private void buscarSerieWeb() {
        var dados = getDadosSerie();
        if (dados == null) return;
        var serie = new Serie(dados);
        repositorio.save(serie);
        System.out.println(serie);
    }

    @org.jetbrains.annotations.Nullable
    private DadosSerie getDadosSerie() {
        System.out.print("Geben Sie den Seriennamen für die Suche ein: ");
        var nomeSerie = leitura.nextLine();
        var json = consumo.obterDados(ENDERECO + nomeSerie.replace(" ", "+") + API_KEY);
        if (json == null || json.isBlank()) return null;
        return conversor.obterDados(json, DadosSerie.class);
    }

    private void buscarEpisodioPorSerie() {
        DadosSerie dadosSerie = getDadosSerie();
        if (dadosSerie == null) return;
        List<DadosTemporada> temporadas = new ArrayList<>();

        for (int i = 1; i <= dadosSerie.totalTemporadas(); i++) {
            var json = consumo.obterDados(ENDERECO + dadosSerie.titulo().replace(" ", "+") + "&season=" + i + API_KEY);
            DadosTemporada dadosTemporada = conversor.obterDados(json, DadosTemporada.class);
            temporadas.add(dadosTemporada);
        }
        temporadas.forEach(System.out::println);
    }

    private void listarSeriesBuscadas() {
        List<Serie> series = repositorio.findAll();
        series.stream()
                .sorted(Comparator.comparing(Serie::getGenero))
                .forEach(System.out::println);
    }
}
