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
  ACAO: 'Action',
    ROMANCE: 'Romanze',
    COMEDIA: 'Komödie',
  DRAMA: 'Drama',
    CRIME: 'Krimi',
};

async function carregar() {
  const id = new URLSearchParams(location.search).get('id');
  const ficha = $('#ficha-descricao');
  const temporadasContainer = $('#temporadas-select');
   const listaEpisodios = $('#temporadas-episodios');
     let temporadaAtual = null;
     let requisicaoAtual = 0;
     let episodiosAgrupados = null;
     let episodiosPromise = null;

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
       console.error('Wesentliche Elemente des Detailbildschirms wurden nicht gefunden.');
       return;
     }

     if (!id) {
    ficha.textContent = 'Fehlende ID';
    mostrarStatus('Wählen Sie eine Staffel aus, um die Episoden zu sehen.');
    return;
  }

   const normalizarTemporada = (valor) => {
      if (valor == null || valor === '') return '';
      const numero = Number.parseInt(valor, 10);
      return Number.isFinite(numero) ? String(numero) : String(valor);
    };

    const numeroSeguro = (valor) => {
      const numero = Number.parseInt(valor, 10);
      return Number.isFinite(numero) ? numero : Number.MAX_SAFE_INTEGER;
    };

    const ordenarEpisodios = (lista) => {
      if (!Array.isArray(lista)) return [];
      return [...lista].sort((a, b) => {
        const temporadaA = numeroSeguro(pick(a, ['temporada', 'season'], ''));
        const temporadaB = numeroSeguro(pick(b, ['temporada', 'season'], ''));
        if (temporadaA !== temporadaB) return temporadaA - temporadaB;

        const numeroA = numeroSeguro(pick(a, ['numeroEpisodio', 'numero', 'episodio', 'episode', 'id'], ''));
        const numeroB = numeroSeguro(pick(b, ['numeroEpisodio', 'numero', 'episodio', 'episode', 'id'], ''));
        if (numeroA !== numeroB) return numeroA - numeroB;

        const tituloA = String(pick(a, ['titulo', 'nome', 'title', 'name'], '') ?? '').toLowerCase();
        const tituloB = String(pick(b, ['titulo', 'nome', 'title', 'name'], '') ?? '').toLowerCase();
        return tituloA.localeCompare(tituloB);
      });
    };

    const agruparEpisodiosPorTemporada = (lista) => {
      const mapa = new Map();
      if (!Array.isArray(lista)) return mapa;

      for (const episodio of lista) {
        const chave = normalizarTemporada(pick(episodio, ['temporada', 'season'], ''));
        const atual = mapa.get(chave) ?? [];
        atual.push(episodio);
        mapa.set(chave, atual);
      }

      for (const [chave, episodiosTemporada] of mapa.entries()) {
        mapa.set(chave, ordenarEpisodios(episodiosTemporada));
      }

      return mapa;
    };

    const garantirEntradaTemporada = (mapa, temporada) => {
      const chave = normalizarTemporada(temporada);
      if (!mapa.has(chave)) {
        mapa.set(chave, []);
      }
      return chave;
    };

    const garantirEpisodiosAgrupados = async () => {
      if (episodiosAgrupados) return episodiosAgrupados;

      if (!episodiosPromise) {
        episodiosPromise = (async () => {
          const resposta = await getJson(`/series/${encodeURIComponent(id)}/temporadas/todas`);
          const lista = Array.isArray(resposta) ? resposta : [];
          episodiosAgrupados = agruparEpisodiosPorTemporada(lista);
          return episodiosAgrupados;
        })();
      }

    try {
      return await episodiosPromise;
         } catch (erro) {
           episodiosPromise = null;
           episodiosAgrupados = new Map();
           throw erro;
         }
       };

       const renderizarEpisodios = (temporada, episodios) => {
         const numeroTemporada = Number.parseInt(temporada, 10);
         const tituloTemporada = Number.isFinite(numeroTemporada) ? numeroTemporada : temporada;

         const itens = episodios
           .map((episodio) => {
             const numero = pick(episodio, ['numeroEpisodio', 'numero', 'episodio', 'episode', 'id'], '');
             const tituloEpisodio = pick(episodio, ['titulo', 'nome', 'title', 'name'], 'Ohne Titel');
             const numeroFormatado = numero != null && numero !== ''
               ? String(numero).padStart(2, '0')
               : '--';

             return `
               <li class="episodios__item">
                 <span class="episodios__numero">F${numeroFormatado}</span>
                 <div class="episodios__info">
                   <h5 class="episodios__nome">${tituloEpisodio}</h5>
                 </div>
               </li>`;
           })
           .join('');

         listaEpisodios.innerHTML = `
           <h4 class="episodios__titulo">Staffel ${tituloTemporada}</h4>
           <ul class="episodios__lista">${itens}</ul>`;
       };

       const carregarEpisodiosDaTemporada = async (temporada) => {
         if (!temporada) {
           mostrarStatus('Wählen Sie eine Staffel aus, um die Episoden zu sehen.');
      return;
    }

 const requisicaoId = ++requisicaoAtual;
     mostrarStatus('Episoden werden geladen...');

     try {
       const mapa = await garantirEpisodiosAgrupados();
       const chave = garantirEntradaTemporada(mapa, temporada);
       let episodiosTemporada = mapa.get(chave);

       if (!episodiosTemporada || episodiosTemporada.length === 0) {
         const resposta = await getJson(`/series/${encodeURIComponent(id)}/temporadas/${encodeURIComponent(temporada)}`);
         const lista = ordenarEpisodios(Array.isArray(resposta) ? resposta : []);
         mapa.set(chave, lista);
         episodiosTemporada = lista;
       }

       if (requisicaoId !== requisicaoAtual) return;

       if (!episodiosTemporada || episodiosTemporada.length === 0) {
               mostrarStatus('Für diese Staffel sind keine Episoden vorhanden.');
        return;
      }

         renderizarEpisodios(temporada, episodiosTemporada);
          } catch (erroEpisodios) {
            if (requisicaoId !== requisicaoAtual) return;
            console.error('Fehler beim Laden der Episoden', erroEpisodios);
            mostrarStatus('Fehler beim Laden der Episoden dieser Staffel.', 'episodios__status--erro');
          }
        };

        try {
          const serie = await getJson(`/series/${encodeURIComponent(id)}`);
          const titulo = pick(serie, ['titulo', 'nome', 'title', 'name'], 'Ohne Titel');
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
                <p><strong>Genre:</strong> ${genero || '-'}</p>
                <p><strong>Bewertung:</strong> ${nota || '-'}</p>
                ${atores ? `<p><strong>Besetzung:</strong> ${atores}</p>` : ''}
                <p><strong>Staffeln:</strong> ${totalTemporadas || '-'}</p>
              </div>
            </div>`;

          if (totalTemporadas <= 0) {
            temporadasContainer.innerHTML = '<p class="temporadas__status">Keine Staffeln verfügbar</p>';
            mostrarStatus('Für diese Serie sind keine Staffeln vorhanden.');
            return;
          }

          temporadasContainer.innerHTML = Array.from({ length: totalTemporadas }, (_, index) => {
            const numero = index + 1;
            return `<button type="button" class="temporadas__botao" data-temporada="${numero}">Staffel ${numero}</button>`;
          }).join('');

          void garantirEpisodiosAgrupados().catch((erro) => {
            console.warn('Episoden konnten nicht im Voraus geladen werden.', erro);
          });

          temporadasContainer.addEventListener('click', (event) => {
      const botao = event.target.closest('[data-temporada]');
      if (!botao) return;

      const temporada = botao.dataset.temporada;
      if (!temporada || temporada === temporadaAtual) return;

      temporadaAtual = temporada;
      marcarTemporadaAtiva(botao);
      void carregarEpisodiosDaTemporada(temporada);
    });

    const primeiroBotao = temporadasContainer.querySelector('[data-temporada]');
    if (primeiroBotao) {
      temporadaAtual = primeiroBotao.dataset.temporada;
      marcarTemporadaAtiva(primeiroBotao);
     await carregarEpisodiosDaTemporada(temporadaAtual);
    } else {
      mostrarStatus('Die Staffeln dieser Serie konnten nicht gefunden werden.');
    }
  } catch (erro) {
    console.error('Fehler beim Laden der Serie', erro);

    ficha.innerHTML = '<p style="color:#b00">Die Details dieser Serie konnten nicht geladen werden.</p>';
      mostrarStatus('Fehler beim Laden der Episoden dieser Serie.', 'episodios__status--erro');
}

window.addEventListener('DOMContentLoaded', carregar);
