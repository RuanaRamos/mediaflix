package br.com.ruana.mediaflix.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Entity
@Table(name = "episodios")
public class Episodio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer temporada;
    private String titulo;
    private Integer numeroEpisodio;
    private Double avaliacao;
    private LocalDate dataLancamento;

    @ManyToOne
    private Serie serie;

    public Episodio() {}


    public Episodio(Integer numeroTemporada, DadosEpisodios de) {
        this.temporada = (numeroTemporada != null ? numeroTemporada : 1);
        this.titulo = de.titulo();
        this.numeroEpisodio = de.numeroComoInteiro();
        this.avaliacao = parseDoubleSafe(de.avaliacao());
        this.dataLancamento = parseDateSafe(de.dataLancamento());
    }

    private Double parseDoubleSafe(String raw) {
        if (raw == null) return 0.0;
        raw = raw.trim();
        if (raw.isEmpty() || "N/A".equalsIgnoreCase(raw)) return 0.0;
        try { return Double.valueOf(raw); } catch (NumberFormatException e) { return 0.0; }
    }

    private LocalDate parseDateSafe(String raw) {
        if (raw == null) return null;
        raw = raw.trim();
        if (raw.isEmpty() || "N/A".equalsIgnoreCase(raw)) return null;


        try { return LocalDate.parse(raw); }
        catch (DateTimeParseException e1) {
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy")
                        .withLocale(java.util.Locale.ENGLISH);
                return LocalDate.parse(raw, fmt);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Serie getSerie() { return serie; }
    public void setSerie(Serie serie) { this.serie = serie; }

    public Integer getTemporada() { return temporada; }
    public void setTemporada(Integer temporada) { this.temporada = temporada; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Integer getNumeroEpisodio() { return numeroEpisodio; }
    public void setNumeroEpisodio(Integer numeroEpisodio) { this.numeroEpisodio = numeroEpisodio; }

    public Double getAvaliacao() { return avaliacao; }
    public void setAvaliacao(Double avaliacao) { this.avaliacao = avaliacao; }

    public LocalDate getDataLancamento() { return dataLancamento; }
    public void setDataLancamento(LocalDate dataLancamento) { this.dataLancamento = dataLancamento; }

    @Override
    public String toString() {
        return "temporada=" + temporada +
                ", titulo='" + titulo + '\'' +
                ", numeroEpisodio=" + numeroEpisodio +
                ", avaliacao=" + avaliacao +
                ", dataLancamento=" + dataLancamento;
    }
}