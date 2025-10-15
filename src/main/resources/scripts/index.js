import getDados from "/scripts/getDados.js";

const elementos = {
  top5: document.querySelector('[data-name="top5"]'),
  lancamentos: document.querySelector('[data-name="lancamentos"]'),
  series: document.querySelector('[data-name="series"]'),
  categoria: document.querySelector('[data-name="categoria"]'),
};

const categoriaSelect = document.querySelector('[data-categorias]');
const sections = document.querySelectorAll('.section');

function criarLista(elemento, dados) {
  const ulAntiga = elemento.querySelector('ul');
  if (ulAntiga) ulAntiga.remove();

  const ul = document.createElement('ul');
  ul.className = 'lista';
  ul.innerHTML = dados.map(f => `
    <li>
      <a href="/detalhes.html?id=${f.id}">
        <img src="${f.poster}" alt="${f.titulo}">
      </a>
    </li>
  `).join('');
  elemento.appendChild(ul);
}

function mostrarTodas() {
  sections.forEach(s => s.classList.remove('hidden'));
  elementos.categoria.classList.add('hidden');
}

function mostrarApenasCategoria() {
  sections.forEach(s => s.classList.add('hidden'));
  elementos.categoria.classList.remove('hidden');
}

function normalizarCategoria(valor) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(); // "comédia" -> "COMEDIA"
}

categoriaSelect.addEventListener('change', async () => {
  const valor = categoriaSelect.value;
  if (valor === 'todos') {
    mostrarTodas();
    await gerarSeries();
    return;
  }
  try {
    mostrarApenasCategoria();
    const enumCat = normalizarCategoria(valor);
    const data = await getDados(`/series/categoria/${enumCat}`);
    criarLista(elementos.categoria, data);
  } catch (e) {
    console.error(e);
  }
});

async function gerarSeries() {
  try {
    const [top5, lanc, todas] = await Promise.all([
      getDados('/series/top5'),
      getDados('/series/lancamentos'),
      getDados('/series')
    ]);
    criarLista(elementos.top5, top5);
    criarLista(elementos.lancamentos, lanc);
    criarLista(elementos.series, todas.slice(0, 5));
  } catch (e) {
    console.error("Erro ao carregar dados iniciais:", e);
  }
}

gerarSeries();
