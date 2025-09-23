package br.com.ruana.mediaflix.repository;

import br.com.ruana.mediaflix.model.Serie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SerieRepository extends JpaRepository<Serie, Long> {
}
