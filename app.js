firebase.initializeApp({apiKey:"AIzaSyAL8gRZ-oounVS9Z99xQrVFY5zyX3hG3KM",authDomain:"lsg-finance-22fe5.firebaseapp.com",projectId:"lsg-finance-22fe5",storageBucket:"lsg-finance-22fe5.firebasestorage.app",messagingSenderId:"823017672920",appId:"1:823017672920:web:a57b314f2ebff4d70107ad"});
const au=firebase.auth(),db=firebase.firestore(),DOC=db.collection('lcg-finance').doc('shared-data'),ADM='batyrkhandt@gmail.com';

/* ═══════════════ ACTIVITY MAP — Block 2 ═══════════════ */
const ACTIVITY_MAP={
  'Продажи/услуги':'operating','ФОТ Зарплата':'operating','ФОТ Налоги':'operating',
  'Аренда':'operating','Аренда юр. адреса':'operating','Услуги':'operating',
  'Реклама':'operating','Комиссия/страховка':'operating','Комиссия/взносы':'operating',
  'Комиссия банка':'operating','Прочее':'operating',
  'Депозит':'financial','Налог (ИПН/КПН)':'financial','Страховка':'financial',
  'Инвестиции':'investing','Оборудование':'investing'
};
function getActivityType(cat){return ACTIVITY_MAP[cat]||'operating'}

/* ═══════════════ STATE ═══════════════ */
let S={
  transactions:[],invoices:[],plans:{},
  settings:{
    taxIP:10,taxTOO:20,erbol:80,ramadan:20,requisites:'',
    sync1c_url:'',sync1c_user:'',sync1c_pass:'',sync1c_enabled:false,sync1c_interval:15
  },
  currentCompany:'ИП LCG',theme:'light',syncLog:[]
};
let txF='all',txS='',edId=null,curU=null,isA=false,sav=false;
let selFounder='both';
let selActivity='operating';

/* ═══════════════ FIREBASE ═══════════════ */
au.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

async function save(){
  if(sav||!isA)return;sav=true;
  try{await DOC.set({transactions:S.transactions,invoices:S.invoices,plans:S.plans,settings:S.settings,syncLog:S.syncLog||[],t:firebase.firestore.FieldValue.serverTimestamp(),by:curU?.displayName||'?'})}
  catch(e){console.error(e)}
  sav=false
}
async function loadDB(){
  try{
    const d=await DOC.get();
    if(d.exists){
      const v=d.data();
      if(v.transactions)S.transactions=v.transactions;
      if(v.invoices)S.invoices=v.invoices;
      if(v.plans)S.plans=v.plans;
      if(v.settings)S.settings={...S.settings,...v.settings};
      if(v.syncLog)S.syncLog=v.syncLog;
    }
  }catch(e){console.error(e)}
}
function startSync(){
  DOC.onSnapshot(d=>{
    if(!d.exists||sav)return;
    const v=d.data();
    if(v.transactions)S.transactions=v.transactions;
    if(v.invoices)S.invoices=v.invoices;
    if(v.plans)S.plans=v.plans;
    if(v.settings)S.settings={...S.settings,...v.settings};
    if(v.syncLog)S.syncLog=v.syncLog;
    ldUI();R()
  },e=>console.error(e))
}

/* ═══════════════ THEME ═══════════════ */
function tTheme(){S.theme=S.theme==='dark'?'light':'dark';aTheme();try{localStorage.setItem('lcg-th',S.theme)}catch(e){}}
function aTheme(){
  document.documentElement.setAttribute('data-theme',S.theme);
  const l=S.theme==='light';
  document.getElementById('is').style.display=l?'block':'none';
  document.getElementById('im').style.display=l?'none':'block';
  document.getElementById('thl').textContent=l?'Тёмная тема':'Светлая тема';
  document.querySelector('meta[name="theme-color"]').content=l?'#ffffff':'#0f1117'
}

/* ═══════════════ AUTH ═══════════════ */
async function gSignIn(){
  document.getElementById('aerr').textContent='';
  document.getElementById('aload').style.display='block';
  try{await au.signInWithPopup(new firebase.auth.GoogleAuthProvider())}
  catch(e){document.getElementById('aload').style.display='none';document.getElementById('aerr').textContent=e.code==='auth/popup-closed-by-user'?'Окно закрыто':'Ошибка: '+e.message}
}
function gOut(){if(confirm('Выйти?'))au.signOut()}

au.onAuthStateChanged(async u=>{
  if(u){
    curU=u;isA=u.email===ADM;
    document.getElementById('auth').classList.add('hide');
    document.getElementById('app').style.display='flex';
    document.getElementById('bnav').style.display='block';
    document.getElementById('uname').textContent=u.displayName||u.email;
    document.getElementById('urole').textContent=isA?'Админ':'Просмотр';
    if(u.photoURL){document.getElementById('uimg').src=u.photoURL;document.getElementById('uimg').style.display='block';document.getElementById('uico').style.display='none'}
    if(isA)document.getElementById('app').classList.add('is-admin');
    else document.getElementById('app').classList.remove('is-admin');
    await loadDB();ldUI();R();startSync()
  }else{
    curU=null;isA=false;
    document.getElementById('app').style.display='none';
    document.getElementById('bnav').style.display='none';
    document.getElementById('auth').classList.remove('hide');
    document.getElementById('aload').style.display='none';
    document.getElementById('app').classList.remove('is-admin')
  }
});

/* ═══════════════ HELPERS ═══════════════ */
const fm=n=>Math.round(n).toLocaleString('ru-RU')+' ₸';
const fn=n=>Math.round(n).toLocaleString('ru-RU');
const td=()=>new Date().toISOString().split('T')[0];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const MN=['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const MF=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

/* ═══════════════ UI LOAD ═══════════════ */
function ldUI(){
  const e=id=>document.getElementById(id);
  if(e('s-tip'))e('s-tip').value=S.settings.taxIP;
  if(e('s-ttoo'))e('s-ttoo').value=S.settings.taxTOO;
  if(e('s-erb'))e('s-erb').value=S.settings.erbol;
  if(e('s-ram'))e('s-ram').value=S.settings.ramadan;
  if(e('s-req'))e('s-req').value=S.settings.requisites;
  if(e('s-1c-url'))e('s-1c-url').value=S.settings.sync1c_url||'';
  if(e('s-1c-user'))e('s-1c-user').value=S.settings.sync1c_user||'';
  if(e('s-1c-pass'))e('s-1c-pass').value=S.settings.sync1c_pass||'';
  if(e('s-1c-interval'))e('s-1c-interval').value=S.settings.sync1c_interval||15;
  renderSyncLog();render1cStatus()
}

/* ═══════════════ DATA FUNCTIONS ═══════════════ */
function fTxs(){
  let t=S.transactions;
  const y=document.getElementById('yr').value;
  if(y!=='all')t=t.filter(x=>x.date&&x.date.startsWith(y));
  if(S.currentCompany!=='Все')t=t.filter(x=>x.company===S.currentCompany);
  return t
}
function calcP(txs){
  const i=txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const e=txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const c=txs.filter(t=>t.type==='cash').reduce((s,t)=>s+t.amount,0);
  const eb=i-e,r=(S.currentCompany==='ТОО LCG'?S.settings.taxTOO:S.settings.taxIP)/100,tx=eb>0?eb*r:0;
  return{i,e,c,eb,tx,n:eb-tx,total:i+c}
}
function eC(txs){
  const m={};
  txs.filter(t=>t.type==='expense').forEach(t=>{m[t.category]=(m[t.category]||0)+t.amount});
  return m
}

/* ═══════════════ NAVIGATION ═══════════════ */
function go(p,el){
  document.querySelectorAll('.snav-i').forEach(i=>i.classList.remove('act'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  if(el)el.classList.add('act');
  document.getElementById('p-'+p).classList.add('active');
  const t={dashboard:'Дашборд',tx:'Транзакции',inv:'Инвойсы',pnl:'P&L',plan:'План/Факт',activity:'Виды деятельности',found:'Руководители',set:'Настройки'};
  document.getElementById('pt').textContent=t[p]||p;
  if(window.innerWidth<769){document.getElementById('side').classList.remove('open');document.getElementById('sov').classList.remove('show')}
  R()
}
function goB(p,el){
  document.querySelectorAll('.bnav-i').forEach(i=>i.classList.remove('act'));
  if(el)el.classList.add('act');
  document.querySelectorAll('.snav-i').forEach(i=>i.classList.remove('act'));
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('p-'+p).classList.add('active');
  const t={dashboard:'Дашборд',tx:'Транзакции',pnl:'P&L',found:'Руководители'};
  document.getElementById('pt').textContent=t[p]||p;R()
}
function setCo(c){
  S.currentCompany=c;
  document.querySelectorAll('.co-btn').forEach(b=>b.classList.remove('act'));
  document.getElementById({'ИП LCG':'co-ip','ТОО LCG':'co-too','Все':'co-all'}[c]).classList.add('act');R()
}
function tSide(){document.getElementById('side').classList.toggle('open');document.getElementById('sov').classList.toggle('show')}

/* ═══════════════ MODALS ═══════════════ */
function openM(id){
  if(!isA){alert('Только админ');return}
  if(id==='tx'){
    document.getElementById('txdt').value=td();
    document.getElementById('txco').value=S.currentCompany==='Все'?'ИП LCG':S.currentCompany;
    if(!edId){document.getElementById('mtxt').textContent='Новая транзакция';document.getElementById('txei').value='';document.getElementById('txam').value='';document.getElementById('txcp').value='';document.getElementById('txde').value='';document.getElementById('txty').value='income'}
  }
  if(id==='inv'){
    document.getElementById('ivdt').value=td();
    const d=new Date();d.setDate(d.getDate()+14);
    document.getElementById('ivdu').value=d.toISOString().split('T')[0];pInv()
  }
  document.getElementById('m-'+id).classList.add('open')
}
function closeM(id){document.getElementById('m-'+id).classList.remove('open');edId=null}

/* ═══════════════ TRANSACTIONS ═══════════════ */
function saveTx(){
  if(!isA)return;
  const id=document.getElementById('txei').value||uid();
  const cat=document.getElementById('txca').value;
  const tx={id,type:document.getElementById('txty').value,amount:+document.getElementById('txam').value,date:document.getElementById('txdt').value,company:document.getElementById('txco').value,category:cat,payment:document.getElementById('txpa').value,counterparty:document.getElementById('txcp').value,desc:document.getElementById('txde').value,activity_type:getActivityType(cat),createdAt:Date.now()};
  if(!tx.amount){alert('Сумма');return}
  const i=S.transactions.findIndex(t=>t.id===id);
  if(i>=0)S.transactions[i]=tx;else S.transactions.unshift(tx);
  save();closeM('tx');R()
}
function editTx(id){
  if(!isA)return;
  const t=S.transactions.find(x=>x.id===id);if(!t)return;
  edId=id;
  document.getElementById('mtxt').textContent='Редактировать';
  document.getElementById('txei').value=id;
  document.getElementById('txty').value=t.type;
  document.getElementById('txam').value=t.amount;
  document.getElementById('txdt').value=t.date;
  document.getElementById('txco').value=t.company;
  document.getElementById('txca').value=t.category;
  document.getElementById('txpa').value=t.payment||'Безнал';
  document.getElementById('txcp').value=t.counterparty||'';
  document.getElementById('txde').value=t.desc||'';
  openM('tx')
}
function delTx(id){if(!isA||!confirm('Удалить?'))return;S.transactions=S.transactions.filter(t=>t.id!==id);save();R()}
function fTx(f){txF=f;['all','income','expense','cash'].forEach(x=>{const b=document.getElementById('f-'+x);if(b){b.style.borderColor=x===f?'var(--accent)':'';b.style.color=x===f?'var(--accent)':''}});rTx()}

/* ═══════════════ INVOICES ═══════════════ */
let ivC=1000;
function saveInv(){
  if(!isA)return;
  const inv={id:uid(),num:'INV-'+(++ivC),client:document.getElementById('ivcl').value,date:document.getElementById('ivdt').value,due:document.getElementById('ivdu').value,company:document.getElementById('ivco').value,desc:document.getElementById('ivde').value,amount:+document.getElementById('ivam').value,status:document.getElementById('ivst').value};
  if(!inv.amount||!inv.client){alert('Заполните');return}
  S.invoices.unshift(inv);
  if(inv.status==='paid')S.transactions.unshift({id:uid(),type:'income',amount:inv.amount,date:inv.date,company:inv.company,category:'Продажи/услуги',payment:'Безнал',counterparty:inv.client,desc:'Инвойс '+inv.num,activity_type:'operating',createdAt:Date.now()});
  save();closeM('inv');R()
}
function markP(id){
  if(!isA)return;
  const i=S.invoices.find(x=>x.id===id);if(!i||i.status==='paid')return;
  i.status='paid';
  S.transactions.unshift({id:uid(),type:'income',amount:i.amount,date:td(),company:i.company,category:'Продажи/услуги',payment:'Безнал',counterparty:i.client,desc:'Инвойс '+i.num+' оплачен',activity_type:'operating',createdAt:Date.now()});
  save();R()
}
function delInv(id){if(!isA||!confirm('Удалить?'))return;S.invoices=S.invoices.filter(i=>i.id!==id);save();R()}
function pInv(){
  const c=document.getElementById('ivcl').value||'—',d=document.getElementById('ivde').value||'—',a=+document.getElementById('ivam').value||0;
  document.getElementById('ivp').innerHTML=`<div style="font-size:18px;font-weight:800;margin-bottom:8px">СЧЁТ</div><table class="inv-tbl"><thead><tr><th>#</th><th>Описание</th><th>Сумма</th></tr></thead><tbody><tr><td>1</td><td>${d}</td><td>${fn(a)} ₸</td></tr></tbody></table><div style="text-align:right;font-size:16px;font-weight:800">ИТОГО: ${fn(a)} ₸</div>`
}
function prInv(){const h=document.getElementById('ivp').innerHTML;const w=window.open('');w.document.write('<html><head><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse}th{background:#1a202c;color:#fff;padding:8px}td{padding:8px;border-bottom:1px solid #eee}</style></head><body>'+h+'</body></html>');w.print()}

/* ═══════════════ SETTINGS ═══════════════ */
function saveSt(){
  if(!isA)return;
  S.settings.taxIP=+document.getElementById('s-tip').value;
  S.settings.taxTOO=+document.getElementById('s-ttoo').value;
  S.settings.erbol=+document.getElementById('s-erb').value;
  S.settings.ramadan=+document.getElementById('s-ram').value;
  S.settings.requisites=document.getElementById('s-req').value;
  S.settings.sync1c_url=document.getElementById('s-1c-url')?.value||'';
  S.settings.sync1c_user=document.getElementById('s-1c-user')?.value||'';
  S.settings.sync1c_pass=document.getElementById('s-1c-pass')?.value||'';
  S.settings.sync1c_interval=+(document.getElementById('s-1c-interval')?.value||15);
  save();R()
}
function expJ(){const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='lcg_'+td()+'.json';a.click()}
function impJ(e){
  if(!isA)return;const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{try{const d=JSON.parse(ev.target.result);S={...S,...d};save();ldUI();R();alert('OK!')}catch(err){alert('Ошибка')}};
  r.readAsText(f)
}
function importFromExcel(e){
  if(!isA){alert('Только админ может импортировать');return}
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=new Uint8Array(ev.target.result);
      const wb=XLSX.read(data,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      if(!rows.length){alert('Нет строк');return}
      let added=0;
      for(const row of rows){
        const x={};
        for(const key in row){if(!Object.hasOwn(row,key))continue;const k=String(key).trim().toLowerCase();x[k]=String(row[key]).trim()}
        const getField=(...names)=>{for(const n of names){const v=x[n.toLowerCase()];if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim()}return ''};
        const date=getField('date','дата');
        const rawAmount=getField('amount','сумма','сумма ₸','total');
        let amount=Number(String(rawAmount).replace(/,/g,'.').replace(/[^0-9.+-]/g,''));
        if(Number.isNaN(amount))continue;
        const rawType=getField('type','тип','транзакция');
        let type='income';
        const lcType=rawType.toLowerCase();
        if(lcType.includes('exp')||lcType.includes('расход')||lcType.includes('расх'))type='expense';
        else if(lcType.includes('cash')||lcType.includes('нал'))type='cash';
        else if(lcType.includes('inc')||lcType.includes('доход')||lcType.includes('приход'))type='income';
        if(amount<0){type='expense';amount=Math.abs(amount)}
        const company=getField('company','компания')||((S.currentCompany==='Все')?'ИП LCG':S.currentCompany);
        const category=getField('category','категория')||'Прочее';
        const payment=getField('payment','оплата')||'Безнал';
        const counterparty=getField('counterparty','контрагент','client','клиент')||'';
        const desc=getField('desc','описание','note','примечание')||'';
        S.transactions.push({id:uid(),type,amount,date:date||td(),company,category,payment,counterparty,desc,activity_type:getActivityType(category),createdAt:Date.now()});
        added++
      }
      if(added){save();R();alert(`Импортировано транзакций: ${added}`)}
      else alert('Нет валидных записей для импорта')
    }catch(err){console.error(err);alert('Ошибка разбора файла: '+err.message)}
  };
  reader.readAsArrayBuffer(file)
}
function parseCsvLine(line){
  const result=[];let cur='';let inQuotes=false;
  for(let i=0;i<line.length;i++){const ch=line[i];if(ch=='"'){if(inQuotes&&line[i+1]=='"'){cur+='"';i++}else inQuotes=!inQuotes;}else if(ch===','&&!inQuotes){result.push(cur.trim());cur=''}else cur+=ch;}
  result.push(cur.trim());return result
}
function importFromGoogleSheets(){
  if(!isA){alert('Только админ может импортировать');return}
  const u=document.getElementById('gs-url').value.trim();
  if(!u){alert('Введите URL Google Sheets');return}
  let url=u;
  const docMatch=u.match(/\/d\/([^\/]+)\/?.*?(?:gid=(\d+))?/);
  if(docMatch){const id=docMatch[1];const gid=docMatch[2]||0;url=`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`}
  else if(!u.includes('format=csv')){alert('URL должен быть URL Google Sheets или содержать экспорт CSV');return}
  fetch(url).then(r=>{if(!r.ok)throw new Error('Ошибка загрузки');return r.text()}).then(text=>{
    const lines=text.split(/\r?\n/).filter(l=>l.trim());
    if(!lines.length){alert('Пустой файл');return}
    const headers=parseCsvLine(lines.shift()).map(h=>h.replace(/^"|"$/g,'').toLowerCase());
    const rows=lines.map(l=>parseCsvLine(l));
    let added=0;
    for(const row of rows){
      if(!row.some(v=>v.replace(/"/g,'').trim()))continue;
      const obj={};
      for(let i=0;i<Math.min(headers.length,row.length);i++){obj[headers[i]]=row[i].replace(/^"|"$/g,'').trim()}
      let amount=Number(obj.amount?.replace(/,/g,'.'));
      if(Number.isNaN(amount))continue;
      const tRaw=(obj.type||'').trim().toLowerCase();
      let type='income';
      if(tRaw.includes('exp')||tRaw.includes('расход')||amount<0)type='expense';
      else if(tRaw.includes('cash')||tRaw.includes('нал'))type='cash';
      else if(tRaw.includes('inc')||tRaw.includes('доход')||amount>0)type='income';
      if(type==='expense')amount=Math.abs(amount);
      const date=obj.date||obj['дата']||td();
      const company=(obj.company||obj['компания'])||((S.currentCompany==='Все')?'ИП LCG':S.currentCompany);
      const category=obj.category||obj['категория']||'Прочее';
      const payment=obj.payment||obj['оплата']||'Безнал';
      const counterparty=obj.counterparty||obj['контрагент']||obj.client||obj['клиент']||'';
      const desc=obj.desc||obj['описание']||'';
      S.transactions.push({id:uid(),type,amount,date,company,category,payment,counterparty,desc,activity_type:getActivityType(category),createdAt:Date.now()});
      added++
    }
    if(added){save();R();alert(`Импортировано транзакций: ${added}`)}
    else alert('Нет валидных записей для импорта')
  }).catch(err=>{console.error(err);alert('Ошибка: '+err.message)})
}
function clrAll(){if(!isA||!confirm('Удалить ВСЕ?'))return;S.transactions=[];S.invoices=[];S.plans={};save();R()}

/* ═══════════════ RENDER ALL ═══════════════ */
function R(){rD();rTx();rI();rPL();rPlan();rF();rA()}

/* ═══════════════ RENDER DASHBOARD ═══════════════ */
function rD(){
  const t=fTxs(),p=calcP(t),re=p.i>0?(p.n/p.i*100).toFixed(1):0;
  document.getElementById('dk').innerHTML=`<div class="card card-accent"><div class="clbl">Общая выручка</div><div class="cval c-g">${fm(p.total)}</div><div class="csub">Безнал ${fm(p.i)} + Нал ${fm(p.c)}</div></div><div class="card" style="border-top:3px solid var(--red)"><div class="clbl">Расходы</div><div class="cval c-r">${fm(p.e)}</div><div class="csub">${t.filter(x=>x.type==='expense').length} платежей</div></div><div class="card" style="border-top:3px solid var(--blue)"><div class="clbl">Чистая прибыль</div><div class="cval ${p.n>=0?'c-g':'c-r'}">${fm(p.n)}</div><div class="csub">Рент. <span class="badge ${p.n>=0?'b-g':'b-r'}">${re}%</span></div></div><div class="card" style="border-top:3px solid var(--cash)"><div class="clbl">💵 Наличные</div><div class="cval c-ca">${fm(p.c)}</div><div class="csub">${t.filter(x=>x.type==='cash').length} операций</div></div>`;
  const rc=fTxs().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,7);
  document.getElementById('dr').innerHTML=rc.length?`<table class="tbl"><thead><tr><th>Дата</th><th>Контр.</th><th class="num">Сумма</th></tr></thead><tbody>${rc.map(x=>`<tr ${isA?`onclick="editTx('${x.id}')"`:''}><td style="font-size:12px">${x.date||'—'}</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x.counterparty||x.desc||'—'}</td><td class="num ${x.type==='income'?'c-g':x.type==='cash'?'c-ca':'c-r'}">${x.type==='expense'?'−':'+'} ${fm(x.amount)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty"><div class="empty-ico">💸</div><div>Нет данных</div></div>';
  const cats=eC(t),tot=Object.values(cats).reduce((s,v)=>s+v,0)||1,cc=['var(--red)','var(--gold)','var(--blue)','var(--accent)','var(--cash)','#7c3aed','#0891b2'];
  document.getElementById('dc').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500">${k}</span><span style="color:${cc[i%cc.length]};font-weight:700">${fm(v)}</span></div><div class="pbar"><div class="pbar-f" style="width:${(v/tot*100)}%;background:${cc[i%cc.length]}"></div></div></div>`).join('')||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Нет расходов</div>';
  const al=[];if(p.n<0)al.push(`<div class="alert a-d">Убыток: ${fm(Math.abs(p.n))}</div>`);
  document.getElementById('da').innerHTML=al.length?al.join(''):p.i>0?`<div class="alert a-ok">Рентабельность ${re}%</div>`:''
}

/* ═══════════════ RENDER TRANSACTIONS ═══════════════ */
function rTx(){
  const txs=S.transactions.filter(t=>S.currentCompany==='Все'||t.company===S.currentCompany),yr=document.getElementById('yr').value;
  let tab=`<button class="mtab act" onclick="fMo(null,this)">Все</button>`;
  MN.forEach((m,i)=>{const mn=String(i+1).padStart(2,'0'),k=yr==='all'?`-${mn}-`:`${yr}-${mn}`,c=txs.filter(t=>t.date&&t.date.includes(k)).length;if(c>0)tab+=`<button class="mtab" onclick="fMo('${k}',this)">${m} (${c})</button>`});
  document.getElementById('tt').innerHTML=tab;
  let list=fTxs();
  if(window._mo)list=list.filter(t=>t.date&&t.date.includes(window._mo));
  if(txF==='cash')list=list.filter(t=>t.type==='cash');
  else if(txF!=='all')list=list.filter(t=>t.type===txF);
  if(txS)list=list.filter(t=>(t.counterparty||'').toLowerCase().includes(txS.toLowerCase())||(t.desc||'').toLowerCase().includes(txS.toLowerCase())||(t.category||'').toLowerCase().includes(txS.toLowerCase()));
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const ic=list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0),ex=list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0),ca=list.filter(t=>t.type==='cash').reduce((s,t)=>s+t.amount,0);
  document.getElementById('ts').innerHTML=`<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div><div class="clbl">Приход</div><div class="cval md c-g">${fm(ic)}</div></div><div><div class="clbl">Расход</div><div class="cval md c-r">${fm(ex)}</div></div><div><div class="clbl">💵 Нал</div><div class="cval md c-ca">${fm(ca)}</div></div><div style="margin-left:auto;font-size:11px;color:var(--muted)">${list.length} шт</div></div>`;
  document.getElementById('ttbl').innerHTML=list.length?`<table class="tbl"><thead><tr><th>Дата</th><th>Тип</th><th>Контрагент</th><th class="hm">Кат.</th><th class="num">Сумма</th></tr></thead><tbody>${list.map(t=>`<tr ${isA?`onclick="editTx('${t.id}')"`:''}><td style="white-space:nowrap;font-size:12px">${t.date||'—'}</td><td><div class="tp ${t.type==='income'?'tp-i':t.type==='cash'?'tp-c':'tp-e'}">${t.type==='income'?'▲':t.type==='cash'?'💵':'▼'}</div></td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.counterparty||t.desc||'—'}</td><td class="hm"><span class="badge ${t.type==='income'?'b-b':t.type==='cash'?'b-ca':'b-r'}">${t.category}</span></td><td class="num"><div style="display:flex;align-items:center;justify-content:flex-end;gap:6px"><span class="${t.type==='income'?'c-g':t.type==='cash'?'c-ca':'c-r'}" style="font-weight:600">${t.type==='expense'?'−':'+'} ${fm(t.amount)}</span>${isA?`<span onclick="event.stopPropagation();delTx('${t.id}')" style="cursor:pointer;color:var(--red);font-size:14px;opacity:.4;padding:2px">✕</span>`:''}</div></td></tr>`).join('')}</tbody></table>`:'<div class="empty"><div class="empty-ico">📭</div><div>Нет данных</div></div>'
}
function fMo(m,el){window._mo=m;document.querySelectorAll('.mtab').forEach(b=>b.classList.remove('act'));el.classList.add('act');rTx()}

/* ═══════════════ RENDER INVOICES ═══════════════ */
function rI(){
  const inv=S.invoices.filter(i=>S.currentCompany==='Все'||i.company===S.currentCompany);
  const pd=inv.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0),pe=inv.filter(i=>i.status==='pending').reduce((s,i)=>s+i.amount,0);
  document.getElementById('ik').innerHTML=`<div class="card card-accent"><div class="clbl">Оплачено</div><div class="cval lg c-g">${fm(pd)}</div></div><div class="card" style="border-top:3px solid var(--gold)"><div class="clbl">Ожидает</div><div class="cval lg c-go">${fm(pe)}</div></div><div class="card" style="border-top:3px solid var(--blue)"><div class="clbl">Всего</div><div class="cval lg c-b">${fm(pd+pe)}</div></div>`;
  const sm={paid:'<span class="badge b-g">✓</span>',pending:'<span class="badge b-go">⏳</span>',overdue:'<span class="badge b-r">⚠</span>'};
  document.getElementById('it').innerHTML=inv.length?`<table class="tbl"><thead><tr><th>#</th><th>Клиент</th><th class="hm">Дата</th><th class="num">Сумма</th><th>Ст.</th>${isA?'<th></th>':''}</tr></thead><tbody>${inv.map(i=>`<tr><td style="color:var(--blue);font-size:11px;font-weight:600">${i.num}</td><td>${i.client}</td><td class="hm">${i.date}</td><td class="num" style="font-weight:700">${fm(i.amount)}</td><td>${sm[i.status]||''}</td>${isA?`<td style="display:flex;gap:4px">${i.status!=='paid'?`<button class="btn btn-p btn-sm" onclick="markP('${i.id}')">✓</button>`:''}<button class="btn btn-d btn-sm" onclick="delInv('${i.id}')">✕</button></td>`:''}</tr>`).join('')}</tbody></table>`:'<div class="empty"><div class="empty-ico">📄</div><div>Нет инвойсов</div></div>'
}

/* ═══════════════ RENDER P&L ═══════════════ */
function rPL(){
  const t=fTxs(),p=calcP(t),re=p.i>0?(p.n/p.i*100).toFixed(1):0,cats=eC(t);
  const cc={'ФОТ Зарплата':'#2563eb','ФОТ Налоги':'#f59e0b','Аренда':'#dc3545','Аренда юр. адреса':'#ec4899','Комиссия/страховка':'#e67e22','Комиссия/взносы':'#d97706','Комиссия банка':'#b45309','Страховка':'#be185d','Услуги':'#7c3aed','Реклама':'#0891b2','Депозит':'#06b6d4','Прочее':'#94a3b8','Налог (ИПН/КПН)':'#ea580c','Инвестиции':'#6366f1','Оборудование':'#14b8a6'};
  const sorted=Object.entries(cats).sort((a,b)=>b[1]-a[1]),te=Object.values(cats).reduce((s,v)=>s+v,0)||1;
  let donut='',off=0;
  if(sorted.length){sorted.forEach(([k,v])=>{const pct=v/te*100,dash=pct*2.51327,gap=251.327-dash;donut+=`<circle cx="50" cy="50" r="40" fill="none" stroke="${cc[k]||'#94a3b8'}" stroke-width="14" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-off*2.51327}"/>`;off+=pct})}
  else{donut='<circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" stroke-width="14"/>'}
  document.getElementById('pm').innerHTML=`<div class="card"><div class="clbl" style="margin-bottom:14px">P&L</div><div class="kpi"><span class="kpi-k">Выручка (безнал)</span><span class="c-g" style="font-weight:700">${fm(p.i)}</span></div><div class="kpi"><span class="kpi-k">💵 Наличные</span><span class="c-ca" style="font-weight:700">${fm(p.c)}</span></div><div class="kpi" style="font-weight:700;border-top:2px solid var(--border);padding-top:8px;margin-top:4px"><span>Общая выручка</span><span class="c-g">${fm(p.total)}</span></div><div class="kpi"><span class="kpi-k">— Расходы</span><span class="c-r">${fm(p.e)}</span></div><div class="kpi" style="font-weight:700"><span>EBITDA</span><span class="${p.eb>=0?'c-go':'c-r'}">${fm(p.eb)}</span></div><div class="kpi"><span class="kpi-k">— Налог</span><span class="c-r">${fm(p.tx)}</span></div><div class="kpi" style="font-weight:700;border-top:2px solid var(--border);padding-top:8px;margin-top:4px"><span>Чистая прибыль</span><span style="font-size:18px;font-weight:800" class="${p.n>=0?'c-g':'c-r'}">${fm(p.n)}</span></div><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:var(--muted)">Рентабельность</span><span class="${+re>=0?'c-g':'c-r'}" style="font-weight:700">${re}%</span></div><div class="pbar" style="height:6px"><div class="pbar-f" style="width:${Math.min(Math.abs(+re),100)}%;background:${+re>=0?'var(--accent)':'var(--red)'}"></div></div></div></div><div class="card"><div class="clbl" style="margin-bottom:16px">Структура расходов</div><div style="display:flex;align-items:center;justify-content:center;margin-bottom:16px"><div style="position:relative;width:180px;height:180px"><svg viewBox="0 0 100 100" style="width:100%;height:100%;transform:rotate(-90deg)">${donut}</svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:20px;font-weight:800">${fm(te)}</div><div style="font-size:10px;color:var(--muted)">расходы</div></div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">${sorted.map(([k,v])=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0"><div style="width:10px;height:10px;border-radius:3px;background:${cc[k]||'#94a3b8'};flex-shrink:0"></div><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k}</div><div style="font-size:10px;color:var(--muted)">${fm(v)} · ${(v/te*100).toFixed(0)}%</div></div></div>`).join('')}</div></div>`;
  document.getElementById('pc').innerHTML=`<div class="card"><div class="clbl" style="margin-bottom:14px">Детализация расходов</div><table class="tbl"><thead><tr><th>Категория</th><th class="num">Сумма</th><th class="num">%</th><th class="hm" style="width:120px"></th></tr></thead><tbody>${sorted.map(([k,v])=>`<tr><td><div style="display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:2px;background:${cc[k]||'#94a3b8'}"></div><span>${k}</span></div></td><td class="num c-r" style="font-weight:600">${fm(v)}</td><td class="num" style="color:var(--muted)">${(v/te*100).toFixed(1)}%</td><td class="hm"><div class="pbar"><div class="pbar-f" style="width:${v/te*100}%;background:${cc[k]||'var(--blue)'}"></div></div></td></tr>`).join('')}${!sorted.length?'<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">Нет расходов</td></tr>':''}</tbody></table></div>`
}

/* ═══════════════ RENDER PLAN ═══════════════ */
function rPlan(){
  const yr=document.getElementById('yr').value==='all'?'2026':document.getElementById('yr').value;
  document.getElementById('pli').innerHTML=MF.map((m,i)=>{const k=`${yr}-${String(i+1).padStart(2,'0')}`;return`<div class="plc"><div class="pm">${m}</div><input class="fin" style="padding:6px 8px;font-size:11px" type="number" placeholder="0" value="${S.plans[k]||''}" onchange="S.plans['${k}']=+this.value;save();rPlan()"></div>`}).join('');
  const rows=MF.map((m,i)=>{const k=`${yr}-${String(i+1).padStart(2,'0')}`,pl=+(S.plans[k]||0),f=S.transactions.filter(t=>t.date&&t.date.startsWith(k)&&t.type==='income'&&(S.currentCompany==='Все'||t.company===S.currentCompany)).reduce((s,t)=>s+t.amount,0),d=f-pl,pct=pl>0?(f/pl*100).toFixed(0):null;return{m,pl,f,d,pct}});
  document.getElementById('plt').innerHTML=`<table class="tbl"><thead><tr><th>Месяц</th><th class="num">План</th><th class="num">Факт</th><th class="num hm">Откл.</th><th class="num">%</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.m}</td><td class="num">${r.pl?fm(r.pl):'—'}</td><td class="num ${r.f?'c-g':''}">${r.f?fm(r.f):'—'}</td><td class="num hm ${r.d>=0?'c-g':'c-r'}">${r.pl||r.f?(r.d>=0?'+':'')+fm(r.d):'—'}</td><td class="num">${r.pct?`<span class="badge ${+r.pct>=100?'b-g':+r.pct>=70?'b-go':'b-r'}">${r.pct}%</span>`:'—'}</td></tr>`).join('')}</tbody></table>`
}

/* ═══════════════ RENDER FOUNDERS — Block 1 ═══════════════ */
function setFounder(f,el){
  selFounder=f;
  document.querySelectorAll('#f-tabs .mtab').forEach(b=>b.classList.remove('act'));
  el.classList.add('act');rF()
}
function rF(){
  let all=S.transactions;
  const yr=document.getElementById('yr').value;
  if(yr!=='all')all=all.filter(t=>t.date&&t.date.startsWith(yr));
  const nf=(txs,co)=>{
    const i=txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const e=txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const c=txs.filter(t=>t.type==='cash').reduce((s,t)=>s+t.amount,0);
    const eb=i-e,r=(co==='ТОО LCG'?S.settings.taxTOO:S.settings.taxIP)/100,tx=eb>0?eb*r:0;
    return{n:eb-tx+c,i,e,c,eb,tx}
  };
  const ip=nf(all.filter(t=>t.company==='ИП LCG'),'ИП LCG');
  const too=nf(all.filter(t=>t.company==='ТОО LCG'),'ТОО LCG');
  const tn=ip.n+too.n;
  const ep=S.settings.erbol/100,rp=S.settings.ramadan/100;
  const fp=selFounder==='erbol'?ep:selFounder==='ramadan'?rp:1;
  const totalIncome=ip.i+too.i+ip.c+too.c;
  const totalOpEx=ip.e+too.e;
  const fotNalogi=all.filter(t=>t.category==='ФОТ Налоги'&&t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const totalTax=ip.tx+too.tx+fotNalogi;
  const rentability=totalIncome>0?(tn/totalIncome*100).toFixed(1):0;
  const taxPct=totalIncome>0?(totalTax/totalIncome*100).toFixed(0):0;
  const opexPct=totalIncome>0?(totalOpEx/totalIncome*100).toFixed(0):0;
  const planYr=yr==='all'?'2026':yr;
  const planTotal=Object.entries(S.plans).filter(([k])=>k.startsWith(planYr)).reduce((s,[,v])=>s+v,0);

  // 1. Tabs
  document.getElementById('f-tabs').innerHTML=[['erbol',`Ербол ${S.settings.erbol}%`],['ramadan',`Рамадан ${S.settings.ramadan}%`],['both','Оба']].map(([id,lbl])=>`<button class="mtab ${selFounder===id?'act':''}" onclick="setFounder('${id}',this)">${lbl}</button>`).join('');

  // 2. KPI
  const bothSub=selFounder==='both'?`<div style="font-size:10px;color:var(--muted);margin-top:4px">Ербол: ${fm(tn*ep)} / Рамадан: ${fm(tn*rp)}</div>`:'';
  document.getElementById('f-kpi').innerHTML=`
    <div class="card" style="border-top:3px solid var(--accent)"><div class="clbl">Моя выручка</div><div class="cval c-g">${fm(totalIncome*fp)}</div><div class="csub">из общих ${fm(totalIncome)}</div>${bothSub}</div>
    <div class="card" style="border-top:3px solid var(--blue)"><div class="clbl">Моя чистая прибыль</div><div class="cval ${tn*fp>=0?'c-g':'c-r'}">${fm(Math.max(tn*fp,0))}</div><div class="csub">Рент. ${rentability}%</div>${bothSub}</div>
    <div class="card" style="border-top:3px solid var(--red)"><div class="clbl">Мои налоги</div><div class="cval c-r">${fm(totalTax*fp)}</div><div class="csub">${taxPct}% от выручки</div></div>
    <div class="card" style="border-top:3px solid var(--gold)"><div class="clbl">Мои опер. расходы</div><div class="cval c-go">${fm(totalOpEx*fp)}</div><div class="csub">${opexPct}% от выручки</div></div>`;

  // 3. Plan vs Fact
  const planFp=planTotal*fp,factFp=totalIncome*fp,diff=factFp-planFp;
  const pct=planFp>0?Math.min((factFp/planFp*100),200).toFixed(0):null;
  const remain=Math.max(planFp-factFp,0),planDone=planFp>0&&factFp>=planFp;
  document.getElementById('f-plan').innerHTML=`
    <div class="card">
      <div class="clbl" style="margin-bottom:14px">План vs Факт</div>
      <div class="kpi"><span class="kpi-k">Плановый доход</span><span style="font-weight:700">${planFp?fm(planFp):'—'}</span></div>
      <div class="kpi"><span class="kpi-k">Фактический доход</span><span class="c-g" style="font-weight:700">${fm(factFp)}</span></div>
      <div class="kpi" style="font-weight:700"><span>Отклонение</span><span class="${diff>=0?'c-g':'c-r'}">${planFp?(diff>=0?'+':'')+fm(diff):'—'}</span></div>
      ${planFp?`<div style="margin-top:12px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span style="color:var(--muted)">Выполнение</span><span class="${+pct>=100?'c-g':+pct>=70?'c-go':'c-r'}" style="font-weight:700">${pct}%</span></div><div class="pbar" style="height:8px"><div class="pbar-f" style="width:${Math.min(+pct,100)}%;background:${+pct>=100?'var(--accent)':+pct>=70?'var(--gold)':'var(--red)'}"></div></div></div>`:''}
    </div>
    <div class="card" style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
      <div class="clbl">Осталось заработать</div>
      ${planDone?`<div style="font-size:40px">✓</div><div style="font-size:16px;font-weight:800;color:var(--accent)">План выполнен!</div>`:`<div class="cval c-r" style="font-size:28px">${planFp?fm(remain):'—'}</div><div class="csub">до выполнения годового плана</div>`}
    </div>`;

  // 4. Tax + OpEx
  const cats=eC(all);
  const opexCats=['ФОТ Зарплата','Аренда','Аренда юр. адреса','Услуги','Реклама','Комиссия/страховка','Комиссия/взносы','Комиссия банка','Прочее'];
  const opexTot=opexCats.reduce((s,c)=>s+(cats[c]||0),0)*fp||1;
  const cc2=['var(--blue)','var(--red)','var(--accent)','#7c3aed','var(--gold)','var(--cash)','#0891b2','#be185d','var(--muted)'];
  document.getElementById('f-detail').innerHTML=`
    <div class="card">
      <div class="clbl" style="margin-bottom:14px">Налоговая нагрузка</div>
      <div class="kpi"><span class="kpi-k">Налог ИП (${S.settings.taxIP}%)</span><span class="c-r" style="font-weight:700">${fm(ip.tx*fp)}</span></div>
      <div class="kpi"><span class="kpi-k">Налог ТОО (${S.settings.taxTOO}%)</span><span class="c-r" style="font-weight:700">${fm(too.tx*fp)}</span></div>
      <div class="kpi"><span class="kpi-k">ФОТ Налоги</span><span class="c-r" style="font-weight:700">${fm(fotNalogi*fp)}</span></div>
      <div class="kpi" style="font-weight:700;border-top:2px solid var(--border);padding-top:8px;margin-top:4px"><span>Итого налоги</span><span class="c-r" style="font-size:16px">${fm(totalTax*fp)}</span></div>
      <div style="margin-top:10px;font-size:11px;color:var(--muted)">${taxPct}% от общей выручки</div>
    </div>
    <div class="card">
      <div class="clbl" style="margin-bottom:14px">Операционные расходы</div>
      ${opexCats.map((cat,i)=>{const v=(cats[cat]||0)*fp;if(!v)return'';return`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500">${cat}</span><span style="color:${cc2[i%cc2.length]};font-weight:700">${fm(v)}</span></div><div class="pbar"><div class="pbar-f" style="width:${v/opexTot*100}%;background:${cc2[i%cc2.length]}"></div></div></div>`}).join('')||'<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Нет расходов</div>'}
    </div>`;

  // 5. Table
  document.getElementById('f-table').innerHTML=`<table class="tbl"><thead><tr><th>Компания</th><th class="num">Выручка</th><th class="num">Расходы</th><th class="num hm">💵 Нал</th><th class="num">К распр.</th><th class="num hm">Ербол</th><th class="num hm">Рамадан</th></tr></thead><tbody><tr><td><span class="badge b-g">ИП</span></td><td class="num c-g">${fm(ip.i)}</td><td class="num c-r">${fm(ip.e)}</td><td class="num hm c-ca">${fm(ip.c)}</td><td class="num ${ip.n>=0?'c-g':'c-r'}" style="font-weight:700">${fm(ip.n)}</td><td class="num c-g hm">${fm(ip.n*ep)}</td><td class="num c-b hm">${fm(ip.n*rp)}</td></tr><tr><td><span class="badge b-go">ТОО</span></td><td class="num c-g">${fm(too.i)}</td><td class="num c-r">${fm(too.e)}</td><td class="num hm c-ca">${fm(too.c)}</td><td class="num ${too.n>=0?'c-g':'c-r'}" style="font-weight:700">${fm(too.n)}</td><td class="num c-g hm">${fm(too.n*ep)}</td><td class="num c-b hm">${fm(too.n*rp)}</td></tr><tr class="tot"><td>Итого</td><td class="num c-g">${fm(ip.i+too.i)}</td><td class="num c-r">${fm(ip.e+too.e)}</td><td class="num hm c-ca">${fm(ip.c+too.c)}</td><td class="num" style="color:var(--gold);font-weight:800">${fm(tn)}</td><td class="num hm" style="color:var(--accent);font-weight:700">${fm(Math.max(tn*ep,0))}</td><td class="num hm" style="color:var(--blue);font-weight:700">${fm(Math.max(tn*rp,0))}</td></tr></tbody></table>`
}

/* ═══════════════ RENDER ACTIVITY — Block 2 ═══════════════ */
function setActivity(a,el){
  selActivity=a;
  document.querySelectorAll('#act-tabs .mtab').forEach(b=>b.classList.remove('act'));
  el.classList.add('act');rA()
}
function rA(){
  const tabsEl=document.getElementById('act-tabs');if(!tabsEl)return;
  const txs=fTxs();
  const tabs=[{id:'operating',label:'🏢 Операционная'},{id:'financial',label:'🏦 Финансовая'},{id:'investing',label:'📈 Инвестиционная'},{id:'cashflow',label:'📊 Cash Flow'}];
  tabsEl.innerHTML=tabs.map(t=>`<button class="mtab ${t.id===selActivity?'act':''}" onclick="setActivity('${t.id}',this)">${t.label}</button>`).join('');
  const byAct={operating:[],financial:[],investing:[]};
  txs.forEach(t=>{const a=getActivityType(t.category);if(byAct[a])byAct[a].push(t)});
  const sumI=arr=>arr.filter(t=>t.type==='income'||t.type==='cash').reduce((s,t)=>s+t.amount,0);
  const sumE=arr=>arr.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
  const kpiEl=document.getElementById('act-kpi'),contentEl=document.getElementById('act-content');
  if(selActivity==='cashflow'){
    const opNet=sumI(byAct.operating)-sumE(byAct.operating);
    const finNet=sumI(byAct.financial)-sumE(byAct.financial);
    const invNet=sumI(byAct.investing)-sumE(byAct.investing);
    const totalNet=opNet+finNet+invNet;
    kpiEl.innerHTML=`
      <div class="card" style="border-top:3px solid var(--accent)"><div class="clbl">ОД нетто</div><div class="cval ${opNet>=0?'c-g':'c-r'}">${fm(opNet)}</div></div>
      <div class="card" style="border-top:3px solid var(--blue)"><div class="clbl">ФД нетто</div><div class="cval ${finNet>=0?'c-g':'c-r'}">${fm(finNet)}</div></div>
      <div class="card" style="border-top:3px solid var(--gold)"><div class="clbl">ИД нетто</div><div class="cval ${invNet>=0?'c-g':'c-r'}">${fm(invNet)}</div></div>`;
    const cfRow=(lbl,amt,isTot=false)=>`<div class="kpi" ${isTot?'style="font-weight:700;border-top:2px solid var(--border);padding-top:8px;margin-top:4px"':''}><span class="kpi-k" ${isTot?'style="font-weight:700;color:var(--text)"':''}>${lbl}</span><span class="${amt>=0?'c-g':'c-r'}" style="font-weight:${isTot?800:600}">${amt>=0?'+':''}${fm(amt)}</span></div>`;
    const secHdr=lbl=>`<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin:16px 0 8px">${lbl}</div>`;
    contentEl.innerHTML=`
      <div class="clbl" style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:16px">ОТЧЁТ О ДВИЖЕНИИ ДЕНЕЖНЫХ СРЕДСТВ</div>
      ${secHdr('I. ОПЕРАЦИОННАЯ ДЕЯТЕЛЬНОСТЬ')}
      ${cfRow('Поступления от клиентов',sumI(byAct.operating))}
      ${Object.entries(eC(byAct.operating)).sort((a,b)=>b[1]-a[1]).map(([k,v])=>cfRow('— '+k,-v)).join('')}
      ${cfRow('Итого по ОД',opNet,true)}
      ${secHdr('II. ФИНАНСОВАЯ ДЕЯТЕЛЬНОСТЬ')}
      ${cfRow('Поступления (депозиты и проч.)',sumI(byAct.financial))}
      ${Object.entries(eC(byAct.financial)).sort((a,b)=>b[1]-a[1]).map(([k,v])=>cfRow('— '+k,-v)).join('')}
      ${cfRow('Итого по ФД',finNet,true)}
      ${secHdr('III. ИНВЕСТИЦИОННАЯ ДЕЯТЕЛЬНОСТЬ')}
      ${cfRow('Поступления от продажи активов',sumI(byAct.investing))}
      ${Object.entries(eC(byAct.investing)).sort((a,b)=>b[1]-a[1]).map(([k,v])=>cfRow('— '+k,-v)).join('')}
      ${cfRow('Итого по ИД',invNet,true)}
      <div style="border-top:2px solid var(--border);margin-top:16px;padding-top:12px">${cfRow('ЧИСТОЕ ИЗМЕНЕНИЕ ДС',totalNet,true)}</div>`;
  }else{
    const list=byAct[selActivity]||[];
    const inc=sumI(list),exp=sumE(list),net=inc-exp;
    const names={operating:'Операционная',financial:'Финансовая',investing:'Инвестиционная'};
    kpiEl.innerHTML=`
      <div class="card" style="border-top:3px solid var(--accent)"><div class="clbl">Поступления</div><div class="cval c-g">${fm(inc)}</div></div>
      <div class="card" style="border-top:3px solid var(--red)"><div class="clbl">Расходы</div><div class="cval c-r">${fm(exp)}</div></div>
      <div class="card" style="border-top:3px solid var(--blue)"><div class="clbl">Нетто</div><div class="cval ${net>=0?'c-g':'c-r'}">${fm(net)}</div></div>`;
    const sorted=list.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    contentEl.innerHTML=`<div class="clbl" style="margin-bottom:12px">${names[selActivity]} деятельность — транзакции</div>`+(sorted.length?`<table class="tbl"><thead><tr><th>Дата</th><th>Тип</th><th>Контрагент</th><th class="hm">Категория</th><th class="num">Сумма</th></tr></thead><tbody>${sorted.map(t=>`<tr ${isA?`onclick="editTx('${t.id}')"`:''}><td style="font-size:12px;white-space:nowrap">${t.date||'—'}</td><td><div class="tp ${t.type==='income'?'tp-i':t.type==='cash'?'tp-c':'tp-e'}">${t.type==='income'?'▲':t.type==='cash'?'💵':'▼'}</div></td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.counterparty||t.desc||'—'}</td><td class="hm"><span class="badge ${t.type==='income'?'b-b':t.type==='cash'?'b-ca':'b-r'}">${t.category}</span></td><td class="num"><span class="${t.type==='income'?'c-g':t.type==='cash'?'c-ca':'c-r'}" style="font-weight:600">${t.type==='expense'?'−':'+'} ${fm(t.amount)}</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty"><div class="empty-ico">📭</div><div>Нет транзакций</div></div>');
  }
}

/* ═══════════════ 1C INTEGRATION — Block 3 ═══════════════ */
function toggle1cSync(){
  if(!isA)return;
  S.settings.sync1c_enabled=!S.settings.sync1c_enabled;
  save();render1cStatus();
  alert(S.settings.sync1c_enabled?'Синхронизация с 1С включена. Интервал: каждые '+S.settings.sync1c_interval+' мин':'Синхронизация с 1С отключена')
}
function test1cConnection(){
  if(!isA)return;
  const url=document.getElementById('s-1c-url').value;
  if(!url){alert('Введите URL OData');return}
  addSyncLog('info','Тест подключения к '+url);
  alert('⚠ Тест подключения пока в разработке. URL сохранён.')
}
function manualSync1c(){
  if(!isA)return;
  if(!S.settings.sync1c_url){alert('Настройте подключение к 1С');return}
  addSyncLog('info','Ручная синхронизация запущена');
  alert('⚠ Синхронизация пока в разработке. Используйте импорт Excel.')
}
function addSyncLog(status,message){
  if(!S.syncLog)S.syncLog=[];
  S.syncLog.unshift({id:uid(),timestamp:new Date().toISOString(),status,message});
  if(S.syncLog.length>50)S.syncLog=S.syncLog.slice(0,50);
  save();renderSyncLog()
}
function renderSyncLog(){
  const el=document.getElementById('sync-log');if(!el)return;
  const logs=(S.syncLog||[]).slice(0,20);
  el.innerHTML=logs.length?logs.map(l=>{
    const d=new Date(l.timestamp);
    const time=d.toLocaleDateString('ru-RU')+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    const badge=l.status==='success'?'b-g':l.status==='error'?'b-r':'b-b';
    const icon=l.status==='success'?'✓':l.status==='error'?'✕':'ℹ';
    return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px"><span class="badge ${badge}">${icon}</span><span style="color:var(--muted);white-space:nowrap">${time}</span><span style="flex:1">${l.message}</span></div>`
  }).join(''):'<div style="color:var(--muted);font-size:11px;padding:16px;text-align:center">Нет записей</div>'
}
function render1cStatus(){
  const el=document.getElementById('sync-status');if(!el)return;
  if(S.settings.sync1c_enabled&&S.settings.sync1c_url){el.className='badge b-g';el.textContent='● Активно'}
  else if(S.settings.sync1c_url){el.className='badge b-go';el.textContent='○ Отключено'}
  else{el.className='badge b-r';el.textContent='Не подключено'}
}

/*
МАППИНГ 1С ↔ LCG FINANCE (для будущей реализации):
1С "Поступление на расчётный счёт" → type: 'income'
1С "Списание с расчётного счёта"   → type: 'expense'
1С "Приходный кассовый ордер"      → type: 'cash'
1С "Реализация (акт)"              → invoice status: 'paid' + transaction
1С Справочник "Контрагенты"        → поле counterparty
1С Справочник "Статьи ДДС"         → category + activity_type
Дедупликация: по ключу date + amount + counterparty + sync_1c_id
*/

/* ═══════════════ INIT ═══════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  try{const t=localStorage.getItem('lcg-th');if(t)S.theme=t}catch(e){}
  aTheme();
  document.querySelectorAll('.mo').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('open')}));
  ['ivcl','ivde','ivdt','ivdu','ivco'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',pInv)})
});
