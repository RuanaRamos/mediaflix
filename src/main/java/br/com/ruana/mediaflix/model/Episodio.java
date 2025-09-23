package br.com.ruana.mediaflix.model;


import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class Episodio {
    private Integer temporadas;
    private String titulo;
    private Integer numero;
    private Double avaliacao;
    private LocalDate dataDeLanacamento;
    private List<Serie> episodios = new ArrayList<>();

    public List<Serie> getEpisodios() {
        return episodios;
    }

    public void setEpisodios(List<Serie> episodios) {
        this.episodios = episodios;
    }

    public Episodio(Integer numeroTemporadas, DadosEpisodios dadosEpisodios) {
        this.temporadas = numeroTemporadas;
        this.titulo = dadosEpisodios.titulo();
        this.numero = dadosEpisodios.numero();

        try {
            this.avaliacao = Double.valueOf(dadosEpisodios.avaliacao());
        } catch (NumberFormatException ex){
            this.avaliacao = 0.0;
        }
        try {
            this.dataDeLanacamento = LocalDate.parse(dadosEpisodios.dataDeLanacamento());
        } catch (DateTimeParseException ex) {
            this.dataDeLanacamento = null;
        }
     }


    public Integer getTemporadas() {
        return temporadas;
    }

    public void setTemporadas(Integer temporadas) {
        this.temporadas = temporadas;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Double getAvaliacao() {
        return avaliacao;
    }

    public void setAvaliacao(Double avaliacao) {
        this.avaliacao = avaliacao;
    }

    public LocalDate getDataDeLanacamento() {
        return dataDeLanacamento;
    }

    public void setDataDeLanacamento(LocalDate dataDeLanacamento) {
        this.dataDeLanacamento = dataDeLanacamento;
    }

    @Override
    public String toString() {
        return "temporadas=" + temporadas +
                ", titulo='" + titulo + '\'' +
                ", numero=" + numero +
                ", avaliacao=" + avaliacao +
                ", dataDeLanacamento=" + dataDeLanacamento;
    }


}
