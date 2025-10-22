package br.com.ruana.mediaflix.service;

import br.com.ruana.mediaflix.dto.EpisodioDTO;
import br.com.ruana.mediaflix.dto.SerieDTO;
import br.com.ruana.mediaflix.model.Categoria;
import java.util.Comparator;

import br.com.ruana.mediaflix.model.Episodio;
import br.com.ruana.mediaflix.model.Serie;
import br.com.ruana.mediaflix.repository.SerieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SerieService {

    @Autowired
    private SerieRepository repositorio;

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
        return converterEpisodios(repositorio.obterEpisodiosPorTemporada(id, numero));
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
}

