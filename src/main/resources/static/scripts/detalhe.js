const $ = (s)=>document.querySelector(s);
async function getJson(u){ const r=await fetch(u,{headers:{Accept:'application/json'}}); if(!r.ok) throw new Error(`HTTP ${r.status}@${u}`); return r.json(); }
function pick(o, ks, d){ for(const k of ks){ if(o&&o[k]!=null&&o[k]!=='') return o[k]; } return d; }
function https(u){ if(typeof u!=='string') return ''; u=u.trim(); if(u.startsWith('http://')) u='https://'+u.slice(7); if(u.startsWith('//')) u='https:'+u; return u; }

async function carregar(){
  const id = new URLSearchParams(location.search).get('id');
  if(!id){ $('#ficha-descricao').textContent='ID ausente'; return; }


  const s = await getJson(`/series/${encodeURIComponent(id)}`);
  const titulo = pick(s, ['titulo','nome','title','name'],'Sem título');
  const poster = https(pick(s, ['poster','posterUrl','imagem','capa','urlImagem','image','thumb','url'],''));
  const sinopse= pick(s, ['sinopse','descricao','overview'],'');
  const genero = pick(s, ['genero','genre'],'');
  const nota   = pick(s, ['nota','rating','imdbRating'],'');
  $('#ficha-descricao').innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start;">
      ${poster?`<img src="${poster}" alt="${titulo}" style="width:200px;aspect-ratio:2/3;object-fit:cover;border-radius:8px;background:#f2f2f2;">`:`<div style="width:200px;aspect-ratio:2/3;background:#eee;border-radius:8px;"></div>`}
      <div>
        <h2>${titulo}</h2>
        ${sinopse?`<p>${sinopse}</p>`:''}
        <p><strong>Gênero:</strong> ${genero||'-'}</p>
        <p><strong>Nota:</strong> ${nota||'-'}</p>
      </div>
    </div>`;

  const temps = await getJson(`/series/${encodeURIComponent(id)}/temporadas`);
  const select = $('#temporadas-select');
  select.innerHTML = (temps||[]).map(t=>{
    const n = pick(t,['numero','temporada','season','id'],'');
    return `<option value="${n}">Temporada ${n}</option>`;
  }).join('');

  async function carregarEps(n){
    if(!n){ $('#temporadas-episodios').innerHTML=''; return; }

    const eps = await getJson(`/series/${encodeURIComponent(id)}/temporadas/${encodeURIComponent(n)}/episodios`);
    $('#temporadas-episodios').innerHTML = (eps||[]).map(e=>{
      const num = pick(e,['numero','episodio','episode','id'],'');
      const tit = pick(e,['titulo','nome','title','name'],'');
      const desc= pick(e,['sinopse','descricao','overview'],'');
      return `<div style="padding:8px 0;border-bottom:1px solid #eee;">
        <strong>E${num}</strong> — ${tit}
        ${desc?`<div style="color:#444;font-size:14px;margin-top:4px;">${desc}</div>`:''}
      </div>`;
    }).join('');
  }

  if(select.value) await carregarEps(select.value);
  select.addEventListener('change', e=>carregarEps(e.target.value));
}
window.addEventListener('DOMContentLoaded', carregar);
