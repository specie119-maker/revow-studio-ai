# 🎭 FaceCast Studio

> 사진 몇 장만 올리면 **얼굴을 학습**하고, 똑같은 얼굴로 **인플루언서/크리에이터용 컨텐츠 영상**을 만들어 주는 풀스택 웹앱.
> Powered by [Higgsfield](https://higgsfield.ai) (Soul 캐릭터 학습 + 영상 생성).

<br/>

## ✨ 핵심 흐름

```
사진 업로드  →  얼굴(Soul 캐릭터) 학습  →  스타일 선택  →  AI 영상 생성  →  갤러리에서 저장
```

1. **얼굴 학습** — 정면·각도 사진 3~5장을 올리면 AI가 얼굴 특징을 학습해 "재사용 가능한 캐릭터"를 만듭니다.
2. **영상 생성** — 학습된 얼굴을 골라 프리셋(시네마틱/패션/뷰티/댄스 등) + 추가 연출 + 비율(9:16/1:1/16:9)을 선택하면 동일 얼굴의 컨텐츠 영상이 생성됩니다.
3. **갤러리** — 생성된 영상이 실시간 진행률과 함께 모이고, 완료되면 바로 재생·다운로드.

<br/>

## 🚀 실행

```bash
npm install
cp .env.example .env     # (선택) Higgsfield 키 입력
npm run dev              # http://localhost:3000
```

> 키 없이 바로 실행해도 됩니다. → **데모 모드**로 전체 UX가 그대로 동작하며 샘플 영상으로 결과를 보여줍니다.

프로덕션 빌드:

```bash
npm run build && npm start
```

<br/>

## 🔑 Higgsfield 연동 (실제 생성 켜기)

공식 SDK [`@higgsfield/client`](https://github.com/higgsfield-ai/higgsfield-js)를 사용합니다.
데모 모드를 끄고 진짜 얼굴 학습/영상 생성을 하려면:

1. <https://cloud.higgsfield.ai> 접속 → 로그인
2. **API Keys** 메뉴 → 새 키 발급 → **키 ID**와 **시크릿** 두 값을 복사
3. **Billing** 메뉴에서 크레딧 충전 (테스트는 소액이면 충분)
4. `.env`에 입력:
   ```bash
   HF_CREDENTIALS=키ID:시크릿
   ```
5. 서버 재시작 → 상단 "데모 모드" 배지가 사라지고 실제 호출로 전환됩니다.

> 생성당 과금(이미지 ~$0.12, 영상 ~$0.16–0.70). 요금은 [pricing](https://higgsfield.ai/pricing) 참고.

### 실연동 파이프라인 (코드: [`src/lib/higgsfield.ts`](src/lib/higgsfield.ts))

```
얼굴 학습 :  uploadImage(사진들) → createSoulId({input_images})        ⇒ Soul ID
영상 생성 :  subscribe('higgsfield-ai/soul/standard',
                       { custom_reference_id: Soul ID, prompt, ... })   ⇒ 장면 이미지(얼굴 일관성)
            subscribe('higgsfield-ai/dop/preview',
                       { model:'dop-turbo', input_images:[장면 이미지] }) ⇒ 최종 영상
```

- `custom_reference_id` = 학습된 Soul ID → 새로운 장면/의상에서도 **같은 얼굴** 유지
- Soul ID가 아직 없으면 업로드 사진을 `image_reference`로 직접 참조(폴백)
- 모델/품질을 바꾸려면 [`higgsfield.ts`](src/lib/higgsfield.ts) 상단의 `SOUL_MODEL` / `DOP_MODEL` /
  `DOP_VARIANT`(lite·turbo·standard) 상수만 수정

> ⚠️ 모델 `model_id`·일부 input 필드는 플랜/모델에 따라 다를 수 있어요. 키 발급 후 각 모델의
> **Playground** 화면에서 정확한 요청 형식을 한 번 확인하면 가장 안전합니다.

### 대안: MCP 연동

Higgsfield는 공식 **MCP 서버**(`https://mcp.higgsfield.ai/mcp`, API 키 불필요·계정 OAuth)도
제공합니다. Claude Code 등 에이전트에서 바로 쓰려면 커스텀 커넥터로 이 URL을 추가하세요.
(개인용/에이전트 흐름에 적합. 멀티유저 SaaS 백엔드에는 위의 Cloud API 키 방식을 권장.)

<br/>

## 🏗 구조

```
src/
  app/
    page.tsx                  메인 (스텝 흐름·폴링 오케스트레이션)
    layout.tsx                폰트·오로라 배경
    globals.css               디자인 시스템(글래스/그라데이션/애니메이션)
    api/
      meta/route.ts           데모 모드 여부
      characters/route.ts     얼굴 학습 시작 / 목록
      characters/[id]/route.ts  학습 상태 폴링
      generate/route.ts       영상 생성 시작 / 목록
      jobs/[id]/route.ts      생성 상태 폴링
  lib/
    higgsfield.ts             ⭐ Higgsfield 연동 (실연동 + 데모 폴백)
    store.ts                  인메모리 저장소 (운영 시 DB로 교체)
    types.ts / presets.ts / client.ts
  components/
    UploadStep · GenerateStep · Gallery · TrainingCard · ui
```

<br/>

## 🧭 다음 단계 (운영 전환 시)

- [ ] 인메모리 `store.ts` → Postgres/Prisma 등 DB로 교체 (재시작해도 유지)
- [ ] 사용자 인증 + 캐릭터/영상 소유권 분리
- [ ] 업로드 이미지 → S3/R2 등 오브젝트 스토리지 저장
- [ ] 크레딧/결제 연동 (생성당 과금 추적)
- [ ] 폴링 → webhook 또는 SSE로 전환
- [ ] 동의·신원 확인 등 **얼굴 사용 동의** 정책 강화

<br/>

## ⚖️ 안전·윤리

본인 또는 **명시적 사용 동의를 받은 인물**의 사진만 사용하세요. 타인의 얼굴을 무단으로
학습·생성하는 행위(딥페이크 악용)는 금지되며, 서비스 운영 시 동의 확인 절차를 두는 것을 강력히 권장합니다.
