import React from 'react';
import { roomLayout } from './roomGeometry';

export function ApplianceShape({ item }) { return <g>      <title>{item.name} · {item.width} × {item.height} cm</title>
      <rect width={item.width} height={item.height} rx="2" fill="#f4f3ed" stroke="#a4a8a1" strokeWidth="1.5" />
      {item.id === 'fridge' && <>
        <rect x="3" y="3" width="54" height="61" rx="2" fill="#dfe4e2" stroke="#c5cecb" />
        <path d="M5 58H55 M5 65H55" stroke="#a3b1ac" strokeWidth="2" />
        <rect x="10" y="62" width="40" height="3" rx="1" fill="#7d8e86" />
      </>}
      {item.id === 'sink' && <>
        <rect x="8" y="9" width="43" height="35" rx="5" fill="#9eaaa6" stroke="#858f8a" />
        <rect x="12" y="13" width="35" height="27" rx="5" fill="#c5d1cd" />
        <circle cx="30" cy="30" r="3" fill="#8b9891" />
        <path d="M30 5v15h8 M57 13h15 M57 20h15 M57 27h15 M57 34h15" fill="none" stroke="#9ba9a3" strokeWidth="2" />
      </>}
      {item.id === 'induction' && <>
        <rect x="5" y="6" width="50" height="42" rx="3" fill="#283133" />
        <circle cx="20" cy="22" r="10" fill="none" stroke="#859292" strokeWidth="1.5" />
        <circle cx="41" cy="33" r="9" fill="none" stroke="#859292" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="7" fill="none" stroke="#4e5c5c" /><circle cx="41" cy="33" r="6" fill="none" stroke="#4e5c5c" />
      </>}
      {item.id === 'washer' && <>
        <rect x="4" y="4" width="52" height="9" rx="2" fill="#d8dfdc" />
        <circle cx="47" cy="8" r="2.5" fill="#718b83" />
        <rect x="10" y="6" width="15" height="4" fill="#94a6a0" />
        <rect x="9" y="17" width="42" height="31" rx="7" fill="#b7cbc9" stroke="#8aa6a3" strokeWidth="2" />
        <ellipse cx="30" cy="32" rx="14" ry="11" fill="#e2edeb" opacity=".8" />
      </>}
      <text x={item.width / 2} y={item.id === 'fridge' ? 48 : 56} textAnchor="middle" fill="#566861" fontSize="7.5">{item.name}</text>
</g>; }

export default function RoomFixtures({ room }) {
  const { kitchen, bathroom, entry, closet } = roomLayout(room);
  if (room.type === 'B') {
    const { width: w, height: h } = room;
    const bx = bathroom.x, by = bathroom.y;
    return <>
      {kitchen.map(item => <g key={item.id} transform={`translate(${item.x} ${item.y})`}><ApplianceShape item={item} /></g>)}
      <rect {...entry} fill="url(#entry-tile)" />
      <text x={entry.x + entry.width / 2} y={entry.y + entry.height / 2} textAnchor="middle" fontSize="11" fill="#7c888c">현관</text>
      <rect {...closet} fill="#f6f5ef" stroke="#4c4d49" strokeWidth="5" />
      <text x={closet.x + closet.width / 2} y={closet.y + closet.height / 2} textAnchor="middle" fontSize="9" fill="#92958a" transform={`rotate(-90 ${closet.x + closet.width / 2} ${closet.y + closet.height / 2})`}>수납장</text>
      <path d={`M${bx} ${by}H${w - 40}V${h - 50}H${w - 110}V${h}H${bx}Z`} fill="#e7f1f2" />
      <path d={`M${bx} ${h}V${by}H${bx + 60} M${bx + 120} ${by}H${w - 40}`} stroke="#4c4d49" fill="none" strokeWidth="5" />
      <ellipse cx={bx + 28} cy={by + 38} rx="19" ry="17" fill="#fff" stroke="#a5b6b6" strokeWidth="2" />
      <circle cx={bx + 28} cy={by + 38} r="12" fill="#edf3f1" stroke="#bdc9c5" /><circle cx={bx + 26} cy={by + 32} r="2" fill="#7f9690" />
      <rect x={bx + 10} y={h - 47} width="15" height="32" fill="#fff" stroke="#b7c4c2" /><ellipse cx={bx + 37} cy={h - 31} rx="20" ry="14" fill="#fff" stroke="#b7c4c2" />
      <path d={`M${bx + 120} ${by}v60 M${bx + 120} ${by + 60}A60 60 0 0 1 ${bx + 60} ${by}`} stroke="#97abaa" fill="none" strokeWidth="1.5" />
      <text x={bx + 85} y={h - 24} textAnchor="middle" fontSize="11" fill="#819796">화장실</text>
      <text x={w * .59} y="85" fontSize="11" fill="#818373">주방 / 식당</text>
      <text x={w * .25} y={h * .52} textAnchor="middle" fontSize="13" fill="#91958a" opacity=".8">거실 / 침실</text>
    </>;
  }
  return <>
    {kitchen.map(item => <g key={item.id} role="img" aria-label={`${item.name} ${item.width} × ${item.height} cm`}
      transform={item.rotation ? `translate(${item.x + item.height} ${item.y}) rotate(90)` : `translate(${item.x} ${item.y})`}>
      <ApplianceShape item={item} />
    </g>)}
    <g transform={`translate(${bathroom.x} 0)`}>
      <rect width="140" height="160" fill="url(#tile)" />
      <rect x="10" y="10" width="73" height="70" rx="3" fill="#fafdfc" stroke="#baccc9" strokeWidth="2" /><circle cx="45" cy="45" r="4" fill="#acb7b3" /><path d="M21 18h28v12" fill="none" stroke="#8c9a96" strokeWidth="3" />
      <rect x="94" y="13" width="34" height="39" rx="4" fill="#fff" stroke="#bac2bd" /><ellipse cx="111" cy="34" rx="12" ry="11" fill="#e2e9e5" /><circle cx="111" cy="19" r="3" fill="#99aaa3" />
      <rect x="98" y="91" width="30" height="17" rx="3" fill="#fff" stroke="#c3cbc6" /><ellipse cx="113" cy="120" rx="17" ry="22" fill="#fff" stroke="#c3cbc6" strokeWidth="2" /><ellipse cx="113" cy="119" rx="10" ry="14" fill="#e5ebe7" />
      <text x="48" y="110" textAnchor="middle" fill="#7f8d87" fontSize="12">화장실</text>
      <path d="M0 0V160h18 M93 160H140V0" fill="none" stroke="#4c4d49" strokeWidth="9" />
      <path d="M18 160v75 M18 235 A75 75 0 0 0 93 160" fill="none" stroke="#9da39a" strokeWidth="1.5" />
    </g>
  </>;
}
