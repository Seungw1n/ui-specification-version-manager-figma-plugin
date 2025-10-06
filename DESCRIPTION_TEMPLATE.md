# UI Description JSON Template 규격

이 프로젝트에서 와이어프레임 분석 후 description JSON 파일을 작성할 때 반드시 따라야 하는 표준 양식입니다.

## 기준 템플릿

**참고 파일**: `claude-code-talk-to-figma-plugin\ui-description\test-project-1\02. 관리관리자\v1.0.0\02_description_v1.0.0.json`

## JSON 구조 규격

```json
{
  "metadata": {
    "fileName": "파일명 (예: 테스트 관리관리자)",
    "pageName": "페이지명/버전 (예: v1.0.0)",
    "categoryNumber": "카테고리 번호 (예: 02)",
    "version": "버전 정보 (예: v1.0.0)",
    "createdAt": "생성일시 (ISO 8601 형식)",
    "updatedAt": "수정일시 (ISO 8601 형식)",
    "sourceWireframes": [
      "참조한 와이어프레임 파일명들의 배열"
    ]
  },
  "screens": {
    "스크린_ID_description_버전": {
      "title": "화면 제목",
      "outline": "화면 개요 설명\n- 주요 기능 1\n- 주요 기능 2\n- 진입 경로 설명",
      "elements": {
        "요소번호": {
          "content": "[UI 요소명]\n세부 설명 내용\n- 기능 1\n- 기능 2\n\n[하위 요소명]\n- 상세 동작 설명"
        }
      }
    }
  }
}
```

## 작성 규칙

1. **metadata 섹션**
   - `fileName`: 와이어프레임의 실제 파일명
   - `pageName`: 페이지 이름 또는 버전 정보
   - `categoryNumber`: 카테고리 번호 (폴더명에서 추출)
   - `version`: 버전 정보
   - `createdAt/updatedAt`: ISO 8601 형식의 타임스탬프
   - `sourceWireframes`: 분석한 와이어프레임 파일명들

2. **screens 섹션**
   - 각 화면마다 고유한 키 사용 (형식: `화면ID_description_버전`)
   - `화면ID`: 화면의 고유한 번호 (예: `01-00-00`)
   - `title`: 화면의 명확한 제목
   - `outline`: 화면 전체적인 구조나 목적 설명 (**"\n" 문자를 사용하여 JSON 내에서 줄바꿈 처리**)
   - `elements`: 화면 내 주요 UI 요소들을 번호별로 정리 (**content 값은 "\n" 문자를 사용하여 JSON 내에서 줄바꿈 처리**)

3. **파일명 규칙**
   - Description 파일: `{카테고리번호}_description_{버전}.json` 형식
   - Wireframe ZIP 파일: `{카테고리번호}_wireframe_{페이지명}` 형식
   - 예: `02_description_v1.0.0.json`, `02_wireframe_v1.0.2.zip`

## Claude Code 사용 시 주의사항

- 와이어프레임 분석 요청 시 별도 지시가 없어도 이 템플릿을 자동으로 적용
- 모든 필수 필드를 누락 없이 작성
- 일관된 명명 규칙과 구조 유지
- 분석 대상 와이어프레임 파일들을 정확히 참조

## Figma 플러그인 자동 생성 구조

Figma 플러그인을 통해 JSON description을 적용할 때 다음과 같은 프레임 구조가 자동으로 생성됩니다:

### 프레임 계층 구조:
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
      │   ├── 📄 number (텍스트: "2", 초록색, 16px)
      │   └── 📄 content (텍스트: elements.2.content, 16px)
      └── ... (JSON의 elements 개수만큼 자동 생성)
```

### 스타일 규격:
- **elements 컨테이너**: 세로 방향 자동 레이아웃, 16px 간격
- **element 프레임**: 세로 방향 자동 레이아웃, 8px 간격, 패딩 12px(상하) 16px(좌우)
- **number 텍스트**: 16px, 초록색(#00CC00), Roboto Regular
- **content 텍스트**: 16px, 검정색(기본), Roboto Regular

### 동작 방식:
1. JSON의 elements 개수 확인
2. 기존 element 프레임 있으면 재사용, 없으면 자동 생성
3. 모든 elements가 누락 없이 Figma에 반영
4. 프레임 구조와 스타일 자동 적용

## JSON 텍스트 포맷팅 규칙

### outline과 elements.content의 줄바꿈 처리
- JSON 문자열 내에서 **`\n` 문자를 사용하여 줄바꿈을 표현**합니다
- 가독성을 위해 리스트나 단락 구분을 명확히 합니다
- DESCRIPTION_STYLE_GUIDE.md의 '적절한 예시'를 참고하여 작성합니다

### 포맷팅 예시:
```json
{
  "outline": "화면 개요 설명\n- 주요 기능 1 설명\n- 주요 기능 2 설명\n- 진입 경로나 특징 설명",
  "elements": {
    "1": {
      "content": "[주요 UI 영역명]\n영역 설명\n- 기능 1\n- 기능 2\n\n[하위 요소명]\n- 세부 동작 설명\n- 조건부 동작 설명"
    }
  }
}
```

## 예시

기준 템플릿 파일(`02_description_v1.0.0.json`)과 DESCRIPTION_STYLE_GUIDE.md의 구조를 참고하여 새로운 description 파일을 작성할 때 동일한 형식을 유지해야 합니다.