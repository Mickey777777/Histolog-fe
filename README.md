# Histolog Frontend

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 런타임 / 프레임워크 | React Native 0.81, React 19, Expo 54 |
| 네비게이션 | 자체 state 기반 화면 분기 (`App.js`) |
| 인증 / 저장소 | AsyncStorage (access / refresh 토큰), expo-auth-session, expo-web-browser |
| Deep Link | expo-linking (`histolog://` scheme) |
| 빌드 / 배포 | EAS Build (Android `com.histolog.app`) |
| 기타 | react-native-safe-area-context, react-native-calendars |

## 프로젝트 구조

```
.
├── App.js                  # 화면 분기 (login / signup / chat) + 토큰 복원 + deep link 처리
├── index.js                # registerRootComponent
├── app.json                # Expo 설정 (scheme: histolog)
├── eas.json                # EAS 빌드 프로파일
└── src
    ├── components
    │   ├── LoginScreen.js      # 로컬 / Google / Naver 로그인
    │   ├── SignupScreen.js     # 회원가입
    │   ├── ChatScreen.js       # 메인 채팅 화면 + 사이드바 슬라이드 + Typing indicator
    │   ├── Sidebar.js          # 대화 목록 + 토큰 사용량 게이지 + 로그아웃
    │   ├── ChatInput.js        # 입력창
    │   ├── MessageItem.js      # 메시지 버블 (USER / ASSISTANT 좌우 배치)
    │   └── KingPickerModal.js  # 임금 선택 모달
    ├── hooks
    │   └── useChatLogic.js     # 세션 목록 / 새 대화 / 메시지 전송 / 내역 로드
    ├── utils
    │   └── authFetch.js        # Bearer 토큰 자동 부착 + 401 시 refresh + 재시도
    └── constants
        └── kings.js            # JEONGJO / DANJONG 메타 (BE King enum과 1:1)
```

## 화면 흐름

`App.js` 가 단일 state(`screen`)로 화면을 전환한다 (`login` → `signup` → `chat`).

1. 앱 시작 시 AsyncStorage 의 `session`(access) / `refreshToken` 을 복원하고, 있으면 `chat` 화면으로 바로 이동.
2. 로그인 성공 시 `setTokens(access, refresh)` 로 `authFetch` 모듈에 토큰을 주입하고 `chat` 화면으로 이동.
3. deep link (`histolog://...?token=...&refresh_token=...`)가 들어오면 OAuth 콜백으로 간주, 토큰을 추출해 로그인 성공으로 처리.
4. 401 → refresh 실패 시 등록된 `_onLogout` 콜백이 발동해 토큰을 비우고 로그인 화면으로 복귀.

## `authFetch` — 토큰 자동 관리

`src/utils/authFetch.js` 가 인증된 요청을 한곳에서 처리한다.

- 모든 요청에 `Authorization: Bearer <access>` 헤더 부착.
- 응답이 `401` 이면 한 번만 `/api/auth/refresh` 호출 → 새 토큰을 AsyncStorage 와 모듈 변수에 저장 → 원래 요청 재시도.
- 동시 401 이 여러 개 떠도 `_refreshPromise` lock 으로 refresh 호출은 1회로 모인다.
- refresh 도 실패하면 로그아웃 콜백 발동.

## BE API 사용 패턴

| 화면 / 동작 | 호출 |
|---|---|
| 회원가입 | `POST /api/auth/signup` |
| 로컬 로그인 | `POST /api/auth/login` |
| Google 로그인 | `GET /api/auth/google/initiate?appRedirect=histolog://google-auth` → 외부 브라우저 → deep link 콜백 |
| Naver 로그인 | `GET /api/auth/naver/initiate?appRedirect=histolog://naver-auth` → 동일 |
| 토큰 재발급 | `POST /api/auth/refresh` (authFetch 내부) |
| 사용량 표시 | `GET /api/user/usage` (사이드바 열릴 때) |
| 대화 목록 | `GET /api/chats` |
| 새 대화 | `POST /api/chats` `{ king: 'JEONGJO' | 'DANJONG' }` |
| 메시지 목록 | `GET /api/chats/{chatId}/messages` |
| 메시지 전송 | `POST /api/chats/{chatId}/messages` `{ message }` |

> 토큰 한도 초과(`T001`) 응답은 채팅 화면에서 "세션 한도에 도달했습니다." 모달로 노출.

## OAuth Deep Link

- Expo `scheme`: `histolog` (`app.json`)
- 클라이언트 redirect: `histolog://google-auth`, `histolog://naver-auth` (BE `app.allowed-redirects` 화이트리스트와 일치해야 함)
- 웹에서는 `window.location.assign(authUrl)` 로 풀 리다이렉트, 네이티브에서는 `WebBrowser.openAuthSessionAsync` 사용.

## 관련 저장소

- **Histolog-be** — Spring Boot 백엔드 (인증 / 채팅 / AI 프록시)
- **Histolog-AI** — FastAPI + RAG 서버 (Gemini 기반 답변 생성)
