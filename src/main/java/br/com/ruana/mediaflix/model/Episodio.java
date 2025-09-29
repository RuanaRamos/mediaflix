// src/main/java/br/com/ruana/mediaflix/model/Episodio.java
package br.com.ruana.mediaflix.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "episodios")
public class Episodio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer temporadas;
    private String titulo;
    private Integer numero;
    private Double avaliacao;
    private LocalDate dataDeLanacamento;

    @ManyToOne
    private Serie serie;

    public Episodio() {}

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTemporadas() { return temporadas; }
    public void setTemporadas(Integer temporadas) { this.temporadas = temporadas; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }

    public Double getAvaliacao() { return avaliacao; }
    public void setAvaliacao(Double avaliacao) { this.avaliacao = avaliacao; }

    public LocalDate getDataDeLanacamento() { return dataDeLanacamento; }
    public void setDataDeLanacamento(LocalDate dataDeLanacamento) { this.dataDeLanacamento = dataDeLanacamento; }

    public Serie getSerie() { return serie; }
    public void setSerie(Serie serie) { this.serie = serie; }

    @Override
    public String toString() {
        return "temporadas=" + temporadas +
                ", titulo='" + titulo + '\'' +
                ", numero=" + numero +
                ", avaliacao=" + avaliacao +
                ", dataDeLanacamento=" + dataDeLanacamento;
    }
}
