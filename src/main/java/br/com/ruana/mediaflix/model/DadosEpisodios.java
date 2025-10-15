package br.com.ruana.mediaflix.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DadosEpisodios(@JsonAlias("Title") String titulo,
                             @JsonAlias("Episode") String numero,
                             @JsonAlias("imdbRating")String avaliacao,
                             @JsonAlias("Released") String dataLancamento) {

    public Integer numeroComoInteiro() {
        if (numero == null) {
            return null;
        }

        var episodio = numero.trim();
        if (episodio.isEmpty() || "N/A".equalsIgnoreCase(episodio)) {
            return null;
        }

        try {
            return Integer.valueOf(episodio);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}

