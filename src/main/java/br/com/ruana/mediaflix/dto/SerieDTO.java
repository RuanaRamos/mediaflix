package br.com.ruana.mediaflix.dto;


import br.com.ruana.mediaflix.model.Categoria;

public record SerieDTO(Long id, String titulo,
                       Integer totalTemporadas,
                       Double avaliacao,
                       Categoria genero,
                       String atores,
                       String poster,
                       String sinopse) {
}
