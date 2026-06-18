@AGENTS.md

## Coding Convention

### 1. Naming

- Component: PascalCase
- Page (Next.js): page.tsx, layout.tsx
- Hook: camelCase (`use` prefix)
- Store: camelCase (`Store` suffix)
- API: kebab-case (\*.api.ts)
- Util: camelCase
- Type: kebab-case (\*.type.ts)
- Const: UPPER_SNAKE_CASE
- Constant file: kebab-case (e.g. community-tabs.ts)
- Folder: kebab-case

### 2. Variables & Functions

- 변수: camelCase
- 상수: UPPER_SNAKE_CASE

#### Functions

- 함수 선언식: component, hook, utility function
- 화살표 함수: handler, callback, inline
- name: camelCase

#### Event Handler

- handle + 대상 + 동작
- 예: handleLoginSubmit, handleInputChange

### 3. API Naming

- prefix: get / create / update / delete

  ```
  getBoard
  createBoard
  updateBoard
  deleteBoard
  ```

- auth 관련은 접두사 생략 (login, logout, signup)

### 4. TanStack Query

- path: hooks/queries/{domain}/use{Domain}.ts

- pattern:
  ```
  useBoardQuery
  useBoardItemQuery
  useBoardMutation
  ```

### 5. z-index

- 0~10: 기본 요소 (text, card, button 등)
- 100: 드롭다운, 셀렉트
- 200: 툴팁, hover card
- 300: 네비게이션 바 (고정 헤더)
- 400: 사이드바 (오버레이 없음)
- 500: 토스트
- 900: 오버레이 (Backdrop)
- 1000: 모달
- 1100: 팝오버
- 2000+: 글로벌 최상위 알림창 (긴급 모달, 시스템 메시지)

### 6. Types

- 파일명: {domain}.type.ts
  ```
  BoardRequest // API Request
  BoardResponse // API Response
  Board // Frontend Model
  ```
