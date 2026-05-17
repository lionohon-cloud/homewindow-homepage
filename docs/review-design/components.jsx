// Shared components for 홈윈도우 review prototypes

const Star = ({ filled, size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? 'currentColor' : 'none'}
       stroke="currentColor" strokeWidth={filled ? 0 : 1.5} className={filled ? 'star' : 'star-empty'}>
    <path d="M12 2.5l2.95 6 6.6.95-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.1 1.13-6.58L2.45 9.45l6.6-.95L12 2.5z"/>
  </svg>
);

const Stars = ({ value, size = 14 }) => (
  <div className="stars-row">
    {[1,2,3,4,5].map(i => <Star key={i} filled={i <= value} size={size}/>)}
  </div>
);

const StatusBar = () => (
  <div className="status-bar">
    <span>9:41</span>
    <div className="icons">
      <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="1"/><rect x="4" y="4" width="3" height="6" rx="1"/><rect x="8" y="2" width="3" height="8" rx="1"/><rect x="12" y="0" width="3" height="10" rx="1"/></svg>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 1.5C4.6 1.5 2.4 2.5 1 4l1 1.2c1.2-1 3-1.7 5-1.7s3.8.7 5 1.7L13 4c-1.4-1.5-3.6-2.5-6-2.5zm0 3c-1.5 0-3 .6-4 1.5l1 1.3c.8-.7 1.8-1.1 3-1.1s2.2.4 3 1.1l1-1.3c-1-1-2.5-1.5-4-1.5zm0 3c-.7 0-1.4.3-2 .8L7 9l2-1.7c-.6-.5-1.3-.8-2-.8z"/></svg>
      <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/><rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="3" rx="0.5" fill="currentColor"/></svg>
    </div>
  </div>
);

const NavBar = ({ title, back = true, dark = false, right }) => (
  <div className="nav">
    {back && <div className="nav-icon nav-back">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </div>}
    <div className="nav-title">{title}</div>
    {right || (
      <>
        <div className="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
        <div className="nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>
      </>
    )}
  </div>
);

const VerifiedMark = () => (
  <svg className="verified-mark" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1l2.4 2.6 3.5-.4.4 3.5L21 9l-2.6 2.4.4 3.5-3.5.4L12 18l-2.4-2.6-3.5.4-.4-3.5L3 9l2.6-2.4-.4-3.5 3.5-.4L12 1z"/>
    <path d="M9.5 12l1.8 1.8 3.5-3.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Crest = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 1l1.4 3.2L11 4.7l-2.6 2.5.7 3.6L6 9l-3.1 1.8.7-3.6L1 4.7l3.6-.5L6 1z"/>
  </svg>
);

const Photo = ({ kind = 'living', label, count, video }) => (
  <div className={`ph ph-bg-${kind}`}>
    {label && <span className="lbl">{label}</span>}
    {video && <span className="video-overlay">▶ 0:{video}</span>}
    {count && <div className="count-overlay">+{count}</div>}
  </div>
);

const BeforeAfter = () => (
  <div className="ba-wrap">
    <div className="ba-half before">
      <span className="ba-tag">BEFORE</span>
    </div>
    <div className="ba-half after">
      <span className="ba-tag">AFTER</span>
    </div>
    <div className="ba-divider"/>
    <div className="ba-handle">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 3 12 9 6"/><polyline points="15 6 21 12 15 18"/></svg>
    </div>
  </div>
);

Object.assign(window, { Star, Stars, StatusBar, NavBar, VerifiedMark, Crest, Photo, BeforeAfter });
