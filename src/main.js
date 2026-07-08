import './styles/app.css';

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[char]));
}

function escapeAttr(value){
  return escapeHtml(value);
}

// ---------- Storan: data kekal walaupun tutup app ----------
// Nota: bila dibuka dalam preview Claude, storan mungkin disekat (data tak kekal) —
// tapi bila dibuka dalam browser sebenar / Live Server / deploy, ia kekal sepenuhnya.
const RESET_HOUR = 6; // anggaran waktu Subuh; fasa Laravel nanti guna waktu solat sebenar ikut zon
function currentDayKey(){
  const d = new Date();
  if(d.getHours() < RESET_HOUR) d.setDate(d.getDate() - 1);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}
let SAVED = null;
try{ SAVED = JSON.parse(localStorage.getItem('zikru-v1')); }catch(e){ SAVED = null; }
const isNewDay = !SAVED || SAVED.dayKey !== currentDayKey();

function saveState(){
  try{
    localStorage.setItem('zikru-v1', JSON.stringify({
      dayKey: currentDayKey(),
      count, targets, mood, muted, vibrateEnabled, appTheme
    }));
  }catch(e){ /* storan disekat (contoh: preview) — app tetap jalan, cuma tak kekal */ }
}

// ---------- Day / Night mood ----------
const MOON = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
const SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.55 1.55M17.52 17.52l1.55 1.55M2 12h2.2M19.8 12H22M4.93 19.07l1.55-1.55M17.52 6.48l1.55-1.55"/>';
const deviceEl = document.querySelector('.device');
let mood = (SAVED && SAVED.mood) ? SAVED.mood : 'night';

function applyMood(){
  deviceEl.setAttribute('data-theme', mood);
  document.querySelectorAll('.theme-toggle svg').forEach(svg=>{
    svg.innerHTML = mood === 'day' ? SUN : MOON;
  });
  try{
    const stars = document.querySelector('.stars');
    if(stars) stars.style.opacity = mood === 'day' ? '0' : '1';
  }catch(e){}
  applyAppTheme(appTheme);
}
// ---------- App theme colors. Gold stays premium and unchanged. ----------
const APP_THEMES = {
  forest: {
    night: { ink:'#11201C', inkElev:'#1B2E28', inkElev2:'#213730', sage:'#3C5148', sageDim:'#243830', body:'#0A1512' },
    day: { ink:'#E9EDE4', inkElev:'#DEE4D6', inkElev2:'#D2DAC7', sage:'#8FA48F', sageDim:'#CDD8C6', body:'#D6DED2' },
  },
  midnight: {
    night: { ink:'#101820', inkElev:'#18242E', inkElev2:'#213141', sage:'#3D5263', sageDim:'#243341', body:'#081017' },
    day: { ink:'#E8EDF2', inkElev:'#DCE4EB', inkElev2:'#CDD8E2', sage:'#8D9DAA', sageDim:'#C8D4DE', body:'#D4DDE6' },
  },
  mineral: {
    night: { ink:'#151D1F', inkElev:'#202B2D', inkElev2:'#2A383A', sage:'#46595B', sageDim:'#2C3A3C', body:'#0D1314' },
    day: { ink:'#E8EBE8', inkElev:'#DDE2DF', inkElev2:'#D0D8D4', sage:'#8C9B96', sageDim:'#C9D1CC', body:'#D5DCD8' },
  },
  maroon: {
    night: { ink:'#201416', inkElev:'#2D1D20', inkElev2:'#3A2529', sage:'#5A3F43', sageDim:'#3B282C', body:'#150C0E' },
    day: { ink:'#EFE7E4', inkElev:'#E6DAD6', inkElev2:'#DBCBC6', sage:'#A48D88', sageDim:'#D8CAC5', body:'#E1D5D0' },
  },
  olive: {
    night: { ink:'#191D13', inkElev:'#252B1D', inkElev2:'#303824', sage:'#4C5837', sageDim:'#303824', body:'#10130C' },
    day: { ink:'#EBECE2', inkElev:'#E1E4D5', inkElev2:'#D3D8C2', sage:'#99A37F', sageDim:'#D0D6BF', body:'#DADDCB' },
  },
};
let appTheme = (SAVED && SAVED.appTheme) ? SAVED.appTheme : 'forest';
function applyAppTheme(theme){
  if(!APP_THEMES[theme]) theme = 'forest';
  appTheme = theme;
  const palette = APP_THEMES[theme][mood === 'day' ? 'day' : 'night'];
  deviceEl.style.setProperty('--ink', palette.ink);
  deviceEl.style.setProperty('--ink-elev', palette.inkElev);
  deviceEl.style.setProperty('--ink-elev-2', palette.inkElev2);
  deviceEl.style.setProperty('--sage', palette.sage);
  deviceEl.style.setProperty('--sage-dim', palette.sageDim);
  document.body.style.backgroundColor = palette.body;

  document.querySelectorAll('.theme-swatch').forEach(btn=>{
    btn.classList.toggle('selected', btn.dataset.appTheme === appTheme);
  });
}
applyAppTheme(appTheme);
document.querySelectorAll('.theme-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    mood = mood === 'night' ? 'day' : 'night';
    applyMood();
    vibrate(8);
    saveState();
  });
});
applyMood();

// ---------- Nav switching ----------
document.querySelectorAll('.navitem').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.navitem').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.querySelectorAll(`[data-target="${item.dataset.target}"]`).forEach(i=>i.classList.add('active'));
    document.getElementById(item.dataset.target).classList.add('active');
  });
});

let vibrateEnabled = SAVED && typeof SAVED.vibrateEnabled === 'boolean' ? SAVED.vibrateEnabled : true;
function vibrate(ms){ if(!vibrateEnabled) return; if(navigator.vibrate) navigator.vibrate(ms); }

// ---------- Bunyi (fallback untuk iOS yang tak sokong vibration) ----------
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    audioCtx = new Ctx();
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
function beep(freq=880, duration=0.08, volume=0.15, type='sine'){
  try{
    const ctx = getAudioCtx();
    if(!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }catch(e){}
}
function beepTick(){ beep(1200, 0.035, 0.07, 'sine'); }
function beepMilestone(){ beep(880, 0.09, 0.15, 'triangle'); setTimeout(()=>beep(1320, 0.12, 0.15, 'triangle'), 90); }
function beepReset(){ beep(320, 0.15, 0.12, 'sine'); }
function beepStepDone(){ beep(700, 0.08, 0.13, 'sine'); }
function beepTargetDone(){ beep(660, 0.1, 0.16, 'triangle'); setTimeout(()=>beep(990, 0.14, 0.16, 'triangle'), 100); }

// ---------- ZIKIR UMUM ----------

let count = (!isNewDay && SAVED && typeof SAVED.count === 'number') ? SAVED.count : 0;
const countNum = document.getElementById('countNum');
countNum.textContent = count.toLocaleString('ms-MY');
const tapCircle = document.getElementById('tapCircle');
let pressTimer = null; let longPressed = false;

// decorative bead ring
const beadRingUmum = document.getElementById('beadRingUmum');
const N_DEC = 60;
for(let i=0;i<N_DEC;i++){
  const b = document.createElement('div');
  b.className='bead';
  const angle = (i/N_DEC)*2*Math.PI;
  const r = 138;
  b.style.transform = `translate(${140+r*Math.cos(angle)-2.5}px, ${140+r*Math.sin(angle)-2.5}px)`;
  beadRingUmum.appendChild(b);
}

function bump(){
  count++;
  countNum.textContent = count.toLocaleString('ms-MY');
  tapCircle.style.transform='scale(0.94)';
  setTimeout(()=>{ tapCircle.style.transform='scale(1)'; }, 90);

  if(count % 100 === 0){
    vibrate([15,40,15,40,15]);
    if(!muted) beepMilestone();
    const toast = document.getElementById('resetToast');
    const original = toast.textContent;
    toast.textContent = count.toLocaleString('ms-MY') + ' kali ✓';
    toast.classList.add('show');
    setTimeout(()=>{
      toast.classList.remove('show');
      setTimeout(()=>{ toast.textContent = original; }, 300);
    }, 900);
  } else {
    vibrate(12);
    if(!muted) beepTick();
  }
  saveState();
}

tapCircle.addEventListener('contextmenu', e=> e.preventDefault());

// Tap utama guna 'click' — sama pattern dengan skrin Khusus yang stabil
tapCircle.addEventListener('click', ()=>{
  if(longPressed){ longPressed = false; return; }
  bump();
});

// Long-press (lapisan tambahan) untuk reset — tak ganggu click di atas
tapCircle.addEventListener('pointerdown', ()=>{
  longPressed = false;
  tapCircle.classList.add('holding');
  pressTimer = setTimeout(()=>{
    longPressed = true;
    tapCircle.classList.remove('holding');
    count = 0;
    countNum.textContent = '0';
    vibrate([20,40,20]);
    if(!muted) beepReset();
    saveState();
    const toast = document.getElementById('resetToast');
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 1200);
  }, 600);
});
tapCircle.addEventListener('pointerup', ()=> { clearTimeout(pressTimer); tapCircle.classList.remove('holding'); });
tapCircle.addEventListener('pointerleave', ()=> { clearTimeout(pressTimer); tapCircle.classList.remove('holding'); });
tapCircle.addEventListener('pointercancel', ()=> { clearTimeout(pressTimer); tapCircle.classList.remove('holding'); });

// ---------- ZIKIR KHUSUS ----------
// type 'simple'  = satu zikir, satu target (contoh: Selawat 1000/hari)
// type 'wirid'   = kumpulan beberapa zikir berturutan (contoh: Wirid Pagi -> Subhanallah, Alhamdulillah, Allahuakbar)
const DEFAULT_TARGETS = [
  {type:'simple', name:'Selawat', current:0, target:1000},
  {type:'wirid', name:'Wirid Pagi', items:[
    {name:'Subhanallah', current:0, target:33},
    {name:'Alhamdulillah', current:0, target:33},
    {name:'Allahuakbar', current:0, target:34},
  ]},
  {type:'wirid', name:'Wirid Petang', items:[
    {name:'Subhanallah', current:0, target:33},
    {name:'Alhamdulillah', current:0, target:33},
    {name:'Allahuakbar', current:0, target:34},
  ]},
];
const targets = (SAVED && Array.isArray(SAVED.targets) && SAVED.targets.length) ? SAVED.targets : DEFAULT_TARGETS;
// Hari baru: definisi target kekal, progress semalam di-reset ke 0
if(isNewDay){
  targets.forEach(t=>{
    if(t.type === 'wirid'){ t.items.forEach(it=> it.current = 0); }
    else { t.current = 0; }
  });
}
let activeIdx = 0;
const NS = "http://www.w3.org/2000/svg";
const ringSvg = document.getElementById('ringSvg');
const N_BEADS = 36;
const cx=125, cy=125, r=105;

function isDone(t){
  return t.type === 'wirid' ? t.items.every(it=>it.current>=it.target) : t.current>=t.target;
}
function activeItemOf(t){
  if(t.type !== 'wirid') return null;
  const idx = t.items.findIndex(it=>it.current<it.target);
  return idx === -1 ? t.items[t.items.length-1] : t.items[idx];
}
function wiridDoneCount(t){ return t.items.filter(it=>it.current>=it.target).length; }
// Kalau ada zikir yang baru selesai tapi belum disahkan (tap) untuk sambung,
// tunjuk zikir tu dulu — bukan terus lompat ke zikir seterusnya
function displayItemOf(t){
  if(t.type !== 'wirid') return t;
  if(t.pendingConfirm != null && t.items[t.pendingConfirm]) return t.items[t.pendingConfirm];
  return activeItemOf(t);
}

function buildRing(){
  ringSvg.innerHTML='';
  for(let i=0;i<N_BEADS;i++){
    const angle = (i/N_BEADS)*2*Math.PI - Math.PI/2;
    const x = cx + r*Math.cos(angle);
    const y = cy + r*Math.sin(angle);
    const c = document.createElementNS(NS,'circle');
    c.setAttribute('cx',x); c.setAttribute('cy',y); c.setAttribute('r', i%9===0?5:3.4);
    c.setAttribute('class','ring-bead');
    c.setAttribute('data-i', i);
    ringSvg.appendChild(c);
  }
}
buildRing();

function getDisplayOrder(){
  return targets.map((_, i) => i).sort((a, b)=>{
    const aDone = isDone(targets[a]);
    const bDone = isDone(targets[b]);
    if(aDone === bDone) return a - b;
    return aDone ? 1 : -1;
  });
}

function renderRing(){
  const t = targets[activeIdx];
  const item = displayItemOf(t);
  const pct = Math.min(item.current/item.target, 1);
  const filled = Math.round(pct*N_BEADS);
  document.querySelectorAll('.ring-bead').forEach((c,i)=>{
    c.setAttribute('class', i < filled ? 'ring-bead filled' : 'ring-bead unfilled');
  });

  document.getElementById('targetName').textContent = t.name;
  document.getElementById('ringCurrent').textContent = item.current.toLocaleString('ms-MY');
  document.getElementById('ringTarget').textContent = '/ ' + item.target.toLocaleString('ms-MY');

  const stepIndicator = document.getElementById('stepIndicator');
  const stepPending = t.type === 'wirid' && t.pendingConfirm != null;
  if(t.type === 'wirid'){
    const doneCount = wiridDoneCount(t);
    stepIndicator.style.display = 'block';
    stepIndicator.textContent = stepPending
      ? `${item.name} selesai ✓ · tap untuk sambung`
      : `${item.name} · langkah ${Math.min(doneCount+1, t.items.length)}/${t.items.length}`;
  } else {
    stepIndicator.style.display = 'none';
  }

  const done = isDone(t);
  document.getElementById('ringLive').style.display = (done || stepPending) ? 'none' : 'flex';
  document.getElementById('ringDone').style.display = (done && !stepPending) ? 'block' : 'none';
  document.getElementById('ringStepDone').style.display = stepPending ? 'block' : 'none';
  if(stepPending){
    document.getElementById('ringStepDoneLabel').textContent = `${item.name} selesai`;
  }

  // target list — yang belum siap dulu, yang dah capai target turun ke belakang
  const list = document.getElementById('targetList');
  list.innerHTML='';
  const order = getDisplayOrder();
  order.forEach(i=>{
    const tg = targets[i];
    const done = isDone(tg);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'target-card' + (i===activeIdx?' active':'') + (done?' completed':'');
    card.setAttribute('aria-pressed', i===activeIdx ? 'true' : 'false');

    if(tg.type === 'wirid'){
      const dc = wiridDoneCount(tg);
      const currentItem = displayItemOf(tg);
      const segs = tg.items.map(it=> `<span class="seg ${it.current>=it.target?'seg-filled':''}"></span>`).join('');
      card.innerHTML = `
        <div class="tc-edit" data-edit-i="${i}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div class="tc-name">${escapeHtml(tg.name)}${done ? ' <span class="tc-check">✓</span>' : ''}</div>
        <div class="tc-segs">${segs}</div>
        <div class="tc-num">${done ? 'Selesai' : `${escapeHtml(currentItem.name)} · ${dc}/${tg.items.length}`}</div>
      `;
    } else {
      const pctc = Math.min(100, Math.round((tg.current/tg.target)*100));
      card.innerHTML = `
        <div class="tc-edit" data-edit-i="${i}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <div class="tc-name">${escapeHtml(tg.name)}${done ? ' <span class="tc-check">✓</span>' : ''}</div>
        <div class="tc-bar"><div class="tc-fill" style="width:${pctc}%"></div></div>
        <div class="tc-num">${done ? 'Selesai' : tg.current + '/' + tg.target}</div>
      `;
    }
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.tc-edit')) return;
      activeIdx=i; renderRing();
    });
    list.appendChild(card);
  });

  const addCard = document.createElement('button');
  addCard.type = 'button';
  addCard.className = 'target-card-add';
  addCard.setAttribute('aria-label','Tambah target baru');
  addCard.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>';
  addCard.addEventListener('click', ()=> openSheet('add'));
  list.appendChild(addCard);

  // pasang listener edit selepas kad dijana (semua jenis kad kini boleh diedit)
  document.querySelectorAll('.tc-edit').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      openSheet('edit', parseInt(btn.dataset.editI));
    });
  });
}
renderRing();
if(isNewDay) saveState(); // rekod dayKey baru supaya reset tak berulang dalam hari sama

document.getElementById('targetSelect').addEventListener('click', ()=>{
  const order = getDisplayOrder();
  const posInOrder = order.indexOf(activeIdx);
  activeIdx = order[(posInOrder + 1) % order.length];
  renderRing();
});

document.getElementById('ringCenter').addEventListener('click', ()=>{
  const t = targets[activeIdx];

  // Ada zikir yang baru selesai, menunggu pengesahan — tap ni cuma sambung, TAK dikira
  if(t.type === 'wirid' && t.pendingConfirm != null){
    t.pendingConfirm = null;
    vibrate(8);
    renderRing();
    saveState();
    return;
  }

  const item = t.type === 'wirid' ? activeItemOf(t) : t;
  if(item.current >= item.target) return;

  item.current++;
  vibrate(12);

  if(item.current >= item.target){
    if(t.type === 'wirid' && wiridDoneCount(t) < t.items.length){
      // satu zikir dalam wirid selesai, tapi wirid belum habis — kunci ring, tunggu tap sahkan
      t.pendingConfirm = t.items.indexOf(item);
      vibrate([25,50,25]);
      if(!muted) beepStepDone();
      const next = activeItemOf(t);
      const toast = document.getElementById('wiridToast');
      toast.textContent = `${item.name} selesai ✓ · tap untuk sambung ke ${next.name}`;
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'), 1800);
    } else {
      // simple selesai, atau wirid — semua zikir dah habis
      vibrate([30,60,30,60,30]);
      if(!muted) beepTargetDone();
    }
  }
  renderRing();
  saveState();
});

const SOUND_ON = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19 5a9 9 0 010 14M15.5 8.5a5 5 0 010 7"/>';
const SOUND_OFF = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/>';
let muted = SAVED ? !!SAVED.muted : true; // bunyi OFF secara default — user opt-in (keputusan awal projek)
function applyMuteIcon(){
  const btns = document.querySelectorAll('.mute-btn');
  btns.forEach(btn=>{
    const svg = btn.querySelector('svg');
    if(svg) svg.innerHTML = muted ? SOUND_OFF : SOUND_ON;
    btn.classList.toggle('muted', muted);
    btn.setAttribute('aria-label', muted ? 'Bunyi dimatikan — tap untuk hidupkan' : 'Bunyi dihidupkan — tap untuk matikan');
  });
}
applyMuteIcon();
document.querySelectorAll('.mute-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    muted = !muted;
    applyMuteIcon();
    saveState();
  });
});

// ---------- Settings overlay handlers ----------
function openSettings(){
  const overlay = document.getElementById('settingsOverlay');
  if(!overlay) return;
  overlay.classList.add('open');

  const soundBtn = document.getElementById('settingsSoundToggle');
  const vibBtn = document.getElementById('settingsVibrateToggle');
  if(soundBtn){
    soundBtn.classList.toggle('muted', muted);
    soundBtn.setAttribute('aria-pressed', String(!muted));
  }
  if(vibBtn){
    vibBtn.classList.toggle('muted', !vibrateEnabled);
    vibBtn.setAttribute('aria-pressed', String(vibrateEnabled));
  }
}
function closeSettings(){
  const overlay = document.getElementById('settingsOverlay');
  if(overlay) overlay.classList.remove('open');
}

document.querySelectorAll('.settings-btn').forEach(b=>{
  b.addEventListener('click', openSettings);
});
const settingsCloseEl = document.getElementById('settingsCloseBtn');
if(settingsCloseEl) settingsCloseEl.addEventListener('click', closeSettings);

const settingsOverlayEl = document.getElementById('settingsOverlay');
if(settingsOverlayEl){
  settingsOverlayEl.addEventListener('click', (e)=>{
    if(e.target === settingsOverlayEl) closeSettings();
  });
}

const settingsSoundToggle = document.getElementById('settingsSoundToggle');
if(settingsSoundToggle){
  settingsSoundToggle.addEventListener('click', ()=>{
    muted = !muted;
    applyMuteIcon();
    settingsSoundToggle.classList.toggle('muted', muted);
    settingsSoundToggle.setAttribute('aria-pressed', String(!muted));
    saveState();
  });
}
const settingsVibrateToggle = document.getElementById('settingsVibrateToggle');
if(settingsVibrateToggle){
  settingsVibrateToggle.addEventListener('click', ()=>{
    vibrateEnabled = !vibrateEnabled;
    settingsVibrateToggle.classList.toggle('muted', !vibrateEnabled);
    settingsVibrateToggle.setAttribute('aria-pressed', String(vibrateEnabled));
    saveState();
  });
}

const settingsResetBtn = document.getElementById('settingsResetBtn');
if(settingsResetBtn){
  settingsResetBtn.addEventListener('click', ()=>{
    if(confirm('Reset semua data app? Ini akan padam simpanan tempatan.')){
      localStorage.removeItem('zikru-v1');
      location.reload();
    }
  });
}

// App theme swatch handlers
document.querySelectorAll('.theme-swatch').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    applyAppTheme(btn.dataset.appTheme);
    saveState();
  });
});

// ---------- Sheet: Tambah / Edit Target ----------
const sheetOverlay = document.getElementById('sheetOverlay');
const sheetTitle = document.getElementById('sheetTitle');
const typeToggleEl = document.getElementById('typeToggle');
const simpleFieldsEl = document.getElementById('simpleFields');
const wiridFieldsEl = document.getElementById('wiridFields');
const sheetNameInput = document.getElementById('sheetNameInput');
const sheetNumInput = document.getElementById('sheetNumInput');
const wiridNameInput = document.getElementById('wiridNameInput');
const wiridItemsList = document.getElementById('wiridItemsList');
const sheetDeleteBtn = document.getElementById('sheetDelete');
let sheetMode = 'add'; // 'add' | 'edit'
let sheetEditIdx = null;
let sheetTargetType = 'simple'; // 'simple' | 'wirid'

function resetChipSelection(){
  document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('.quick-num').forEach(c=>c.classList.remove('selected'));
}

function setSheetType(type){
  sheetTargetType = type;
  document.querySelectorAll('.type-opt').forEach(b=>{
    const active = b.dataset.type === type;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  simpleFieldsEl.style.display = type === 'simple' ? 'block' : 'none';
  wiridFieldsEl.style.display = type === 'wirid' ? 'block' : 'none';
}
document.querySelectorAll('.type-opt').forEach(btn=>{
  btn.addEventListener('click', ()=> setSheetType(btn.dataset.type));
});

function addWiridItemRow(name='', target=''){
  const row = document.createElement('div');
  row.className = 'wirid-item-row';
  row.innerHTML = `
    <input type="text" class="sheet-input wirid-item-name" placeholder="Nama zikir" maxlength="20" value="${escapeAttr(name)}">
    <input type="number" inputmode="numeric" class="sheet-input wirid-item-num" placeholder="Bil." value="${escapeAttr(target)}">
    <button type="button" class="wirid-item-remove" aria-label="Buang zikir ni">✕</button>
  `;
  row.querySelector('.wirid-item-remove').addEventListener('click', ()=>{
    if(wiridItemsList.querySelectorAll('.wirid-item-row').length > 1) row.remove();
  });
  wiridItemsList.appendChild(row);
}
document.getElementById('addWiridItem').addEventListener('click', ()=> addWiridItemRow());

function openSheet(mode, idx){
  sheetMode = mode;
  sheetEditIdx = idx ?? null;
  resetChipSelection();
  wiridItemsList.innerHTML = '';

  if(mode === 'edit'){
    const t = targets[idx];
    sheetTitle.textContent = 'Edit Target';
    typeToggleEl.style.display = 'none'; // jenis tak boleh tukar semasa edit — elak kehilangan data
    sheetDeleteBtn.style.display = targets.length > 1 ? 'block' : 'none';

    if(t.type === 'wirid'){
      setSheetType('wirid');
      wiridNameInput.value = t.name;
      t.items.forEach(it => addWiridItemRow(it.name, it.target));
    } else {
      setSheetType('simple');
      sheetNameInput.value = t.name;
      sheetNumInput.value = t.target;
      const chip = [...document.querySelectorAll('.preset-chip')].find(c=>c.dataset.name===t.name);
      if(chip) chip.classList.add('selected');
      const num = [...document.querySelectorAll('.quick-num')].find(c=>c.dataset.num==String(t.target));
      if(num) num.classList.add('selected');
    }
  } else {
    sheetTitle.textContent = 'Tambah Target';
    typeToggleEl.style.display = 'flex';
    setSheetType('simple');
    sheetNameInput.value = '';
    sheetNumInput.value = '';
    wiridNameInput.value = '';
    addWiridItemRow();
    sheetDeleteBtn.style.display = 'none';
  }
  sheetOverlay.classList.add('open');
}

function closeSheet(){ sheetOverlay.classList.remove('open'); }

document.querySelectorAll('.preset-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.preset-chip').forEach(c=>c.classList.remove('selected'));
    chip.classList.add('selected');
    sheetNameInput.value = chip.dataset.name;
  });
});
sheetNameInput.addEventListener('input', ()=>{
  document.querySelectorAll('.preset-chip').forEach(c=>{
    c.classList.toggle('selected', c.dataset.name === sheetNameInput.value);
  });
});

document.querySelectorAll('.quick-num').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.quick-num').forEach(c=>c.classList.remove('selected'));
    btn.classList.add('selected');
    sheetNumInput.value = btn.dataset.num;
  });
});
sheetNumInput.addEventListener('input', ()=>{
  document.querySelectorAll('.quick-num').forEach(c=>{
    c.classList.toggle('selected', c.dataset.num === sheetNumInput.value);
  });
});

document.getElementById('sheetCancel').addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', (e)=>{ if(e.target === sheetOverlay) closeSheet(); });

document.getElementById('sheetSave').addEventListener('click', ()=>{
  if(sheetTargetType === 'wirid'){
    const groupName = wiridNameInput.value.trim();
    const rows = [...wiridItemsList.querySelectorAll('.wirid-item-row')];
    const parsed = rows.map(row=>({
      name: row.querySelector('.wirid-item-name').value.trim(),
      target: parseInt(row.querySelector('.wirid-item-num').value)
    }));
    const valid = groupName && parsed.length>0 && parsed.every(it=>it.name && it.target>0);
    if(!valid){ vibrate([15,30,15]); return; }

    if(sheetMode === 'add'){
      targets.push({type:'wirid', name:groupName, items: parsed.map(it=>({name:it.name, target:it.target, current:0}))});
      activeIdx = targets.length - 1;
    } else {
      const old = targets[sheetEditIdx];
      const merged = parsed.map(it=>{
        const match = old.items && old.items.find(oi=>oi.name===it.name);
        return {name:it.name, target:it.target, current: match ? Math.min(match.current, it.target) : 0};
      });
      targets[sheetEditIdx] = {type:'wirid', name:groupName, items:merged};
    }
  } else {
    const name = sheetNameInput.value.trim();
    const num = parseInt(sheetNumInput.value);
    if(!name || !num || num < 1){
      vibrate([15,30,15]);
      if(!name) sheetNameInput.focus(); else sheetNumInput.focus();
      return;
    }
    if(sheetMode === 'add'){
      targets.push({type:'simple', name, current:0, target:num});
      activeIdx = targets.length - 1;
    } else {
      const oldCurrent = targets[sheetEditIdx].current || 0;
      targets[sheetEditIdx] = {type:'simple', name, current: Math.min(oldCurrent, num), target:num};
    }
  }
  vibrate(12);
  closeSheet();
  renderRing();
  saveState();
});

sheetDeleteBtn.addEventListener('click', ()=>{
  if(targets.length <= 1) return;
  targets.splice(sheetEditIdx, 1);
  activeIdx = 0;
  closeSheet();
  renderRing();
  saveState();
});

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register(new URL('sw.js', window.location.href)).catch(()=>{});
  });
}
