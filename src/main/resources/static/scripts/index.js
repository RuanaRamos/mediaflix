async function getJson(url){ const r=await fetch(url,{headers:{Accept:'application/json'}}); if(!r.ok) throw new Error(`HTTP ${r.status}@${url}`); return r.json(); }
function pick(o, ks, d){ for(const k of ks){ if(o&&o[k]!=null&&o[k]!=='') return o[k]; } return d; }
function https(u){ if(typeof u!=='string') return ''; u=u.trim(); if(u.startsWith('http://')) u='https://'+u.slice(7); if(u.startsWith('//')) u='https:'+u; return u; }

function cardHtml(item){
  const id     = pick(item, ['id','serieId','codigo','uid','imdbId'], '');
  const titulo = pick(item, ['titulo','nome','title','name'], 'Sem título');
  const poster = https(pick(item, ['poster','posterUrl','imagem','capa','urlImagem','image','thumb','url'], ''));
  const img    = poster ? `<img class="card__thumb" src="${poster}" alt="${titulo}">`
                        : `<div class="card__thumb card__thumb--fallback"></div>`;

  const open   = id ? `<a class="card__link" href="/detalhes.html?id=${encodeURIComponent(id)}" title="${titulo}">`
                    : `<span class="card__link" title="${titulo}">`;
  const close  = id ? `</a>` : `</span>`;
  return `<li class="card" data-id="${id}">${open}${img}<div class="card__body"><h3 class="card__title">${titulo}</h3></div>${close}</li>`;
}

async function render(endpoint, target){
 const container = document.querySelector(target);
  if(!container){
    console.warn('Container não encontrado para', target);
    return;
  }
  try{
    const data = await getJson(endpoint);
     const list = Array.isArray(data) ? data : [];
        container.innerHTML = list.length
          ? list.map(cardHtml).join('')
          : `<li class="grid__empty">Nenhuma série encontrada.</li>`;
  }catch(e){
    console.error('Falha em', endpoint, e);
    container.innerHTML = `<li class="grid__empty" style="color:#b00">Erro ao carregar ${endpoint}</li>`;
  }
}

async function carregarListasPadrao(){
  await Promise.all([
     render('/series/lancamentos', '#grid-lancamentos'),
        render('/series/top5', '#grid-top5'),
    render('/series', '#grid-series'),
  ]);
}
async function init(){
  const selectCategorias = document.querySelector('[data-categorias]');

  await carregarListasPadrao();

  if(selectCategorias){
    selectCategorias.addEventListener('change', async (event)=>{
      const valor = event.target.value;
      if(valor === 'todos'){
        await carregarListasPadrao();
        return;
      }

      await render(`/series/categoria/${encodeURIComponent(valor)}`, '#grid-series');
    });
  }


  document.addEventListener('click', (e)=>{
    const li = e.target.closest('.card'); if(!li) return;
    const id = li.dataset.id; if(!id) return;

    if (!e.target.closest('a')) location.href = `/detalhes.html?id=${encodeURIComponent(id)}`;
  });
}
window.addEventListener('DOMContentLoaded', init);
