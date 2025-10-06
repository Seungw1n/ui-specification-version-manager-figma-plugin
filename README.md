# Claude Code to Figma Plugin

Figma에서 와이어프레임 UI 구조를 읽어온 후, Claude Code로 UI 정의서를 작성하고, 다시 Figma에 적용하는 자동화 플러그인 프로젝트입니다.

## 개요

이 프로젝트는 UI 정의서 작성 프로세스를 자동화하기 위한 Figma 플러그인과 Claude Code 연동 시스템입니다. Figma의 와이어프레임에서 구조를 추출하고, Claude Code를 활용해 상세한 UI Description을 생성한 후, 다시 Figma에 자동으로 적용하는 워크플로우를 제공합니다.

### 주요 특징

- **양방향 연동**: Figma ↔ Claude Code
- **구조화된 데이터 추출**: 와이어프레임의 계층 구조와 텍스트 정보를 JSON으로 변환
- **자동 Description 생성**: Claude Code를 통한 체계적인 UI 정의서 작성
- **일괄 적용**: JSON 형태의 Description을 Figma 프레임에 자동 입력
- **표준화된 양식**: DESCRIPTION_TEMPLATE.md와 DESCRIPTION_STYLE_GUIDE.md 기반의 일관된 작성 규칙

## 프로젝트 구조

```
claude-code-talk-to-figma-plugin/
├── manifest.json                    # Figma 플러그인 설정 파일
├── code.js                         # Figma 플러그인 메인 로직
├── ui.html                         # Figma 플러그인 UI
├── create-description.js           # Description JSON 생성 모듈
├── claude-description-helper.js    # Claude Code 연동 헬퍼 함수들
├── DESCRIPTION_TEMPLATE.md         # Description JSON 표준 템플릿
├── DESCRIPTION_STYLE_GUIDE.md      # 작성 스타일 가이드라인
├── temp/                           # 임시 파일 저장소
└── ui-description/                 # 예시 프로젝트들
    ├── test-project-1-sampleAdmin/
    ├── test-project-2-designedAdmin/
    └── description_examples/
```

## 설치 방법

### 1. 프로젝트 다운로드
```bash
git clone <repository-url>
```

### 2. Figma 플러그인 설치

#### 개발 모드로 설치:
1. Figma Desktop 애플리케이션 실행
2. `Plugins` → `Development` → `Import plugin from manifest...` 선택
3. 프로젝트 폴더의 `manifest.json` 파일 선택
4. 플러그인이 개발 플러그인 목록에 추가됨

#### 플러그인 실행:
1. Figma 파일에서 `Plugins` → `Development` → `Apply Content from JSON` 선택
2. 플러그인 UI가 실행됨

### 3. Node.js 모듈 설치 (선택사항)
Claude Code와 연동하여 자동화 스크립트를 사용하려는 경우:

```bash
npm install
```

## 사용법

### 1단계: Figma에서 와이어프레임 구조 추출

#### 선택한 프레임 구조 저장:
1. Figma에서 와이어프레임 프레임 선택
2. 플러그인 실행 후 "선택한 wireframe 구조 저장하기" 버튼 클릭
3. 개별 JSON 파일이 다운로드됨

#### 모든 와이어프레임 구조 저장:
1. 플러그인에서 "모든 wireframe 구조 저장하기" 버튼 클릭
2. 페이지 내 "wireframe"이 포함된 모든 프레임의 구조를 ZIP 파일로 다운로드

**출력 파일 형태:**
```json
{
  "fileName": "테스트 관리관리자",
  "pageName": "v1.0.0", 
  "frameName": "02-03-00_wireframe_v1.4.5",
  "timestamp": "2025-09-01T07:30:00.000Z",
  "structure": {
    "name": "02-03-00_wireframe_v1.4.5",
    "type": "FRAME",
    "layers": [
      {
        "name": "navigation_bar",
        "type": "FRAME",
        "depth": 1,
        "children": 3
      },
      {
        "name": "ADMIN",
        "type": "TEXT",
        "currentText": "ADMIN",
        "depth": 2
      }
      // ... 더 많은 레이어 정보
    ]
  }
}
```

### 2단계: Claude Code로 Description 생성

#### 수동 방식:
1. 추출된 와이어프레임 구조 JSON 파일을 Claude Code에서 분석
2. DESCRIPTION_STYLE_GUIDE.md의 가이드라인에 따라 Description 작성
3. DESCRIPTION_TEMPLATE.md 양식에 맞춰 JSON 생성

#### 자동화 스크립트 사용:
```bash
# 특정 파일로 Description 생성
node create-description.js <와이어프레임파일경로>

# 폴더에서 파일 찾아서 생성  
node claude-description-helper.js folder <폴더경로> [프레임명]

# 가장 최근 파일로 생성
node claude-description-helper.js latest [검색경로]

# 구조화된 경로로 생성
node claude-description-helper.js path <프로젝트명> <페이지명> <프레임명>
```

**생성되는 Description JSON 예시:**
```json
{
  "metadata": {
    "fileName": "테스트 관리관리자",
    "pageName": "v1.0.0",
    "categoryNumber": "02",
    "version": "v1.0.0",
    "createdAt": "2025-09-01T07:30:00.000Z",
    "updatedAt": "2025-09-01",
    "sourceWireframes": ["02-03-00_wireframe_v1.4.5.json"]
  },
  "screens": {
    "02-03-00_description_v1.0.0": {
      "title": "관리자 웹사이트",
      "outline": "Flow 데이터 관리를 위한 관리자 대시보드 화면입니다.",
      "elements": {
        "1": {
          "content": "[내비게이션 바] 상단 고정 헤더\n- ADMIN 로고 표시\n- Flow 메뉴 링크"
        },
        "2": {
          "content": "[페이지네이션] 상단 페이지 번호 네비게이션\n- 페이지 번호: 1, 2, 3, 4, 5\n- 현재 페이지 하이라이트"
        }
      }
    }
  }
}
```

### 3단계: Figma에 Description 적용

1. 생성된 Description JSON 내용을 복사
2. Figma 플러그인의 "Description JSON 파일 붙여넣기" 텍스트영역에 붙여넣기
3. "Description 일괄 적용하기" 버튼 클릭
4. Figma에서 자동으로 Description 프레임들이 생성되고 내용이 입력됨

**자동 생성되는 Figma 구조:**
```
📁 [화면ID]_description_[버전] (description frame)
  ├── 📄 title (텍스트)
  ├── 📄 outline (텍스트)
  ├── 📄 updatedAt (텍스트)
  └── 📁 elements (컨테이너 프레임)
      ├── 📁 element-1 (element 프레임)
      │   ├── 📄 number (텍스트: "1", 초록색, 16px)
      │   └── 📄 content (텍스트: elements.1.content, 16px)
      ├── 📁 element-2 (element 프레임)
      └── ... (JSON의 elements 개수만큼 자동 생성)
```

## 주요 기능

### Figma 플러그인 기능

#### 구조 읽기:
- 선택된 프레임의 계층 구조 추출
- 모든 와이어프레임 일괄 추출
- TEXT, FRAME, GROUP, RECTANGLE, ELLIPSE, VECTOR 타입 지원
- 중첩 깊이(depth) 정보 포함

#### Description 적용:
- JSON 기반 일괄 텍스트 업데이트
- 자동 프레임 구조 생성
- 폰트 자동 로드 (Roboto Regular)
- 기존 프레임 재사용 또는 신규 생성

### Claude Code 연동

#### 헬퍼 함수들:
- `findAndCreateDescription()`: 폴더에서 와이어프레임 파일 검색 후 Description 생성
- `createDescriptionFromPath()`: 구조화된 경로로 Description 생성
- `createDescriptionFromLatest()`: 가장 최근 수정된 파일로 Description 생성
- `createDescriptionFromWireframe()`: 특정 와이어프레임 파일로 Description 생성

#### 표준화 도구:
- **DESCRIPTION_TEMPLATE.md**: JSON 구조 표준 규격 정의
- **DESCRIPTION_STYLE_GUIDE.md**: 작성 스타일 및 품질 기준 제시

## 파일명 규칙

### 와이어프레임 파일:
- 형식: `{화면ID}_wireframe_{버전}.json`
- 예시: `02-03-00_wireframe_v1.4.5.json`

### Description 파일:
- 형식: `{카테고리번호}_description_{버전}.json`
- 예시: `02_description_v1.0.0.json`

### ZIP 파일:
- 형식: `{파일명}_{페이지명}_v{날짜}.zip`
- 예시: `테스트 관리관리자_v1.0.0_v2025-09-01.zip`

## 문제 해결

### 일반적인 오류들:

#### "프레임을 선택해주세요!" 오류:
- Figma에서 FRAME 타입의 객체를 선택했는지 확인
- 여러 프레임을 동시에 선택 가능

#### "일치하는 description 프레임을 찾을 수 없습니다." 오류:
- JSON의 screens 키와 Figma의 프레임 이름이 정확히 일치하는지 확인
- 프레임 이름에 특수문자나 공백이 포함되어 있는지 확인

#### ZIP 파일 생성 실패:
- JSZip 라이브러리 로딩 확인 (ui.html의 CDN 링크)
- 개별 파일 다운로드로 자동 fallback 실행됨

#### 폰트 로딩 오류:
- Figma 플러그인에서 Roboto 폰트 자동 로드 시도
- 실패 시 기본 폰트로 대체

### 디버깅 모드:
브라우저 개발자 도구의 콘솔에서 상세한 로그 확인 가능:
- 구조 읽기 과정 로그
- ZIP 파일 생성 과정 로그
- Description 적용 과정 로그

## 고급 사용법

### 배치 처리:
여러 프로젝트의 와이어프레임을 일괄 처리하려면:

```bash
# 여러 폴더를 순회하면서 Description 생성
for folder in ui-description/*/v*.*.*; do
  node claude-description-helper.js folder "$folder"
done
```

### 커스텀 스타일 적용:
ui.html 파일의 스타일 섹션을 수정하여 플러그인 UI 커스터마이징 가능

### 확장된 노드 타입 지원:
code.js의 `collectLayers` 함수에서 새로운 Figma 노드 타입 추가 가능

## 기여하기

1. 이슈 리포팅: 버그나 개선사항 발견 시 이슈 등록
2. 문서 개선: README.md, DESCRIPTION_STYLE_GUIDE.md 등 문서 업데이트
3. 기능 추가: 새로운 노드 타입 지원, UI 개선 등

## 라이선스

이 프로젝트는 BigValue 라이선스 하에 배포됩니다.

## 버전 히스토리

- v1.0.0: 기본 Figma 플러그인 기능 및 Claude Code 연동
- 향후 버전에서 추가 예정: 다국어 지원, 커스텀 템플릿, API 연동