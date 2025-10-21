// util: mesma origem (localhost e ngrok)
async function getJson(endpoint) {
  const r = await fetch(endpoint, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} @ ${endpoint}`);
  return r.json();
}

// tenta vários nomes de campo
function pick(obj, keys, def = undefined) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return def;
}

// normaliza URL do poster (força https e evita vazio)
function normalizePoster(url, imdbId) {
  if (typeof url !== "string") url = "";
  url = url.trim();

  // se vier http:, troca por https:
  if (url.startsWith("http://")) url = "https://" + url.slice(7);

  // alguns serviços usam // sem protocolo
  if (url.startsWith("//")) url = "https:" + url;

  // se ainda estiver vazio e tiver imdbId, tenta uma thumb pública do OMDb (se você usa a chave lá no backend)
  // OBS: se não tiver chave no backend isso não vai funcionar; então só use se preciso.
  if (!url && imdbId) {
    // url = `https://img.omdbapi.com/?i=${imdbId}&h=600&apikey=SUACHAVE`; // descomente se tiver
  }
  return url || "";
}

// card HTML
function cardHtml(item) {
  const id = pick(item, ["id", "serieId", "codigo", "uid", "imdbId"]) ?? "";
  const titulo = pick(item, ["titulo", "nome", "title", "name"], "Sem título");
  const posterRaw = pick(item, ["poster", "imagem", "capa", "urlImagem", "posterUrl", "image", "thumb", "url"]);
  const poster = normalizePoster(posterRaw, pick(item, ["imdbId"]));

  const imgTag = poster
    ? `<img class="card__thumb" src="${poster}" alt="${titulo}">`
    : `<div class="card__thumb card__thumb--fallback" aria-label="sem imagem"></div>`;

  return `
    <li class="card" data-id="${id}">
      ${imgTag}
      <div class="card__body">
        <h3 class="card__title" title="${titulo}">${titulo}</h3>
      </div>
    </li>
  `;
}

async function renderLista(endpoint, gridSel) {
  try {
    const data = await getJson(endpoint);

    // diagnóstico rápido no console
    console.info(`[MediaFlix] GET ${endpoint} →`, Array.isArray(data) ? `${data.length} itens` : data);
    if (Array.isArray(data) && data[0]) console.debug(`[MediaFlix] exemplo do item[0]:`, data[0]);

    const grid = document.querySelector(gridSel);
    if (!grid) return;

    const list = Array.isArray(data) ? data : [];
    grid.innerHTML = list.map(cardHtml).join("");
  } catch (e) {
    console.error("Falha ao renderizar", endpoint, e);
    const grid = document.querySelector(gridSel);
    if (grid) grid.innerHTML = `<li style="color:#b00">Erro ao carregar ${endpoint}</li>`;
  }
}

function wireClickCards() {
  document.body.addEventListener("click", (e) => {
    const li = e.target.closest(".card");
    if (!li) return;
    const id = li.dataset.id;
    if (id) window.location.href = `/detalhes.html?id=${encodeURIComponent(id)}`;
  });
}

function wireCategorias() {
  const sel = document.querySelector("[data-categorias]");
  if (!sel) return;
  sel.addEventListener("change", async () => {
    const v = sel.value;
    const endpoint = v === "todos" ? "/series" : `/series?genero=${encodeURIComponent(v)}`;
    await renderLista(endpoint, "#grid-categoria");
    document.querySelector('[data-name="categoria"]').classList.remove("hidden");
  });
}

async function init() {
  // Para garantir cards na tela, usa /series em todas as seções neste primeiro passo.
  await Promise.all([
    renderLista("/series", "#grid-lancamentos"),
    renderLista("/series", "#grid-top5"),
    renderLista("/series", "#grid-series"),
  ]);

  wireClickCards();
  wireCategorias();
}

window.addEventListener("DOMContentLoaded", init);
