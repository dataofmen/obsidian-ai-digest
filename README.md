# Obsidian AI Digest 플러그인 (한글)

AI를 통해 일일 노트와 스크랩을 자동 요약하고, 지식 그래프와 내러티브로 연결하여 제공하는 Obsidian 플러그인입니다.

## ✨ 새로운 기능 (v1.1.0)
- **🗺️ 지식 맵 (Knowledge Map)**: 수집된 정보들의 핵심 개념을 Mermaid 다이어그램으로 시각화하여 보여줍니다.
- **📅 스마트 날짜 선택 (Smart Date Selection)**: 파일이 존재하는 날짜만 드롭다운으로 편리하게 선택할 수 있습니다.
- **🌐 이중 언어 지원**: 한국어 요약을 기본으로 하되, 주요 용어는 영어를 병기하여(예: `생성형 AI (Generative AI)`) 학습 효율을 높입니다.
- **📚 소스 요약**: 다이제스트 하단에 각 문서별 3줄 요약을 별도로 제공하여 원본 맥락을 쉽게 파악할 수 있습니다.

![Smart Date Selection](https://github.com/dataofmen/obsidian-ai-digest/raw/main/assets/smart-date-selection.png) *(예시 이미지)*

---

## 주요 기능

### 1. 🤖 자동 요약기 (Auto-Summarizer)
- `Target Folder` (기본: `In Box`)에 새로운 마크다운 파일이 생기면 자동으로 감지합니다.
- AI(OpenAI 또는 Anthropic)를 사용하여 내용을 4가지 핵심 섹션으로 요약합니다:
    - **한 줄 요약**
    - **핵심 질문 3가지**
    - **핵심 개념 (Key Concepts)**
    - **액션 아이템**
- **스마트 자르기**: 긴 텍스트의 경우, 요약에 필요한 핵심 부분(초반/후반)만 추출하여 API 비용을 효율적으로 관리합니다.

### 2. 🧠 일간 인사이트 다이제스트 (Daily Insight Digest)
- 선택한 날짜에 생성된 모든 노트를 통합 분석하여 하나의 리포트를 생성합니다.
- **지식 맵**: 개념 간의 연결 고리를 시각화합니다.
- **연결과 패턴**: 서로 다른 노트들 사이의 숨겨진 연관성을 찾아냅니다.
- **새로운 아이디어**: 결합된 지식에서 도출될 수 있는 새로운 아이디어를 제안합니다.

---

## 설치 방법

1. [Releases](https://github.com/dataofmen/obsidian-ai-digest/releases) 페이지에서 최신 `main.js`, `manifest.json`, `styles.css` 파일을 다운로드합니다.
2. 당신의 볼트 내 `.obsidian/plugins/` 경로에 `obsidian-ai-digest` 폴더를 만듭니다.
3. 다운로드한 파일들을 해당 폴더로 옮깁니다.
4. Obsidian을 재시작하거나 "Community Plugins" 설정에서 플러그인을 새로고침한 뒤 활성화합니다.

## 설정 방법

1. **설정(Settings)** -> **Obsidian AI Digest**로 이동합니다.
2. **API Key**: 사용하실 OpenAI (`sk-...`) 또는 Anthropic (`sk-ant-...`) API 키를 입력합니다.
    - [Test Connection] 버튼으로 키가 정상 작동하는지 바로 확인할 수 있습니다.
3. **AI Provider**: OpenAI (기본) 또는 Anthropic을 선택합니다.
4. **Target Folder**: 감시할 폴더명을 선택합니다 (기본: `In Box`).
5. **Digest Folder**: 일간 다이제스트가 저장될 폴더를 선택합니다 (기본: `Daily Notes`).

## 사용 방법

### 자동 요약 (Auto-Summarization)
1. `Target Folder`에 텍스트나 기사를 복사해서 넣으세요.
2. 약 5초 후, 문서의 맨 아래에 `## 💡 AI 요약` 섹션이 자동으로 추가됩니다.

### 수동 요약 (Manual Summarization)
- 파일을 열고 명령어 창(`Cmd+P`)에서 `Obsidian AI Digest: Summarize Current File`을 실행하세요.

### 다이제스트 생성 (Generate Digest)
1. 명령어 창에서 `Obsidian AI Digest: Generate Daily Digest (Select Date)`를 실행합니다.
2. 팝업창(스마트 드롭다운)에서 원하는 날짜를 선택합니다. 파일 개수가 함께 표시됩니다.
    - 예: `2025-12-25 (5 files)`
3. 잠시 후 `Digest Folder`에 새로운 인사이트 리포트가 생성됩니다.

---

## 개발 (Development)
- `npm install`
- `npm run dev` (변경 사항 실시간 감지)
- `npm run build` (배포용 빌드)

## 라이선스
MIT License
