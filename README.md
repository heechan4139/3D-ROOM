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
