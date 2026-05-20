# WP AI 블로그 생성기

키워드 하나로 SEO 최적화 WordPress 블로그 글을 자동 생성하는 도구입니다.

## 주요 기능

- **키워드 분석**: 연관 키워드 추천 및 글 유형 자동 분류 (정보성 / 비교형 / 이슈분석)
- **SEO 최적화 제목**: 5개의 제목 후보 생성 (SEO 점수 포함)
- **자동 아웃라인**: H2/H3 계층 구조의 아웃라인 생성 및 드래그&드롭 편집
- **본문 자동 작성**: 글 유형별 맞춤형 프롬프트로 2,000자 이상 본문 생성
- **SEO 메타 정보**: 메타디스크립션, 태그, URL 슬러그 자동 생성
- **DALL-E 3 썸네일**: 1792×1024 고품질 썸네일 이미지 자동 생성
- **WordPress 발행**: REST API로 바로 발행 또는 임시저장
- **SEO 체크리스트**: 발행 전 6가지 SEO 요소 자동 점검

## 설치 방법

### 1. 의존성 설치

```bash
cd wp-ai-blog
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 열고 다음 값을 입력하세요:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
WP_URL=https://your-wordpress-site.com
WP_USERNAME=your_wp_username
WP_APP_PASSWORD=your_wp_application_password
```

#### 환경변수 발급 방법

- **ANTHROPIC_API_KEY**: [Anthropic Console](https://console.anthropic.com) → API Keys
- **OPENAI_API_KEY**: [OpenAI Platform](https://platform.openai.com) → API keys
- **WP_APP_PASSWORD**: WordPress 관리자 → 사용자 → 프로필 → 애플리케이션 비밀번호 생성

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

## 사용 방법

### Step 1: 키워드 입력
- 메인 페이지에서 키워드를 입력하고 "글 생성 시작" 버튼 클릭
- 10단계 자동 파이프라인이 순서대로 실행됩니다

### Step 2: 제목 선택
- AI가 생성한 5개의 SEO 최적화 제목 중 하나를 선택하거나 직접 입력
- 각 제목의 SEO 점수 확인 가능

### Step 3: 에디터
- **아웃라인 탭**: H2/H3 섹션을 드래그&드롭으로 재배치, 수정, 추가
- **본문 탭**: 마크다운 에디터로 직접 편집 또는 미리보기
- **SEO 탭**: 메타디스크립션, 슬러그, 태그 편집
- **썸네일 탭**: AI 생성 썸네일 확인 및 재생성

### Step 4: 발행
- SEO 체크리스트 6가지 항목 자동 점검
- "임시저장" 또는 "즉시발행" 선택

## 프로젝트 구조

```
wp-ai-blog/
├── app/
│   ├── page.tsx              # Step 1: 키워드 입력 & 파이프라인
│   ├── titles/page.tsx       # Step 2: 제목 선택
│   ├── editor/page.tsx       # Step 3: 에디터
│   ├── publish/page.tsx      # Step 4: 발행
│   ├── drafts/page.tsx       # 임시저장 목록
│   ├── settings/page.tsx     # 설정 & WP 연결 점검
│   ├── layout.tsx            # 공통 레이아웃
│   └── api/                  # API 라우트
│       ├── keywords/suggest  # 연관 키워드 추천
│       ├── keywords/analyze  # 키워드 분석
│       ├── titles/generate   # SEO 제목 생성
│       ├── outline/generate  # 아웃라인 생성
│       ├── content/generate  # 본문 생성
│       ├── seo/generate      # 메타 정보 생성
│       ├── image/generate    # DALL-E 3 썸네일
│       ├── wordpress/check   # WP 연결 점검
│       ├── wordpress/publish # WP 발행
│       └── drafts            # 임시저장 CRUD
├── components/
│   ├── OutlineEditor.tsx     # 드래그&드롭 아웃라인 편집기
│   ├── MarkdownEditor.tsx    # 마크다운 에디터
│   ├── ThumbnailPreview.tsx  # 썸네일 미리보기
│   ├── SeoChecklist.tsx      # SEO 체크리스트 모달
│   ├── WpConnectionChecker.tsx # WP 연결 점검 UI
│   ├── StepIndicator.tsx     # 파이프라인 진행 상태
│   └── ProgressBar.tsx       # 진행 바
├── lib/
│   ├── claude.ts             # Anthropic SDK 래퍼
│   ├── openai.ts             # OpenAI DALL-E 3 래퍼
│   ├── wordpress.ts          # WordPress REST API
│   ├── db.ts                 # JSON 기반 임시저장 DB
│   └── types.ts              # 공통 타입 & sessionStorage 헬퍼
└── .env.local                # 환경변수 (gitignore됨)
```

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **AI (텍스트)**: Anthropic Claude Sonnet 4.6
- **AI (이미지)**: OpenAI DALL-E 3
- **CMS**: WordPress REST API
- **Editor**: @uiw/react-md-editor
- **DnD**: @hello-pangea/dnd
- **Markdown**: react-markdown + remark-gfm

## 빌드

```bash
npm run build
npm start
```
