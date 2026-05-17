// PC desktop screens for 홈윈도우 review system
// Width: 1280px, follows the same brand color system

const { Star, Stars, VerifiedMark, Crest, Photo, BeforeAfter } = window;

// =================================================================
// Shared PC chrome
// =================================================================

const pcStyle = `
  .pc {
    width: 1280px;
    background: var(--bg);
    font-family: var(--font);
    color: var(--ink);
    font-size: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pc-header {
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    height: 72px;
    display: flex;
    align-items: center;
    padding: 0 48px;
    gap: 48px;
    flex-shrink: 0;
  }
  .pc-logo {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--brand);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pc-logo .mark {
    width: 28px; height: 28px;
    background: var(--brand);
    color: #fff;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 700;
  }
  .pc-nav { display: flex; gap: 32px; flex: 1; }
  .pc-nav a {
    font-size: 14px;
    color: var(--ink-2);
    font-weight: 500;
    letter-spacing: -0.01em;
    cursor: pointer;
  }
  .pc-nav a.on { color: var(--ink); font-weight: 700; position: relative; }
  .pc-nav a.on::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -27px;
    height: 2px; background: var(--brand);
  }
  .pc-tel {
    font-family: var(--font);
    font-weight: 800;
    color: var(--ink);
    letter-spacing: -0.02em;
    font-size: 16px;
    display: flex; align-items: center; gap: 6px;
  }
  .pc-tel-mini { font-size: 11px; color: var(--ink-3); font-weight: 500; }
  .pc-cta {
    background: var(--brand);
    color: #fff;
    height: 40px;
    padding: 0 18px;
    border-radius: 8px;
    border: 0;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
    font-family: var(--font);
  }

  .pc-page-head {
    background: var(--surface);
    padding: 40px 48px 28px;
    border-bottom: 1px solid var(--line);
  }
  .pc-breadcrumb {
    font-size: 12px;
    color: var(--ink-3);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }
  .pc-page-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .pc-page-sub {
    margin-top: 8px;
    font-size: 14px;
    color: var(--ink-3);
    letter-spacing: -0.01em;
  }

  .pc-body { padding: 32px 48px; flex: 1; overflow: hidden; }
  .pc-body-scroll { height: 100%; overflow-y: auto; }
  .pc-body-scroll::-webkit-scrollbar { width: 8px; }
  .pc-body-scroll::-webkit-scrollbar-thumb {
    background: var(--line); border-radius: 4px;
  }

  /* Summary card */
  .pc-summary {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 28px 32px;
    display: grid;
    grid-template-columns: 1fr 1.4fr 1fr;
    gap: 40px;
    align-items: center;
    margin-bottom: 24px;
  }
  .pc-summary-left { border-right: 1px solid var(--line); padding-right: 32px; }
  .pc-score {
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--ink);
    display: flex; align-items: baseline; gap: 6px;
  }
  .pc-score-of {
    font-size: 20px; color: var(--ink-3); font-weight: 600;
  }
  .pc-score-stars { margin-top: 10px; }
  .pc-score-stars svg { width: 18px; height: 18px; }
  .pc-score-count {
    margin-top: 8px;
    font-size: 13px;
    color: var(--ink-3);
  }
  .pc-bars { display: grid; gap: 6px; }
  .pc-bar {
    display: grid;
    grid-template-columns: 30px 1fr 60px;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--ink-3);
  }
  .pc-bar .track {
    height: 6px; background: var(--line-2);
    border-radius: 3px; overflow: hidden;
  }
  .pc-bar .fill { height: 100%; background: var(--brand); border-radius: 3px; }
  .pc-bar .num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }
  .pc-summary-cta {
    text-align: center;
  }
  .pc-summary-cta .lbl {
    font-size: 12px;
    color: var(--ink-3);
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }
  .pc-write-btn {
    background: var(--brand);
    color: #fff;
    height: 48px;
    padding: 0 24px;
    border-radius: 10px;
    border: 0;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: -0.01em;
    font-family: var(--font);
    width: 100%;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  }
  .pc-write-btn.outline {
    background: transparent;
    color: var(--brand);
    border: 1.5px solid var(--brand);
  }

  /* Tab + filter row */
  .pc-tabs-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }
  .pc-tabs {
    display: flex;
    gap: 28px;
  }
  .pc-tab {
    padding: 12px 0 14px;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink-3);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 6px;
  }
  .pc-tab.on { color: var(--brand); border-bottom-color: var(--brand); }
  .pc-tab .ct {
    font-size: 12px; color: inherit; opacity: .65;
    font-variant-numeric: tabular-nums;
  }
  .pc-filter-row {
    display: flex;
    gap: 16px;
    align-items: center;
    padding-bottom: 12px;
  }
  .pc-chip {
    height: 30px;
    padding: 0 14px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 100px;
    font-size: 12.5px;
    color: var(--ink-2);
    cursor: pointer;
    font-family: var(--font);
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .pc-chip.on { background: var(--brand); color: #fff; border-color: var(--brand); }

  /* Simple card list (PC) */
  .pc-list { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
  .pc-simple-row {
    display: grid;
    grid-template-columns: 100px 110px 1fr 100px;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--line);
    font-size: 13.5px;
  }
  .pc-simple-row:last-child { border-bottom: 0; }
  .pc-simple-row .pc-stars svg { width: 14px; height: 14px; }
  .pc-simple-row .pc-author { color: var(--ink-2); font-weight: 500; letter-spacing: -0.01em; }
  .pc-simple-row .pc-author .pc-author-date {
    font-size: 11.5px; color: var(--ink-3); margin-top: 2px; font-family: var(--font-mono);
  }
  .pc-simple-row .pc-body-text {
    color: var(--ink); letter-spacing: -0.01em; line-height: 1.55;
  }
  .pc-simple-row .pc-body-text .pc-tags {
    margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;
  }
  .pc-simple-row .pc-body-text .pc-tag {
    font-size: 11px; padding: 2px 8px;
    background: var(--brand-soft); color: var(--brand);
    border-radius: 100px;
    font-weight: 500;
  }
  .pc-simple-row .pc-helpful {
    text-align: right; color: var(--ink-3); font-size: 12px;
    display: flex; align-items: center; justify-content: flex-end; gap: 4px;
  }

  /* Premium grid */
  .pc-premium-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
  .pc-premium-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pc-pc-hero { position: relative; height: 220px; }
  .pc-pc-hero .ph { height: 100%; }
  .pc-pc-hero .pc-badge {
    position: absolute; top: 14px; left: 14px;
    background: rgba(26,18,16,0.92);
    color: var(--gold-light);
    padding: 5px 10px 5px 8px;
    border-radius: 100px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.02em;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .pc-pc-hero .pc-photo-count {
    position: absolute; bottom: 14px; right: 14px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    padding: 4px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-family: var(--font-mono);
    display: inline-flex; align-items: center; gap: 4px;
  }
  .pc-pc-body {
    padding: 18px 20px 16px;
    display: flex; flex-direction: column; gap: 10px;
    flex: 1;
  }
  .pc-pc-meta { display: flex; align-items: center; gap: 8px; }
  .pc-pc-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #b85957, #7a2625);
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    font-weight: 600;
  }
  .pc-pc-name { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; }
  .pc-pc-loc { font-size: 11.5px; color: var(--ink-3); margin-top: 1px; }
  .pc-pc-stars { margin-left: auto; }
  .pc-pc-stars svg { width: 13px; height: 13px; }
  .pc-pc-excerpt {
    font-size: 13.5px; line-height: 1.6;
    color: var(--ink-2); letter-spacing: -0.01em;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pc-pc-spec {
    margin-top: 4px;
    padding-top: 12px;
    border-top: 1px dashed var(--line);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11.5px; color: var(--ink-3);
  }
  .pc-pc-spec .model { font-weight: 600; color: var(--ink-2); letter-spacing: -0.01em; }
  .pc-pc-spec .date { font-family: var(--font-mono); }

  /* Sort right */
  .pc-sort {
    display: flex; gap: 14px;
    font-size: 12.5px; color: var(--ink-3);
  }
  .pc-sort span { cursor: pointer; letter-spacing: -0.01em; }
  .pc-sort span.on { color: var(--ink); font-weight: 600; }

  /* Detail page (PC) */
  .pc-detail {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 32px;
    align-items: start;
  }
  .pc-gallery {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
  }
  .pc-gallery-main { height: 380px; }
  .pc-gallery-strip {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    padding: 2px;
    background: var(--line);
  }
  .pc-gallery-strip .ph { height: 70px; cursor: pointer; }
  .pc-gallery-strip .ph.sel { box-shadow: 0 0 0 2px var(--brand) inset; }
  .pc-detail-side {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 28px 28px 20px;
  }
  .pc-detail-author-row {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }
  .pc-detail-author-row .pc-pc-avatar { width: 44px; height: 44px; font-size: 14px; }
  .pc-detail-author-row .name { font-size: 15px; font-weight: 700; letter-spacing: -0.02em; display: flex; align-items: center; gap: 6px; }
  .pc-detail-author-row .meta { font-size: 12px; color: var(--ink-3); margin-top: 2px; }
  .pc-detail-stars { padding: 18px 0 14px; display: flex; align-items: center; gap: 10px; }
  .pc-detail-stars svg { width: 22px; height: 22px; }
  .pc-detail-stars .num { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; }
  .pc-detail-stars .date { margin-left: auto; font-size: 12px; color: var(--ink-3); font-family: var(--font-mono); }
  .pc-detail-body {
    font-size: 14.5px; line-height: 1.75; color: var(--ink-2);
    letter-spacing: -0.01em;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }
  .pc-detail-body p { margin: 0 0 10px; }
  .pc-detail-body p.lead { color: var(--ink); font-weight: 600; }
  .pc-detail-spec {
    padding: 18px 0;
    display: grid;
    gap: 10px;
    border-bottom: 1px solid var(--line);
  }
  .pc-detail-spec .row {
    display: grid; grid-template-columns: 90px 1fr;
    font-size: 13px;
  }
  .pc-detail-spec .row .k { color: var(--ink-3); }
  .pc-detail-spec .row .v { color: var(--ink); font-weight: 500; letter-spacing: -0.01em; }
  .pc-detail-foot {
    padding-top: 16px;
    display: flex; gap: 18px;
    color: var(--ink-3);
    font-size: 13px;
  }
  .pc-detail-foot button {
    background: none; border: 0; padding: 0; cursor: pointer;
    color: inherit; font-family: var(--font); font-size: inherit;
    display: flex; align-items: center; gap: 5px;
  }

  /* PC write form (premium) — magazine layout */
  .pc-write {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 32px;
    align-items: start;
  }
  .pc-write-form {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 32px;
    display: grid;
    gap: 24px;
  }
  .pc-write-side {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 24px;
    position: sticky;
    top: 0;
  }
  .pc-write-side h4 {
    margin: 0 0 14px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .pc-write-side .preview-card {
    border: 1px dashed var(--line);
    border-radius: 10px;
    padding: 14px;
    background: var(--bg);
    font-size: 12px;
    color: var(--ink-3);
    line-height: 1.6;
  }
  .pc-write-tips {
    margin-top: 18px;
    padding: 16px;
    background: var(--brand-soft);
    border-radius: 10px;
    font-size: 12.5px;
    color: var(--brand-deep);
    line-height: 1.65;
    letter-spacing: -0.01em;
  }
  .pc-write-tips b {
    display: block;
    color: var(--brand);
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
    font-size: 11px;
    text-transform: uppercase;
  }

  .pc-form-block label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }
  .pc-form-block .req { color: var(--brand); margin-left: 2px; }
  .pc-form-block .hint {
    margin-left: 8px;
    font-size: 11.5px;
    color: var(--ink-3);
    font-weight: 500;
  }

  .pc-star-input { display: flex; gap: 4px; align-items: center; }
  .pc-star-input button { background: none; border: 0; padding: 0; cursor: pointer; color: var(--ink-4); }
  .pc-star-input button.on { color: var(--star); }
  .pc-star-input svg { width: 36px; height: 36px; }
  .pc-star-input .txt { margin-left: 12px; font-size: 14px; font-weight: 600; color: var(--brand); }

  .pc-tag-pick { display: flex; flex-wrap: wrap; gap: 8px; }
  .pc-tag-pick button {
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--ink-2);
    font-size: 13px;
    padding: 9px 16px;
    border-radius: 100px;
    cursor: pointer;
    letter-spacing: -0.01em;
    font-family: var(--font);
    font-weight: 500;
  }
  .pc-tag-pick button.on {
    background: var(--brand-soft); border-color: var(--brand); color: var(--brand);
  }

  .pc-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pc-input {
    height: 46px;
    padding: 0 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--bg);
    font-size: 14px;
    color: var(--ink);
    font-family: var(--font);
    width: 100%;
    letter-spacing: -0.01em;
  }
  .pc-input:focus { outline: none; border-color: var(--brand); background: var(--surface); }

  .pc-ta {
    width: 100%;
    min-height: 180px;
    padding: 14px 16px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--bg);
    font-family: var(--font);
    font-size: 14.5px;
    line-height: 1.7;
    resize: vertical;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .pc-ta:focus { outline: none; border-color: var(--brand); background: var(--surface); }
  .pc-ta-meta {
    display: flex; justify-content: space-between; margin-top: 6px;
    font-size: 11.5px; color: var(--ink-3); font-family: var(--font-mono);
  }
  .pc-ta-meta b { color: var(--success); font-weight: 700; }
  .pc-ta-meta b.warn { color: var(--brand); }

  .pc-photo-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  .pc-photo-grid .slot {
    aspect-ratio: 1;
    border: 1.5px dashed var(--ink-4);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--ink-3);
    font-size: 11.5px;
    background: var(--bg);
    flex-direction: column; gap: 4px;
    cursor: pointer;
  }
  .pc-photo-grid .slot.filled {
    border: 0;
    background: repeating-linear-gradient(135deg, #efeae0 0 6px, #e7e1d4 6px 12px);
    position: relative;
  }
  .pc-photo-grid .slot.filled .x {
    position: absolute; top: 6px; right: 6px;
    width: 20px; height: 20px;
    background: rgba(0,0,0,0.6); color: #fff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; cursor: pointer;
  }
  .pc-photo-grid .slot.filled .ba {
    position: absolute; bottom: 6px; left: 6px;
    background: rgba(0,0,0,0.7); color: #fff;
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 2px 7px;
    border-radius: 4px;
  }
  .pc-photo-grid .slot.filled .star-cover {
    position: absolute; bottom: 6px; right: 6px;
    background: var(--gold); color: var(--premium-bg);
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
  }

  .pc-write-cta-row {
    display: flex; justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
  }
  .pc-write-cta-row .btn-cancel {
    background: transparent; border: 1px solid var(--line);
    color: var(--ink-2);
    height: 48px; padding: 0 28px;
    border-radius: 10px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: var(--font);
    letter-spacing: -0.01em;
  }
  .pc-write-cta-row .btn-submit {
    background: var(--brand);
    color: #fff; border: 0;
    height: 48px; padding: 0 36px;
    border-radius: 10px;
    font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: var(--font);
    letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 6px;
  }
  .pc-write-cta-row .btn-premium-submit {
    background: linear-gradient(135deg, #1a1210 0%, #2a1f1c 100%);
    color: var(--gold-light);
    border: 0;
  }

  /* Type picker (PC modal) */
  .pc-modal-back {
    background: rgba(28, 22, 20, 0.45);
    padding: 48px 0;
    display: flex; justify-content: center;
    height: 100%;
    overflow: hidden;
  }
  .pc-modal {
    background: var(--surface);
    width: 800px;
    height: fit-content;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0,0,0,0.25);
  }
  .pc-modal-head {
    padding: 32px 40px 24px;
    text-align: center;
    border-bottom: 1px solid var(--line);
  }
  .pc-modal-head h2 {
    margin: 0; font-size: 24px; font-weight: 800;
    letter-spacing: -0.03em;
  }
  .pc-modal-head p {
    margin: 8px 0 0;
    font-size: 14px; color: var(--ink-3);
    letter-spacing: -0.01em;
  }
  .pc-type-grid {
    padding: 32px 40px 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .pc-type-card {
    border: 1.5px solid var(--line);
    border-radius: 14px;
    padding: 28px 24px 24px;
    cursor: pointer;
    background: var(--surface);
    position: relative;
    transition: all 0.15s;
  }
  .pc-type-card:hover { border-color: var(--brand); }
  .pc-type-card.dark {
    background: var(--premium-bg);
    border-color: var(--premium-bg);
    color: var(--premium-ink);
  }
  .pc-type-card .head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px;
  }
  .pc-type-card .h-title {
    font-size: 18px; font-weight: 800; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 8px;
  }
  .pc-type-card.dark .h-title { color: var(--gold-light); }
  .pc-type-card .h-time {
    font-size: 12px;
    color: var(--ink-3);
    font-family: var(--font-mono);
    padding: 3px 10px;
    background: var(--bg);
    border-radius: 100px;
  }
  .pc-type-card.dark .h-time {
    color: rgba(250,247,244,0.6);
    background: rgba(255,255,255,0.07);
  }
  .pc-type-card .h-desc {
    font-size: 13.5px; color: var(--ink-2); line-height: 1.55;
    letter-spacing: -0.01em;
  }
  .pc-type-card.dark .h-desc { color: rgba(250,247,244,0.75); }
  .pc-type-card .feats {
    margin-top: 18px;
    display: grid;
    gap: 8px;
    font-size: 13px;
    color: var(--ink-2);
  }
  .pc-type-card.dark .feats { color: rgba(250,247,244,0.85); }
  .pc-type-card .feat-row { display: flex; gap: 8px; align-items: flex-start; }
  .pc-type-card .ck { width: 16px; height: 16px; flex-shrink: 0; color: var(--brand); margin-top: 1px; }
  .pc-type-card.dark .ck { color: var(--gold); }
  .pc-type-card .go {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
    display: flex; justify-content: space-between; align-items: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--brand);
    letter-spacing: -0.01em;
  }
  .pc-type-card.dark .go {
    border-top-color: rgba(255,255,255,0.08);
    color: var(--gold-light);
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('pc-styles')) {
  const s = document.createElement('style');
  s.id = 'pc-styles';
  s.textContent = pcStyle;
  document.head.appendChild(s);
}

// =================================================================
// PC Header
// =================================================================

const PcHeader = ({ active = 'review' }) => (
  <div className="pc-header">
    <div className="pc-logo">
      <span className="mark">청</span>
      <span>청암홈윈도우</span>
    </div>
    <div className="pc-nav">
      <a>제품소개</a>
      <a>시공현장</a>
      <a className={active === 'review' ? 'on' : ''}>시공후기</a>
      <a>15년 보증</a>
      <a>이벤트</a>
    </div>
    <div className="pc-tel">
      <span className="pc-tel-mini">무료견적</span>
      1661-4830
    </div>
    <button className="pc-cta">무료상담 신청</button>
  </div>
);

// =================================================================
// LIST PAGE (PC)
// =================================================================

const PcSimpleRow = ({ stars, name, date, body, tags, helpful }) => (
  <div className="pc-simple-row">
    <div className="pc-stars"><Stars value={stars}/></div>
    <div className="pc-author">
      {name}
      <div className="pc-author-date">{date}</div>
    </div>
    <div className="pc-body-text">
      {body}
      {tags && <div className="pc-tags">{tags.map(t => <span key={t} className="pc-tag">{t}</span>)}</div>}
    </div>
    <div className="pc-helpful">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
      도움돼요 {helpful}
    </div>
  </div>
);

const PcPremiumCard = ({ name, initial, date, location, model, stars, photos, excerpt, kind = 'living' }) => (
  <div className="pc-premium-card">
    <div className="pc-pc-hero">
      <Photo kind={kind}/>
      <span className="pc-badge"><Crest size={10}/>프리미엄 리뷰</span>
      <span className="pc-photo-count">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        {photos}
      </span>
    </div>
    <div className="pc-pc-body">
      <div className="pc-pc-meta">
        <div className="pc-pc-avatar">{initial}</div>
        <div>
          <div className="pc-pc-name">{name}</div>
          <div className="pc-pc-loc">{location}</div>
        </div>
        <div className="pc-pc-stars"><Stars value={stars}/></div>
      </div>
      <div className="pc-pc-excerpt">{excerpt}</div>
      <div className="pc-pc-spec">
        <span className="model">{model}</span>
        <span className="date">{date}</span>
      </div>
    </div>
  </div>
);

const PcList = () => {
  const [tab, setTab] = React.useState('all');
  return (
    <div className="pc" style={{height: 880}}>
      <PcHeader active="review"/>

      <div className="pc-page-head">
        <div className="pc-breadcrumb">홈 › 시공후기</div>
        <div className="pc-page-title">시공 후기</div>
        <div className="pc-page-sub">수천 건의 시공이 입증한, 청암홈윈도우를 경험한 이야기</div>
      </div>

      <div className="pc-body">
        <div className="pc-body-scroll">
          <div className="pc-summary">
            <div className="pc-summary-left">
              <div className="pc-score">4.9<span className="pc-score-of">/ 5.0</span></div>
              <div className="pc-score-stars"><Stars value={5}/></div>
              <div className="pc-score-count">총 시공후기 <b style={{color:'var(--ink)'}}>2,847건</b></div>
            </div>
            <div className="pc-bars">
              {[[5, 88, '2,510'], [4, 9, '256'], [3, 2, '57'], [2, 1, '18'], [1, 0, '6']].map(([s, p, n]) => (
                <div key={s} className="pc-bar">
                  <span>{s}점</span>
                  <div className="track"><div className="fill" style={{width: `${p}%`}}/></div>
                  <span className="num">{p}% · {n}</span>
                </div>
              ))}
            </div>
            <div className="pc-summary-cta">
              <div className="lbl">시공받으셨나요?</div>
              <button className="pc-write-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4z"/></svg>
                후기 작성하기
              </button>
            </div>
          </div>

          <div className="pc-tabs-row">
            <div className="pc-tabs">
              <div className={`pc-tab ${tab==='all'?'on':''}`} onClick={() => setTab('all')}>
                전체 <span className="ct">2,847</span>
              </div>
              <div className={`pc-tab ${tab==='simple'?'on':''}`} onClick={() => setTab('simple')}>
                간편 리뷰 <span className="ct">2,591</span>
              </div>
              <div className={`pc-tab ${tab==='premium'?'on':''}`} onClick={() => setTab('premium')}>
                <Crest size={11}/> 프리미엄 리뷰 <span className="ct">256</span>
              </div>
            </div>
            <div className="pc-sort">
              <span className="on">최신순</span>
              <span>도움순</span>
              <span>별점 높은 순</span>
            </div>
          </div>

          <div className="pc-filter-row">
            <button className="pc-chip on">전체 부위</button>
            <button className="pc-chip">거실</button>
            <button className="pc-chip">주방</button>
            <button className="pc-chip">안방</button>
            <button className="pc-chip">베란다</button>
            <span style={{width:1, height:18, background:'var(--line)', margin:'0 4px'}}/>
            <button className="pc-chip">사진 있음</button>
            <button className="pc-chip">동영상 있음</button>
            <button className="pc-chip">Before / After</button>
          </div>

          <div style={{fontSize: 13, color: 'var(--ink-2)', marginBottom: 14}}>
            <b style={{color:'var(--ink)'}}>프리미엄 후기</b> — 사진과 함께 자세한 시공기를 남긴 후기입니다
          </div>

          <div className="pc-premium-grid">
            <PcPremiumCard name="이도윤" initial="도" date="2026.03.14"
              location="경기 분당 · KCC 클렌체 240mm"
              model="이중창 · 7개소"
              stars={5} photos="12장 · 영상 1"
              kind="living"
              excerpt="30평대 아파트 전체 창호 교체. 거실 통창과 주방, 안방까지 7개소 모두 한 번에. 하루 완공이 가능할까 걱정했지만 정말 오후 6시 전에 끝났습니다. 단열 체감이 확실해서 난방 1도 낮춰도 따뜻합니다."/>
            <PcPremiumCard name="김민서" initial="민" date="2026.03.21"
              location="서울 마포구 · LX Z:IN"
              model="슈퍼세이브2 PHC235"
              stars={5} photos="8장"
              kind="room"
              excerpt="10년 된 아파트 거실창과 안방창을 한 번에 교체. 견적 단계부터 디테일이 달랐어요. 기존 창틀 상태가 좋지 않았는데도 추가 비용 없이 마감을 깔끔하게 잡아주셨습니다."/>
            <PcPremiumCard name="박지훈" initial="지" date="2026.03.08"
              location="인천 송도 · LX Z:IN"
              model="수퍼더블로이"
              stars={5} photos="15장 · 영상 2"
              kind="balcony"
              excerpt="40평대 신축 아파트. 빌트인 창호가 마음에 안 들어 입주 전 전체 교체. 시공팀이 깔끔하게 진행해주셨고, 입주 후 첫 겨울 보냈는데 외풍이 전혀 없습니다."/>
            <PcPremiumCard name="최서연" initial="서" date="2026.02.27"
              location="부산 해운대 · 홈윈도우"
              model="Signature 라인"
              stars={5} photos="9장"
              kind="night"
              excerpt="고층 아파트라 바람 영향이 심했는데, 시공 후 거실에서 바람 소리가 거의 안 들립니다. 안전방충망 무상 옵션도 큰 메리트였어요."/>
          </div>

          <div style={{fontSize: 13, color: 'var(--ink-2)', marginBottom: 14}}>
            <b style={{color:'var(--ink)'}}>간편 후기</b>
          </div>

          <div className="pc-list">
            <PcSimpleRow stars={5} name="김*은" date="3일 전"
              body="시공 깔끔하고 단열도 확실히 좋아졌어요. 추천합니다!"
              tags={['거실', '단열 만족', '깔끔한 마감']}
              helpful={32}/>
            <PcSimpleRow stars={5} name="박*수" date="5일 전"
              body="당일 완공 인상적. 소음도 줄었어요."
              tags={['주방', '소음 차단']}
              helpful={18}/>
            <PcSimpleRow stars={4} name="이*영" date="1주 전"
              body="가격 대비 만족스러워요. 다만 핸들 색이 사진과 살짝 달랐어요."
              tags={['안방']}
              helpful={7}/>
            <PcSimpleRow stars={5} name="정*아" date="1주 전"
              body="LG지인 시스템창으로 했는데 결로 없어졌습니다."
              tags={['베란다', '결로 해결']}
              helpful={24}/>
            <PcSimpleRow stars={5} name="최*훈" date="2주 전"
              body="실측부터 시공까지 친절하셨어요."
              tags={['친절 응대']}
              helpful={11}/>
            <PcSimpleRow stars={5} name="윤*민" date="2주 전"
              body="견적이 정직해서 신뢰가 갔어요."
              tags={['친절 응대', '깔끔한 마감']}
              helpful={9}/>
          </div>

          <div style={{height: 40}}/>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// DETAIL PAGE (PC)
// =================================================================

const PcDetail = () => {
  const [sel, setSel] = React.useState(0);
  const photos = ['living', 'room', 'balcony', 'night', 'living'];
  return (
    <div className="pc" style={{height: 920}}>
      <PcHeader/>
      <div className="pc-page-head">
        <div className="pc-breadcrumb">홈 › 시공후기 › 프리미엄 리뷰</div>
        <div style={{display:'flex', alignItems:'center', gap:10, marginTop:4}}>
          <span className="pc-badge" style={{
            position:'static',
            background: 'var(--premium-bg)',
            color: 'var(--gold-light)',
            padding: '5px 10px 5px 8px',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}><Crest size={10}/> 프리미엄 리뷰</span>
          <span style={{fontSize:12, color:'var(--ink-3)', fontFamily:'var(--font-mono)'}}>#2891</span>
        </div>
        <div className="pc-page-title" style={{marginTop:8}}>30평대 아파트, 7개소 한 번에 교체했습니다</div>
      </div>

      <div className="pc-body">
        <div className="pc-body-scroll">
          <div className="pc-detail">
            <div className="pc-gallery">
              <div className="pc-gallery-main">
                <Photo kind={photos[sel]}/>
              </div>
              <div className="pc-gallery-strip">
                {photos.map((k, i) => (
                  <div key={i} className={`ph ph-bg-${k} ${i===sel?'sel':''}`}
                    onClick={() => setSel(i)} style={{cursor:'pointer'}}/>
                ))}
              </div>
              <div style={{padding:'18px 24px'}}>
                <div style={{fontSize:13, fontWeight:700, marginBottom:12, letterSpacing:'-0.01em'}}>
                  Before / After
                </div>
                <BeforeAfter/>
              </div>
            </div>

            <div className="pc-detail-side">
              <div className="pc-detail-author-row">
                <div className="pc-pc-avatar">도</div>
                <div>
                  <div className="name">이도윤 <VerifiedMark/></div>
                  <div className="meta">경기 분당 · 시공 7개월차 입주민</div>
                </div>
              </div>

              <div className="pc-detail-stars">
                <Stars value={5} size={22}/>
                <span className="num">5.0</span>
                <span className="date">2026.03.21</span>
              </div>

              <div className="pc-detail-body">
                <p className="lead">이사 들어간 지 8년 된 아파트, 겨울마다 외풍이 심했습니다.</p>
                <p>결정 전 3군데 견적을 받았는데, 청암홈윈도우는 견적 단계부터 디테일이 달랐어요. 기존 창틀의 누수 흔적까지 짚어주시면서 어떤 부분을 보강해야 하는지 설명해주셨습니다.</p>
                <p>시공 당일 오전 9시 도착, 오후 6시 전에 마무리. 정말 하루 완공이었습니다. 거실 통창은 4명이 들어서 올리시는 모습이 인상적이었어요.</p>
                <p>일주일 살아본 결과: 난방 1도 낮춰도 따뜻하고, 옆 동 공사 소음이 거의 안 들립니다. 만족도 100%.</p>
              </div>

              <div className="pc-detail-spec">
                <div className="row"><div className="k">시공 부위</div><div className="v">거실 · 주방 · 안방 · 작은방 2 · 베란다</div></div>
                <div className="row"><div className="k">제품</div><div className="v">KCC 클렌체 240mm 이중창</div></div>
                <div className="row"><div className="k">유리</div><div className="v">로이복층 22mm + 아르곤 가스</div></div>
                <div className="row"><div className="k">사이즈</div><div className="v">통창 3,200×2,400mm 외 6개소</div></div>
                <div className="row"><div className="k">시공일</div><div className="v">2026.03.14 · 1일 완공</div></div>
                <div className="row"><div className="k">보증</div><div className="v">PRESTIGE 15년 무상보증</div></div>
              </div>

              <div className="pc-detail-foot">
                <button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                  도움돼요 <b style={{color:'var(--ink)', marginLeft:2}}>87</b>
                </button>
                <button>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  댓글 12
                </button>
                <button style={{marginLeft:'auto'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  공유하기
                </button>
              </div>
            </div>
          </div>
          <div style={{height: 40}}/>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// TYPE PICKER (PC modal)
// =================================================================

const PcTypePicker = () => (
  <div className="pc" style={{height: 720, background: '#dcd5d0'}}>
    <PcHeader/>
    <div className="pc-modal-back">
      <div className="pc-modal">
        <div className="pc-modal-head">
          <h2>어떤 후기를 남기실래요?</h2>
          <p>간단히 별점만, 아니면 자세한 시공기까지. 편하신 방식으로 남겨주세요.</p>
        </div>
        <div className="pc-type-grid">
          <div className="pc-type-card">
            <div className="head">
              <div className="h-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--star)" stroke="none"><path d="M12 2.5l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.9 3.1 1.1-6.5L2.5 9.4l6.5-.9z"/></svg>
                간편 리뷰
              </div>
              <div className="h-time">약 30초</div>
            </div>
            <div className="h-desc">별점 + 한 줄 후기로 빠르게 남기기</div>
            <div className="feats">
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
            <div className="go">
              간편하게 작성하기
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          <div className="pc-type-card dark">
            <div className="head">
              <div className="h-title"><Crest size={16}/> 프리미엄 리뷰</div>
              <div className="h-time">약 5분</div>
            </div>
            <div className="h-desc">사진과 함께 시공 경험을 자세히 남기기</div>
            <div className="feats">
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
            <div className="go">
              자세히 작성하기
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// =================================================================
// SIMPLE WRITE FORM (PC modal)
// =================================================================

const PcSimpleForm = () => {
  const [score, setScore] = React.useState(5);
  const [tags, setTags] = React.useState(['거실', '단열 만족']);
  const [text, setText] = React.useState('당일 완공도 깜짝 놀랐고, 단열 차이가 확실히 느껴져요!');
  const allTags = ['거실', '주방', '안방', '베란다', '단열 만족', '소음 차단', '깔끔한 마감', '친절 응대', '빠른 시공'];
  const max = 50;
  const [hover, setHover] = React.useState(0);
  const labels = ['', '아쉬워요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'];
  const v = hover || score;

  return (
    <div className="pc" style={{height: 720, background: '#dcd5d0'}}>
      <PcHeader/>
      <div className="pc-modal-back">
        <div className="pc-modal" style={{width: 640}}>
          <div className="pc-modal-head" style={{padding: '28px 36px 20px', textAlign:'left'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <h2 style={{fontSize:20}}>간편 리뷰 작성</h2>
              <span style={{fontSize:12, color:'var(--ink-3)'}}>약 30초 소요</span>
            </div>
            <p style={{marginTop:6}}>별점과 한 줄 후기로 빠르게 남겨주세요</p>
          </div>
          <div style={{padding:'24px 36px 28px', display:'grid', gap:24}}>
            <div className="pc-form-block">
              <label>전체 만족도 <span className="req">*</span></label>
              <div className="pc-star-input">
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" className={i <= v ? 'on' : ''}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                    onClick={() => setScore(i)}>
                    <Star filled={i <= v} size={36}/>
                  </button>
                ))}
                <span className="txt">{labels[v]}</span>
              </div>
            </div>

            <div className="pc-form-block">
              <label>한 줄 후기 <span className="req">*</span><span className="hint">50자 이내</span></label>
              <textarea className="pc-ta" style={{minHeight:80}} value={text}
                onChange={e => setText(e.target.value.slice(0, max))}
                placeholder="시공 후 솔직한 한 줄 후기를 남겨주세요"/>
              <div className="pc-ta-meta">
                <span/>
                <span><b className={text.length > max * 0.9 ? 'warn' : ''}>{text.length}</b> / {max}자</span>
              </div>
            </div>

            <div className="pc-form-block">
              <label>좋았던 부분 <span className="hint">중복 선택 가능</span></label>
              <div className="pc-tag-pick">
                {allTags.map(t => (
                  <button key={t} type="button" className={tags.includes(t) ? 'on' : ''}
                    onClick={() => setTags(tags.includes(t) ? tags.filter(x => x!==t) : [...tags, t])}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pc-write-cta-row">
              <button className="btn-cancel">취소</button>
              <button className="btn-submit" style={{flex:1}}>후기 등록하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// PREMIUM WRITE FORM (PC, magazine layout)
// =================================================================

const PcPremiumForm = () => {
  const [score, setScore] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const v = hover || score;
  const labels = ['', '아쉬워요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'];
  const [parts, setParts] = React.useState(['거실', '안방', '베란다']);
  const allParts = ['거실', '주방', '안방', '작은방', '베란다', '현관', '서재', '드레스룸'];
  const [text, setText] = React.useState(
    "30평대 아파트 전체 창호 교체했습니다. 결정 전 3군데 견적을 받았는데 청암홈윈도우는 견적 단계부터 디테일이 달랐어요. 기존 창틀의 누수 흔적까지 짚어주시면서 어떤 부분을 보강해야 하는지 설명해주셨습니다.\n\n시공 당일 오전 9시 도착, 오후 6시 전에 마무리. 정말 하루 완공이었습니다. 일주일 살아본 결과 난방 1도 낮춰도 따뜻해요."
  );
  const min = 200;

  return (
    <div className="pc" style={{height: 1100}}>
      <PcHeader/>
      <div className="pc-page-head" style={{paddingBottom:20}}>
        <div className="pc-breadcrumb">홈 › 시공후기 › 프리미엄 리뷰 작성</div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div className="pc-page-title" style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{color:'var(--gold)'}}><Crest size={20}/></span>
            프리미엄 리뷰 작성
          </div>
          <div style={{fontSize:13, color:'var(--ink-3)', display:'flex', alignItems:'center', gap:14}}>
            <span>2 / 4 단계</span>
            <div style={{display:'flex', gap:4}}>
              <div style={{width:32, height:3, background:'var(--gold)', borderRadius:2}}/>
              <div style={{width:32, height:3, background:'var(--gold)', borderRadius:2}}/>
              <div style={{width:32, height:3, background:'var(--line)', borderRadius:2}}/>
              <div style={{width:32, height:3, background:'var(--line)', borderRadius:2}}/>
            </div>
          </div>
        </div>
      </div>

      <div className="pc-body">
        <div className="pc-body-scroll">
          <div className="pc-write">
            <div className="pc-write-form">
              <div className="pc-form-block">
                <label>별점 <span className="req">*</span></label>
                <div className="pc-star-input">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" className={i <= v ? 'on' : ''}
                      onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                      onClick={() => setScore(i)}>
                      <Star filled={i <= v} size={36}/>
                    </button>
                  ))}
                  <span className="txt">{labels[v]}</span>
                </div>
              </div>

              <div className="pc-form-block">
                <label>시공 부위 <span className="req">*</span><span className="hint">중복 선택 가능</span></label>
                <div className="pc-tag-pick">
                  {allParts.map(t => (
                    <button key={t} type="button" className={parts.includes(t) ? 'on' : ''}
                      onClick={() => setParts(parts.includes(t) ? parts.filter(x => x!==t) : [...parts, t])}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pc-form-block">
                <label>제품 정보 <span className="req">*</span></label>
                <div style={{display:'grid', gap:10}}>
                  <input className="pc-input" placeholder="제품명 (예: LX Z:IN 슈퍼세이브2 PHC235)" defaultValue="KCC 클렌체 240mm 이중창"/>
                  <div className="pc-input-grid">
                    <input className="pc-input" placeholder="유리 종류" defaultValue="로이복층 22mm + 아르곤"/>
                    <input className="pc-input" placeholder="시공 개소" defaultValue="7개소"/>
                  </div>
                  <div className="pc-input-grid">
                    <input className="pc-input" placeholder="대표 사이즈 (mm)" defaultValue="3,200 × 2,400"/>
                    <input className="pc-input" placeholder="시공 일자" defaultValue="2026.03.14"/>
                  </div>
                </div>
              </div>

              <div className="pc-form-block">
                <label>사진 첨부 <span className="req">*</span><span className="hint">최소 3장 · Before/After 권장</span></label>
                <div className="pc-photo-grid">
                  <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#d4ddc8 0 6px,#c5cfb8 6px 12px)'}}>
                    <span className="ba">BEFORE</span>
                    <span className="star-cover">대표</span>
                    <span className="x">×</span>
                  </div>
                  <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#c8d4dc 0 6px,#b4c0c8 6px 12px)'}}>
                    <span className="ba">AFTER</span>
                    <span className="x">×</span>
                  </div>
                  <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#e8d8c0 0 6px,#d8c8b0 6px 12px)'}}>
                    <span className="x">×</span>
                  </div>
                  <div className="slot filled" style={{background:'repeating-linear-gradient(135deg,#efeae0 0 6px,#e0d8c8 6px 12px)'}}>
                    <span className="x">×</span>
                  </div>
                  <div className="slot">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <span>4 / 10</span>
                  </div>
                  <div className="slot">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    <span>영상 추가</span>
                  </div>
                </div>
              </div>

              <div className="pc-form-block">
                <label>상세 후기 <span className="req">*</span><span className="hint">200자 이상</span></label>
                <textarea className="pc-ta" value={text} onChange={e => setText(e.target.value)}
                  placeholder="시공 결정 이유, 진행 과정, 완성 후 만족도 등을 자유롭게 적어주세요"/>
                <div className="pc-ta-meta">
                  <span>{text.length < min ? `아직 ${min - text.length}자 더 필요해요` : '✓ 충분한 길이입니다'}</span>
                  <span><b className={text.length < min ? 'warn' : ''}>{text.length}</b> / 최소 {min}자</span>
                </div>
              </div>

              <div className="pc-write-cta-row">
                <button className="btn-cancel">이전 단계</button>
                <button className="btn-submit btn-premium-submit" style={{flex:1}}>
                  <Crest size={12}/>
                  다음 단계로 진행
                </button>
              </div>
            </div>

            <div className="pc-write-side">
              <h4>미리보기</h4>
              <div className="preview-card">
                작성하시는 내용이 이렇게 노출됩니다.<br/><br/>
                · 별점, 시공 부위 태그<br/>
                · 대표 사진 (Before/After)<br/>
                · 본문 첫 3줄 요약<br/>
                · 제품명 · 시공일
              </div>

              <div className="pc-write-tips">
                <b>좋은 후기 작성 가이드</b>
                · 시공 전 어떤 문제가 있었나요?<br/>
                · 청암홈윈도우를 선택한 이유는?<br/>
                · 시공 과정 중 인상적이었던 점은?<br/>
                · 사용해보니 어떤 점이 달라졌나요?
              </div>

              <div style={{marginTop:18, padding:'14px 16px', background:'var(--bg)', borderRadius:10, fontSize:12, color:'var(--ink-3)', lineHeight:1.6}}>
                작성하신 내용은 자동 저장되며, 임시저장 후 나중에 이어서 작성하실 수 있습니다.
              </div>
            </div>
          </div>
          <div style={{height: 40}}/>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  PcList, PcDetail, PcTypePicker, PcSimpleForm, PcPremiumForm
});
