const $ = (selector) => document.querySelector(selector);

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}@${url}`);
  return response.json();
}

function pick(object, keys, fallback) {
  for (const key of keys) {
    if (object && object[key] != null && object[key] !== '') {
      return object[key];
    }
  }
  return fallback;
}

function https(url) {
  if (typeof url !== 'string') return '';
  let value = url.trim();
  if (value.startsWith('http://')) value = `https://${value.slice(7)}`;
  if (value.startsWith('//')) value = `https:${value}`;
  return value;
}
const GENERO_TRADUCOES = {
  ACAO: 'Ação',
  ROMANCE: 'Romance',
  COMEDIA: 'Comédia',
  DRAMA: 'Drama',
  CRIME: 'Crime',
};

async function carregar() {
  const id = new URLSearchParams(location.search).get('id');
  const ficha = $('#ficha-descricao');
  const temporadasContainer = $('#temporadas-select');
    const listaEpisodios = $('#temporadas-episodios');
    let temporadaAtual = null;
    let requisicaoAtual = 0;

    const mostrarStatus = (texto, classeExtra = '') => {
      if (!listaEpisodios) return;
      const classeBase = 'episodios__status';
      const classes = classeExtra ? `${classeBase} ${classeExtra}` : classeBase;
      listaEpisodios.innerHTML = `<p class="${classes}">${texto}</p>`;
    };

    const marcarTemporadaAtiva = (botaoAtivo) => {
      if (!temporadasContainer) return;
      temporadasContainer.querySelectorAll('[data-temporada]').forEach((botao) => {
        botao.classList.toggle('temporadas__botao--ativo', botao === botaoAtivo);
      });
    };

    if (!ficha || !temporadasContainer || !listaEpisodios) {
      console.error('Elementos principais da tela de detalhes não foram encontrados.');
      return;
    }

    if (!id) {
      ficha.textContent = 'ID ausente';
      mostrarStatus('Selecione uma temporada para ver os episódios.');
      return;
    }

    try {
      const serie = await getJson(`/series/${encodeURIComponent(id)}`);
      const titulo = pick(serie, ['titulo', 'nome', 'title', 'name'], 'Sem título');
      const poster = https(pick(serie, ['poster', 'posterUrl', 'imagem', 'capa', 'urlImagem', 'image', 'thumb', 'url'], ''));
      const sinopse = pick(serie, ['sinopse', 'descricao', 'overview'], '');
      const generoBruto = pick(serie, ['genero', 'genre'], '');
      const genero = GENERO_TRADUCOES[generoBruto] ?? generoBruto ?? '';
      const nota = pick(serie, ['avaliacao', 'nota', 'rating', 'imdbRating'], '');
      const atores = pick(serie, ['atores', 'elenco', 'cast'], '');
      const totalTemporadas = Number.parseInt(pick(serie, ['totalTemporadas', 'total_temporadas', 'seasons'], 0), 10) || 0;

      ficha.innerHTML = `
        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
          ${poster
            ? `<img src="${poster}" alt="${titulo}" style="width:200px;aspect-ratio:2/3;object-fit:cover;border-radius:8px;background:#f2f2f2;">`
            : '<div style="width:200px;aspect-ratio:2/3;background:#eee;border-radius:8px;"></div>'}
          <div style="flex:1;min-width:260px;">
            <h2>${titulo}</h2>
            ${sinopse ? `<p>${sinopse}</p>` : ''}
            <p><strong>Gênero:</strong> ${genero || '-'}</p>
            <p><strong>Nota:</strong> ${nota || '-'}</p>
            ${atores ? `<p><strong>Elenco:</strong> ${atores}</p>` : ''}
            <p><strong>Temporadas:</strong> ${totalTemporadas || '-'}</p>
          </div>
        </div>`;

      if (totalTemporadas <= 0) {
        temporadasContainer.innerHTML = '<p class="temporadas__status">Sem temporadas disponíveis</p>';
        mostrarStatus('Não há temporadas cadastradas para esta série.');
        return;
      }

      temporadasContainer.innerHTML = Array.from({ length: totalTemporadas }, (_, index) => {
        const numero = index + 1;
        return `<button type="button" class="temporadas__botao" data-temporada="${numero}">Temporada ${numero}</button>`;
      }).join('');

      const carregarEpisodios = async (temporada) => {
        if (!temporada) {
          mostrarStatus('Selecione uma temporada para ver os episódios.');
          return;
        }

      try{
        const episodios = await getJson(`/series/${encodeURIComponent(id)}/temporadas/${encodeURIComponent(temporada)}`);
         if (requisicaoId !== requisicaoAtual) return;
        const lista = Array.isArray(episodios) ? episodios : [];

       if (!lista.length) {
                 mostrarStatus('Não há episódios cadastrados para esta temporada.');
                 return;
               }

               const numeroTemporada = Number.parseInt(temporada, 10);
               const tituloTemporada = Number.isFinite(numeroTemporada) ? numeroTemporada : temporada;

               const itens = lista
                 .map((episodio) => {
                   const numero = pick(episodio, ['numeroEpisodio', 'numero', 'episodio', 'episode', 'id'], '');
                   const tituloEpisodio = pick(episodio, ['titulo', 'nome', 'title', 'name'], 'Sem título');
                   const numeroFormatado = numero != null && numero !== ''
                     ? String(numero).padStart(2, '0')
                     : '--';

                   return `
                     <li class="episodios__item">
                       <span class="episodios__numero">E${numeroFormatado}</span>
                       <div class="episodios__info">
                         <h5 class="episodios__nome">${tituloEpisodio}</h5>
                       </div>
                     </li>`;
                 })
                 .join('');

               listaEpisodios.innerHTML = `
                 <h4 class="episodios__titulo">Temporada ${tituloTemporada}</h4>
                 <ul class="episodios__lista">${itens}</ul>`;
             } catch (erroEpisodios) {
               if (requisicaoId !== requisicaoAtual) return;
               console.error('Erro ao carregar episódios', erroEpisodios);
               mostrarStatus('Erro ao carregar episódios desta temporada.', 'episodios__status--erro');
      }
     };

        temporadasContainer.addEventListener('click', (event) => {
          const botao = event.target.closest('[data-temporada]');
          if (!botao) return;

 const temporada = botao.dataset.temporada;
      if (!temporada || temporada === temporadaAtual) return;

      temporadaAtual = temporada;
      marcarTemporadaAtiva(botao);
      void carregarEpisodios(temporada);
    });

    const primeiroBotao = temporadasContainer.querySelector('[data-temporada]');
    if (primeiroBotao) {
      temporadaAtual = primeiroBotao.dataset.temporada;
      marcarTemporadaAtiva(primeiroBotao);
      await carregarEpisodios(temporadaAtual);
    } else {
      mostrarStatus('Não foi possível encontrar as temporadas desta série.');
    }
  } catch (erro) {
    console.error('Erro ao carregar série', erro);

    ficha.innerHTML = '<p style="color:#b00">Não foi possível carregar os detalhes desta série.</p>';
     mostrarStatus('Erro ao carregar episódios desta série.', 'episodios__status--erro');
  }
}

window.addEventListener('DOMContentLoaded', carregar);
