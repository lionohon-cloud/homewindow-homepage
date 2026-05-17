// All review screens — list, detail, simple-form, premium-form
// Each screen has 2-3 variants for the design canvas.

const { Star, Stars, StatusBar, NavBar, VerifiedMark, Crest, Photo, BeforeAfter } = window;

// =================================================================
// LIST SCREEN — variants
// =================================================================

const SimpleReview = ({ stars, name, date, body, tags }) => (
  <div className="simple-card">
    <div className="top">
      <Stars value={stars}/>
      <div className="meta">
        <span>{name}</span>
        <span className="dot"/>
        <span>{date}</span>
      </div>
    </div>
    <div className="body">{body}</div>
    {tags && <div className="tags">{tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}
  </div>
);

const PremiumReview = ({ name, initial, date, location, model, stars, photos = 'g-3', body, ba = true, video = false }) => (
  <div className="premium-card">
    <div className="badge-row">
      <span className="premium-badge">
        <span className="crest"><Crest size={9}/></span>
        프리미엄 리뷰
      </span>
      <span style={{fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>{date}</span>
    </div>
    <div className="author">
      <div className="avatar">{initial}</div>
      <div className="author-info">
        <div className="author-name">{name} <VerifiedMark/></div>
        <div className="author-meta">{location} · {model}</div>
      </div>
    </div>
    <div className="stars-row" style={{padding:'0 16px 12px'}}>
      <Stars value={stars} size={16}/>
    </div>
    {ba && <BeforeAfter/>}
    {photos === 'g-3' && (
      <div className="photo-grid g-3">
        <Photo kind="living" label="거실 전면창"/>
        <Photo kind="room" label="안방 분합창" video={video ? '32' : null}/>
        <Photo kind="balcony" label="베란다"/>
        <Photo kind="night" count={3} label=""/>
      </div>
    )}
    {photos === 'g-mosaic' && (
      <div className="photo-grid g-mosaic">
        <Photo kind="living" label=""/>
        <Photo kind="room" label=""/>
        <Photo kind="balcony" count={2}/>
      </div>
    )}
    <div className="premium-body">
      {body.map((p, i) => <p key={i}>{p}</p>)}
    </div>
    <div className="spec-table">
      <div className="spec-row"><div className="k">시공 부위</div><div className="v">거실 전면창 · 안방 분합창</div></div>
      <div className="spec-row"><div className="k">제품</div><div className="v">{model}</div></div>
      <div className="spec-row"><div className="k">사이즈</div><div className="v">2,400 × 2,100mm 외 2개소</div></div>
      <div className="spec-row"><div className="k">시공일</div><div className="v">2026.03.18 · 1일 완공</div></div>
    </div>
    <div className="premium-foot">
      <button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
        도움돼요 <b style={{color:'var(--ink-2)'}}>32</b>
      </button>
      <button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        댓글 5
      </button>
      <span className="spacer"/>
      <button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
      </button>
    </div>
  </div>
);

// ───── List Variant A: Tabs separated, compact ─────
const ListA = ({ tweaks }) => {
  const [tab, setTab] = React.useState('simple');
  return (
    <div className="phone">
      <StatusBar/>
      <NavBar title="시공 후기" back={false} right={<>
        <div className="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></div>
      </>}/>

      <div className="summary">
        <div className="summary-row">
          <div className="summary-score">4.9<span className="summary-of">/5.0</span></div>
          <div className="summary-meta">
            <Stars value={5} size={14}/>
            <div className="count">총 시공후기 <b style={{color:'var(--ink)'}}>2,847건</b></div>
          </div>
        </div>
        <div className="summary-bars">
          {[[5, 88, 2510], [4, 9, 256], [3, 2, 57], [2, 1, 18], [1, 0, 6]].map(([s, p, n]) => (
            <div key={s} className="summary-bar">
              <span>{s}점</span>
              <div className="track"><div className="fill" style={{width: `${p}%`}}/></div>
              <span className="num">{p}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==='simple'?'active':''}`} onClick={() => setTab('simple')}>
          간편 리뷰<span className="count">2,591</span>
        </div>
        <div className={`tab ${tab==='premium'?'active':''}`} onClick={() => setTab('premium')}>
          <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
            <span style={{color:'var(--gold)'}}><Crest size={9}/></span>
            프리미엄 리뷰
          </span>
          <span className="count">256</span>
        </div>
      </div>

      <div className="filter-row">
        <button className="chip active">전체</button>
        <button className="chip">거실</button>
        <button className="chip">안방</button>
        <button className="chip">주방</button>
        <button className="chip">베란다</button>
        <button className="chip">사진 있음</button>
      </div>

      <div className="scroll">
        <div className="scroll-inner">
          <div className="sort-row">
            <div className="total">전체 <b>2,591</b>건</div>
            <button className="sort-btn">최신순
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          {tab === 'simple' ? <>
            <SimpleReview stars={5} name="김*은" date="3일 전"
              body="시공 깔끔하고 단열도 확실히 좋아졌어요. 추천합니다!"
              tags={['거실', '단열 만족', '깔끔한 마감']}/>
            <SimpleReview stars={5} name="박*수" date="5일 전"
              body="당일 완공 인상적. 소음도 줄었어요."
              tags={['주방', '소음 차단']}/>
            <SimpleReview stars={4} name="이*영" date="1주 전"
              body="가격 대비 만족스러워요. 다만 핸들 색이 사진과 살짝 달랐어요."
              tags={['안방']}/>
            <SimpleReview stars={5} name="정*아" date="1주 전"
              body="LG지인 시스템창으로 했는데 결로 없어졌습니다."
              tags={['베란다', '결로 해결']}/>
            <SimpleReview stars={5} name="최*훈" date="2주 전"
              body="실측부터 시공까지 친절하셨어요."
              tags={['친절 응대']}/>
          </> : <>
            <PremiumReview name="김민서" initial="민" date="2026.03.21"
              location="서울 마포구" model="LX Z:IN 슈퍼세이브2 PHC235"
              stars={5}
              body={[
                "10년 된 아파트 거실창과 안방창을 한 번에 교체했습니다. 결정 전 3군데 견적을 받았는데, 견적 단계부터 가장 디테일하게 설명해주셨어요.",
                "특히 기존 창틀 상태가 좋지 않았는데도 추가 비용 없이 마감을 깔끔하게 잡아주신 점이 인상적이었습니다. 시공 후 첫 비 오는 날에도 누수 없이 잘 막혀있었고, 외부 소음이 확연히 줄었습니다."
              ]}/>
            <PremiumReview name="이도윤" initial="도" date="2026.03.14"
              location="경기 분당" model="KCC 클렌체 240mm 이중창"
              stars={5} photos="g-3" video="45"
              body={[
                "30평대 아파트 전체 창호 교체. 거실 통창 + 주방 + 안방 + 작은방 2개 + 베란다까지 총 7개소. 하루 만에 끝낸다는 말이 반신반의했는데 오전 9시 시작해서 오후 6시 전에 마무리되었습니다.",
                "단열 효과는 일주일 살아본 결과 확실히 체감됩니다. 난방 온도 1℃ 낮춰도 따뜻해요."
              ]}/>
          </>}
          <div style={{height:80}}/>
        </div>
      </div>

      <div className="cta-bar">
        <button className="btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/></svg>
          후기 작성하기
        </button>
      </div>
    </div>
  );
};

// ───── List Variant B: Premium pulled to top ─────
const ListB = ({ tweaks }) => (
  <div className="phone">
    <StatusBar/>
    <NavBar title="시공 후기" back={false}/>

    <div className="summary">
      <div className="summary-row">
        <div className="summary-score">4.9<span className="summary-of">/5.0</span></div>
        <div className="summary-meta">
          <Stars value={5} size={14}/>
          <div className="count">2,847명이 시공받고 평가했습니다</div>
        </div>
      </div>
    </div>

    <div className="filter-row">
      <button className="chip active">최신순</button>
      <button className="chip"><span style={{color:'var(--gold)',marginRight:4}}>★</span>프리미엄만</button>
      <button className="chip">사진/영상</button>
      <button className="chip">거실</button>
      <button className="chip">안방</button>
      <button className="chip">주방</button>
    </div>

    <div className="scroll">
      <div className="scroll-inner">
        <div className="photo-strip">
          <div className="pst-head">
            <span className="pst-title">📸 포토 후기</span>
            <span className="pst-more">전체 보기 ›</span>
          </div>
          <div className="photo-grid g-strip">
            <Photo kind="living"/>
            <Photo kind="room"/>
            <Photo kind="balcony"/>
            <Photo kind="night"/>
            <Photo kind="living"/>
          </div>
        </div>

        <PremiumReview name="이도윤" initial="도" date="2026.03.14"
          location="경기 분당" model="KCC 클렌체 240mm"
          stars={5} photos="g-3"
          body={[
            "30평대 아파트 전체 창호 교체. 거실 통창과 주방, 안방까지 7개소 모두 한 번에 진행했어요. 하루 완공이 가능할까 걱정했지만 정말 오후 6시 전에 끝났습니다.",
            "단열 체감이 확실해서 난방 1도 낮춰도 따뜻합니다."
          ]}/>

        <SimpleReview stars={5} name="박*수" date="5일 전"
          body="당일 완공 인상적. 소음도 줄었어요."
          tags={['주방', '소음 차단']}/>

        <SimpleReview stars={5} name="김*은" date="3일 전"
          body="시공 깔끔하고 단열도 확실히 좋아졌어요. 추천합니다!"
          tags={['거실', '단열 만족']}/>

        <PremiumReview name="김민서" initial="민" date="2026.03.21"
          location="서울 마포구" model="LX Z:IN 슈퍼세이브2"
          stars={5} photos="g-mosaic" ba={false}
          body={[
            "결정 전 3군데 견적을 받았는데, 견적 단계부터 가장 디테일하게 설명해주셨어요. 기존 창틀 상태가 좋지 않았는데도 추가 비용 없이 마감을 깔끔하게 잡아주셨습니다.",
            "외부 소음이 확연히 줄었고 첫 비 오는 날에도 누수 없었습니다."
          ]}/>

        <SimpleReview stars={4} name="이*영" date="1주 전"
          body="가격 대비 만족스러워요. 핸들 색이 사진과 살짝 달랐어요."
          tags={['안방']}/>
        <div style={{height:80}}/>
      </div>
    </div>

    <div className="cta-bar">
      <button className="btn btn-primary">후기 작성하기</button>
    </div>
  </div>
);

// =================================================================
// DETAIL SCREEN
// =================================================================

const DetailA = () => (
  <div className="phone">
    <StatusBar/>
    <NavBar title="후기 상세"/>

    <div className="scroll">
      <div className="scroll-inner">
        <div style={{padding:'14px 16px 0'}}>
          <span className="premium-badge">
            <span className="crest"><Crest size={9}/></span>
            프리미엄 리뷰
          </span>
        </div>
        <div className="author" style={{padding:'12px 16px'}}>
          <div className="avatar" style={{width:42,height:42,fontSize:14}}>도</div>
          <div className="author-info">
            <div className="author-name" style={{fontSize:14}}>이도윤<VerifiedMark/></div>
            <div className="author-meta">경기 분당 · 시공 7개월차 입주민</div>
          </div>
        </div>
        <div style={{padding:'0 16px 14px'}}>
          <Stars value={5} size={18}/>
          <div style={{marginTop:6, fontSize:12, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>
            2026.03.14 시공 · 2026.03.21 작성
          </div>
        </div>

        <BeforeAfter/>

        <div className="photo-grid g-3" style={{margin:'0 0 14px'}}>
          <Photo kind="living" label="거실 전면창"/>
          <Photo kind="room" label="안방"/>
          <Photo kind="balcony" label="베란다"/>
          <Photo kind="night" count={5}/>
        </div>

        <div className="premium-body">
          <p><b>30평대 아파트, 7개소 한 번에 교체했습니다.</b></p>
          <p>이사 들어간 지 8년 된 아파트인데 겨울마다 거실 큰창에서 외풍이 심했습니다. 결정 전 3군데 견적을 받았는데, 청암홈윈도우는 견적 단계부터 디테일이 달랐어요. 특히 기존 창틀의 누수 흔적까지 짚어주시면서 어떤 부분을 보강해야 하는지 설명해주셨습니다.</p>
          <p>시공 당일 오전 9시 도착, 오후 6시 전에 마무리. 정말 하루 완공이었습니다. 거실 통창은 4명이 들어서 올리시는 모습이 인상적이었어요.</p>
          <p>일주일 살아본 결과: 난방 1도 낮춰도 따뜻하고, 옆 동 공사 소음이 거의 안 들립니다. 만족도 100%.</p>
        </div>

        <div className="spec-table">
          <div className="spec-row"><div className="k">시공 부위</div><div className="v">거실 · 주방 · 안방 · 작은방 2 · 베란다</div></div>
          <div className="spec-row"><div className="k">제품</div><div className="v">KCC 클렌체 240mm 이중창</div></div>
          <div className="spec-row"><div className="k">유리</div><div className="v">로이복층 22mm + 아르곤 가스</div></div>
          <div className="spec-row"><div className="k">사이즈</div><div className="v">총 7개소 · 통창 3,200×2,400mm 포함</div></div>
          <div className="spec-row"><div className="k">시공일</div><div className="v">2026.03.14 · 1일 완공</div></div>
        </div>

        <div className="premium-foot" style={{borderTop:'1px solid var(--line)', marginTop:0}}>
          <button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
            도움돼요 <b style={{color:'var(--ink-2)'}}>87</b>
          </button>
          <button>댓글 12</button>
          <span className="spacer"/>
          <button>공유</button>
        </div>
        <div style={{height:60}}/>
      </div>
    </div>
  </div>
);

// =================================================================
// REVIEW TYPE PICKER
// =================================================================

const TypePickerA = () => (
  <div className="phone">
    <StatusBar/>
    <NavBar title="후기 작성"/>
    <div style={{padding:'8px 16px 4px'}}>
      <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em'}}>어떤 후기를 남기실래요?</div>
      <div style={{fontSize:13, color:'var(--ink-3)', marginTop:4, lineHeight:1.5}}>
        간단히 별점만, 아니면 자세한 시공기까지.<br/>편하신 방식으로 남겨주세요.
      </div>
    </div>
    <div className="type-pick">
      <div className="type-card">
        <div className="head">
          <div className="h-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.5l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.9 3.1 1.1-6.5L2.5 9.4l6.5-.9z"/></svg>
            간편 리뷰
          </div>
          <div className="h-time">약 30초</div>
        </div>
        <div className="h-desc">별점 + 한 줄 후기로 빠르게 남기기</div>
        <div className="feat">
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>별점 5단계</span>
          </div>
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>50자 이내 한 줄 코멘트</span>
          </div>
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>만족한 부분 태그 선택</span>
          </div>
        </div>
        <div className="arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <div className="type-card dark">
        <div className="head">
          <div className="h-title" style={{color:'var(--gold)'}}>
            <Crest size={14}/>
            프리미엄 리뷰
          </div>
          <div className="h-time">약 5분</div>
        </div>
        <div className="h-desc">사진과 함께 시공 경험을 자세히 남기기</div>
        <div className="feat">
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>200자 이상 본문</span>
          </div>
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>사진 3장 이상 + 동영상 첨부</span>
          </div>
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Before / After 비교 사진</span>
          </div>
          <div className="feat-row">
            <svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>제품·옵션 정보 기록</span>
          </div>
        </div>
        <div className="arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>
  </div>
);

// =================================================================
// SIMPLE REVIEW WRITE FORM
// =================================================================

const SimpleFormStars = ({ value, onChange }) => {
  const [hover, setHover] = React.useState(0);
  const labels = ['', '아쉬워요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'];
  const v = hover || value;
  return (
    <div>
      <div className="star-input">
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button" className={i <= v ? 'on' : ''}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}>
            <Star filled={i <= v} size={32}/>
          </button>
        ))}
        <span className="lbl-text">{v ? labels[v] : '별점을 선택해주세요'}</span>
      </div>
    </div>
  );
};

const SimpleFormPoints = ({ value, onChange }) => (
  <div>
    <div className="points-row">
      {Array.from({length:10}, (_,i) => i+1).map(n => (
        <button key={n} type="button" className={`point ${value === n ? 'on' : ''}`}
          onClick={() => onChange(n)}>{n}</button>
      ))}
    </div>
    <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink-3)', marginTop:6, fontFamily:'var(--font-mono)'}}>
      <span>1 · 별로</span>
      <span>10 · 강력 추천</span>
    </div>
  </div>
);

const SimpleFormSat = ({ value, onChange }) => {
  const opts = [
    { v: 1, e: '😞', l: '실망' },
    { v: 2, e: '😐', l: '아쉬움' },
    { v: 3, e: '🙂', l: '괜찮음' },
    { v: 4, e: '😊', l: '만족' },
    { v: 5, e: '🤩', l: '강추' },
  ];
  return (
    <div className="sat-row">
      {opts.map(o => (
        <button key={o.v} type="button" className={`sat ${value === o.v ? 'on' : ''}`}
          onClick={() => onChange(o.v)}>
          <span>{o.e}</span>
          <span className="sat-lbl">{o.l}</span>
        </button>
      ))}
    </div>
  );
};

const SimpleForm = ({ tweaks }) => {
  const [score, setScore] = React.useState(tweaks.scoreType === 'stars' ? 5 : tweaks.scoreType === 'points' ? 8 : 4);
  const [tags, setTags] = React.useState(['거실', '단열 만족']);
  const [text, setText] = React.useState('당일 완공도 깜짝 놀랐고, 단열 차이가 확실히 느껴져요!');
  const allTags = ['거실', '주방', '안방', '베란다', '단열 만족', '소음 차단', '깔끔한 마감', '친절 응대', '빠른 시공'];
  const max = 50;

  const ScoreInput = tweaks.scoreType === 'stars' ? SimpleFormStars
    : tweaks.scoreType === 'points' ? SimpleFormPoints
    : SimpleFormSat;

  return (
    <div className="phone">
      <StatusBar/>
      <NavBar title="간편 리뷰 작성"/>

      <div className="scroll">
        <div className="scroll-inner">
          <div className="form">
            <div className="form-block">
              <label>전체 만족도</label>
              <ScoreInput value={score} onChange={setScore}/>
            </div>

            <div className="form-block">
              <label>한 줄 후기</label>
              <textarea className="ta" value={text} onChange={e => setText(e.target.value.slice(0, max))}
                placeholder="시공 받으신 후 솔직한 한 줄 후기를 남겨주세요"/>
              <div className={`ta-counter ${text.length > max * 0.9 ? 'warn' : ''}`}>
                <span className="ok">{text.length}</span> / {max}자
              </div>
            </div>

            <div className="form-block">
              <label>좋았던 부분 <span className="hint">(중복 선택 가능)</span></label>
              <div className="tag-pick">
                {allTags.map(t => (
                  <button key={t} type="button" className={tags.includes(t) ? 'on' : ''}
                    onClick={() => setTags(tags.includes(t) ? tags.filter(x => x!==t) : [...tags, t])}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{height:20}}/>
        </div>
      </div>

      <div className="form-cta-bar">
        <button className="btn btn-primary">후기 등록하기</button>
      </div>
    </div>
  );
};

// =================================================================
// PREMIUM WRITE FORM
// =================================================================

const PremiumForm = ({ tweaks }) => {
  const [text, setText] = React.useState(
    "30평대 아파트 전체 창호 교체했습니다. 결정 전 3군데 견적을 받았는데 청암홈윈도우는 견적 단계부터 디테일이 달랐어요. 기존 창틀의 누수 흔적까지 짚어주시면서 어떤 부분을 보강해야 하는지 설명해주셨습니다.\n\n시공 당일 오전 9시 도착, 오후 6시 전에 마무리. 정말 하루 완공이었습니다."
  );
  const [score, setScore] = React.useState(5);
  const [parts, setParts] = React.useState(['거실', '안방', '베란다']);
  const allParts = ['거실', '주방', '안방', '작은방', '베란다', '현관'];
  const min = 200;

  return (
    <div className="phone dark">
      <StatusBar/>
      <NavBar title="프리미엄 리뷰"/>

      <div className="step-dots">
        <div className="dot-step on"/>
        <div className="dot-step on"/>
        <div className="dot-step"/>
        <div className="dot-step"/>
        <span className="stxt">2 / 4</span>
      </div>

      <div className="scroll">
        <div className="scroll-inner">
          <div className="form">
            <div className="form-block">
              <label>별점</label>
              <SimpleFormStars value={score} onChange={setScore}/>
            </div>

            <div className="form-block">
              <label>시공 부위 <span className="hint">(중복 가능)</span></label>
              <div className="tag-pick">
                {allParts.map(t => (
                  <button key={t} type="button" className={parts.includes(t) ? 'on' : ''}
                    onClick={() => setParts(parts.includes(t) ? parts.filter(x => x!==t) : [...parts, t])}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-block">
              <label>제품 정보</label>
              <div style={{display:'grid', gap:8}}>
                <input className="spec-input" placeholder="제품명 (예: LX Z:IN 슈퍼세이브2)" defaultValue="KCC 클렌체 240mm 이중창"/>
                <div className="spec-grid">
                  <input className="spec-input" placeholder="유리 종류" defaultValue="로이복층 22mm"/>
                  <input className="spec-input" placeholder="시공 개소" defaultValue="7개소"/>
                </div>
              </div>
            </div>

            <div className="form-block">
              <label>사진 첨부 <span className="hint">(최소 3장)</span></label>
              <div className="photo-pick">
                <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#d4ddc8 0 6px,#c5cfb8 6px 12px)'}}>
                  <span className="ba">BEFORE</span>
                  <span className="x">×</span>
                </div>
                <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#c8d4dc 0 6px,#b4c0c8 6px 12px)'}}>
                  <span className="ba">AFTER</span>
                  <span className="x">×</span>
                </div>
                <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#e8d8c0 0 6px,#d8c8b0 6px 12px)'}}>
                  <span className="x">×</span>
                </div>
                <div className="slot">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span className="num">3 / 10</span>
                </div>
              </div>
            </div>

            <div className="form-block">
              <label>동영상 (선택)</label>
              <div className="photo-pick" style={{gridTemplateColumns:'repeat(2, 1fr)'}}>
                <div className="slot" style={{aspectRatio:'16/9'}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  <span style={{fontSize:11}}>영상 추가</span>
                </div>
                <div style={{display:'flex', alignItems:'center', fontSize:11, color:'rgba(246,244,240,0.55)', lineHeight:1.5, padding:'0 4px'}}>
                  최대 60초<br/>시공 과정이나 완성 모습을 담아보세요
                </div>
              </div>
            </div>

            <div className="form-block">
              <label>상세 후기 <span className="hint">(200자 이상)</span></label>
              <textarea className="ta" style={{minHeight:140}} value={text}
                onChange={e => setText(e.target.value)}
                placeholder="시공 결정 이유, 진행 과정, 완성 후 만족도 등을 자유롭게 적어주세요"/>
              <div className={`ta-counter ${text.length < min ? 'warn' : ''}`}>
                {text.length < min ? <>아직 <b>{min - text.length}자</b> 더 필요해요</> :
                  <><span className="ok">✓</span> {text.length}자 (최소 {min}자)</>}
              </div>
            </div>
          </div>
          <div style={{height:20}}/>
        </div>
      </div>

      <div className="form-cta-bar" style={{display:'flex', gap:8}}>
        <button className="btn" style={{flex:'0 0 100px', background:'transparent', borderColor:'rgba(255,255,255,0.15)', color:'var(--premium-ink)'}}>이전</button>
        <button className="btn btn-premium" style={{flex:1}}>
          <span className="crest"><Crest size={11}/></span>
          다음 단계로
        </button>
      </div>
    </div>
  );
};

Object.assign(window, {
  ListA, ListB, DetailA, TypePickerA, SimpleForm, PremiumForm
});
