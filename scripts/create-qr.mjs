import { mkdir } from 'node:fs/promises';
import QRCode from 'qrcode';

const url = process.argv[2];

if (!url || !/^https?:\/\//i.test(url)) {
  console.error('사용법: npm run qr -- https://배포한-웹페이지-주소');
  process.exit(1);
}

await mkdir('dist', { recursive: true });
await QRCode.toFile('dist/website-qr.png', url, {
  type: 'png',
  width: 1200,
  margin: 4,
  errorCorrectionLevel: 'H',
});

console.log('QR 저장 완료: dist/website-qr.png');
