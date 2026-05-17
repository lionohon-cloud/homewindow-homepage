// app.jsx — wires all screens into the design canvas with tweaks

const {
  DesignCanvas, DCSection, DCArtboard,
  TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle,
  ListA, ListB, DetailA, TypePickerA, SimpleForm, PremiumForm,
  PcList, PcDetail, PcTypePicker, PcSimpleForm, PcPremiumForm,
  EventSectionPC, EventSectionMobile,
} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scoreType": "stars",
  "photoLayout": "g-3",
  "showPremiumPromo": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return (
    <>
      <DesignCanvas>
        <DCSection id="event" title="홈페이지 이벤트 섹션 (NEW)" subtitle="릴레이 할인 — 후기 작성 인센티브 중심으로 재구성">
          <DCArtboard id="event-pc" label="PC · 릴레이 할인 섹션" width={1280} height={1320}>
            <EventSectionPC/>
          </DCArtboard>
          <DCArtboard id="event-mobile" label="모바일 · 릴레이 할인 섹션" width={375} height={1280}>
            <EventSectionMobile/>
          </DCArtboard>
        </DCSection>

        <DCSection id="list" title="리뷰 목록 페이지" subtitle="간편/프리미엄 리뷰가 함께 노출되는 시공 후기 메인">
          <DCArtboard id="list-a" label="A · 탭 분리 + 점수 분포" width={375} height={760}>
            <ListA tweaks={t}/>
          </DCArtboard>
          <DCArtboard id="list-b" label="B · 통합 피드 + 포토 스트립" width={375} height={760}>
            <ListB tweaks={t}/>
          </DCArtboard>
        </DCSection>

        <DCSection id="detail" title="리뷰 상세 페이지" subtitle="프리미엄 리뷰의 풀 디테일 뷰">
          <DCArtboard id="detail-a" label="프리미엄 리뷰 상세" width={375} height={760}>
            <DetailA/>
          </DCArtboard>
        </DCSection>

        <DCSection id="picker" title="작성 진입 화면" subtitle="간편/프리미엄 선택 분기">
          <DCArtboard id="pick-a" label="A · 듀얼 카드 (소요 시간 표기)" width={375} height={760}>
            <TypePickerA/>
          </DCArtboard>
        </DCSection>

        <DCSection id="simple" title="간편 리뷰 작성 폼" subtitle="별점 + 한 줄 코멘트 + 태그 (50자)">
          <DCArtboard id="simple-a" label={`A · ${t.scoreType === 'stars' ? '별점 5단계' : t.scoreType === 'points' ? '10점 척도' : '만족도 이모지'}`} width={375} height={760}>
            <SimpleForm tweaks={t}/>
          </DCArtboard>
        </DCSection>

        <DCSection id="premium" title="프리미엄 리뷰 작성 폼" subtitle="200자+ 본문, Before/After, 사진 3장+, 동영상, 제품 정보">
          <DCArtboard id="premium-a" label="A · 다크 / 4단계 스텝" width={375} height={760}>
            <PremiumForm tweaks={t}/>
          </DCArtboard>
        </DCSection>

        <DCSection id="pc-list" title="[PC] 리뷰 목록 페이지" subtitle="데스크탑 1280px — 점수 분포 + 프리미엄 그리드 + 간편 리스트">
          <DCArtboard id="pc-list-a" label="PC · 통합 페이지" width={1280} height={880}>
            <PcList/>
          </DCArtboard>
        </DCSection>

        <DCSection id="pc-detail" title="[PC] 리뷰 상세 페이지" subtitle="갤러리 좌측 + 본문/스펙 우측의 매거진형 레이아웃">
          <DCArtboard id="pc-detail-a" label="PC · 프리미엄 리뷰 상세" width={1280} height={920}>
            <PcDetail/>
          </DCArtboard>
        </DCSection>

        <DCSection id="pc-picker" title="[PC] 작성 진입" subtitle="모달 형식으로 간편/프리미엄 분기">
          <DCArtboard id="pc-pick" label="PC · 타입 선택 모달" width={1280} height={720}>
            <PcTypePicker/>
          </DCArtboard>
        </DCSection>

        <DCSection id="pc-simple" title="[PC] 간편 리뷰 작성" subtitle="컴팩트 모달 — 별점 + 한 줄 + 태그">
          <DCArtboard id="pc-simple" label="PC · 간편 작성 모달" width={1280} height={720}>
            <PcSimpleForm/>
          </DCArtboard>
        </DCSection>

        <DCSection id="pc-premium" title="[PC] 프리미엄 리뷰 작성" subtitle="좌 폼 + 우 사이드 (미리보기 · 작성 가이드)">
          <DCArtboard id="pc-premium" label="PC · 프리미엄 작성 페이지" width={1280} height={1100}>
            <PcPremiumForm/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="간편 리뷰 점수 방식"/>
        <TweakRadio value={t.scoreType}
          options={[
            { value: 'stars', label: '별점' },
            { value: 'points', label: '10점' },
            { value: 'sat', label: '만족도' },
          ]}
          onChange={(v) => setTweak('scoreType', v)}/>

        <TweakSection label="프리미엄 리뷰 사진 그리드"/>
        <TweakRadio value={t.photoLayout}
          options={[
            { value: 'g-3', label: '히어로형' },
            { value: 'g-mosaic', label: '모자이크' },
          ]}
          onChange={(v) => setTweak('photoLayout', v)}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
