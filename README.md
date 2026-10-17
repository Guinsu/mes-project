# MES (Manufacturing Execution System)

생산계획부터 품목, 재고, 생산실적까지 제조 현장의 주요 업무를 통합하여 관리하는 웹 기반 생산관리 시스템입니다.  
생산 정보를 체계적으로 관리하고 업무 현황을 한눈에 파악할 수 있는 환경을 제공하는 것을 목표로 합니다.

## 프로젝트 소개

생산계획을 엑셀이나 수기로 관리할 때 발생할 수 있는 데이터 중복과 이력 관리의 어려움을 줄이고, 담당자의 역할에 따라 필요한 기능만 사용할 수 있는 MES를 목표로 합니다.

- Supabase Auth를 이용한 이메일 로그인 및 세션 관리
- 직원 역할에 따른 생산계획 등록·수정·삭제 권한 제어
- 다양한 조건을 조합한 생산계획 검색
- 서버 기반 페이지네이션과 선택 데이터 엑셀 다운로드
- 공통 테이블·페이지네이션 컴포넌트를 활용한 확장 가능한 화면 구성

### 생산계획 관리

- 계획번호, 품목코드, 품목명, 상태, 계획기간을 이용한 복합 검색
- 생산계획 등록 및 수정
- 선택 항목 일괄 삭제
- 페이지당 표시 건수 변경 및 페이지 이동
- 선택 항목을 `.xlsx` 파일로 다운로드
- 필수값, 양의 정수 수량, 계획기간 등 입력값 검증
- 대기·진행중·완료·취소 상태 표시

### 공통 UI

- 헤더, 사이드바 기반의 애플리케이션 레이아웃
- 재사용 가능한 데이터 테이블과 페이지네이션
- Tailwind CSS 기반 반응형 화면

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React 19, TypeScript 6 |
| Build | Vite 8 |
| Routing | React Router 8 |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 |
| Backend / Auth | Supabase |
| Excel | ExcelJS |
| Quality | ESLint |

## 프로젝트 구조

```text
src/
├─ components/
│  ├─ common/                # 공통 테이블, 페이지네이션
│  └─ production-plan/       # 생산계획 검색, 목록, 등록·수정 모달
├─ layouts/                  # 공통 애플리케이션 레이아웃
├─ lib/                      # Supabase 클라이언트 설정
├─ pages/                    # 메뉴별 페이지
├─ router/                   # 라우트 및 인증 보호 설정
├─ stores/                   # Zustand 인증 상태
├─ types/                    # 도메인 타입과 상수
├─ index.css                 # Tailwind 및 공통 스타일
└─ main.tsx                  # 애플리케이션 진입점
```
