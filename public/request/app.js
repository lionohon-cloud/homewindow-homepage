/* ============================================================
   청암홈윈도우 접수상담 · 2안(단계별 주소 분리) 공용 스크립트
   ============================================================ */

/* ── 설정 ── */
const REDIRECT_URL = 'https://homewindow.kr/';  // 접수 후 최종 이동 주소
const REDIRECT_SEC = 3;                          // 땡큐페이지 대기 초. 0이면 즉시 이동
const LEAD_API = '/api/request/lead';             // same-origin Pages Function
const SMS_API  = '/api/request';                  // same-origin Pages Functions
const NOW = 2026;
const TEL = '1661-4830';   /* 대표번호 — 표기는 각 페이지 마크업에 직접 들어 있습니다 */

const FLOW_ID_KEY = 'cah_request_flow_id';
const ATTRIBUTION_KEY = 'cah_request_attribution';
const ATTRIBUTION_FIELDS = [
  'inflowMedia','inflowChannelText','utm_source','utm_medium','utm_campaign',
  'utm_content','utm_term','visit_id'
];

function createFlowId(){
  if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b=>b.toString(16).padStart(2,'0')).join('');
  return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}

function readSessionJson(key){
  try{ return JSON.parse(sessionStorage.getItem(key) || 'null'); }catch(e){ return null; }
}

function getFlowId(){
  let value = '';
  try{ value = sessionStorage.getItem(FLOW_ID_KEY) || ''; }catch(e){}
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)){
    value = createFlowId();
    try{ sessionStorage.setItem(FLOW_ID_KEY, value); }catch(e){}
  }
  return value;
}

function getAttribution(currentFlowId){
  let saved = readSessionJson(ATTRIBUTION_KEY);
  if(!saved || typeof saved !== 'object'){
    const search = new URLSearchParams(location.search);
    saved = {};
    ATTRIBUTION_FIELDS.forEach(key=>{
      const value = (search.get(key) || '').trim();
      if(value) saved[key] = value.slice(0,200);
    });
    saved.landing_path = (location.pathname + location.search).slice(0,500);
    saved.referrer = (document.referrer || '').slice(0,500);
  }
  if(!saved.visit_id) saved.visit_id = currentFlowId;
  try{ sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(saved)); }catch(e){}
  return saved;
}

const FLOW_ID = getFlowId();
const ATTRIBUTION = getAttribution(FLOW_ID);

/* 기존 사이트의 GA4·Clarity 프로젝트로 각 정적 단계의 이벤트를 전송합니다. */
function initAnalytics(){
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-KS2RBMP7L0', {send_page_view:true});
  if(!document.querySelector('script[data-request-ga]')){
    const ga = document.createElement('script');
    ga.async = true; ga.dataset.requestGa = 'true';
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-KS2RBMP7L0';
    document.head.appendChild(ga);
  }

  if(!window.clarity){
    const queue = function(){ queue.q.push(arguments); };
    queue.q = []; window.clarity = queue;
  }
  if(!document.querySelector('script[data-request-clarity]')){
    const clarity = document.createElement('script');
    clarity.async = true; clarity.dataset.requestClarity = 'true';
    clarity.src = 'https://www.clarity.ms/tag/w8vyyzdyut';
    document.head.appendChild(clarity);
  }
}
initAnalytics();

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const qs = k => new URLSearchParams(location.search).get(k) || '';

/* ── 단지 정보를 주소에 실어 나르기 ──
   페이지가 나뉘어도 서버 없이 값이 넘어갑니다.
   순서: 단지명, 상담권역, 법정동, 준공연도, 세대수, 동수, 최고층, 복도유형, 난방방식, 단지분류, 시공사 */
function packDanji(arr){
  return btoa(unescape(encodeURIComponent(JSON.stringify(arr))))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function unpackDanji(str){
  try{
    const b = str.replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  }catch(e){ return null; }
}

/* 다음 단계로 이동 (A/B 문구 식별자와 거주 형태를 계속 물고 갑니다) */
function goStep(page, params){
  const u = new URLSearchParams();
  Object.entries(params||{}).forEach(([k,v])=>{ if(v) u.set(k,v); });
  const ab = qs('ab'); if(ab) u.set('ab', ab);
  if(!u.has('t')){ const t = qs('t'); if(t) u.set('t', t); }
  location.href = page + (u.toString() ? '?'+u.toString() : '');
}

/* ── 경로 ──
   apt   아파트 → 단지 검색 → 단지 확인 → 견적 요청 → 완료 (5단계)
   house 주택   → 지역·연락처 → 완료 (3단계)
   none  아파트인데 단지가 목록에 없음 → 지역·연락처 → 완료 (4단계) */
const PATH = ['house','none'].includes(qs('t')) ? qs('t') : 'apt';
const HOME_TYPE = PATH === 'house' ? '주택' : '아파트';

/* ── 초성 변환 (단지 검색·지역 검색 공용) ── */
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function toCho(str){
  let o='';
  for(const ch of str){
    const c=ch.charCodeAt(0);
    o += (c>=0xAC00&&c<=0xD7A3) ? CHO[Math.floor((c-0xAC00)/588)] : ch;
  }
  return o;
}


/* ── 추적 ── */
function track(name, data){
  try{
    if(window.clarity){
      window.clarity('event', name);
      if(data) Object.entries(data).forEach(([k,v])=>window.clarity('set',k,String(v)));
    }
    if(window.gtag) window.gtag('event', name, data||{});
    else if(window.dataLayer) window.dataLayer.push(Object.assign({event:name}, data||{}));
  }catch(e){}
}

function finishFlow(){
  try{
    sessionStorage.removeItem(FLOW_ID_KEY);
    sessionStorage.removeItem(ATTRIBUTION_KEY);
  }catch(e){}
}

async function submitLead(payload){
  const response = await fetch(LEAD_API, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(Object.assign({}, payload, {
      flowId:FLOW_ID,
      utm:ATTRIBUTION
    }))
  });
  let result = {};
  try{ result = await response.json(); }catch(e){}
  if(!response.ok || !result.ok || typeof result.receiptNo !== 'string' || !result.receiptNo){
    const error = new Error(result.error || '상담 접수에 실패했습니다.');
    error.code = result.code || '';
    throw error;
  }
  return result;
}

function setSubmitState(button, busy, message){
  if(!button) return;
  if(!button.dataset.idleText) button.dataset.idleText = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? '접수 중…' : button.dataset.idleText;
  let note = document.getElementById('submit-error');
  if(!note){
    note = document.createElement('p');
    note.id = 'submit-error';
    note.setAttribute('role','alert');
    note.style.cssText = 'margin:10px 0 0;color:#c52222;font-size:13px;text-align:center;word-break:keep-all';
    button.insertAdjacentElement('afterend', note);
  }
  note.textContent = message || '';
}

/* ============================================================
   진단 엔진
   ============================================================ */

/* 준공 시기별 창호 추정 사양. 단열 성능은 창세트 기준 추정값입니다. */
const WIN_ERA = [
  { max:1994, gen:'1세대',
    type:'알루미늄 단창 (구형)',
    glass:'단판유리 6mm',
    frame:'알루미늄 비단열 프레임',
    uval:'약 5.8 W/m²K',
    why:'알루미늄 단창은 단열·소음 성능이 현저히 낮아 교체 효과가 가장 크게 나타납니다.' },
  { max:2004, gen:'2세대',
    type:'알루미늄 이중창',
    glass:'복층유리 12~16mm',
    frame:'알루미늄 프레임 (단열바 없음)',
    uval:'약 3.4 W/m²K',
    why:'프레임이 남아 있어도 롤러·크리센트 수명이 지나 개폐가 뻑뻑해지고 창틀 틈으로 바람이 들어옵니다.' },
  { max:2012, gen:'3세대',
    type:'PVC 이중창',
    glass:'일반 복층유리 (로이 미적용)',
    frame:'PVC 단열 프레임',
    uval:'약 2.3 W/m²K',
    why:'프레임은 멀쩡해도 유리 단열이 지금 기준에 못 미쳐, 겨울 결로가 유리면에서 먼저 시작됩니다.' },
  { max:2019, gen:'4세대',
    type:'PVC 이중창 (로이)',
    glass:'로이 복층유리',
    frame:'PVC 단열 프레임',
    uval:'약 1.6 W/m²K',
    why:'단열 사양은 기준을 만족하지만 10년 전후로 기밀재와 하드웨어가 먼저 내려앉습니다.' },
  { max:9999, gen:'신축',
    type:'PVC 또는 시스템창',
    glass:'로이 복층유리 이상',
    frame:'PVC·알루미늄 단열 프레임',
    uval:'약 1.2 W/m²K',
    why:'창호 노후보다 시공 하자나 기밀 불량이 원인인 경우가 많아 하자 범위를 먼저 확인합니다.' }
];

/* 연차 → 노후도 등급 / 판정 문구 */
function ageLabel(age){
  return age<=5 ? '신축 (5년 이하)'
       : age<=15 ? '준신축 (6~15년)'
       : age<=25 ? '노후 (16~25년)'
       : '장기 노후 (26년 이상)';
}
function ageVerdict(age){
  return age<=5 ? '양호합니다.'
       : age<=10 ? '점검이 필요합니다.'
       : age<=20 ? '교체를 검토해보세요.'
       : '교체가 필요합니다.';
}

function gen(d){
  const [name, zone, dong, year, hh, dongCnt, floor, corr, heat, type, builder] = d;
  const age = year ? NOW - year : 0;
  const era = year ? (WIN_ERA.find(x => year <= x.max) || WIN_ERA[WIN_ERA.length-1]) : null;
  const grade = era ? era.gen : '연식 확인 필요';

  /* 분석 결과 — 연식 → 창호 함의 → 단지 조건 → 주의, 최대 5줄 */
  const notes = [];
  if(year){
    notes.push(year+'년 준공 단지로 '+age+'년이 지났습니다. '
      + (age>=26 ? '창호 노후화 가능성이 높습니다.'
      : age>=16 ? '창호 교체를 검토할 시기입니다.'
      : age>=6  ? '창호 상태 점검이 필요한 시기입니다.'
      : '창호 자체는 아직 양호할 가능성이 큽니다.'));
    notes.push(era.why);
  }else{
    notes.push('공개 자료에 준공 연도가 없어 창호 사양을 추정하지 못했습니다. 통화로 확인해 드리겠습니다.');
  }

  if(corr==='복도식') notes.push('복도식 구조라 주방·현관 쪽 창이 외기에 그대로 노출됩니다. 결로가 이 두 곳에서 먼저 나타납니다.');
  else if(corr==='계단식') notes.push('계단식 구조라 거실 발코니 전면창이 시공 물량의 대부분을 차지합니다. 확장 세대는 창이 더 커집니다.');
  else if(corr==='혼합식') notes.push('계단식과 복도식이 섞인 단지로 동·호수에 따라 창 구성이 달라집니다. 실측 전 도면을 확인합니다.');

  if(heat==='중앙난방'||heat==='지역난방') notes.push(heat+' 단지라 세대에서 온도를 조절할 폭이 좁습니다. 창호 단열만 잡아도 겨울 체감 차이가 큽니다.');
  else if(heat && heat.indexOf('개별난방')===0) notes.push('개별난방 단지라 창호 단열 개선분이 난방비에 바로 반영됩니다. 회수 기간을 계산해 안내드릴 수 있습니다.');

  notes.push('세대별 개별 교체 이력이 있을 수 있어 현장 확인을 권장합니다.');

  return {name, zone, dong, year, hh, dongCnt, floor, corr, heat, type, builder,
          age, grade, era, notes:notes.slice(0,5)};
}

/* ============================================================
   렌더러
   ============================================================ */

const irow = (l,v) => '<div class="irow"><span class="l">'+esc(l)+'</span><span class="v">'+esc(v)+'</span></div>';

/* 받침 유무로 목적격 조사를 고릅니다. 단지명 끝 글자에 따라 을/를이 갈립니다. */
function josaEul(word){
  const c = String(word).trim().slice(-1).charCodeAt(0);
  if(c>=0xAC00 && c<=0xD7A3) return (c-0xAC00)%28 ? '을' : '를';
  return '1360'.indexOf(String.fromCharCode(c))>=0 ? '을' : '를';  /* 1·3·6·0으로 끝나면 받침 */
}

/* ── 단지 카드 (노후도 게이지 + 접히는 기본정보) ── */
function renderDanjiCard(el, g){
  const zoneLine = [g.zone, g.dong].filter(Boolean).join(' ');
  const metaLine = [g.year ? g.year+'년 준공' : null, g.floor ? '최고 '+g.floor+'층' : null]
                     .filter(Boolean).join(' · ');
  /* 게이지: 20년을 만점으로 채웁니다 */
  const pct = Math.min(g.age/20, 1) * 100;
  const marks = [[0,'0년'],[25,'5년'],[50,'10년'],[100,'20년+']];

  let h = '<div class="dj-top">';
  h += '<div class="dj-head"><div class="left">';
  h += '<p class="dj-zone">'+esc(zoneLine)+'</p>';
  h += '<h2 class="dj-name">'+esc(g.name)+'</h2>';
  if(metaLine) h += '<p class="dj-meta">'+esc(metaLine)+'</p>';
  h += '</div>';
  if(g.year){
    h += '<div class="right"><span class="dj-age">'+g.age+'년</span>'
       + '<p class="dj-agelab">'+ageLabel(g.age)+'</p></div>';
  }
  h += '</div>';

  if(g.year){
    h += '<div>';
    /* 너비 0으로 그려두고 그린 뒤에 목표치를 넣어야 차오르는 트랜지션이 걸립니다 */
    h += '<div class="gauge-bar"><div class="gauge-fill" id="gauge-fill" style="width:0"></div></div>';
    h += '<div class="gauge-scale">'
       + marks.map(([p,t])=>'<span style="left:'+p+'%">'+t+'</span>').join('')
       + '</div>';
    h += '<p class="gauge-verdict">'+ageVerdict(g.age)+'</p>';
    h += '</div>';
  }
  h += '</div>';

  /* 접히는 단지 기본정보 */
  const rows = [
    g.year ? ['준공 연도', g.year+'년'] : null,
    g.year ? ['노후도', ageLabel(g.age)] : null,
    g.hh ? ['총 세대수', g.hh.toLocaleString()+'세대'] : null,
    g.dongCnt ? ['동 수', g.dongCnt+'개 동'] : null,
    g.floor ? ['최고 층수', g.floor+'층'] : null,
    g.corr ? ['복도 유형', g.corr] : null,
    g.heat ? ['난방 방식', g.heat] : null,
    g.builder ? ['시공사', g.builder] : null
  ].filter(Boolean);

  /* 패널을 먼저 두고 버튼을 그 아래에 둡니다.
     접혀 있을 땐 패널 높이가 0이라 버튼이 카드 바로 밑에,
     펼치면 내용이 버튼을 밀어내려 항상 목록 끝에 붙습니다. */
  if(rows.length){
    h += '<div class="acc-panel" id="acc-panel"><div class="acc-inner">'
       + rows.map(r=>irow(r[0], r[1])).join('')
       + '</div></div>'
       + '<button type="button" class="acc-btn" id="acc-btn" aria-expanded="false" aria-controls="acc-panel">'
       + '<span class="acc-lab"><span class="acc-txt">추가 정보 보기</span>'
       + '<svg viewBox="0 0 14 14"><path d="M2 5l5 5 5-5"/></svg></span></button>';
  }

  el.innerHTML = h;

  /* 노후도 게이지 — 카드가 올라온 뒤 0에서 목표치까지 차오릅니다 */
  const fill = el.querySelector('#gauge-fill');
  if(fill){
    requestAnimationFrame(()=>{
      setTimeout(()=>{ fill.style.width = pct.toFixed(1)+'%'; }, 240);
    });
  }

  /* 아코디언 — 내용 높이를 실측해서 열고 닫습니다 */
  const btn = el.querySelector('#acc-btn'), panel = el.querySelector('#acc-panel');
  if(btn && panel){
    const txt = btn.querySelector('.acc-txt');
    btn.addEventListener('click', ()=>{
      const open = btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.style.maxHeight = open ? '0px' : panel.scrollHeight+'px';
      txt.textContent = open ? '추가 정보 보기' : '추가 정보 접기';
      if(!open) track('step2_more_info');
    });
  }
}

/* ── 창호 추정 사양 ── */
function renderWindow(el, g){
  if(!g.era){
    el.innerHTML = '<div class="win-top"><h3>창호 추정 사양</h3></div>'
      + '<div class="win-body" style="padding-bottom:16px">'
      + '<p style="margin:12px 0 0;font-size:14px;color:var(--muted);word-break:keep-all">'
      + '공개 자료에 준공 연도가 없어 사양을 추정하지 못했습니다. 통화로 확인한 뒤 안내드리겠습니다.</p></div>';
    return;
  }
  el.innerHTML = '<div class="win-top"><h3>창호 추정 사양</h3>'
    + '<span class="tag">준공 기준 추정</span></div>'
    + '<div class="win-body">'
    + irow('창호 종류', g.era.type)
    + irow('유리 사양', g.era.glass)
    + irow('프레임', g.era.frame)
    + irow('단열 성능', g.era.uval)
    + '</div>';
}

/* ── 분석 결과 ── */
function renderNotes(el, g){
  const check = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">'
    + '<circle cx="8" cy="8" r="8" fill="#FDEAEA"/>'
    + '<path d="M4.5 8l2.5 2.5 4.5-5" stroke="#D22727" stroke-width="1.5"'
    + ' stroke-linecap="round" stroke-linejoin="round"/></svg>';

  el.innerHTML = '<div class="an-top">'
    + '<p><em>'+esc(g.name)+'</em>'+josaEul(g.name)+'<br>분석한 결과입니다</p>'
    + '<div class="an-ico"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">'
    + '<rect x="2" y="11" width="4" height="9" rx="1" fill="#D22727" opacity=".4"/>'
    + '<rect x="9" y="6" width="4" height="14" rx="1" fill="#D22727" opacity=".7"/>'
    + '<rect x="16" y="2" width="4" height="18" rx="1" fill="#D22727"/>'
    + '</svg></div></div>'
    + '<ul class="an-list">'
    + g.notes.map(n=>'<li>'+check+'<span>'+esc(n)+'</span></li>').join('')
    + '</ul>';
}

/* ============================================================
   연락처 문자 인증

   발송·검증은 전부 서버가 합니다. 팝빌 LinkID/SecretKey를 프런트에 두면
   누구나 그 계정으로 문자를 발송할 수 있으므로 절대 넣지 않습니다.
   서버가 지켜야 할 규칙은 문자인증_API_명세.md 참고.

   필요한 마크업
     #f-tel  > #i-tel  + #send-code
     #f-code > #i-code + #check-code + #code-note
   ============================================================ */
function initTelVerify(){
  const telF = $('f-tel'), tel = $('i-tel'), send = $('send-code');
  const codeF = $('f-code'), code = $('i-code'), check = $('check-code'), note = $('code-note');
  if(!telF || !tel || !send || !codeF) return {isVerified:()=>true, token:()=>'', pendingField:()=>null};

  const label = telF.querySelector('label');
  const telError = telF.querySelector('.err');
  const defaultTelError = telError ? telError.textContent : '연락처를 다시 확인해 주세요.';
  const EXPIRE = 180;   /* 인증번호 유효 시간(초) — 서버 값과 맞춰야 합니다 */
  const RESEND = 30;    /* 재전송 허용까지 대기(초) */

  let verified = false, token = '', tick = null, left = 0, busy = false;

  const digits = () => tel.value.replace(/\D/g,'');
  const telOk  = () => digits().length >= 10 && digits().startsWith('01');
  const mmss   = s => Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
  const say    = html => { note.innerHTML = html; };

  if(telError){
    telError.setAttribute('role', 'alert');
    telError.setAttribute('aria-live', 'polite');
  }

  function clearTelError(){
    telF.classList.remove('bad');
    if(telError) telError.textContent = defaultTelError;
  }

  function showTelError(message){
    if(telError) telError.textContent = message || defaultTelError;
    telF.classList.add('bad');
  }

  function syncSend(){
    send.disabled = verified || busy || !telOk() || left > EXPIRE - RESEND;
  }

  /* 번호를 고치면 이전 인증은 무효입니다 */
  function invalidate(){
    verified = false; token = '';
    clearInterval(tick); tick = null; left = 0;
    codeF.classList.add('hidden');
    codeF.classList.remove('bad');
    clearTelError();
    telF.classList.remove('verified');
    tel.readOnly = false;
    const b = label.querySelector('.ok-badge'); if(b) b.remove();
    code.value = '';
    send.textContent = '인증번호 받기';
    say('');
    syncSend();
  }

  function startCountdown(){
    left = EXPIRE;
    clearInterval(tick);
    const paint = () => {
      if(left <= 0){
        clearInterval(tick); tick = null;
        say('인증번호가 만료되었습니다. 다시 받아주세요.');
        syncSend();
        return;
      }
      say('문자로 보냈습니다 · 남은 시간 <b>'+mmss(left)+'</b>');
      left--;
      syncSend();
    };
    paint();
    tick = setInterval(paint, 1000);
  }

  async function post(path, body){
    try{
      const res = await fetch(SMS_API.replace(/\/$/,'') + '/sms/' + path, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.assign({}, body, {flowId:FLOW_ID}))
      });
      let json = {};
      try{ json = await res.json(); }catch(e){}
      return Object.assign({ok:false, status:res.status}, json);
    }catch(e){
      return {ok:false, code:path === 'send' ? 'SEND_FAILED' : 'VERIFY_FAILED'};
    }
  }

  const ERRMSG = {
    INVALID_TEL:'번호를 다시 확인해 주세요.',
    RATE_LIMIT:'요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    SEND_FAILED:'문자 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    CODE_MISMATCH:'인증번호가 맞지 않습니다.',
    CODE_EXPIRED:'인증번호가 만료되었습니다. 다시 받아주세요.',
    TOO_MANY_ATTEMPTS:'시도 횟수를 초과했습니다. 인증번호를 다시 받아주세요.'
  };
  const errText = r => ERRMSG[r.code] || '잠시 후 다시 시도해 주세요.';

  /* ── 인증번호 받기 ── */
  send.addEventListener('click', async ()=>{
    if(send.disabled) return;
    clearTelError();
    if(!telOk()){ showTelError(defaultTelError); tel.focus(); return; }

    busy = true; syncSend();
    const prev = send.textContent;
    send.textContent = '전송 중';
    track('sms_send', {});

    const r = await post('send', {tel:digits()});
    busy = false;
    send.textContent = '재전송';

    if(!r.ok){
      send.textContent = prev;
      showTelError(errText(r));
      syncSend();
      return;
    }
    codeF.classList.remove('hidden');
    startCountdown();
    code.value = '';
    code.focus();
  });

  /* ── 인증번호 확인 ── */
  check.addEventListener('click', async ()=>{
    const v = code.value.replace(/\D/g,'');
    codeF.classList.remove('bad');
    if(v.length !== 6){ codeF.classList.add('bad'); code.focus(); return; }
    if(left <= 0){ say('인증번호가 만료되었습니다. 다시 받아주세요.'); return; }

    check.disabled = true;
    const r = await post('verify', {tel:digits(), code:v});
    check.disabled = false;

    if(!r.ok || !r.token){
      codeF.classList.add('bad');
      const el = codeF.querySelector('.err');
      if(el) el.textContent = errText(r) + (r.attemptsLeft != null ? ' (남은 시도 '+r.attemptsLeft+'회)' : '');
      track('sms_verify_fail', {code:r.code||''});
      return;
    }

    /* 통과 */
    verified = true; token = r.token || '';
    clearInterval(tick); tick = null; left = 0;
    codeF.classList.add('hidden');
    telF.classList.remove('bad');
    telF.classList.add('verified');
    tel.readOnly = true;
    if(!label.querySelector('.ok-badge')){
      const b = document.createElement('span');
      b.className = 'ok-badge'; b.textContent = '인증 완료';
      label.appendChild(b);
    }
    send.textContent = '인증 완료';
    say('');
    syncSend();
    track('sms_verified', {});
  });

  code.addEventListener('input', e=>{
    e.target.value = e.target.value.replace(/\D/g,'').slice(0,6);
    codeF.classList.remove('bad');
  });
  code.addEventListener('keydown', e=>{ if(e.key === 'Enter'){ e.preventDefault(); check.click(); } });

  tel.addEventListener('input', ()=>{
    clearTelError();
    if(verified || left > 0) invalidate();
    else syncSend();
  });

  syncSend();

  return {
    isVerified: () => verified,
    token: () => token,
    /* 미인증 상태에서 어느 칸으로 보내야 하는지 */
    pendingField: () => verified ? null : (codeF.classList.contains('hidden') ? 'f-tel' : 'f-code'),
    promptSend: () => { if(!send.disabled) send.click(); }
  };
}

/* ── 선택 버튼 그룹 (평형·교체 범위·희망 시기 공용) ──
   한 번 더 누르면 해제되는 라디오 그룹입니다. quote.html 에만 있던 것을
   region.html 도 쓰게 되어 공용부로 옮겼다(260907, 교체 희망 시기 추가). */
function initSeg(id){
  const box = $(id);
  if(!box) return;
  box.querySelectorAll('button').forEach(b=>{
    b.setAttribute('role','radio'); b.setAttribute('aria-checked','false');
    b.addEventListener('click', ()=>{
      const on = b.getAttribute('aria-checked')==='true';
      box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-checked','false'));
      b.setAttribute('aria-checked', on?'false':'true');
    });
  });
}
const segValue = id => {
  const b = $(id) && $(id).querySelector('button[aria-checked="true"]');
  return b ? b.dataset.v : '';
};

/* ── 모달 열고 닫기 ── */
function bindModal(modalId, openId, closeId){
  const m = $(modalId), o = $(openId), c = $(closeId);
  if(!m || !o || !c) return;
  o.addEventListener('click', ()=>{ m.classList.remove('hidden'); c.focus(); });
  c.addEventListener('click', ()=>m.classList.add('hidden'));
  m.addEventListener('click', e=>{ if(e.target===m) m.classList.add('hidden'); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') m.classList.add('hidden'); });
}
