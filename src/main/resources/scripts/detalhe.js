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
  } catch (e) { console.error(e); }
}

async function carregarTemporadas() {
  try {
    const data = await getDados(`/series/${serieId}/temporadas/todas`);
    const temps = [...new Set(data.map(t => t.temporada))].sort((a,b)=>a-b);
    listaTemporadas.innerHTML = "";
    listaTemporadas.appendChild(option("", "Selecione a temporada"));
    temps.forEach(t => listaTemporadas.appendChild(option(String(t), `Temporada ${t}`)));
    listaTemporadas.appendChild(option("todas", "Todas as temporadas"));
  } catch (e) { console.error(e); }
}

async function carregarEpisodios() {
  try {
    const val = listaTemporadas.value;
    const url = (val === "todas" || val === "")
      ? `/series/${serieId}/temporadas/todas`
      : `/series/${serieId}/temporadas/${val}`;

    const data = await getDados(url);
    fichaSerie.innerHTML = "";

    const grupos = [...new Set(data.map(e => e.temporada))].sort((a,b)=>a-b);
    grupos.forEach(temp => {
      const episodios = data.filter(e => e.temporada === temp);
      const p = document.createElement("p");
      p.textContent = `Temporada ${temp}`;
      const br = document.createElement("br");
      const ul = document.createElement("ul");
      ul.className = "episodios-lista";
      ul.innerHTML = episodios.map(e => `<li>${e.numeroEpisodio} - ${e.titulo}</li>`).join("");
      fichaSerie.appendChild(p); fichaSerie.appendChild(br); fichaSerie.appendChild(ul);
    });
  } catch (e) { console.error(e); }
}

listaTemporadas.addEventListener("change", carregarEpisodios);

if (!serieId) {
  console.error("URL sem ?id=...");
} else {
  carregarInfoSerie();
  carregarTemporadas();
}
