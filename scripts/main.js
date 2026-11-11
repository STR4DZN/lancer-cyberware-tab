import {NeuralMotion} from './neural-motion.js';
import {neuralReadouts} from './neural-narrative.js';

/**
 * CYBER//IMPLANTES v0.10.1 – Foundry VTT v13 / LANCER.
 * Data compatible with versions 0.1–0.5: flags.lancer-cyberware-tab.registry.
 * Cyberpsychosis is an optional homebrew display; does not alter LANCER mechanics.
 */
(() => {
'use strict';
const ID='lancer-cyberware-tab', FLAG='registry', CAT='catalogue';
const REGIONS=[
 {id:'frontal',title:'Córtex frontal',sub:'FRONTAL CORTEX',mark:'◈'},
 {id:'optico',title:'Sistema ocular',sub:'OCULAR SYSTEM',mark:'◎'},
 {id:'circulatorio',title:'Sistema circulatório',sub:'CIRCULATORY',mark:'♡'},
 {id:'imunologico',title:'Sistema imunológico',sub:'IMMUNE SYSTEM',mark:'✚'},
 {id:'neural',title:'Sistema nervoso',sub:'NERVOUS SYSTEM',mark:'⌁'},
 {id:'pele',title:'Sistema tegumentar',sub:'INTEGUMENTARY',mark:'▧'},
 {id:'esqueleto',title:'Esqueleto',sub:'SKELETON',mark:'⋈'},
 {id:'maos',title:'Mãos',sub:'HANDS',mark:'⌘'},
 {id:'bracos',title:'Braços',sub:'ARMS',mark:'⫷'},
 {id:'pernas',title:'Pernas',sub:'LEGS',mark:'⫸'},
 {id:'sistema',title:'Sistema operacional',sub:'OPERATING SYSTEM',mark:'⌬'},
 {id:'tronco',title:'Tronco / corpo',sub:'BODY',mark:'⬡'}
];
const TIERS=['Comum','Raro','Incomum','Mítico','Corporativo','Lendário'];
const DEFAULT_SLOTS={frontal:3,optico:3,circulatorio:3,imunologico:2,neural:4,pele:3,esqueleto:2,maos:2,bracos:2,pernas:2,sistema:1,tronco:3};
// Original vector artwork, drawn for each anatomical system. No external icon font.
const ICONS={
 frontal:'<path d="M23 35V13c-7-9-17-2-15 6-7 5-3 15 3 15-1 8 8 12 12 6m2-5V13c7-9 17-2 15 6 7 5 3 15-3 15 1 8-8 12-12 6M12 18l6 3v8l-5 4m23-15-6 3v8l5 4M18 12v5m12-5v5M17 37l3-3m11 3-3-3"/>',
 optico:'<path d="M3 24s8-13 21-13 21 13 21 13-8 13-21 13S3 24 3 24Z"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="3"/><path d="M24 4v4m0 32v4M4 11l5 5m35-5-5 5M4 37l5-5m35 5-5-5"/>',
 circulatorio:'<path d="M24 40S6 30 7 19c1-10 13-11 17-3 5-8 16-7 17 3 1 11-17 21-17 21Z"/><path d="M3 25h11l4-7 5 14 5-10 3 3h14M22 10V4m6 8 4-7"/>',
 imunologico:'<path d="m24 4 17 7v13c0 10-17 20-17 20S7 34 7 24V11L24 4Z"/><path d="M20 14h8v7h7v8h-7v7h-8v-7h-7v-8h7v-7Z"/>',
 neural:'<path d="M20 5h8l3 6-3 6v21l-4 6-4-6V17l-3-6 3-6ZM20 20l-8 4-5-5m21 1 8 4 5-5M20 29l-8 4-5-5m21 1 8 4 5-5M12 24v13m24-13v13"/><circle cx="7" cy="17" r="2"/><circle cx="41" cy="17" r="2"/>',
 pele:'<path d="m4 16 20-10 20 10-20 10L4 16Zm0 8 20 10 20-10M4 32l20 10 20-10M14 15l10-5 10 5-10 5-10-5Z"/><path d="M14 25v5m20-5v5M24 26v8"/>',
 esqueleto:'<path d="M20 7h8v6h-8zM20 17h8v6h-8zM20 27h8v6h-8zM20 37h8v6h-8zM12 8l-6 5v9l6 5m24-19 6 5v9l-6 5M17 13 9 16m22-3 8 3M17 23l-7-2m21 2 7-2M17 32l-6 5 6 6m14-11 6 5-6 6"/>',
 maos:'<path d="M15 29V12a3 3 0 0 1 6 0v12-16a3 3 0 0 1 6 0v16-12a3 3 0 0 1 6 0v15-9a3 3 0 0 1 6 0v15l-8 11H20L8 29c-3-5 2-8 5-4l2 4Z"/><path d="M21 32h9v6h-9zm6-8v5"/>',
 bracos:'<path d="m12 5 12 5-4 13 15 6 7 11-6 5-9-9-17-3-5-9 7-19Z"/><path d="m11 13 9 4M9 23l10 3m-4 7 3-7m12 4-3 6m9-2-5 5"/><circle cx="14" cy="27" r="3"/>',
 pernas:'<path d="m17 4 15 3-3 16-7 12 8 4v5H11v-9l5-14 1-17Z"/><path d="m17 13 13 2M16 23l12 3m-12 9 7 2M12 39h11"/><circle cx="22" cy="24" r="3"/>',
 sistema:'<rect x="11" y="11" width="26" height="26" rx="3"/><path d="M18 18h12v12H18zM17 3v8m7-8v8m7-8v8M17 37v8m7-8v8m7-8v8M3 17h8m-8 7h8m-8 7h8m26-14h8m-8 7h8m-8 7h8"/>',
 tronco:'<path d="m17 5 7 4 7-4 12 10-6 9-5-4v23H16V20l-5 4-6-9L17 5Z"/><path d="M24 9v28M16 16l8 5 8-5m-16 9 8 4 8-4M16 37h16"/>'
};
const icon = id => {
 const drawing = ICONS[slug(id).id];
 return `<svg class="lcy-body-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
   <path class="lcy-icon-frame" d="M2 13V3h10m24 0h10v10m0 22v10H36m-24 0H2V35M24 1v3m0 40v3"/>
   <g class="lcy-icon-echo">${drawing}</g>
   <g class="lcy-icon-line">${drawing}</g>
 </svg>`;
};
const rarity=g=>TIERS.includes(g)?g:({Épico:'Mítico',Icônico:'Lendário',Padrão:'Comum',Militar:'Corporativo',Experimental:'Mítico',Protótipo:'Mítico',Proibido:'Lendário'}[g]||'Comum');
const MIME='application/x-lancer-cyberware';
const actorKey=a=>a.uuid||a.id;

const STATUS=['Operacional','Desativado','Danificado','Em manutenção'];
const panels=new Map(),appPanels=new WeakMap(),uiState=new Map(),pending=new Set();
let panelCount = 0;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number.isFinite(+n)?+n:a));
const num=(n,a=0,b=9999)=>Math.trunc(clamp(n,a,b));
const slug=id=>REGIONS.find(r=>r.id===id)||REGIONS[4];
const gm=()=>globalThis.game?.user?.isGM===true;
const canUse=a=>gm()||Boolean(a?.canUserModify?.(globalThis.game?.user,'update')||a?.isOwner);
const rand=()=>globalThis.foundry?.utils?.randomID?.()||`lcy-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const actorFrom=app=>app?.actor||(app?.document?.type==='pilot'?app.document:null);
const rootFrom=html=>html instanceof HTMLElement?html:html?.[0]||html?.get?.(0)||null;
const state=a=>{const id=a.uuid||a.id;if(!uiState.has(id))uiState.set(id,{mode:'pilot',category:'neural',selected:null,search:'',gmSearch:'',gmCategory:'all',open:false,quiet:false});return uiState.get(id)};
const safeImage=url=>{const s=String(url||'').trim().slice(0,800);if(!s||/[<>"'`\s]/.test(s)||/^(?:javascript:|data:|vbscript:)/i.test(s))return '';return /^(?:https?:\/\/|\/?(?:worlds|modules|systems|icons|assets|uploads|s3)\/|[a-z0-9_-]+\/)/i.test(s)?s:''};
const imgConfig=i=>({url:safeImage(i?.image||i?.img||''),zoom:clamp(i?.imageZoom??i?.zoom??1,1,3),x:clamp(i?.imageX??0,-60,60),y:clamp(i?.imageY??0,-60,60)});
const imageHTML=(i,extra='')=>{const im=imgConfig(i);return `<span class="lcy-art ${extra}" aria-hidden="true">${im.url?`<img loading="lazy" src="${esc(im.url)}" alt="" style="transform:translate(${im.x}%,${im.y}%) scale(${im.zoom})">`:`<span class="lcy-art-placeholder">${icon(i?.slot)}</span>`}</span>`};
const norm=i=>{const q=num(i.quantity??1,1,99),installed=i.installedQuantity==null?(i.installed===false?0:q):num(i.installedQuantity,0,q);return {...i,id:String(i.id||rand()),name:String(i.name||'Sem identificação'),slot:slug(i.slot).id,grade:rarity(i.grade),status:STATUS.includes(i.status)?i.status:'Operacional',potency:num(i.potency??(Math.round((i.humanityCost||5)/5)||1),1,5),load:num(i.load??0,0,9999),quantity:q,installedQuantity:installed,installed:installed>0,image:safeImage(i.image||i.img),...{imageZoom:imgConfig(i).zoom,imageX:imgConfig(i).x,imageY:imgConfig(i).y}}};
function setting(key,fallback){try{const v=game.settings.get(ID,key);return v===undefined?fallback:v}catch{return fallback}}
const getCatalog=()=>{const raw=setting(CAT,{items:[]});return {items:Array.isArray(raw?.items)?raw.items.filter(Boolean).slice(0,500).map(normTemplate):[]}};
function normTemplate(i){return {...norm(i),id:String(i.id||rand())}}
function read(actor){const raw=actor.getFlag?.(ID,FLAG)||{};const data={...raw,capacity:raw.capacity===undefined||raw.capacity===null?num(setting('defaultCapacity',60),0,9999):num(raw.capacity,0,9999),limits:raw.limits&&typeof raw.limits==='object'?raw.limits:{},implants:Array.isArray(raw.implants)?raw.implants.filter(Boolean).slice(0,500).map(norm):[]};return reconcileSlots(data)}
const slots=(data,id)=>num(data.limits?.[id]??DEFAULT_SLOTS[id]??3,0,99); // Explicit zero remains unlimited.
function reconcileSlots(data){
 for(const r of REGIONS){const used=new Set(),items=data.implants.filter(i=>i.slot===r.id);
  // Keep valid saved positions first, then place old records / added quantities in free spaces.
  for(const i of items){const old=Array.isArray(i.installedSlots)?i.installedSlots:[];i.installedSlots=[];for(const n of old){if(Number.isInteger(n)&&n>=0&&n<50000&&!used.has(n)&&i.installedSlots.length<i.installedQuantity){i.installedSlots.push(n);used.add(n)}}}
  for(const i of items)while(i.installedSlots.length<i.installedQuantity){let n=0;while(used.has(n))n++;i.installedSlots.push(n);used.add(n)}
 }return data;
}
const occupied=(data,region)=>data.implants.filter(i=>i.slot===region).flatMap(i=>i.installedSlots.map(index=>({index,item:i})));
const freeSlot=(data,region)=>{const taken=new Set(occupied(data,region).map(x=>x.index));let n=0;while(taken.has(n))n++;return n};
function metrics(data){
 const active=data.implants.filter(i=>i.installedQuantity>0),count=active.reduce((s,i)=>s+i.installedQuantity,0);
 const load=active.reduce((s,i)=>s+i.load*i.installedQuantity,0);
 const over=Math.max(0,load-data.capacity),intensity=active.reduce((s,i)=>s+(i.potency*1.8+(['Lendário','Mítico','Corporativo'].includes(i.grade)?3:0))*i.installedQuantity,0);
 const risk=num(Math.round(intensity*.92+(data.capacity>0?load/data.capacity*29:0)+over*2.4),0,100);
 const stage = risk >= 85 ? 'collapse' : risk >= 65 ? 'danger' : risk >= 40 ? 'warn' : risk >= 20 ? 'watch' : 'stable';
 return {count,operating:active.filter(i=>i.status==='Operacional').reduce((s,i)=>s+i.installedQuantity,0),load,overload:over,risk,humanity:100-risk,stage:{label:SIGNAL[stage].label,id:stage},reserve:data.implants.reduce((s,i)=>s+i.quantity-i.installedQuantity,0),models:data.implants.length,averagePower:count?Math.round(active.reduce((s,i)=>s+i.potency*i.installedQuantity,0)/count*10)/10:0};
}
function checkInstall(data,id){
 const r=data.implants.find(x=>x.id===id);if(!r)return 'Implante não encontrado.';
 if(['Danificado','Em manutenção'].includes(r.status))return 'Implante indisponível: solicite reparo ao mestre.';
 if(r.installedQuantity>=r.quantity)return 'Todas as unidades já estão instaladas.';
 if(!setting('allowOverload',false)&&data.capacity>0&&metrics(data).load+r.load>data.capacity)return 'Capacidade neural insuficiente. Retire outro implante ou peça ao mestre para ampliar o limite.';
 const limit=slots(data,r.slot);if(limit&&data.implants.filter(x=>x.slot===r.slot).reduce((s,x)=>s+x.installedQuantity,0)>=limit)return `Espaços de ${slug(r.slot).title} preenchidos. Retire um implante ou solicite ajuste ao mestre.`;
 return '';
}
async function equip(actor,id,diff,target={}){
 if(!canUse(actor))throw Error('Você precisa ser proprietário da ficha para instalar ou retirar cyberwares.');
 const data=read(actor),r=data.implants.find(x=>x.id===id);if(!r)throw Error('Implante indisponível no inventário.');
 if(target.region&&r.slot!==target.region)throw Error(`Encaixe incompatível. Use ${slug(r.slot).title}.`);
 if(diff>0){const reason=checkInstall(data,id);if(reason)throw Error(reason);
  const index=target.index??freeSlot(data,r.slot),limit=slots(data,r.slot);
  if(!Number.isInteger(index)||index<0||(limit&&index>=limit)||occupied(data,r.slot).some(x=>x.index===index))throw Error('Este encaixe está ocupado ou indisponível.');
  r.installedSlots.push(index);r.installedQuantity++;r.status='Operacional';
 }else{
  const index=target.sourceIndex??r.installedSlots.at(-1);if(!r.installedSlots.includes(index))throw Error('Nenhuma unidade instalada neste encaixe.');
  r.installedSlots=r.installedSlots.filter(n=>n!==index);r.installedQuantity--;
 }
 r.installed=r.installedQuantity>0;await actor.setFlag(ID,FLAG,data);
}
async function moveImplant(actor,payload,region,index){
 if(!canUse(actor))throw Error('Você precisa ser proprietário da ficha.');
 if(payload.actor!==actorKey(actor))throw Error('Arraste um implante do inventário deste piloto.');
 const data=read(actor),i=data.implants.find(i=>i.id===payload.id);if(!i)throw Error('Implante não encontrado.');
 if(region==='reserve'){if(payload.source!=='installed')throw Error('O implante já está na reserva.');return equip(actor,i.id,-1,{sourceIndex:payload.index})}
 if(i.slot!==region)throw Error(`Encaixe incompatível. Use ${slug(i.slot).title}.`);
 if(payload.source==='reserve')return equip(actor,i.id,1,{region,index});
 if(payload.source!=='installed'||!i.installedSlots.includes(payload.index))throw Error('Origem do implante inválida.');
 const next=index??freeSlot(data,region),limit=slots(data,region);
 if(next===payload.index)return;
 if(!Number.isInteger(next)||next<0||(limit&&next>=limit)||occupied(data,region).some(x=>x.index===next))throw Error('O encaixe de destino está ocupado.');
 i.installedSlots=i.installedSlots.map(n=>n===payload.index?next:n);await actor.setFlag(ID,FLAG,data);
}
async function togglePower(actor,id){
 if(!canUse(actor))throw Error('Você precisa ser proprietário da ficha.');
 const data=read(actor),i=data.implants.find(i=>i.id===id);if(!i?.installedQuantity)throw Error('Instale o implante antes de ativá-lo.');
 if(!['Operacional','Desativado'].includes(i.status))throw Error('Solicite reparo ao mestre antes de ativar este implante.');
 i.status=i.status==='Operacional'?'Desativado':'Operacional';await actor.setFlag(ID,FLAG,data);
}
async function saveActor(a,data){if(!gm())throw Error('Acesso restrito ao mestre.');await a.setFlag(ID,FLAG,data)}
async function saveCatalog(data){if(!gm())throw Error('Acesso restrito ao mestre.');await game.settings.set(ID,CAT,{items:data.items.slice(0,500)})}
const notify=err=>{console.error('[CYBER//IMPLANTES]',err);globalThis.ui?.notifications?.error?.(err?.message||'Não foi possível salvar.');};
const opts=(name,choices,value)=>`<select name="${name}">${choices.map(o=>{const v=typeof o==='string'?o:o.id,l=typeof o==='string'?o:o.title;return `<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`}).join('')}</select>`;
function categoryCounts(data){return REGIONS.map(r=>{const items=data.implants.filter(i=>i.slot===r.id),installed=items.reduce((s,i)=>s+i.installedQuantity,0),reserve=items.reduce((s,i)=>s+i.quantity-i.installedQuantity,0);return {...r,items,installed,reserve,limit:slots(data,r.id)};})}
function neuralLabel(title, region = '', local = false) {
 return `<span class="lcy-neural-label"${region ? ` data-neural-region="${region}"` : ''}${local ? ' data-neural-local' : ''}>
   <span class="lcy-neural-normal">${esc(title)}</span><span class="lcy-neural-question" aria-hidden="true"></span>
 </span>`;
}

function categoryGrid(data, st, id) {
 const cards = categoryCounts(data).map(region => {
  const selected = st.category === region.id;
  const positions = new Set(occupied(data, region.id).map(entry => entry.index));
  const count = Math.min(region.limit || Math.max(region.installed + 1, 3), 12);
  const sockets = Array.from({length: count}, (_, index) => `<i class="${positions.has(index) ? 'filled' : ''}"></i>`).join('');
  return `<button type="button" class="lcy-cat ${selected ? 'selected' : ''}"
       data-cyber-action="category" data-region="${region.id}" data-drop-region="${region.id}"
       aria-pressed="${selected}" aria-controls="${id}-workbench">
     <span class="lcy-cat-top">
       <span class="lcy-cat-symbol">${icon(region.id)}</span>
       <span class="lcy-cat-count" aria-hidden="true">${region.installed}<small> / ${region.limit || '∞'}</small></span>
     </span>
     <span class="lcy-cat-name">${neuralLabel(region.title, region.id)}</span>
     <span class="lcy-sr-only">${region.installed} em uso. ${region.limit ? 'Limite de ' + region.limit + ' encaixes.' : 'Sem limite de encaixes.'}</span>
     <span class="lcy-cat-foot">${region.reserve} na reserva</span>
     <span class="lcy-mini-sockets" aria-hidden="true">${sockets}</span>
   </button>`;
 }).join('');
 return `<section class="lcy-cat-section" aria-labelledby="${id}-systems">
   <div class="lcy-section-title"><h3 id="${id}-systems">Sistemas cibernéticos</h3></div>
   <div class="lcy-cat-grid">${cards}</div>
 </section>`;
}

function rarityBadge(grade) {
 const label = rarity(grade);
 return `<span class="lcy-rarity-badge" data-rarity="${esc(label)}"><i aria-hidden="true"></i>${esc(label)}</span>`;
}

function dragAttrs(i, actor, source, index) {
 return canUse(actor) ? `draggable="true" data-drag-id="${esc(i.id)}" data-drag-source="${source}" ${index === undefined ? '' : `data-drag-index="${index}"`}` : '';
}

function itemCard(i, st, actor) {
 return `<button type="button" class="lcy-item-card ${st.selected === i.id ? 'selected' : ''}"
      data-rarity="${esc(i.grade)}" data-cyber-action="select" data-id="${esc(i.id)}"
      ${dragAttrs(i, actor, 'reserve')} aria-haspopup="dialog">
   ${imageHTML(i, 'lcy-item-art')}
   <span class="lcy-item-text">
     <strong>${esc(i.name)}</strong>
     ${i.manufacturer ? `<small>${esc(i.manufacturer)}</small>` : ''}
     <span class="lcy-item-meta">${rarityBadge(i.grade)}<span>${i.load} CN</span></span>
     <span class="lcy-item-state">${i.quantity - i.installedQuantity} na reserva</span>
   </span>
 </button>`;
}

function infoSelected(data, st) {
 return data.implants.find(i => i.slot === st.category && i.id === st.selected) || null;
}

function detailPanel(i, region, id) {
 if (!i) return `<aside class="lcy-detail" aria-labelledby="${id}-detail">
   <div class="lcy-detail-empty">
     <span aria-hidden="true">${icon(region.id)}</span>
     <h4 id="${id}-detail">Dossiê de implante</h4>
     <p>Selecione um implante para ver seus efeitos, sua condição e o custo neural.</p>
   </div>
 </aside>`;
 return `<aside class="lcy-detail" data-rarity="${esc(i.grade)}" aria-labelledby="${id}-detail">
   <div class="lcy-detail-head">${rarityBadge(i.grade)}</div>
   ${imageHTML(i, 'lcy-hero-art')}
   <div class="lcy-detail-content">
     ${i.manufacturer ? `<span class="lcy-manufacturer">${esc(i.manufacturer)}</span>` : ''}
     <h4 id="${id}-detail">${esc(i.name)}</h4>
     ${i.description ? `<p class="lcy-detail-summary">${esc(i.description)}</p>` : ''}
     <div class="lcy-quick-spec"><span>${i.load} CN</span><span>Potência ${i.potency}/5</span></div>
     <button type="button" class="lcy-action-primary lcy-open-dossier"
          data-cyber-action="select" data-id="${esc(i.id)}" aria-haspopup="dialog">Abrir dossiê</button>
   </div>
 </aside>`;
}

function slotGrid(data, st, actor) {
 const region = slug(st.category);
 const entries = occupied(data, region.id);
 const limit = slots(data, region.id);
 const highest = entries.length ? Math.max(...entries.map(entry => entry.index)) + 1 : 0;
 const count = limit ? Math.max(limit, highest) : Math.max(3, highest + 1);
 const editable = canUse(actor);
 const items = new Map(entries.map(entry => [entry.index, entry.item]));
 const cards = Array.from({length: count}, (_, index) => {
  const item = items.get(index);
  const number = index + 1;
  const position = `<span class="lcy-socket-number">
    <span class="lcy-sr-only">Encaixe </span>${String(number).padStart(2, '0')}${limit && index >= limit ? ' · Excesso' : ''}
  </span>`;
  if (item) return `<button type="button" class="lcy-socket occupied ${item.status === 'Operacional' ? 'online' : 'offline'} ${st.selected === item.id ? 'selected' : ''}"
       data-rarity="${esc(item.grade)}" data-cyber-action="select" data-id="${esc(item.id)}"
       data-drop-region="${region.id}" data-slot-index="${index}"
       ${dragAttrs(item, actor, 'installed', index)} aria-haspopup="dialog">
     ${position}${imageHTML(item, 'lcy-socket-art')}
     <strong>${esc(item.name)}</strong>
     ${rarityBadge(item.grade)}
     <small class="lcy-power-state">${esc(item.status)}</small>
   </button>`;
  return `<button type="button" class="lcy-socket empty" data-cyber-action="socket"
       data-drop-region="${region.id}" data-slot-index="${index}" ${editable ? '' : 'disabled'}
       aria-label="${editable ? 'Instalar no encaixe' : 'Encaixe livre'} ${number} de ${esc(region.title)}"
       ${editable ? 'aria-haspopup="dialog"' : ''}>
     ${position}<span class="lcy-socket-icon" aria-hidden="true">${icon(region.id)}</span>
     <strong>Encaixe livre</strong>${editable ? '<small>Solte ou selecione</small>' : ''}
   </button>`;
 }).join('');
 return `<div class="lcy-socket-grid">${cards}</div>`;
}

function reserveCards(data, st, actor) {
 const query = st.search.trim().toLocaleLowerCase('pt-BR');
 const spare = data.implants.filter(i => i.slot === st.category && i.quantity > i.installedQuantity);
 const matches = spare.filter(i => !query || [i.name, i.manufacturer, i.grade, i.description, i.function]
   .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(query)));
 if (matches.length) return matches.map(i => itemCard(i, st, actor)).join('');
 return `<p class="lcy-empty-slot">${query ? 'Nenhum implante encontrado.' : 'A reserva deste sistema está vazia.'}</p>`;
}

function inventory(data, st, actor, id) {
 const region = slug(st.category);
 const items = data.implants.filter(i => i.slot === region.id);
 const installed = items.reduce((count, item) => count + item.installedQuantity, 0);
 const reserve = items.reduce((count, item) => count + item.quantity - item.installedQuantity, 0);
 const limit = slots(data, region.id);
 const owner = canUse(actor);
 return `<section class="lcy-workbench" id="${id}-workbench" aria-labelledby="${id}-region">
   <div class="lcy-inventory">
     <div class="lcy-workbench-head">
       <span class="lcy-region-emblem" aria-hidden="true">${icon(region.id)}</span>
       <h3 id="${id}-region" tabindex="-1">${neuralLabel(region.title, region.id, true)}</h3>
       <button type="button" class="lcy-systems-back" data-cyber-action="systems"><span aria-hidden="true">↑</span> Voltar aos sistemas</button>
     </div>
     <section aria-labelledby="${id}-installed">
       <div class="lcy-equipped-row"><h4 id="${id}-installed">${neuralLabel('Instalados', '', true)}</h4>
         <strong>${limit ? `${installed} de ${limit} encaixes` : `${installed} em uso · Sem limite`}</strong>
       </div>
       ${slotGrid(data, st, actor)}
     </section>
     <section class="lcy-reserve" data-drop-region="reserve" aria-labelledby="${id}-reserve">
       <div class="lcy-equipped-row lcy-inventory-label"><h4 id="${id}-reserve">${neuralLabel('Reserva', '', true)}</h4>
         <strong>${reserve} ${reserve === 1 ? 'unidade' : 'unidades'}</strong>
       </div>
       ${owner && installed ? '<p class="lcy-reserve-help">Para retirar, arraste o implante instalado até a reserva.</p>' : ''}
       <label class="lcy-search"><span aria-hidden="true">⌕</span>
         <input type="search" data-cyber-search placeholder="Buscar na reserva" value="${esc(st.search)}" aria-label="Buscar na reserva de ${esc(region.title)}">
       </label>
       <div class="lcy-items-grid">${reserveCards(data, st, actor)}</div>
     </section>
   </div>
   ${detailPanel(infoSelected(data, st), region, id)}
 </section>`;
}

const DOSSIER_TABS = [['description', 'Descrição'], ['effects', 'Efeitos'], ['technical', 'Dados técnicos']];

function dossier(i, data, actor, id) {
 const available = i.quantity - i.installedQuantity;
 const blocked = checkInstall(data, i.id);
 const owner = canUse(actor);
 const index = state(actor).selectedSocket;
 const slot = Number.isInteger(index) && i.installedSlots.includes(index) ? index : null;
 const active = i.status === 'Operacional';
 return `<article class="lcy-dossier" data-rarity="${esc(i.grade)}">
   <div class="lcy-modal-bar"><span>${esc(slug(i.slot).title)}</span>
     <button type="button" data-cyber-action="close-modal" aria-label="Fechar dossiê">✕</button>
   </div>
   <div class="lcy-dossier-intro">
     ${imageHTML(i, 'lcy-dossier-art')}
     <div>
       ${i.manufacturer ? `<span class="lcy-manufacturer">${esc(i.manufacturer)}</span>` : ''}
       <h3>${esc(i.name)}</h3>
       <div class="lcy-dossier-tags">${rarityBadge(i.grade)}
         <span class="lcy-condition">${i.installedQuantity ? esc(i.status) : 'Na reserva'}</span>
       </div>
       <dl class="lcy-spec-grid">
         <div><dt>Custo neural</dt><dd>${i.load} CN</dd></div>
         <div><dt>Potência</dt><dd>${i.potency}/5</dd></div>
         <div><dt>Preço</dt><dd>${num(i.cost || 0, 0, 999999999).toLocaleString('pt-BR')} €$</dd></div>
         <div><dt>Unidades instaladas</dt><dd>${i.installedQuantity} de ${i.quantity}</dd></div>
       </dl>
     </div>
   </div>
   <div class="lcy-dossier-tabs" role="tablist" aria-label="Informações do implante">
     ${DOSSIER_TABS.map(([key, label], index) => `<button type="button" id="${id}-tab-${key}" role="tab"
         aria-controls="${id}-info-${key}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}"
         data-cyber-action="detail-tab" data-detail-tab="${key}">${label}</button>`).join('')}
   </div>
   <section id="${id}-info-description" role="tabpanel" aria-labelledby="${id}-tab-description" tabindex="0">
     <div class="lcy-description"><p>${esc(i.description || 'Descrição indisponível.')}</p></div>
   </section>
   <section id="${id}-info-effects" role="tabpanel" aria-labelledby="${id}-tab-effects" tabindex="0" hidden>
     <div class="lcy-description"><h4>Efeitos</h4><p>${esc(i.function || 'Nenhum efeito cadastrado.')}</p></div>
     ${i.drawback ? `<div class="lcy-description downside"><h4>Contrapartidas</h4><p>${esc(i.drawback)}</p></div>` : ''}
   </section>
   <section id="${id}-info-technical" role="tabpanel" aria-labelledby="${id}-tab-technical" tabindex="0" hidden>
     <dl class="lcy-spec-grid lcy-technical-spec">
       <div><dt>Sistema</dt><dd>${esc(slug(i.slot).title)}</dd></div>
       <div><dt>Condição</dt><dd>${esc(i.status)}</dd></div>
       <div><dt>Unidades na reserva</dt><dd>${available}</dd></div>
     </dl>
     ${i.notes ? `<div class="lcy-description"><h4>Observações</h4><p>${esc(i.notes)}</p></div>` : ''}
   </section>
   ${owner ? `<div class="lcy-dossier-bottom">
     <div class="lcy-detail-actions">
       <button type="button" data-cyber-action="install" data-id="${esc(i.id)}" class="lcy-action-primary"
          ${!available || blocked ? 'disabled' : ''}>Instalar e ativar</button>
       <button type="button" data-cyber-action="uninstall" data-id="${esc(i.id)}"
          ${slot === null ? '' : `data-source-index="${slot}"`} ${!i.installedQuantity ? 'disabled' : ''}>
          ${slot === null ? 'Retirar uma unidade' : `Retirar do encaixe ${slot + 1}`}
       </button>
       <button type="button" data-cyber-action="power" data-id="${esc(i.id)}"
          ${!i.installedQuantity || !['Operacional', 'Desativado'].includes(i.status) ? 'disabled' : ''}>
          ${active ? 'Desativar' : 'Ativar'} modelo
       </button>
     </div>
     ${blocked && available ? `<p class="lcy-blocked">${esc(blocked)}</p>` : ''}
     ${i.installedQuantity > 1 ? '<small>Ativar ou desativar afeta todas as unidades deste modelo.</small>' : ''}
   </div>` : ''}
 </article>`;
}

function openDossier(panel, actor, id) {
 const data = read(actor);
 const item = data.implants.find(i => i.id === id);
 if (item) openModal(panel, dossier(item, data, actor, panel.id + '-dossier'));
}

const SIGNAL = {
 stable: {label: 'Estável', description: 'Leitura sincronizada'},
 watch: {label: 'Monitoramento', description: 'Oscilação no pulso'},
 warn: {label: 'Instabilidade', description: 'Perda parcial de amostras'},
 danger: {label: 'Risco crítico', description: 'Leitura intermitente'},
 collapse: {label: 'Colapso iminente', description: 'Perda de sincronização'}
};

function telemetry(m, st) {
 const link = neuralReadouts(m.stage.id, m.risk);
 return `<section class="lcy-telemetry" data-stage="${m.stage.id}" aria-label="Diagnóstico do sinal neural">
   <div class="lcy-signal-copy">
     <h3>Sinal neural</h3>
     <p>${SIGNAL[m.stage.id].description}</p>
   </div>
   <div class="lcy-signal" aria-hidden="true">
     <canvas class="lcy-scope-canvas" width="480" height="70"></canvas>
   </div>
   <button type="button" data-cyber-action="quiet" aria-pressed="${st.quiet}">Reduzir efeitos</button>
   <dl class="lcy-link-readouts">
     <div class="lcy-link-sync"><dt>Sincronia</dt><dd>${link.sync}</dd></div>
     <div><dt>Quadro</dt><dd>${link.frame}</dd></div>
     <div><dt>Origem</dt><dd>${link.origin}</dd></div>
     <div><dt>Pacote</dt><dd>${link.packet}</dd></div>
   </dl>
 </section>`;
}

function statusHeader(data, m) {
 const load = data.capacity ? Math.min(1, m.load / data.capacity) : 0;
 return `<dl class="lcy-status" aria-label="Estatísticas do piloto">
   <div class="lcy-capacity">
     <dt>Carga neural</dt>
     <dd class="lcy-status-value">${m.load} <small>/ ${data.capacity || '∞'} CN</small></dd>
     ${data.capacity ? `<dd class="lcy-bar" aria-hidden="true" data-meter="load" data-fill="${load}"><i style="--lcy-fill:${load}"></i></dd>`
       : '<dd class="lcy-metric-note">Sem limite</dd>'}
   </div>
   <div class="lcy-status-metric lcy-risk" data-stage="${m.stage.id}">
     <dt>Cyberpsicose</dt>
     <dd class="lcy-status-value"><span class="lcy-value-ink">${m.risk}<span class="lcy-ink-echo" data-ink="${m.risk}" aria-hidden="true"></span></span><small>%</small></dd>
     <dd class="lcy-metric-note">${m.stage.label}</dd>
     <dd class="lcy-risk-scale" aria-hidden="true" data-meter="risk" data-fill="${m.risk / 100}">
       <i style="--lcy-fill:${m.risk / 100}"></i><span></span>
     </dd>
   </div>
   <div class="lcy-status-metric">
     <dt>Integridade neural</dt>
     <dd class="lcy-status-value"><span class="lcy-value-ink">${m.humanity}<span class="lcy-ink-echo" data-ink="${m.humanity}" aria-hidden="true"></span></span><small>%</small></dd>
   </div>
   <div class="lcy-status-metric">
     <dt>Implantes instalados</dt>
     <dd class="lcy-status-value">${m.count}</dd>
     <dd class="lcy-metric-note">${m.operating} ${m.operating === 1 ? 'operacional' : 'operacionais'} · ${m.reserve} na reserva</dd>
   </div>
 </dl>`;
}

function pilotView(actor, data, st, m, id) {
 return `${statusHeader(data, m)}${telemetry(m, st)}
   ${!canUse(actor) ? '<p class="lcy-readonly">Somente leitura. O proprietário da ficha pode instalar e retirar implantes.</p>' : ''}
   ${categoryGrid(data, st, id)}${inventory(data, st, actor, id)}`;
}
function catalogueRows(st) {
 const query = st.gmSearch.toLocaleLowerCase('pt-BR');
 const items = getCatalog().items.filter(i => (st.gmCategory === 'all' || i.slot === st.gmCategory)
   && [i.name, i.manufacturer, i.grade, i.description, i.function, slug(i.slot).title]
     .some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(query)));
 const rows = items.map(i => `<tr>
   <th scope="row" class="lcy-gm-name">${tableItem(i)}</th>
   <td>${esc(slug(i.slot).title)}</td><td>${rarityBadge(i.grade)}</td><td>${i.load} CN</td>
   <td class="lcy-gm-buttons">
     <button type="button" data-cyber-action="assign" data-id="${esc(i.id)}" class="lcy-action-primary">Atribuir</button>
     <button type="button" data-cyber-action="catalog-edit" data-id="${esc(i.id)}">Editar</button>
     <button type="button" data-cyber-action="catalog-delete" data-id="${esc(i.id)}" class="lcy-red-button">Excluir</button>
   </td>
 </tr>`).join('');
 return `<div class="lcy-gm-table-wrap"><table class="lcy-gm-table">
   <caption class="lcy-sr-only">Catálogo de implantes</caption>
   <thead><tr><th scope="col">Implante</th><th scope="col">Sistema</th><th scope="col">Raridade</th>
     <th scope="col">Custo neural</th><th scope="col">Ações</th></tr></thead>
   <tbody>${rows || `<tr><td colspan="5"><p class="lcy-empty-slot">${query || st.gmCategory !== 'all'
     ? 'Nenhum modelo encontrado.' : 'O catálogo está vazio.'}</p></td></tr>`}</tbody>
 </table></div>`;
}

function tableItem(i) {
 return `<div class="lcy-gm-product" data-rarity="${esc(i.grade)}">
   ${imageHTML(i, 'lcy-gm-thumb')}<span><strong>${esc(i.name)}</strong>${i.manufacturer ? `<small>${esc(i.manufacturer)}</small>` : ''}</span>
 </div>`;
}

function assignedRows(data) {
 const rows = data.implants.map(i => `<tr>
   <th scope="row" class="lcy-gm-name">${tableItem(i)}</th>
   <td>${esc(slug(i.slot).title)}</td><td>${rarityBadge(i.grade)}</td><td>${i.installedQuantity} de ${i.quantity}</td>
   <td class="lcy-gm-buttons">
     <button type="button" data-cyber-action="assignment-edit" data-id="${esc(i.id)}">Quantidade</button>
     <button type="button" data-cyber-action="actor-edit" data-id="${esc(i.id)}">Editar</button>
     <button type="button" data-cyber-action="actor-remove" data-id="${esc(i.id)}" class="lcy-red-button">Remover</button>
     ${!i.templateId ? `<button type="button" data-cyber-action="legacy-import" data-id="${esc(i.id)}">Importar</button>` : ''}
   </td>
 </tr>`).join('');
 return `<div class="lcy-gm-table-wrap"><table class="lcy-gm-table">
   <caption class="lcy-sr-only">Inventário do piloto</caption>
   <thead><tr><th scope="col">Implante</th><th scope="col">Sistema</th><th scope="col">Raridade</th>
     <th scope="col">Instalados</th><th scope="col">Ações</th></tr></thead>
   <tbody>${rows || '<tr><td colspan="5"><p class="lcy-empty-slot">O piloto ainda não recebeu implantes.</p></td></tr>'}</tbody>
 </table></div>`;
}

function masterView(data, st, id) {
 return `<div class="lcy-master">
   <section aria-labelledby="${id}-catalogue">
     <div class="lcy-master-top">
       <h3 id="${id}-catalogue">Catálogo de implantes</h3>
       <button type="button" data-cyber-action="catalog-new" class="lcy-action-primary">Criar implante</button>
     </div>
     <div class="lcy-gm-toolbar">
       <label class="lcy-search"><span aria-hidden="true">⌕</span>
         <input type="search" data-cyber-gm-search value="${esc(st.gmSearch)}" placeholder="Buscar no catálogo" aria-label="Buscar no catálogo">
       </label>
       <label class="lcy-gm-filter">Sistema
         <select data-cyber-gm-category>
           <option value="all">Todos</option>
           ${REGIONS.map(r => `<option value="${r.id}" ${st.gmCategory === r.id ? 'selected' : ''}>${esc(r.title)}</option>`).join('')}
         </select>
       </label>
     </div>
     ${catalogueRows(st)}
   </section>
   <section aria-labelledby="${id}-assigned">
     <div class="lcy-master-top lcy-master-segment"><h3 id="${id}-assigned">Inventário do piloto</h3></div>
     ${assignedRows(data)}
   </section>
   <section aria-labelledby="${id}-settings">
     <div class="lcy-master-top lcy-master-segment"><h3 id="${id}-settings">Capacidade e encaixes</h3></div>
     <form class="lcy-settings-form" data-kind="settings">
       <label>Capacidade do piloto (CN)<input type="number" min="0" max="9999" name="capacity" value="${data.capacity}"></label>
       <label>Capacidade padrão do mundo (CN)<input type="number" min="1" max="9999" name="defaultCapacity" value="${num(setting('defaultCapacity', 60), 1, 9999)}"></label>
       <label class="lcy-setting-check"><input type="checkbox" name="allowOverload" ${setting('allowOverload', false) ? 'checked' : ''}>Permitir exceder a capacidade</label>
       <fieldset class="lcy-slot-limits">
         <legend>Encaixes por sistema (0 = sem limite)</legend>
         <div>${REGIONS.map(r => `<label>${esc(r.title)}<input type="number" name="slot_${r.id}" min="0" max="99" value="${slots(data, r.id)}"></label>`).join('')}</div>
       </fieldset>
       <button type="submit" class="lcy-action-primary">Salvar limites</button>
     </form>
   </section>
 </div>`;
}

function content(actor, id = 'lcy-preview') {
 const data = read(actor);
 const st = state(actor);
 const m = metrics(data);
 if (!gm()) st.mode = 'pilot';
 return `<div class="lcy-shell ${st.quiet ? 'lcy-quiet' : ''}" data-risk-stage="${m.stage.id}" data-risk-score="${m.risk}" data-view="${st.mode}">
   <div class="lcy-feedback" role="status"></div>
   <header class="lcy-header">
     <div>
       ${actor.name ? `<span>${esc(actor.name)}</span>` : ''}
       <h2 id="${id}-title" class="lcy-ink" data-ink="CYBER//WARE">CYBER<span>//</span>WARE<span class="lcy-ink-echo" data-ink="CYBER//WARE" aria-hidden="true"></span></h2>
     </div>
     <span class="lcy-header-right">${gm() ? 'Mestre' : canUse(actor) ? 'Piloto' : 'Somente leitura'}</span>
   </header>
   ${gm() ? `<div class="lcy-mode-tabs" role="group" aria-label="Modo da interface">
       <button type="button" data-cyber-action="show-pilot" aria-pressed="${st.mode === 'pilot'}" class="${st.mode === 'pilot' ? 'active' : ''}">Ficha do piloto</button>
       <button type="button" data-cyber-action="show-gm" aria-pressed="${st.mode === 'gm'}" class="${st.mode === 'gm' ? 'active' : ''}">Oficina do mestre</button>
     </div>` : ''}
   ${st.mode === 'gm' ? masterView(data, st, id) : pilotView(actor, data, st, m, id)}
   <footer class="lcy-footer">CYBER//IMPLANTES · LANCER · v0.10.1</footer>
 </div>`;
}

function recordForm(i = {}, kind = 'catalogue') {
 const im = imgConfig(i);
 return `<form class="lcy-editor-form" data-kind="${kind}">
   <div class="lcy-modal-bar"><span>${kind === 'catalogue' ? 'Catálogo' : 'Inventário do piloto'}</span>
     <button type="button" data-cyber-action="close-modal" aria-label="Fechar editor">✕</button>
   </div>
   <h3>${i.id ? 'Editar implante' : 'Novo implante'}</h3>
   <div class="lcy-editor-columns">
     <div class="lcy-editor-image">
       <h4>Imagem do implante</h4>
       <div class="lcy-crop-stage">${imageHTML(i, 'lcy-crop-art')}<span class="lcy-crop-cross" aria-hidden="true">+</span></div>
       <label>Caminho ou URL da imagem<input name="image" value="${esc(im.url)}" placeholder="modules/.../imagem.webp"></label>
       <button type="button" data-cyber-action="browse-image">Escolher arquivo no Foundry</button>
       <p>Arraste para enquadrar. Use a roda do mouse ou o controle para ajustar o zoom.</p>
       <div class="lcy-crop-control">
         <label>Zoom<input type="range" name="imageZoom" min="1" max="3" step="0.01" value="${im.zoom}"></label>
         <output data-cyber-zoom>${im.zoom.toFixed(2)}x</output>
       </div>
       <div class="lcy-pan-row">
         <label>Horizontal<input type="range" name="imageX" min="-60" max="60" step="1" value="${im.x}"></label>
         <label>Vertical<input type="range" name="imageY" min="-60" max="60" step="1" value="${im.y}"></label>
       </div>
       <button type="button" data-cyber-action="reset-image">Restaurar enquadramento</button>
     </div>
     <div class="lcy-editor-fields">
       <label>Nome do modelo<input name="name" maxlength="100" required placeholder="Ex.: Sandevistan Mk.III" value="${esc(i.name || '')}"></label>
       <div class="lcy-two-fields">
         <label>Sistema corporal${opts('slot', REGIONS, i.slot || 'neural')}</label>
         <label>Raridade${opts('grade', TIERS, i.grade || 'Raro')}</label>
       </div>
       <div class="lcy-two-fields">
         <label>Fabricante<input name="manufacturer" maxlength="100" value="${esc(i.manufacturer || '')}"></label>
         <label>Condição${opts('status', STATUS, i.status || 'Operacional')}</label>
       </div>
       <div class="lcy-three-fields">
         <label>Custo neural (CN)<input type="number" name="load" min="0" max="9999" value="${num(i.load ?? 2)}"></label>
         <label>Potência (1–5)<input type="number" name="potency" min="1" max="5" value="${num(i.potency ?? 2, 1, 5)}"></label>
         <label>Preço (€$)<input type="number" name="cost" min="0" max="999999999" value="${num(i.cost ?? 0)}"></label>
       </div>
       <label>Descrição<textarea name="description" maxlength="2500" rows="4">${esc(i.description || '')}</textarea></label>
       <label>Efeitos e estatísticas<textarea name="function" maxlength="2500" rows="4">${esc(i.function || '')}</textarea></label>
       <label>Contrapartidas<textarea name="drawback" maxlength="1200" rows="2">${esc(i.drawback || '')}</textarea></label>
       <label>Observações<textarea name="notes" maxlength="1500" rows="2">${esc(i.notes || '')}</textarea></label>
     </div>
   </div>
   <div class="lcy-editor-actions">
     <button type="button" data-cyber-action="close-modal">Cancelar</button>
     <button type="submit" class="lcy-action-primary">Salvar implante</button>
   </div>
 </form>`;
}
function parseRecord(form,old={}){const d=new FormData(form),s=(k,n)=>String(d.get(k)||'').trim().slice(0,n),name=s('name',100);if(!name)throw Error('O nome do implante é obrigatório.');return {...old,id:old.id||rand(),name,slot:slug(s('slot',30)).id,grade:TIERS.includes(s('grade',50))?s('grade',50):'Comum',manufacturer:s('manufacturer',100),status:STATUS.includes(s('status',50))?s('status',50):'Operacional',load:num(d.get('load'),0,9999),potency:num(d.get('potency'),1,5),cost:num(d.get('cost'),0,999999999),description:s('description',2500),function:s('function',2500),drawback:s('drawback',1200),notes:s('notes',1500),image:safeImage(s('image',800)),imageZoom:clamp(d.get('imageZoom'),1,3),imageX:clamp(d.get('imageX'),-60,60),imageY:clamp(d.get('imageY'),-60,60)}}
function assignmentForm(i, qty = 1, installed = 0, edit = false) {
 return `<form class="lcy-small-form" data-kind="assignment" data-rarity="${esc(i.grade)}">
   <div class="lcy-modal-bar"><span>Inventário do piloto</span>
     <button type="button" data-cyber-action="close-modal" aria-label="Fechar atribuição">✕</button>
   </div>
   <h3>${edit ? 'Editar quantidade' : 'Atribuir implante'}</h3>
   ${imageHTML(i, 'lcy-assign-art')}
   <strong>${esc(i.name)}</strong>
   <p class="lcy-assignment-meta">${rarityBadge(i.grade)} <span>${esc(slug(i.slot).title)} · ${i.load} CN</span></p>
   <label>Total de unidades<input type="number" name="quantity" min="1" max="99" value="${num(qty, 1, 99)}" required></label>
   <label>Unidades já instaladas<input type="number" name="installedQuantity" min="0" max="99" value="${num(installed, 0, 99)}" required></label>
   <div class="lcy-editor-actions">
     <button type="button" data-cyber-action="close-modal">Cancelar</button>
     <button type="submit" class="lcy-action-primary">${edit ? 'Salvar' : 'Atribuir'}</button>
   </div>
 </form>`;
}

function syncNeuralMotion(panel) {
 const shell = panel.querySelector('.lcy-shell');
 const quiet = Boolean(shell?.classList.contains('lcy-quiet'));
 panel.toggleAttribute('data-lcy-quiet', quiet);
 const active = panel.classList.contains('active') && panel.isConnected
   && shell?.dataset.view === 'pilot' && !panel._lcyCloseModal;
 if (active) panel._lcyNeuralMotion ??= new NeuralMotion(panel);
 panel._lcyNeuralMotion?.update(shell, active, quiet);
}

function openModal(panel, markup) {
 panel._lcyCloseModal?.();
 const old = document.activeElement;
 const shell = panel.querySelector('.lcy-shell');
 const overlay = document.createElement('div');
 overlay.className = 'lcy-modal-cover';
 overlay.innerHTML = `<div class="lcy-modal" role="dialog" aria-modal="true">${markup}</div>`;
 const dialog = overlay.firstElementChild;
 const title = dialog.querySelector('h3');
 title.id = panel.id + '-modal-title';
 title.tabIndex = -1;
 dialog.setAttribute('aria-labelledby', title.id);
 panel.append(overlay);
 shell.inert = true;

 const close = ({restoreFocus = true} = {}) => {
  if (!overlay.isConnected) return;
  overlay.remove();
  shell.inert = false;
  panel._lcyCloseModal = null;
  if (restoreFocus) {
   old?.focus({preventScroll: true});
   refresh(panel, panel._lcyActor);
  }
 };
 panel._lcyCloseModal = close;
 syncNeuralMotion(panel);
 overlay.addEventListener('click', event => {
  if (event.target !== overlay && !event.target.closest('[data-cyber-action="close-modal"]')) return;
  event.preventDefault();
  event.stopPropagation();
  close();
 });
 overlay.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
   event.preventDefault();
   event.stopPropagation();
   close();
   return;
  }
  if (event.key === 'Tab') {
   const elements = [...overlay.querySelectorAll('button,input,select,textarea,[tabindex]')]
     .filter(element => !element.disabled && element.tabIndex >= 0 && !element.closest('[hidden]'));
   if (!elements.length) {
    event.preventDefault();
   } else if (event.shiftKey && [title, elements[0]].includes(document.activeElement)) {
    event.preventDefault();
    elements.at(-1).focus();
   } else if (!event.shiftKey && document.activeElement === elements.at(-1)) {
    event.preventDefault();
    elements[0].focus();
   }
  }
  const tab = event.target.closest('[role="tab"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
   event.preventDefault();
   event.stopPropagation();
   const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
   const index = tabs.indexOf(tab);
   const direction = event.key === 'ArrowLeft' ? -1 : 1;
   const target = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1)
     : tabs[(index + direction + tabs.length) % tabs.length];
   target.click();
  }
 });
 // Focusing the title preserves the reading order while exposing the dialog name.
 title.focus({preventScroll: true});
 return {overlay, close};
}
function initImageEditor(overlay){const f=overlay.querySelector('form'),stage=f?.querySelector('.lcy-crop-stage');if(!stage)return;const q=n=>f.elements.namedItem(n),preview=()=>{const url=safeImage(q('image').value),el=stage.querySelector('.lcy-crop-art');if(el){const obj={slot:'neural',image:url,imageZoom:q('imageZoom').value,imageX:q('imageX').value,imageY:q('imageY').value};el.outerHTML=imageHTML(obj,'lcy-crop-art')}f.querySelector('[data-cyber-zoom]').textContent=(+q('imageZoom').value).toFixed(2)+'x'};for(const n of ['image','imageZoom','imageX','imageY'])q(n).addEventListener('input',preview);let start=null;stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;start={px:e.clientX,py:e.clientY,x:+q('imageX').value,y:+q('imageY').value};stage.setPointerCapture?.(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!start)return;const rect=stage.getBoundingClientRect();q('imageX').value=clamp(start.x+(e.clientX-start.px)/rect.width*100,-60,60);q('imageY').value=clamp(start.y+(e.clientY-start.py)/rect.height*100,-60,60);preview()});for(const type of ['pointerup','pointercancel'])stage.addEventListener(type,()=>{start=null});stage.addEventListener('wheel',e=>{e.preventDefault();q('imageZoom').value=clamp(+q('imageZoom').value+(e.deltaY<0?.08:-.08),1,3);preview()},{passive:false});f.querySelector('[data-cyber-action="reset-image"]').addEventListener('click',()=>{q('imageZoom').value='1';q('imageX').value='0';q('imageY').value='0';preview()});f.querySelector('[data-cyber-action="browse-image"]').addEventListener('click',()=>{const Picker=globalThis.foundry?.applications?.apps?.FilePicker?.implementation||globalThis.foundry?.applications?.apps?.FilePicker||globalThis.FilePicker;if(!Picker){notify(Error('O seletor de arquivos do Foundry não está disponível neste ambiente. Cole um caminho ou URL no campo de imagem.'));return}try{const picker=new Picker({type:'image',current:q('image').value,callback:path=>{q('image').value=path;preview()}});picker.render(true)}catch(err){notify(err)}});preview()}
function captureMeters(shell) {
 return Object.fromEntries([...shell.querySelectorAll('[data-meter]')].map(meter => {
  const fill = meter.firstElementChild;
  const scale = fill.getAnimations?.().length ? new DOMMatrix(getComputedStyle(fill).transform).a : Number(meter.dataset.fill);
  return [meter.dataset.meter, scale];
 }));
}

function animateMeters(shell, previous, entering) {
 if (shell.classList.contains('lcy-quiet') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 shell.querySelectorAll('[data-meter]').forEach(meter => {
  const end = Number(meter.dataset.fill);
  const start = entering ? end * .62 : previous[meter.dataset.meter];
  if (start === undefined || Math.abs(end - start) < .01) return;
  const fill = meter.firstElementChild;
  fill.style.setProperty('--lcy-fill-start', start);
  fill.classList.add('lcy-fill-motion');
 });
}

function refresh(panel, actor, motion) {
 if (!panel?.isConnected || panel._lcyCloseModal) return;
 const oldShell = panel.querySelector('.lcy-shell');
 const meters = captureMeters(oldShell);
 const active = panel.contains(document.activeElement) ? document.activeElement : null;
 const isSearch = active?.matches('[data-cyber-search], [data-cyber-gm-search]');
 const selection = isSearch ? [active.selectionStart, active.selectionEnd] : null;
 const action = active?.closest('[data-cyber-action]')?.dataset;
 const filter = active?.matches('[data-cyber-gm-category]');
 const scroll = panel.scrollTop;
 const markup = document.createElement('template');
 markup.innerHTML = content(actor, panel.id);
 const shell = markup.content.firstElementChild;
 oldShell.replaceWith(shell);
 if (motion) shell.dataset.motion = motion;
 panel.scrollTop = scroll;
 syncNeuralMotion(panel);
 if (panel.classList.contains('active')) animateMeters(shell, meters, motion === 'enter');

 if (isSearch) {
  const input = shell.querySelector(active.hasAttribute('data-cyber-search') ? '[data-cyber-search]' : '[data-cyber-gm-search]');
  input?.focus({preventScroll: true});
  if (input) input.setSelectionRange(...selection);
 } else if (filter) {
  shell.querySelector('[data-cyber-gm-category]')?.focus({preventScroll: true});
 } else if (action) {
  const candidates = [...shell.querySelectorAll('[data-cyber-action]:not(:disabled)')];
  const match = candidates.find(({dataset}) => dataset.cyberAction === action.cyberAction && dataset.id === action.id
    && dataset.region === action.region && dataset.slotIndex === action.slotIndex);
  const moved = action.cyberAction === 'select' && candidates.find(({dataset}) => dataset.cyberAction === 'select' && dataset.id === action.id);
  (match || moved)?.focus({preventScroll: true});
 }
}

function scrollToSection(panel, target, focusTarget) {
 focusTarget?.focus({preventScroll: true});
 const quiet = panel.hasAttribute('data-lcy-quiet') || matchMedia('(prefers-reduced-motion: reduce)').matches;
 const behavior = quiet ? 'auto' : 'smooth';
 for (let area = target.parentElement; area && area !== document.body; area = area.parentElement) {
  if (!/^(auto|scroll|overlay)$/.test(getComputedStyle(area).overflowY) || area.scrollHeight <= area.clientHeight) continue;
  const bounds = area.getBoundingClientRect();
  const scale = bounds.height / area.offsetHeight || 1;
  const top = (target.getBoundingClientRect().top - bounds.top) / scale - area.clientTop - 12;
  area.scrollTo({top: area.scrollTop + top, behavior});
  return;
 }
 target.scrollIntoView({block: 'start', behavior});
}

function openSystem(panel, actor, button) {
 const st = state(actor);
 let workbench = panel.querySelector('.lcy-workbench');
 if (st.category !== button.dataset.region) {
  st.category = button.dataset.region;
  st.selected = null;
  st.selectedSocket = null;
  st.search = '';
  const template = document.createElement('template');
  template.innerHTML = inventory(read(actor), st, actor, panel.id);
  const next = template.content.firstElementChild;
  workbench.replaceWith(next);
  workbench = next;
  workbench.dataset.motion = 'category';
  for (const card of panel.querySelectorAll('[data-cyber-action="category"]')) {
   card.classList.toggle('selected', card === button);
   card.setAttribute('aria-pressed', String(card === button));
  }
  panel._lcyNeuralMotion?.rebindLabels();
 }
 scrollToSection(panel, workbench, workbench.querySelector('.lcy-workbench-head h3'));
}

function feedback(panel, message, error = false) {
 const el = panel.querySelector('.lcy-feedback');
 if (!el) return;
 clearTimeout(panel._lcyFeedbackTimer);
 el.classList.toggle('error', error);
 el.classList.add('visible');
 el.textContent = message;
 panel._lcyFeedbackTimer = setTimeout(() => {
  el.classList.remove('visible');
  el.textContent = '';
 }, 5000);
}

function slotPicker(panel, actor, region, index, options) {
 const pop = openModal(panel, `<div class="lcy-slot-picker">
   <div class="lcy-modal-bar"><span>${esc(slug(region).title)} · Encaixe ${index + 1}</span>
     <button type="button" data-cyber-action="close-modal" aria-label="Fechar seleção">✕</button>
   </div>
   <h3>Escolha um implante da reserva</h3>
   <div class="lcy-picker-options">
     ${options.map(i => `<button type="button" data-picker-id="${esc(i.id)}" data-rarity="${esc(i.grade)}">
       ${imageHTML(i, 'lcy-item-art')}
       <span class="lcy-picker-label"><strong>${esc(i.name)}</strong>
         <span class="lcy-picker-meta">${rarityBadge(i.grade)}<small>${i.load} CN</small></span>
       </span>
     </button>`).join('')}
   </div>
 </div>`);
 pop.overlay.querySelectorAll('[data-picker-id]').forEach(button => button.addEventListener('click', () =>
  perform(panel, actor, () => equip(actor, button.dataset.pickerId, 1, {region, index}), 'Implante instalado e ativado.')));
}
async function perform(panel,actor,action,message){const key=actorKey(actor);if(pending.has(key))return;pending.add(key);panel.setAttribute('aria-busy','true');try{await action();panel._lcyCloseModal?.();refresh(panel,actor);feedback(panel,message)}catch(err){feedback(panel,err.message,true);globalThis.ui?.notifications?.warn?.(err.message)}finally{pending.delete(key);panel.removeAttribute('aria-busy')}}
function bindDrag(panel,actor){let dragging=null;
 const clear=()=>{panel.querySelectorAll('.lcy-drop-valid,.lcy-drop-invalid,.lcy-drop-hover').forEach(x=>x.classList.remove('lcy-drop-valid','lcy-drop-invalid','lcy-drop-hover'));panel.classList.remove('lcy-dragging');dragging=null};
 panel.addEventListener('dragstart',e=>{const el=e.target.closest('[data-drag-id]');if(!el||!canUse(actor))return;const i=read(actor).implants.find(i=>i.id===el.dataset.dragId);if(!i||!e.dataTransfer)return;dragging={actor:actorKey(actor),id:i.id,source:el.dataset.dragSource,index:el.hasAttribute('data-drag-index')?Number(el.dataset.dragIndex):undefined};e.dataTransfer.setData(MIME,JSON.stringify(dragging));e.dataTransfer.effectAllowed='move';panel.classList.add('lcy-dragging');for(const target of panel.querySelectorAll('[data-drop-region]')){const ok=target.dataset.dropRegion===i.slot||(target.dataset.dropRegion==='reserve'&&dragging.source==='installed');target.classList.add(ok?'lcy-drop-valid':'lcy-drop-invalid')}});
 panel.addEventListener('dragover',e=>{const target=e.target.closest('[data-drop-region]');if(!target||!e.dataTransfer?.types.includes(MIME))return;e.preventDefault();e.stopPropagation();panel.querySelector('.lcy-drop-hover')?.classList.remove('lcy-drop-hover');target.classList.add('lcy-drop-hover');e.dataTransfer.dropEffect='move'});
 panel.addEventListener('dragleave',e=>{const el=e.target.closest('[data-drop-region]');if(el&&!el.contains(e.relatedTarget))el.classList.remove('lcy-drop-hover')});
 panel.addEventListener('dragend',clear);
 panel.addEventListener('drop',async e=>{const target=e.target.closest('[data-drop-region]');if(!target||!e.dataTransfer?.types.includes(MIME))return;e.preventDefault();e.stopPropagation();let payload;try{payload=JSON.parse(e.dataTransfer.getData(MIME))}catch{clear();feedback(panel,'Dados de arraste inválidos.',true);return}const region=target.dataset.dropRegion,index=target.hasAttribute('data-slot-index')?Number(target.dataset.slotIndex):undefined;clear();await perform(panel,actor,()=>moveImplant(actor,payload,region,index),region==='reserve'?'Implante retirado para a reserva.':'Encaixe atualizado. Implante conectado.');});
 panel.addEventListener('keydown',e=>{const tab=e.target.closest('[role="tab"][data-detail-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')],n=tabs.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(n+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click()});
}
function events(panel,actor){if(panel.dataset.lcyBound)return;panel.dataset.lcyBound='1';bindDrag(panel,actor);
 panel.addEventListener('click',async e=>{const b=e.target.closest('[data-cyber-action]');if(!b||!panel.contains(b))return;const act=b.dataset.cyberAction,id=b.dataset.id,st=state(actor);if(act==='close-modal')return;e.preventDefault();e.stopPropagation();
  if (act === 'category') {
   openSystem(panel, actor, b);
   return;
  }
  if (act === 'systems') {
   const systems = panel.querySelector('.lcy-cat-section');
   scrollToSection(panel, systems, systems.querySelector('.lcy-cat[aria-pressed="true"]'));
   return;
  }
  if(act==='select'){st.selected=id;st.selectedSocket=b.hasAttribute('data-slot-index')?Number(b.dataset.slotIndex):null;refresh(panel,actor);openDossier(panel,actor,id);return}
  if(act==='quiet'){st.quiet=!st.quiet;refresh(panel,actor);return}
  if(act==='detail-tab'){const tabs=b.closest('[role="tablist"]');for(const t of tabs.querySelectorAll('[role="tab"]')){const selected=t===b;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;panel.querySelector('#'+t.getAttribute('aria-controls')).hidden=!selected}b.focus();return}
  if (act === 'socket') {
   if (!canUse(actor)) return;
   const data = read(actor);
   const index = Number(b.dataset.slotIndex);
   const region = st.category;
   const options = data.implants.filter(i => i.slot === region && i.quantity > i.installedQuantity);
   const selected = options.find(i => i.id === st.selected);
   if (selected) await perform(panel, actor, () => equip(actor, selected.id, 1, {region, index}), 'Implante instalado e ativado.');
   else if (options.length) slotPicker(panel, actor, region, index, options);
   else feedback(panel, 'A reserva deste sistema está vazia.', true);
   return;
  }

  if(act==='show-pilot'){if(st.mode!=='pilot'){st.mode='pilot';refresh(panel,actor,'view')}return}
  if(['install','uninstall','power'].includes(act)){await perform(panel,actor,()=>act==='power'?togglePower(actor,id):equip(actor,id,act==='install'?1:-1,b.hasAttribute('data-source-index')?{sourceIndex:Number(b.dataset.sourceIndex)}:{}),act==='power'?'Estado operacional atualizado.':act==='install'?'Implante instalado e ativado.':'Uma unidade retornou à reserva.');return}
  if(!gm())return;const data=read(actor),catalog=getCatalog();if(act==='show-gm'){if(st.mode!=='gm'){st.mode='gm';refresh(panel,actor,'view')}return}
  if(['catalog-new','catalog-edit','actor-edit'].includes(act)){
   const isActor=act==='actor-edit',target=act==='catalog-new'?{}:(isActor?data.implants:catalog.items).find(i=>i.id===id);if(!target)return;
   const pop=openModal(panel,recordForm(target,isActor?'actor':'catalogue'));initImageEditor(pop.overlay);
   pop.overlay.querySelector('form').addEventListener('submit',async ev=>{ev.preventDefault();let rec;try{rec=parseRecord(ev.currentTarget,target)}catch(err){notify(err);return};const f=ev.currentTarget,b=f.querySelector('[type="submit"]');b.disabled=true;
    try{if(isActor){const current=read(actor);current.implants=current.implants.map(i=>i.id===id?{...rec,quantity:i.quantity,installedQuantity:i.installedQuantity,installed:i.installedQuantity>0,templateId:i.templateId}:i);await saveActor(actor,current)}else{const c=getCatalog();if(!target.id&&c.items.length>=500)throw Error('Limite do catálogo atingido (500 modelos).');c.items=target.id?c.items.map(i=>i.id===id?rec:i):[...c.items,rec];await saveCatalog(c)}pop.close();refresh(panel,actor)}catch(err){notify(err);b.disabled=false}});return;
  }
  if(act==='assign'||act==='assignment-edit'){
   const editing=act==='assignment-edit',rec=(editing?data.implants:catalog.items).find(i=>i.id===id);if(!rec)return;
   const pop=openModal(panel,assignmentForm(rec,editing?rec.quantity:1,editing?rec.installedQuantity:0,editing));pop.overlay.querySelector('form').addEventListener('submit',async ev=>{ev.preventDefault();const fd=new FormData(ev.currentTarget),q=num(fd.get('quantity'),1,99),n=num(fd.get('installedQuantity'),0,q),current=read(actor),b=ev.currentTarget.querySelector('[type="submit"]');b.disabled=true;
    try{if(editing){const row=current.implants.find(i=>i.id===id);if(!row)throw Error('Item não encontrado.');row.quantity=q;row.installedQuantity=n;row.installed=n>0}else{if(current.implants.length>=500)throw Error('Inventário do piloto atingiu 500 registros.');current.implants.push({...rec,id:rand(),templateId:rec.id,installedSlots:[],quantity:q,installedQuantity:n,installed:n>0})}await saveActor(actor,current);pop.close();refresh(panel,actor)}catch(err){notify(err);b.disabled=false}});return;
  }
  if(act==='catalog-delete'||act==='actor-remove'){
   const catalogMode=act==='catalog-delete',row=(catalogMode?catalog.items:data.implants).find(i=>i.id===id);if(!row)return;
   const pop=openModal(panel,`<div class="lcy-small-form"><div class="lcy-modal-bar"><span>${catalogMode?'Catálogo':'Inventário do piloto'}</span><button type="button" data-cyber-action="close-modal" aria-label="Fechar confirmação">✕</button></div><h3>${catalogMode?'Excluir modelo?':'Remover implante do piloto?'}</h3><p>${esc(row.name)}</p><p>${catalogMode?'As cópias entregues aos pilotos permanecem no inventário.':'O implante será removido do inventário deste piloto.'}</p><div class="lcy-editor-actions"><button type="button" data-cyber-action="close-modal">Cancelar</button><button type="button" class="lcy-red-button" data-cyber-action="confirm-delete">${catalogMode?'Excluir':'Remover'}</button></div></div>`);
   pop.overlay.querySelector('[data-cyber-action="confirm-delete"]').addEventListener('click',async ev=>{const btn=ev.currentTarget;btn.disabled=true;try{if(catalogMode){const c=getCatalog();c.items=c.items.filter(i=>i.id!==id);await saveCatalog(c)}else{const d=read(actor);d.implants=d.implants.filter(i=>i.id!==id);await saveActor(actor,d)}pop.close();refresh(panel,actor)}catch(err){notify(err);btn.disabled=false}});return;
  }
  if(act==='legacy-import'){const row=data.implants.find(i=>i.id===id);if(!row)return;const c=getCatalog();if(c.items.length>=500){notify(Error('Catálogo cheio.'));return}const copy={...row,id:rand()};delete copy.quantity;delete copy.installedQuantity;delete copy.installed;delete copy.templateId;c.items.push(copy);try{await saveCatalog(c);refresh(panel,actor)}catch(err){notify(err)}return}
 });
 panel.addEventListener('input', event => {
  const st = state(actor);
  if (event.target.matches('[data-cyber-search]')) {
   st.search = event.target.value;
   panel.querySelector('.lcy-items-grid').innerHTML = reserveCards(read(actor), st, actor);
  }
  if (event.target.matches('[data-cyber-gm-search]')) {
   st.gmSearch = event.target.value;
   panel.querySelector('.lcy-gm-table-wrap').outerHTML = catalogueRows(st);
  }
 });
 panel.addEventListener('change', event => {
  if (!event.target.matches('[data-cyber-gm-category]')) return;
  const st = state(actor);
  st.gmCategory = event.target.value;
  panel.querySelector('.lcy-gm-table-wrap').outerHTML = catalogueRows(st);
 });
 panel.addEventListener('submit',async e=>{e.stopPropagation();if(!e.target.matches('[data-kind="settings"]')||!gm())return;e.preventDefault();const form=e.target,d=new FormData(form),data=read(actor),b=form.querySelector('[type="submit"]');b.disabled=true;data.capacity=num(d.get('capacity'),0,9999);data.limits={...data.limits};for(const r of REGIONS)data.limits[r.id]=num(d.get('slot_'+r.id),0,99);try{await saveActor(actor,data);await game.settings.set(ID,'defaultCapacity',num(d.get('defaultCapacity'),1,9999));await game.settings.set(ID,'allowOverload',d.get('allowOverload')!==null);refresh(panel,actor);globalThis.ui?.notifications?.info?.('Limites neurais atualizados.')}catch(err){notify(err);b.disabled=false}});
}
function sheetLayout(root) {
 if (!root?.querySelector) return null;
 const nav = root.querySelector('.lancer-tabs') ?? [...root.querySelectorAll('nav, .tabs, [role="tablist"]')]
   .find(element => element.querySelector('[data-tab="dossier"]') && element.querySelector('[data-tab="tactical"]'));
 if (!nav) return null;
 const tabs = [...nav.querySelectorAll('[data-tab]')];
 const ids = new Set(tabs.map(tab => tab.dataset.tab));
 const parent = [...root.querySelectorAll('.sheet-body, .sheet-content, .tab-content')].find(element =>
   [...element.children].some(pane => ids.has(pane.dataset.tab)));
 if (!parent) return null;
 const panes = [...parent.children].filter(pane => ids.has(pane.dataset.tab) && pane.dataset.tab !== 'cyberware');
 return {nav, tabs, parent, panes};
}

function releasePanel(panel) {
 panel._lcyDispose?.();
 panel._lcyNeuralMotion?.stop();
 panel._lcyCloseModal?.({restoreFocus: false});
 clearTimeout(panel._lcyFeedbackTimer);
 const key = actorKey(panel._lcyActor);
 const tracked = panels.get(key);
 tracked?.delete(panel);
 if (tracked?.size === 0) panels.delete(key);
}

function detach(app) {
 const panel = appPanels.get(app);
 if (!panel) return;
 releasePanel(panel);
 appPanels.delete(app);
}

function attach(app, html) {
 if (globalThis.game?.system?.id !== 'lancer') return;
 const actor = actorFrom(app);
 if (actor?.type !== 'pilot') return;
 const layout = sheetLayout(rootFrom(html)) ?? sheetLayout(rootFrom(app.element));
 if (!layout) return;
 const {nav, tabs, parent, panes} = layout;
 const previous = appPanels.get(app);
 if (previous?.parentElement === parent && parent.previousElementSibling?.classList.contains('lcy-launcher')) return;

 detach(app);
 const panel = document.createElement('section');
 panel.id = 'lcy-panel-' + ++panelCount;
 panel.className = 'lcy-panel tab';
 panel.dataset.tab = 'cyberware';
 panel.setAttribute('aria-labelledby', panel.id + '-title');
 panel.style.display = 'none';

 const launcher = document.createElement('div');
 launcher.className = 'lcy-launcher';
 const tab = document.createElement('button');
 tab.className = 'lcy-nav';
 tab.type = 'button';
 tab.textContent = 'CYBER//WARE';
 tab.setAttribute('aria-controls', panel.id);
 tab.setAttribute('aria-expanded', 'false');
 launcher.append(tab);
 parent.before(launcher);

 panel.innerHTML = content(actor, panel.id);
 parent.append(panel);
 panel._lcyActor = actor;
 events(panel, actor);
 appPanels.set(app, panel);
 const key = actorKey(actor);
 if (!panels.has(key)) panels.set(key, new Set());
 panels.get(key).add(panel);

 const st = state(actor);
 let opened = false;
 let snapshot = [];
 let selectedTabs = [];
 function open() {
  if (opened) return;
  opened = true;
  st.open = true;
  snapshot = panes.map(pane => ({
   pane,
   display: pane.style.getPropertyValue('display'),
   priority: pane.style.getPropertyPriority('display'),
   active: pane.classList.contains('active')
  }));
  for (const {pane} of snapshot) {
   pane.style.setProperty('display', 'none', 'important');
   pane.classList.remove('active');
  }
  selectedTabs = tabs.map(node => ({node, active: node.classList.contains('active'),
   selected: node.classList.contains('selected'), aria: node.getAttribute('aria-selected')}));
  for (const {node, aria} of selectedTabs) {
   node.classList.remove('active', 'selected');
   if (aria !== null) node.setAttribute('aria-selected', 'false');
  }
  tab.classList.add('active', 'selected');
  tab.setAttribute('aria-expanded', 'true');
  panel.classList.add('active');
  panel.style.setProperty('display', 'block', 'important');
  if (panel.isConnected) refresh(panel, actor, 'enter');
  else requestAnimationFrame(() => { if (opened) refresh(panel, actor, 'enter'); });
 }
 function close(remember = true) {
  if (!opened) return;
  opened = false;
  if (remember) st.open = false;
  for (const {pane, display, priority, active} of snapshot) {
   if (display) pane.style.setProperty('display', display, priority);
   else pane.style.removeProperty('display');
   pane.classList.toggle('active', active);
  }
  snapshot = [];
  panel.classList.remove('active');
  panel.style.setProperty('display', 'none', 'important');
  panel._lcyCloseModal?.({restoreFocus: false});
  syncNeuralMotion(panel);
  tab.classList.remove('active', 'selected');
  tab.setAttribute('aria-expanded', 'false');
  for (const {node, active, selected, aria} of selectedTabs) {
   node.classList.toggle('active', active);
   node.classList.toggle('selected', selected);
   if (aria !== null) node.setAttribute('aria-selected', aria);
  }
  selectedTabs = [];
 }
 const controls = new AbortController();
 const {signal} = controls;
 tab.addEventListener('click', () => {
  if (opened) close();
  else open();
 }, {signal});
 nav.addEventListener('click', event => {
  if (tabs.includes(event.target.closest('[data-tab]'))) close();
 }, {capture: true, signal});
 panel._lcyDispose = () => {
  controls.abort();
  close(false);
  launcher.remove();
  panel.remove();
 };
 if (st.open) open();
}

function refreshAll(actor) {
 const tracked = panels.get(actorKey(actor));
 if (!tracked) return;
 for (const panel of tracked) {
  if (panel.isConnected) refresh(panel, actor);
  else releasePanel(panel);
 }
}
const sample=()=>({capacity:52,limits:{optico:3,frontal:3,neural:4,bracos:3},implants:[
 {id:'demo-1',name:'Neural Link MK.IV',slot:'neural',grade:'Lendário',potency:4,quantity:1,installedQuantity:1,load:13,cost:19000,manufacturer:'RAVEN SYSTEMS',description:'Interface de processamento de altíssima velocidade com integração a drones.',function:'+2 em análise de dispositivos. Conexão de curto alcance.',drawback:'Interferência sob campos eletromagnéticos.'},
 {id:'demo-2',name:'Kiroshi Optics Mk.3',slot:'optico',grade:'Mítico',potency:3,quantity:1,installedQuantity:1,load:7,cost:6400,manufacturer:'KIROSHI',description:'Retinas sintéticas com identificação de assinaturas, espectro térmico e auxílio de mira.',function:'Zoom digital, visão em pouca luz e rastreamento.'},
 {id:'demo-3',name:'Retina Espectral',slot:'optico',grade:'Raro',potency:2,quantity:1,installedQuantity:0,load:4,cost:3400,manufacturer:'HELIX',description:'Sensor adicional de contraste e diferenciação térmica.'},
 {id:'demo-4',name:'Sandevistan X-8',slot:'neural',grade:'Lendário',potency:5,quantity:1,installedQuantity:0,load:23,cost:34000,manufacturer:'QIAN-T',description:'Acelerador nervoso para resposta em situações críticas.',function:'Ação relâmpago narrativa, à discrição do mestre.'},
 {id:'demo-5',name:'Malha subdérmica',slot:'pele',grade:'Comum',potency:1,quantity:1,installedQuantity:1,load:4,cost:2600,manufacturer:'MILITECH',description:'Trama protetora integrada sob a pele.'},
 {id:'demo-6',name:'Gorilla Arms',slot:'bracos',grade:'Mítico',potency:4,quantity:1,installedQuantity:0,load:14,cost:18000,manufacturer:'MILITECH',description:'Servomotores com reforço para força e resistência.'},
 {id:'demo-7',name:'Coprocessador Tático',slot:'neural',grade:'Raro',potency:3,quantity:1,installedQuantity:1,load:8,cost:8200,manufacturer:'ARASAKA',description:'Interpretação tática de padrões e dados de combate.'}
]});
// Testable functions are available in the HTML preview. Foundry still requires in-game verification.
globalThis.LancerCyberwareTab={attach,read,metrics,render:content,sample,getCatalogue:getCatalog,checkInstall,equip,moveImplant,togglePower,tiers:TIERS,regions:REGIONS};
if(typeof Hooks!=='undefined'&&Hooks?.on){Hooks.once?.('init',()=>{game.settings.register(ID,CAT,{name:'Catálogo global de cyberware',scope:'world',config:false,type:Object,default:{items:[]}});game.settings.register(ID,'defaultCapacity',{name:'Capacidade neural padrão',scope:'world',config:false,type:Number,default:60});game.settings.register(ID,'allowOverload',{name:'Permitir exceder capacidade',scope:'world',config:false,type:Boolean,default:false})});Hooks.on('renderLancerPilotSheet',attach);Hooks.on('renderActorSheet',attach);Hooks.on('renderActorSheetV2',attach);Hooks.on('closeLancerPilotSheet',detach);Hooks.on('closeActorSheet',detach);Hooks.on('closeActorSheetV2',detach);Hooks.on('updateActor',a=>{if(a?.type==='pilot')refreshAll(a)});Hooks.on('updateSetting',s=>{if(String(s?.key||'').startsWith(ID+'.'))for(const set of panels.values())for(const panel of set){if(panel.isConnected&&panel._lcyActor)refresh(panel,panel._lcyActor)}})}
})();
