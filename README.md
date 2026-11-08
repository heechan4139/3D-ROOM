# 방꾸미기 프로젝트 프로토타입

첨부된 React 코드를 그대로 사용합니다. 화면 맨 아래에 작은 안내 문구만 추가했습니다.

## 실행

Node.js와 pnpm이 설치된 컴퓨터에서 이 폴더를 연 뒤 다음 명령을 실행합니다.

```bash
pnpm install
pnpm run dev
```

터미널에 표시되는 주소를 브라우저에서 열면 로컬에서 확인할 수 있습니다.

## GitHub Pages 배포

저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. 이후 `main` 브랜치에 변경 사항을 올리면 GitHub Actions가 웹사이트를 빌드하고 배포합니다.

배포 주소: `https://heechan4139.github.io/3D-ROOM/`

배포 작업이 완료되면 QR 이미지를 `https://heechan4139.github.io/3D-ROOM/website-qr.png`에서 받을 수 있습니다. 로컬에서 별도로 만들 때는 아래처럼 실행합니다.

```bash
pnpm run qr https://heechan4139.github.io/3D-ROOM/
```

QR 이미지가 `dist/website-qr.png`에 만들어집니다. 이 PNG를 발표 자료나 인쇄물에 넣으면 QR 스캔으로 웹페이지에 접근할 수 있습니다.

## 관리자 가구 통계 설정

사용자가 방 이미지를 저장한 순간, 배치된 가구별 수를 공용 데이터베이스에 더합니다. 관리자 로그인 화면에서만 통계를 조회하거나 초기화할 수 있습니다. 통계 백엔드는 Supabase를 사용합니다. Supabase 연결 전에는 기존 프로토타입 화면 흐름만 동작하며 통계는 저장되지 않습니다.

### 1. Supabase 프로젝트와 관리자 계정 만들기

1. [Supabase](https://supabase.com/)에서 프로젝트를 만듭니다.
2. Authentication의 URL Configuration에서 Site URL을 `https://heechan4139.github.io/3D-ROOM/`으로 설정하고, 같은 주소를 Redirect URLs에도 추가합니다. 초대 링크가 `localhost`로 돌아가지 않도록 하는 설정입니다.
3. SQL Editor에서 `supabase/setup.sql`을 열고 `ADMIN_EMAIL_HERE` 두 곳을 관리자 이메일로 바꾼 뒤 전체 SQL을 실행합니다.

### 2. GitHub Pages에 연결하기

저장소의 **Settings → Secrets and variables → Actions → New repository secret**에서 다음 세 항목을 추가합니다.

| Secret 이름 | 값 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase의 공개 `anon` 또는 `publishable` API key |
| `VITE_ADMIN_EMAIL` | SQL에 입력한 관리자 이메일 |

`service_role` 또는 `secret` API key는 웹사이트에 입력하지 마세요. 설정 후 **Actions → Deploy to GitHub Pages → Run workflow**를 실행하면 사이트가 다시 배포됩니다.

### 3. 사용하기

- 관리자 화면: `https://heechan4139.github.io/3D-ROOM/?admin=1`
- 관리자 초대 또는 비밀번호 재설정 링크는 사이트로 돌아와 비밀번호 설정 화면을 엽니다.
- 공개 사이트에서 사용자가 방 이미지를 저장하면 그 시점에 배치한 가구별 수가 집계됩니다. 여러 번 저장하면 저장할 때마다 집계됩니다.
- 관리자 계정으로 로그인한 뒤 **전체 초기화**를 누르면 집계가 0으로 돌아갑니다.

현재 구현은 수업 발표용 프로토타입 통계입니다. 공개 저장 요청 자체는 서버에서 사용자나 중복 저장 여부를 검증하지 않습니다.
