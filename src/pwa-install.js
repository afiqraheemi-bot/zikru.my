// ---------- Add to Home Screen prompt ----------
// Android/Chrome guna beforeinstallprompt API (native install).
// iOS Safari takde API macam tu — Apple sengaja block — jadi tunjuk arahan manual.
const DISMISS_KEY = 'zikru-install-dismissed-at';
const DISMISS_DAYS = 14;

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS(){
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS13Up = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS13Up;
}

function wasDismissedRecently(){
  try{
    const raw = localStorage.getItem(DISMISS_KEY);
    if(!raw) return false;
    if(raw === 'installed') return true;
    return (Date.now() - parseInt(raw, 10)) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  }catch(e){ return false; }
}

function markDismissed(){
  try{ localStorage.setItem(DISMISS_KEY, String(Date.now())); }catch(e){}
}

function markInstalled(){
  try{ localStorage.setItem(DISMISS_KEY, 'installed'); }catch(e){}
}

export function initInstallPrompt(){
  if(isStandalone() || wasDismissedRecently()) return;

  const overlay = document.getElementById('installOverlay');
  if(!overlay) return;
  const closeBtn = document.getElementById('installClose');
  const laterBtn = document.getElementById('installLater');
  const installBtn = document.getElementById('installNow');
  const copyEl = document.getElementById('installCopy');
  const stepsEl = document.getElementById('installIosSteps');

  function show(){ overlay.classList.add('open'); }
  function hide(){ overlay.classList.remove('open'); }

  let deferredPrompt = null;

  if(isIOS()){
    installBtn.style.display = 'none';
    laterBtn.textContent = 'Faham';
    setTimeout(show, 1500);
  } else {
    copyEl.textContent = 'Akses lebih pantas dari skrin utama, walaupun offline.';
    stepsEl.style.display = 'none';
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      show();
    });
    window.addEventListener('appinstalled', () => {
      markInstalled();
      hide();
    });
    installBtn.addEventListener('click', async () => {
      if(!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if(choice.outcome === 'accepted') markInstalled();
      else markDismissed();
      hide();
    });
  }

  [closeBtn, laterBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      markDismissed();
      hide();
    });
  });
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay){ markDismissed(); hide(); }
  });
}
