// event-section.jsx — Homepage "릴레이 고객 감사 EVENT" 섹션 리디자인
// homewindow.kr의 기존 빨간 배경 무드를 유지하면서
// 후기 작성 인센티브를 강조하도록 재구성

const { Crest } = window;

const evStyle = `
  /* Event section base ---------------------------------- */
  .ev {
    background:
      radial-gradient(120% 80% at 50% 0%, #d23030 0%, #b01818 60%, #8a1010 100%);
    color: #fff;
    font-family: var(--font);
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }
  .ev::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(800px 400px at 0% 100%, rgba(255,255,255,.06), transparent 60%),
      radial-gradient(600px 300px at 100% 0%, rgba(255,255,255,.05), transparent 60%);
    z-index: -1;
  }

  /* Decorative window grid in background */
  .ev-bg-window {
    position: absolute;
    opacity: 0.07;
    pointer-events: none;
  }

  .ev-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 18px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    color: #fff;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    backdrop-filter: blur(8px);
  }
  .ev-tag .dot {
    width: 6px; height: 6px;
    background: #ffd84d;
    border-radius: 50%;
    box-shadow: 0 0 12px #ffd84d;
    animation: ev-pulse 1.6s ease-in-out infinite;
  }
  @keyframes ev-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .ev-headline {
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.15;
    text-shadow: 0 2px 24px rgba(0,0,0,0.18);
  }
  .ev-headline .pct {
    color: #ffd84d;
    font-size: 84px;
    font-weight: 900;
    margin: 0 6px;
    text-shadow: 0 4px 28px rgba(255,216,77,0.55);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .ev-headline .fire {
    display: inline-block;
    font-size: 56px;
    transform: translateY(-12px);
  }
  .ev-sub {
    margin-top: 18px;
    font-size: 16px;
    line-height: 1.7;
    color: rgba(255,255,255,0.78);
    letter-spacing: -0.01em;
    font-weight: 400;
  }

  /* Discount stack list (PC) ---------------------------- */
  .ev-stack {
    display: grid;
    gap: 12px;
  }
  .ev-row {
    background: rgba(255,255,255,0.97);
    border-radius: 16px;
    padding: 22px 28px;
    display: grid;
    grid-template-columns: 56px 1fr 130px;
    align-items: center;
    gap: 20px;
    color: var(--ink);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    position: relative;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .ev-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  }
  .ev-row.clickable { cursor: pointer; }
  .ev-row.featured {
    background: linear-gradient(135deg, #fff7e6 0%, #ffffff 60%);
    box-shadow: 0 4px 14px rgba(0,0,0,0.08), 0 0 0 2px #ffd84d inset;
  }
  .ev-num {
    width: 40px; height: 40px;
    background: var(--brand);
    color: #fff;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-family: var(--font-mono);
  }
  .ev-row.featured .ev-num {
    background: #1a1210;
    color: #ffd84d;
  }
  .ev-row .ev-name {
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap;
  }
  .ev-row .ev-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .ev-row .ev-new {
    background: #1a1210;
    color: #ffd84d;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    padding: 3px 7px;
    border-radius: 4px;
    font-family: var(--font-mono);
  }
  .ev-row .ev-desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--ink-3);
    letter-spacing: -0.01em;
    line-height: 1.5;
  }
  .ev-row .ev-pct {
    text-align: right;
    font-size: 32px;
    font-weight: 900;
    color: var(--brand);
    letter-spacing: -0.03em;
    line-height: 1;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 2px;
  }
  .ev-row .ev-pct .plus { font-size: 20px; color: var(--brand-deep); margin-right: 2px; }
  .ev-row .ev-pct .pct-sym { font-size: 20px; font-weight: 800; }
  .ev-row.featured .ev-pct { color: #c89400; }
  .ev-row.featured .ev-pct .plus { color: #c89400; }

  .ev-row .ev-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.15s, transform 0.15s;
    color: var(--brand);
  }
  .ev-row.clickable:hover .ev-arrow {
    opacity: 0.7;
    transform: translateY(-50%) translateX(4px);
  }

  /* Sum / total bar ------------------------------------- */
  .ev-sum {
    margin-top: 16px;
    padding: 24px 32px;
    background: #ffd84d;
    color: #1a1210;
    border-radius: 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    box-shadow: 0 6px 20px rgba(255,216,77,0.35);
  }
  .ev-sum-label {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6b4a00;
    margin-bottom: 4px;
  }
  .ev-sum-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1a1210;
  }
  .ev-sum-val {
    font-size: 60px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
    color: #8a1010;
    display: flex;
    align-items: baseline;
  }
  .ev-sum-val .pct-sym { font-size: 32px; font-weight: 800; }

  /* Premium bonus card ---------------------------------- */
  .ev-bonus {
    margin-top: 32px;
    background: linear-gradient(135deg, #1a1210 0%, #2a1f1c 100%);
    border-radius: 20px;
    padding: 32px 36px;
    color: #faf7f4;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .ev-bonus:hover { transform: translateY(-2px); }
  .ev-bonus::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(212,178,119,0.18) 0%, transparent 60%);
    pointer-events: none;
  }
  .ev-bonus-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .ev-bonus-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: rgba(212,178,119,0.18);
    color: #d4b277;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .ev-bonus-title {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }
  .ev-bonus-title em { font-style: normal; color: #d4b277; }
  .ev-bonus-sub {
    margin-top: 6px;
    font-size: 14px;
    color: rgba(250,247,244,0.65);
    letter-spacing: -0.01em;
  }
  .ev-bonus-grid {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 60px 1fr;
    gap: 16px;
    align-items: stretch;
  }
  .ev-choice {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(212,178,119,0.3);
    border-radius: 14px;
    padding: 22px 24px;
    transition: all 0.15s;
  }
  .ev-choice:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(212,178,119,0.6);
  }
  .ev-choice .label {
    font-size: 11px;
    font-weight: 700;
    color: #d4b277;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .ev-choice .big {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-top: 8px;
    color: #faf7f4;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .ev-choice .big small { font-size: 16px; font-weight: 700; color: rgba(250,247,244,0.7); }
  .ev-choice .desc {
    margin-top: 8px;
    font-size: 12.5px;
    color: rgba(250,247,244,0.6);
    line-height: 1.5;
  }
  .ev-or {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: rgba(212,178,119,0.7);
  }
  .ev-or .line {
    flex: 1;
    width: 1px;
    background: rgba(212,178,119,0.25);
  }
  .ev-or .or {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    padding: 8px 0;
    color: #d4b277;
  }
  .ev-bonus-cta {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1px solid rgba(212,178,119,0.18);
  }
  .ev-bonus-cta .terms {
    font-size: 11.5px;
    color: rgba(250,247,244,0.5);
    line-height: 1.55;
    letter-spacing: -0.01em;
  }
  .ev-bonus-btn {
    background: linear-gradient(135deg, #d4b277, #b8945a);
    color: #1a1210;
    border: 0;
    height: 52px;
    padding: 0 26px;
    border-radius: 10px;
    font-size: 14.5px;
    font-weight: 800;
    cursor: pointer;
    font-family: var(--font);
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 6px 20px rgba(212,178,119,0.35);
    flex-shrink: 0;
  }

  /* Mobile-specific ------------------------------------- */
  .ev-mobile .ev-headline {
    font-size: 28px;
  }
  .ev-mobile .ev-headline .pct {
    font-size: 42px;
  }
  .ev-mobile .ev-headline .fire {
    font-size: 28px;
    transform: translateY(-6px);
  }
  .ev-mobile .ev-sub {
    font-size: 13px;
    margin-top: 12px;
  }
  .ev-mobile .ev-row {
    padding: 16px;
    grid-template-columns: 36px 1fr 80px;
    gap: 12px;
    border-radius: 12px;
  }
  .ev-mobile .ev-num {
    width: 30px; height: 30px;
    font-size: 13px;
    border-radius: 8px;
  }
  .ev-mobile .ev-row .ev-title { font-size: 14px; }
  .ev-mobile .ev-row .ev-desc { font-size: 11px; margin-top: 2px; }
  .ev-mobile .ev-row .ev-pct { font-size: 22px; }
  .ev-mobile .ev-row .ev-pct .plus { font-size: 14px; }
  .ev-mobile .ev-row .ev-pct .pct-sym { font-size: 14px; }
  .ev-mobile .ev-sum {
    padding: 18px 22px;
    border-radius: 12px;
  }
  .ev-mobile .ev-sum-label { font-size: 11px; }
  .ev-mobile .ev-sum-title { font-size: 15px; }
  .ev-mobile .ev-sum-val { font-size: 38px; }
  .ev-mobile .ev-sum-val .pct-sym { font-size: 22px; }
  .ev-mobile .ev-bonus {
    margin-top: 20px;
    padding: 22px 20px;
    border-radius: 16px;
  }
  .ev-mobile .ev-bonus-title { font-size: 17px; }
  .ev-mobile .ev-bonus-sub { font-size: 12px; }
  .ev-mobile .ev-bonus-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 10px;
  }
  .ev-mobile .ev-or {
    flex-direction: row;
    gap: 10px;
  }
  .ev-mobile .ev-or .line { width: auto; height: 1px; flex: 1; }
  .ev-mobile .ev-or .or { padding: 0; font-size: 11px; }
  .ev-mobile .ev-choice {
    padding: 16px 18px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
  }
  .ev-mobile .ev-choice > div:first-child { display: contents; }
  .ev-mobile .ev-choice .label { grid-column: 1; }
  .ev-mobile .ev-choice .desc { grid-column: 1; }
  .ev-mobile .ev-choice .big { grid-column: 2; grid-row: 1 / 3; font-size: 24px; }
  .ev-mobile .ev-bonus-cta {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-top: 18px;
    padding-top: 18px;
  }
  .ev-mobile .ev-bonus-btn {
    width: 100%;
    justify-content: center;
    height: 48px;
    font-size: 13.5px;
  }
  .ev-mobile .ev-bonus-cta .terms { font-size: 11px; order: 2; }
`;

if (typeof document !== 'undefined' && !document.getElementById('ev-styles')) {
  const s = document.createElement('style');
  s.id = 'ev-styles';
  s.textContent = evStyle;
  document.head.appendChild(s);
}

// Decorative window SVG -----------------------------------
const WindowDeco = ({ size = 280, style }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 280 320" fill="none" style={style}>
    <rect x="40" y="40" width="200" height="240" rx="4" stroke="#fff" strokeWidth="2"/>
    <line x1="140" y1="40" x2="140" y2="280" stroke="#fff" strokeWidth="2"/>
    <line x1="40" y1="160" x2="240" y2="160" stroke="#fff" strokeWidth="2"/>
    <line x1="46" y1="46" x2="46" y2="154" stroke="#fff" strokeWidth="1" opacity="0.5"/>
    <line x1="134" y1="46" x2="134" y2="154" stroke="#fff" strokeWidth="1" opacity="0.5"/>
    <line x1="146" y1="166" x2="146" y2="274" stroke="#fff" strokeWidth="1" opacity="0.5"/>
    <line x1="234" y1="166" x2="234" y2="274" stroke="#fff" strokeWidth="1" opacity="0.5"/>
  </svg>
);

// =================================================================
// PC Event Section
// =================================================================

const DiscountRow = ({ num, title, desc, pct, isNew, featured, clickable }) => (
  <div className={`ev-row ${featured ? 'featured' : ''} ${clickable ? 'clickable' : ''}`}>
    <div className="ev-num">{num}</div>
    <div>
      <div className="ev-name">
        <span className="ev-title">{title}</span>
        {isNew && <span className="ev-new">NEW</span>}
      </div>
      <div className="ev-desc">{desc}</div>
    </div>
    <div className="ev-pct">
      <span className="plus">+</span>{pct}<span className="pct-sym">%</span>
    </div>
    {clickable && (
      <div className="ev-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    )}
  </div>
);

const EventSectionPC = () => (
  <div className="ev" style={{padding: '80px 0 100px'}}>
    <WindowDeco size={320} style={{position:'absolute', top:40, left:-40}}/>
    <WindowDeco size={280} style={{position:'absolute', bottom:60, right:-30}}/>

    <div style={{maxWidth: 940, margin: '0 auto', padding: '0 32px', position: 'relative'}}>
      <div style={{textAlign: 'center'}}>
        <div className="ev-tag">
          <span className="dot"/>
          릴레이 고객 감사 EVENT
        </div>
        <div className="ev-headline" style={{marginTop: 22}}>
          <span className="pct">최대 <span style={{position:'relative'}}>40%<span className="fire" style={{position:'absolute', top: -16, right: -28, fontSize: 36}}>🔥</span></span></span> 릴레이 할인,<br/>
          지금 신청하면 더 드립니다
        </div>
        <div className="ev-sub">
          혜택을 모두 더해 최대 40% 할인을 받아보세요.<br/>
          선착순 한정 프로모션으로 조기 마감될 수 있습니다.
        </div>
      </div>

      <div style={{marginTop: 48}}>
        <div className="ev-stack">
          <DiscountRow num="01" title="홈페이지 상담 신청" pct="10"
            desc="현재 페이지에서 무료 견적 신청 시 자동 적용"/>
          <DiscountRow num="02" title="간편 리뷰 약속" pct="10" isNew featured clickable
            desc="시공 후 후기 작성을 약속하시면 자동 적용"/>
          <DiscountRow num="03" title="선금보증보험 할인" pct="20"
            desc="견적 상담 시 할인 적용"/>
        </div>

        <div className="ev-sum">
          <div>
            <div className="ev-sum-label">총 누적 할인</div>
            <div className="ev-sum-title">모든 창호 할인 혜택을 합치면 최대</div>
          </div>
          <div className="ev-sum-val">40<span className="pct-sym">%</span></div>
        </div>
      </div>

      <div className="ev-bonus">
        <div className="ev-bonus-head">
          <span className="ev-bonus-tag"><Crest size={9}/> PREMIUM EXCLUSIVE</span>
        </div>
        <div className="ev-bonus-title">
          프리미엄 후기 작성 고객께는<br/>
          <em>두 가지 혜택 중 선택</em>해서 드립니다
        </div>
        <div className="ev-bonus-sub">
          사진 3장 이상 + 200자 본문 시공 후기를 남겨주시면 아래 혜택 중 하나를 선택하실 수 있어요
        </div>

        <div className="ev-bonus-grid">
          <div className="ev-choice">
            <div className="label">OPTION A</div>
            <div className="big">+5<small>%</small></div>
            <div className="desc">기존 할인에 추가 5% — 최종 견적가에서 즉시 차감</div>
          </div>
          <div className="ev-or">
            <div className="line"/>
            <div className="or">OR</div>
            <div className="line"/>
          </div>
          <div className="ev-choice">
            <div className="label">OPTION B</div>
            <div className="big">10<small>만원</small></div>
            <div className="desc">백화점 상품권 10만원 — 시공 완료 후 후기 등록 확인 즉시 발송</div>
          </div>
        </div>

        <div className="ev-bonus-cta">
          <div className="terms">
            ※ 두 혜택 중복 적용 불가 / 옵션 A는 견적단계에서 사전 선택 시에만 적용
          </div>
          <button className="ev-bonus-btn">
            <Crest size={12}/>
            지금 후기 작성하러 가기
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// =================================================================
// Mobile Event Section
// =================================================================

const EventSectionMobile = () => (
  <div className="ev ev-mobile" style={{padding: '48px 0 60px', width: 375}}>
    <WindowDeco size={180} style={{position:'absolute', top:20, right:-50, opacity: 0.05}}/>

    <div style={{padding: '0 20px', position: 'relative'}}>
      <div style={{textAlign: 'center'}}>
        <div className="ev-tag" style={{padding: '5px 14px', fontSize: 11}}>
          <span className="dot"/>
          릴레이 고객 감사 EVENT
        </div>
        <div className="ev-headline" style={{marginTop: 16}}>
          <span className="pct">최대 <span style={{position:'relative'}}>40%<span className="fire" style={{position:'absolute', top:-8, right:-18, fontSize:22}}>🔥</span></span></span> 릴레이 할인,<br/>
          지금 신청하면<br/>더 드립니다
        </div>
        <div className="ev-sub">
          혜택을 모두 더해 최대 40% 할인을<br/>받아보세요. 선착순 한정 프로모션.
        </div>
      </div>

      <div style={{marginTop: 28}}>
        <div className="ev-stack">
          <DiscountRow num="1" title="홈페이지 상담 신청" pct="10"
            desc="현재 페이지에서 신청 시 자동 적용"/>
          <DiscountRow num="2" title="간편 리뷰 약속" pct="10" isNew featured clickable
            desc="시공 후 후기 작성을 약속하시면 적용"/>
          <DiscountRow num="3" title="선금보증보험 할인" pct="20"
            desc="견적 상담 시 할인 적용"/>
        </div>

        <div className="ev-sum">
          <div>
            <div className="ev-sum-label">총 누적</div>
            <div className="ev-sum-title">최대</div>
          </div>
          <div className="ev-sum-val">40<span className="pct-sym">%</span></div>
        </div>
      </div>

      <div className="ev-bonus">
        <div className="ev-bonus-head">
          <span className="ev-bonus-tag"><Crest size={9}/> PREMIUM</span>
        </div>
        <div className="ev-bonus-title">
          프리미엄 후기 작성 고객<br/>
          <em>두 가지 혜택 중 선택</em>
        </div>
        <div className="ev-bonus-sub">
          사진 3장+ 200자 본문 후기 시
        </div>

        <div className="ev-bonus-grid">
          <div className="ev-choice">
            <div>
              <div className="label">OPTION A</div>
              <div className="desc">추가 할인 · 견적가에서 즉시 차감</div>
            </div>
            <div className="big">+5<small>%</small></div>
          </div>
          <div className="ev-or">
            <div className="line"/>
            <div className="or">OR</div>
            <div className="line"/>
          </div>
          <div className="ev-choice">
            <div>
              <div className="label">OPTION B</div>
              <div className="desc">백화점 상품권 · 후기 등록 확인 후 발송</div>
            </div>
            <div className="big">10<small>만</small></div>
          </div>
        </div>

        <div className="ev-bonus-cta">
          <button className="ev-bonus-btn">
            <Crest size={11}/>
            지금 후기 작성하러 가기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <div className="terms">
            ※ 두 혜택 중복 적용 불가<br/>
            ※ 옵션 A는 견적단계에서 사전 선택 시에만 적용
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { EventSectionPC, EventSectionMobile });
