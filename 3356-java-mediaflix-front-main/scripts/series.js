// detalhe.js
import getDados from "./getDados.js";

const params = new URLSearchParams(window.location.search);
const serieId = params.get("id");

const listaTemporadas  = document.getElementById("temporadas-select");
const fichaSerie       = document.getElementById("temporadas-episodios");
const fichaDescricao   = document.getElementById("ficha-descricao");

// Garante que os elementos existem
function assertEl(el, id) {
  if (!el) throw new Error(`Elemento com id="${id}" não encontrado no HTML`);
}

function option(value, text) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = text;
  return o;
}

// === Carregar temporadas (popular o <select>) ===
async function carregarTemporadas() {
  try {
    const data = await getDados(`/series/${serieId}/temporadas/todas`);
    // data deve ser array com objetos que têm .temporada
    const temporadasUnicas = [...new Set(data.map(t => t.temporada))].sort((a,b)=>a-b);

    listaTemporadas.innerHTML = "";
    listaTemporadas.appendChild(option("", "Selecione a temporada"));
    temporadasUnicas.forEach(temp => listaTemporadas.appendChild(option(String(temp), `Temporada ${temp}`)));
    listaTemporadas.appendChild(option("todas", "Todas as temporadas"));
  } catch (err) {
    console.error("Erro ao obter temporadas:", err);
  }
}

// === Carregar episódios conforme seleção do <select> ===
async function carregarEpisodios() {
  try {
    const valor = listaTemporadas.value;
    const url = (valor === "todas" || valor === "")
      ? `/series/${serieId}/temporadas/todas`
      : `/series/${serieId}/temporadas/${valor}`;

    const data = await getDados(url);
    fichaSerie.innerHTML = "";

    // Se pediu "todas": agrupa por temporada. Se pediu uma: só usa o array.
    const temporadas = (valor === "todas" || valor === "")
      ? [...new Set(data.map(e => e.temporada))].sort((a,b)=>a-b)
      : [...new Set(data.map(e => e.temporada))]; // provavelmente uma só

    temporadas.forEach(temp => {
      const episodios = data.filter(e => e.temporada === temp);

      const tituloTemp = document.createElement("p");
      tituloTemp.textContent = `Temporada ${temp}`;
      const br = document.createElement("br");

      const ul = document.createElement("ul");
      ul.className = "episodios-lista";
      ul.innerHTML = episodios.map(e => `<li>${e.numeroEpisodio} - ${e.titulo}</li>`).join("");

      fichaSerie.appendChild(tituloTemp);
      fichaSerie.appendChild(br);
      fichaSerie.appendChild(ul);
    });
  } catch (err) {
    console.error("Erro ao obter episódios:", err);
  }
}

// === Carregar ficha da série (poster + texto) ===
async function carregarInfoSerie() {
  try {
    const data = await getDados(`/series/${serieId}`);
    fichaDescricao.innerHTML = `
      <img src="${data.poster}" alt="${data.titulo}" />
      <div>
        <h2>${data.titulo}</h2>
        <div class="descricao-texto">
          <p><b>Média de avaliações:</b> ${data.avaliacao ?? "-"}</p>
          <p>${data.sinopse ?? ""}</p>
          <p><b>Estrelando:</b> ${data.atores ?? ""}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Erro ao obter informações da série:", err);
  }
}

// === Boot ===
try {
  assertEl(listaTemporadas, "temporadas-select");
  assertEl(fichaSerie, "temporadas-episodios");
  assertEl(fichaDescricao, "ficha-descricao");

  // Se o script NÃO for module, garanta rodar após o DOM:
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
} catch (err) {
  console.error(err.message);
}

function init() {
  // listener do select
  listaTemporadas.addEventListener("change", carregarEpisodios);
  // dados iniciais
  carregarInfoSerie();
  carregarTemporadas();
}
