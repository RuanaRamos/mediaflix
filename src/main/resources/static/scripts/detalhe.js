const $ = (s)=>document.querySelector(s);
async function getJson(u){ const r=await fetch(u,{headers:{Accept:'application/json'}}); if(!r.ok) throw new Error(`HTTP ${r.status}@${u}`); return r.json(); }
function pick(o, ks, d){ for(const k of ks){ if(o&&o[k]!=null&&o[k]!=='') return o[k]; } return d; }
function https(u){ if(typeof u!=='string') return ''; u=u.trim(); if(u.startsWith('http://')) u='https://'+u.slice(7); if(u.startsWith('//')) u='https:'+u; return u; }

const GENERO_TRADUCOES = {
  ACAO: 'Ação',
  ROMANCE: 'Romance',
  COMEDIA: 'Comédia',
  DRAMA: 'Drama',
  CRIME: 'Crime'
};

async function carregar(){
  const id = new URLSearchParams(location.search).get('id');
  const ficha = $('#ficha-descricao');
  const select = $('#temporadas-select');
   const listaEpisodios = $('#temporadas-episodios');

   if(!id){
     ficha.textContent = 'ID ausente';
     return;
   }

   try{
     const serie = await getJson(`/series/${encodeURIComponent(id)}`);
     const titulo = pick(serie, ['titulo','nome','title','name'],'Sem título');
     const poster = https(pick(serie, ['poster','posterUrl','imagem','capa','urlImagem','image','thumb','url'],''));
     const sinopse= pick(serie, ['sinopse','descricao','overview'],'');
     const generoBruto = pick(serie, ['genero','genre'],'');
     const genero = GENERO_TRADUCOES[generoBruto] ?? generoBruto ?? '';
     const nota   = pick(serie, ['avaliacao','nota','rating','imdbRating'],'');
     const atores = pick(serie, ['atores','elenco','cast'],'');
     const totalTemporadas = Number.parseInt(pick(serie, ['totalTemporadas','total_temporadas','seasons'], 0), 10) || 0;

     ficha.innerHTML = `
       <div style="display:flex;gap:16px;align-items:flex-start;">
         ${poster?`<img src="${poster}" alt="${titulo}" style="width:200px;aspect-ratio:2/3;object-fit:cover;border-radius:8px;background:#f2f2f2;">`:`<div style="width:200px;aspect-ratio:2/3;background:#eee;border-radius:8px;"></div>`}
         <div>
           <h2>${titulo}</h2>
           ${sinopse?`<p>${sinopse}</p>`:''}
           <p><strong>Gênero:</strong> ${genero||'-'}</p>
           <p><strong>Nota:</strong> ${nota||'-'}</p>
           ${atores?`<p><strong>Elenco:</strong> ${atores}</p>`:''}
           <p><strong>Temporadas:</strong> ${totalTemporadas || '-'}</p>
         </div>
       </div>`;

     if(totalTemporadas <= 0){
       select.innerHTML = '<option value="">Sem temporadas disponíveis</option>';
       listaEpisodios.innerHTML = '<p>Não há temporadas cadastradas para esta série.</p>';
       return;
     }

     select.innerHTML = Array.from({length: totalTemporadas}, (_,i)=>{
       const numero = i + 1;
       return `<option value="${numero}">Temporada ${numero}</option>`;
     }).join('');


async function carregarEpisodios(temporada){
      if(!temporada){
        listaEpisodios.innerHTML = '<p>Selecione uma temporada para ver os episódios.</p>';
        return;
      }

      try{
        const episodios = await getJson(`/series/${encodeURIComponent(id)}/temporadas/${encodeURIComponent(temporada)}`);
        const lista = Array.isArray(episodios) ? episodios : [];
        listaEpisodios.innerHTML = lista.length
          ? lista.map(e=>{
              const num = pick(e,['numeroEpisodio','numero','episodio','episode','id'],'');
              const tit = pick(e,['titulo','nome','title','name'],'');
              return `<div style="padding:8px 0;border-bottom:1px solid #eee;">
                <strong>E${num}</strong> — ${tit}
              </div>`;
            }).join('')
          : '<p>Não há episódios cadastrados para esta temporada.</p>';
      }catch(e){
        console.error('Erro ao carregar episódios', e);
        listaEpisodios.innerHTML = '<p style="color:#b00">Erro ao carregar episódios desta temporada.</p>';
      }
    }

    const primeiraTemporada = select.options[0]?.value ?? '';
    await carregarEpisodios(primeiraTemporada);
    select.value = primeiraTemporada;
    select.addEventListener('change', e=>carregarEpisodios(e.target.value));
  }catch(e){
    console.error('Erro ao carregar série', e);
    ficha.innerHTML = '<p style="color:#b00">Não foi possível carregar os detalhes desta série.</p>';
  }
}
window.addEventListener('DOMContentLoaded', carregar);
