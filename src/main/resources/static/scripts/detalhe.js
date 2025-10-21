import getDados from "/scripts/getDados.js";

const params = new URLSearchParams(window.location.search);
const serieId = params.get("id");

const listaTemporadas = document.getElementById("temporadas-select");
const fichaSerie      = document.getElementById("temporadas-episodios");
const fichaDescricao  = document.getElementById("ficha-descricao");

function option(value, text) {
  const o = document.createElement("option");
  o.value = value; o.textContent = text;
  return o;
}

async function carregarInfoSerie() {
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
    </div>`;
}

// Lê uma propriedade com fallback de nomes
const getNum = e => e.numeroEpisodio ?? e.numero ?? e.episodio ?? "-";
const getTemp = e => e.temporada ?? e.season ?? e.numeroTemporada ?? null;

async function carregarTemporadas() {
  const data = await getDados(`/series/${serieId}/temporadas/todas`);
  // Se a API não informar temporada em cada item, esse Set ficará vazio.
  const temps = [...new Set(data.map(e => getTemp(e)).filter(v => v != null))]
                .sort((a,b)=>a-b);

  listaTemporadas.innerHTML = "";
  listaTemporadas.appendChild(option("", "Selecione a temporada"));
  // Só cria opções se de fato houver temporada nos dados
  temps.forEach(t => listaTemporadas.appendChild(option(String(t), `Temporada ${t}`)));
  listaTemporadas.appendChild(option("todas", "Todas as temporadas"));
}

async function carregarEpisodios() {
  const val = listaTemporadas.value;
  const url = (val === "todas" || val === "")
    ? `/series/${serieId}/temporadas/todas`
    : `/series/${serieId}/temporadas/${val}`;

  const data = await getDados(url);
  fichaSerie.innerHTML = "";

  // Se os itens não trazem "temporada", não agrupa por temporada
  const temps = [...new Set(data.map(e => getTemp(e)).filter(v => v != null))]
                .sort((a,b)=>a-b);

  if (temps.length === 0) {
    // Lista “flat” (evita “Temporada null”)
    const ul = document.createElement("ul");
    ul.className = "episodios-lista";
    ul.innerHTML = data.map(e => `<li>${getNum(e)} - ${e.titulo}</li>`).join("");
    fichaSerie.appendChild(ul);
    return;
  }

  // Agrupa por temporada quando existir
  temps.forEach(t => {
    const episodios = data.filter(e => getTemp(e) === t);
    const p = document.createElement("p");
    p.textContent = `Temporada ${t}`;
    const br = document.createElement("br");
    const ul = document.createElement("ul");
    ul.className = "episodios-lista";
    ul.innerHTML = episodios.map(e => `<li>${getNum(e)} - ${e.titulo}</li>`).join("");
    fichaSerie.appendChild(p); fichaSerie.appendChild(br); fichaSerie.appendChild(ul);
  });
}

listaTemporadas.addEventListener("change", carregarEpisodios);

// boot
if (!serieId) console.error("URL sem ?id=...");
carregarInfoSerie().catch(console.error);
carregarTemporadas().catch(console.error);
