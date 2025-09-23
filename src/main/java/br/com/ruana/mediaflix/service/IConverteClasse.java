package br.com.ruana.mediaflix.service;

public interface IConverteClasse {
    <T> T obterDados(String json, Class<T> classe);

}
