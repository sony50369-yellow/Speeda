
const PRICE={ID_per_site:111,IM_per_visit:328};
const brandSel=document.getElementById('brand'),routeSel=document.getElementById('route'),
planBtn=document.getElementById('planBtn'),planOut=document.getElementById('planOut'),
resetBtn=document.getElementById('resetBtn'),hiRiskCk=document.getElementById('hiRisk'),
prevSel=document.getElementById('prev'),lastDate=document.getElementById('lastDoseDate');
const rigTypeSel=document.getElementById('rigType'),rigProdSel=document.getElementById('rigProd'),
rigBtn=document.getElementById('rigBtn'),rigOut=document.getElementById('rigOut');

function fmt(d){const dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'),yy=d.getFullYear();return `${dd}-${mm}-${yy}`;}
function addDays(ds,n){const d=new Date(ds);d.setDate(d.getDate()+n);return fmt(d);}

async function loadData(){
  const products=await fetch('products.json').then(r=>r.json());
  const faqs=await fetch('faq.json').then(r=>r.json());
  window._products=products;
  const only=products.find(p=>p.id==='trcs_speeda');const o=document.createElement('option');
  o.value=only.id;o.textContent=`${only.brand} (${only.type})`;brandSel.appendChild(o);
  function refreshRIG(){rigProdSel.innerHTML='';const typ=rigTypeSel.value;
    products.filter(p=>p.category==='RIG'&&p.kind===typ).forEach(p=>{const x=document.createElement('option');
      x.value=p.id;x.textContent=`${p.brand} ${p.strength} — ${p.price} บาท/ขวด`;rigProdSel.appendChild(x);});}
  rigTypeSel.addEventListener('change',refreshRIG);refreshRIG();
  renderCards(products.filter(p=>p.category==='vaccine')); renderFAQ(faqs);
}
function renderCards(list){
  list.sort((a,b)=>(b.in_thailand?1:0)-(a.in_thailand?1:0));
  const host=document.getElementById('products');host.innerHTML='';
  list.forEach(p=>{const el=document.createElement('div');el.className='prod';
    el.innerHTML=`<img src="${p.image||'icon.png'}" alt="${p.brand}">
    <div class="kv"><span>ยี่ห้อ</span><div>${p.brand} ${p.in_thailand?'<span class="badge">มีในไทย</span>':''}</div></div>
    <div class="kv"><span>ชนิด</span><div>${p.type}</div></div>
    <div class="kv"><span>IM/เข็ม</span><div>${p.im_ml} mL × 1 เข็ม</div></div>
    <div class="kv"><span>ID/จุด</span><div>${p.id_ml} mL × ${p.id_sites} จุด</div></div>
    <div class="kv"><span>เก็บรักษา</span><div>${p.storage}</div></div>
    <div class="kv"><span>อายุยา</span><div>${p.shelf||'-'}</div></div>`;host.appendChild(el);});}
function renderFAQ(items){const ul=document.getElementById('faq');ul.innerHTML='';items.forEach(x=>{const li=document.createElement('li');li.innerHTML=`<b>${x.q}</b><br>${x.a}`;ul.appendChild(li);});}

planBtn.addEventListener('click',()=>{
  const mode=document.querySelector('input[name="mode"]:checked').value,start=document.getElementById('startDate').value,
        route=routeSel.value,hiRisk=hiRiskCk.checked,prev=prevSel.value,last=lastDate.value;
  if(!start){planOut.innerHTML='กรุณาใส่วันเริ่มฉีด (Day 0)';return;}
  const prod=window._products.find(p=>p.id==='trcs_speeda'); let schedule=[],extra='';
  if(mode==='PEP'){
    if(prev==='>=3'){
      if(last){const diff=Math.floor((new Date(start)-new Date(last))/(1000*3600*24)); schedule=(diff<=183)?[0]:[0,3];}
      else{schedule=[0,3];}
      extra='(เคยครบ ≥3 เข็ม: โดยทั่วไปไม่ต้องให้ RIG)';
    }else{schedule=(route==='IM')?[0,3,7,14,28]:[0,3,7,28];}
  }else if(mode==='PrEP'){schedule=[0,7,21];}
  else{
    if(last){const diff=Math.floor((new Date(start)-new Date(last))/(1000*3600*24)); schedule=(diff<=183)?[0]:[0,3];}
    else{schedule=[0];}
    extra='(Booster: ID 1 จุด หรือ IM 1 เข็ม)';
  }
  const idSites=(route==='ID')?((hiRisk||mode==='Booster')?1:prod.id_sites):0;
  const dose=(route==='IM')?`${prod.im_ml} mL × 1 เข็ม`:`${prod.id_ml} mL × ${idSites} จุด (รวม ${(prod.id_ml*idSites).toFixed(2)} mL)`;
  const rows=schedule.map(d=>{const cost=(route==='IM')?328:111*idSites;
    return `<tr><td>Day ${d}</td><td>${addDays(start,d)}</td><td>${route}</td><td>${dose}</td><td>${cost} บาท</td></tr>`;}).join('');
  const total=schedule.reduce((t)=>t+(route==='IM'?328:111*idSites),0);
  const head=`<thead><tr><th>เข็ม</th><th>วันที่</th><th>Route</th><th>ขนาด/จำนวนเข็ม</th><th>ค่าใช้จ่าย/ครั้ง</th></tr></thead>`;
  const note=(route==='ID')?`ID: ปกติ 2 จุด/ครั้ง • hi‑risk/Booster ใช้ 1 จุด`:`IM: TRCS Speeda 0.5 mL/เข็ม`;
  planOut.innerHTML=`<table class="table">${head}<tbody>${rows}</tbody></table><p class="note">${note}${extra?'<br>'+extra:''}</p><div class="total"><b>รวมค่าใช้จ่ายประมาณ:</b> ${total} บาท</div>`;
});
resetBtn.addEventListener('click',()=>{
  document.querySelectorAll('input,select').forEach(el=>{if(el.type==='radio'){if(el.value==='PEP')el.checked=true;}
    else if(el.id==='route'){el.value='ID';} else if(el.type==='checkbox'){el.checked=false;} else el.value='';});
  planOut.innerHTML='';rigOut.innerHTML='';
});
rigTypeSel.addEventListener('change',()=>{
  const ps=window._products||[]; rigProdSel.innerHTML=''; const typ=rigTypeSel.value;
  ps.filter(p=>p.category==='RIG'&&p.kind===typ).forEach(p=>{const o=document.createElement('option');
    o.value=p.id;o.textContent=`${p.brand} ${p.strength} — ${p.price} บาท/ขวด`;rigProdSel.appendChild(o);});
});
rigBtn.addEventListener('click',()=>{
  const wt=parseFloat(document.getElementById('wt').value||'0'),typ=rigTypeSel.value,
        prod=(window._products||[]).find(p=>p.id===rigProdSel.value);
  if(!wt||!prod){rigOut.innerHTML='กรอกน้ำหนักและเลือกผลิตภัณฑ์';return;}
  const doseIU=(typ==='ERIG')?40*wt:20*wt, vol=doseIU/prod.iu_per_ml, vials=Math.ceil(vol/prod.vial_ml), total=vials*prod.price;
  rigOut.innerHTML=`<b>ขนาด:</b> ${doseIU.toFixed(0)} IU • ≈ ${vol.toFixed(2)} mL<br><b>ต้องใช้:</b> ${vials} ขวด × ${prod.price} บาท = <b>${total} บาท</b><br><small>${prod.iu_per_ml} IU/mL • ${prod.vial_ml} mL/ขวด</small>`;
});
loadData();
