package br.com.ruana.mediaflix.service;

import com.theokanning.openai.completion.CompletionRequest;
import com.theokanning.openai.service.OpenAiService;

public class ConsultaChatGPT {
    public static String obterTraducao(String texto) {
        String key = System.getenv("OPENAI_API_KEY");
        if (key == null || key.isBlank()) return texto;

        OpenAiService service = new OpenAiService(key);

        CompletionRequest requisicao = CompletionRequest.builder()
                .model("gpt-3.5-turbo-instruct")
                .prompt("traduza para o alemao o texto: " + texto)
                .maxTokens(1000)
                .temperature(0.7)
                .build();


        var resposta = service.createCompletion(requisicao);
        return resposta.getChoices().get(0).getText();
    }
}