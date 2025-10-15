package br.com.ruana.mediaflix.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DadosTemporada(@JsonAlias("Season") String numero,
                             @JsonAlias("Episodes")List<DadosEpisodios> episodios) {

    public Integer numeroComoInteiro() {
        if (numero == null) {
            return null;
        }

        var temporada = numero.trim();
        if (temporada.isEmpty() || "N/A".equalsIgnoreCase(temporada)) {
            return null;
        }

        try {
            return Integer.valueOf(temporada);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
