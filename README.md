# Obsidian AI Digest 플러그인 (한글)

새로운 클리핑 문서를 자동으로 요약하고, 이를 엮어 매일의 지식 내러티브(다이제스트)를 생성해주는 플러그인입니다.

## 주요 기능

### 1. 🤖 자동 요약기 (Auto-Summarizer)
- `In Box` 폴더에 새로운 마크다운 파일이 생기면 자동으로 감지합니다.
- AI(OpenAI 또는 Anthropic)를 사용하여 내용을 4가지 핵심 섹션으로 요약합니다:
    - **한 줄 요약**
    - **핵심 질문 3가지**
    - **핵심 개념** (Key Concepts)
    - **액션 아이템**
- **스마트 자르기**: 긴 텍스트의 경우 자동으로 앞뒤 내용만 추출하여 API 비용을 절약합니다.

### 2. 📰 일간 내러티브 다이제스트 (Daily Narrative Digest)
- 어제 스크랩한 모든 문서들의 요약을 엮어, 우연한 연결(Serendipity)을 발견할 수 있는 하나의 에세이로 만들어줍니다.
- 서로 관련 없어 보이는 주제들 사이의 숨겨진 연결고리를 찾아줍니다.
- **실행**: 명령어 창에서 `Obsidian AI Digest: Generate Daily Digest (Yesterday)`를 실행하세요.

---

## 설치 방법

1. `main.js`, `manifest.json`, `styles.css` 파일을 다운로드합니다.
2. 당신의 볼트 내 `.obsidian/plugins/` 경로에 `obsidian-ai-digest` 폴더를 만듭니다.
3. 다운로드한 파일들을 해당 폴더로 옮깁니다.
4. Obsidian을 재시작하거나 "Community Plugins" 설정에서 플러그인을 새로고침한 뒤 활성화합니다.

## 설정 방법

1. **설정(Settings)** -> **Obsidian AI Digest**로 이동합니다.
2. **API Key**: 사용하실 OpenAI (`sk-...`) 또는 Anthropic (`sk-ant-...`) API 키를 입력합니다.
3. **AI Provider**: 사용하실 AI 제공업체를 선택합니다.
4. **Target Folder**: 감시할 폴더명을 입력합니다 (기본값: `In Box`).
    - *주의*: 이 폴더에 파일이 생성되어야 AI가 동작합니다.
5. **Digest Folder**: 일간 다이제스트가 저장될 폴더를 지정합니다 (기본값: `Daily Notes`).

## 사용 방법

### 자동 요약 (Auto-Summarization)
1. `In Box` 폴더에 텍스트나 기사를 복사해서 넣으세요.
2. 약 5초간 기다립니다.
3. 문서의 맨 아래에 `## 💡 AI 요약` 섹션이 자동으로 추가됩니다.

### 수동 요약 (Manual Summarization)
- 아무 파일이나 열고 명령어 창(`Cmd+P`)에서 `Obsidian AI Digest: Summarize Current File`을 실행하세요.

### 일간 다이제스트 생성 (Generating Daily Digest)
- 명령어 창에서 `Obsidian AI Digest: Generate Daily Digest (Yesterday)`를 실행하세요.
- 어제 요약된 모든 문서들을 모아 `Daily Notes` 폴더에 새로운 내러티브 노트를 생성합니다.

---

## 개발 (Development)
- `npm install`
- `npm run dev` (변경 사항 실시간 감지)
- `npm run build` (배포용 빌드)
