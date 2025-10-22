package br.com.ruana.mediaflix.service;

import br.com.ruana.mediaflix.dto.EpisodioDTO;
import br.com.ruana.mediaflix.dto.SerieDTO;
import br.com.ruana.mediaflix.model.Categoria;
import br.com.ruana.mediaflix.model.DadosEpisodios;
import br.com.ruana.mediaflix.model.DadosTemporada;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Objects;
import br.com.ruana.mediaflix.model.Episodio;
import br.com.ruana.mediaflix.model.Serie;
import br.com.ruana.mediaflix.repository.SerieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SerieService {

    @Autowired
    private SerieRepository repositorio;

    private static final String ENDERECO = "https://www.omdbapi.com/?t=";
    private static final String API_KEY = "&apikey=6585022c";

    private final ConsumoApi consumoApi = new ConsumoApi();
    private final ConverteDados conversor = new ConverteDados();

    public List<SerieDTO> obterTodasAsSeries() {
        return converteDados(repositorio.findAll());
    }

    public List<SerieDTO> obterTop5Series() {
        return converteDados(repositorio.findTop5ByOrderByAvaliacaoDesc());
    }

    private List<SerieDTO> converteDados(List<Serie> series) {
        return series.stream()
                .map(s -> new SerieDTO(s.getId(), s.getTitulo(), s.getTotalTemporadas(), s.getAvaliacao(), s.getGenero(), s.getAtores(), s.getPoster(), s.getSinopse()))
                .collect(Collectors.toList());
    }

    public List<SerieDTO> obterLancamentos() {
        return converteDados(repositorio.lancamentosMaisRecentes(PageRequest.of(0, 5)));
    }

    public SerieDTO obterPorId(Long id) {
        Optional<Serie> serie = repositorio.findById(id);

        if (serie.isPresent()) {
            Serie s = serie.get();
            return new SerieDTO(s.getId(), s.getTitulo(), s.getTotalTemporadas(), s.getAvaliacao(), s.getGenero(), s.getAtores(), s.getPoster(), s.getSinopse());
        }
        return null;
    }

    public List<EpisodioDTO> obterTodasTemporadas(Long id) {
        return repositorio.findById(id)
                .map(Serie::getEpisodios)
                .map(this::converterEpisodios)
                .orElse(Collections.emptyList());
    }

    public List<EpisodioDTO> obterTemporadasPorNumero(Long id, Integer numero) {
        if (id == null || numero == null || numero <= 0) {
            return Collections.emptyList();
        }

        List<Episodio> episodios = repositorio.obterEpisodiosPorTemporada(id, numero);

        if (episodios != null && !episodios.isEmpty()) {
            return converterEpisodios(episodios);
        }

        return repositorio.findById(id)
                .map(serie -> {
                    List<Episodio> novosEpisodios = buscarEpisodiosDaApi(serie, numero);

                    if (!novosEpisodios.isEmpty()) {
                        return converterEpisodios(novosEpisodios);
                    }

                    List<Episodio> episodiosPersistidos = Optional.ofNullable(serie.getEpisodios())
                            .orElse(Collections.emptyList())
                            .stream()
                            .filter(ep -> Objects.equals(ep.getTemporada(), numero))
                            .collect(Collectors.toList());

                    return converterEpisodios(episodiosPersistidos);
                })
                .orElse(Collections.emptyList());
    }

    public List<SerieDTO> obterSeriesPorCategoria(String nomeGenero) {
        Categoria categoria = Categoria.fromPortugues(nomeGenero);
        return converteDados(repositorio.findByGenero(categoria));
    }

    public List<EpisodioDTO> obterTopEpisodios(Long id) {
        return repositorio.findById(id)
                .map(serie -> repositorio.topEpisodiosPorSerie(serie, PageRequest.of(0, 5))
                        .stream()
                        .map(e -> new EpisodioDTO(e.getTemporada(), e.getNumeroEpisodio(), e.getTitulo()))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }
    private List<EpisodioDTO> converterEpisodios(List<Episodio> episodios) {
        if (episodios == null || episodios.isEmpty()) {
            return Collections.emptyList();
        }

        Comparator<Episodio> comparator = Comparator
                .comparing(Episodio::getTemporada, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(Episodio::getNumeroEpisodio, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(Episodio::getTitulo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));

        return episodios.stream()
                .sorted(comparator)
                .map(e -> new EpisodioDTO(e.getTemporada(), e.getNumeroEpisodio(), e.getTitulo()))
                .collect(Collectors.toList());
    }

    private List<Episodio> buscarEpisodiosDaApi(Serie serie, Integer numeroTemporada) {
        if (serie == null || numeroTemporada == null || numeroTemporada <= 0) {
            return Collections.emptyList();
        }

        String tituloCodificado = URLEncoder.encode(serie.getTitulo(), StandardCharsets.UTF_8);
        String url = ENDERECO + tituloCodificado + "&season=" + numeroTemporada + API_KEY;
        String json;
        try {
            json = consumoApi.obterDados(url);
        } catch (RuntimeException ex) {
            return Collections.emptyList();
        }

        DadosTemporada dadosTemporada;
        try {
            dadosTemporada = conversor.obterDados(json, DadosTemporada.class);
        } catch (RuntimeException ex) {
            return Collections.emptyList();
        }

        if (dadosTemporada == null) {
            return Collections.emptyList();
        }

        Integer numeroTemporadaNormalizado = Optional.ofNullable(dadosTemporada.numeroComoInteiro())
                .orElse(numeroTemporada);
        List<DadosEpisodios> dadosEpisodios = Optional.ofNullable(dadosTemporada.episodios())
                .orElse(Collections.emptyList());

        List<Episodio> episodios = new ArrayList<>();

        for (int i = 0; i < dadosEpisodios.size(); i++) {
            DadosEpisodios dadosEpisodio = dadosEpisodios.get(i);
            Episodio episodio = new Episodio(numeroTemporadaNormalizado, dadosEpisodio);
            if (episodio.getNumeroEpisodio() == null) {
                episodio.setNumeroEpisodio(i + 1);
            }
            episodio.setSerie(serie);
            episodios.add(episodio);
        }

        if (episodios.isEmpty()) {
            return Collections.emptyList();
        }

        List<Episodio> episodiosExistentes = Optional.ofNullable(serie.getEpisodios())
                .map(ArrayList::new)
                .orElseGet(ArrayList::new);

        episodiosExistentes.removeIf(ep -> Objects.equals(ep.getTemporada(), numeroTemporadaNormalizado));
        episodiosExistentes.addAll(episodios);
        serie.setEpisodios(episodiosExistentes);
        repositorio.save(serie);

        return repositorio.obterEpisodiosPorTemporada(serie.getId(), numeroTemporadaNormalizado);
    }
}


