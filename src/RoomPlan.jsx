import React, { useRef } from 'react';
import { RotateCw, Trash2, Check } from 'lucide-react';
import { footprint, isRug, roomLayout } from './roomGeometry';
import RoomFixtures, { ApplianceShape } from './RoomFixtures';

export function FurnitureShape({ item }) {
  const { width: w, height: h, id } = item;
  if (id === 'fridge' || id === 'washer') return <ApplianceShape item={item} />;
  if (id === 'plant') return <g>
    <circle cx={w / 2} cy={h / 2} r="16" fill="#ba8a65" stroke="#916441" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r="12" fill="#60513d" />
    {[0, 60, 120, 180, 240, 300].map((angle, i) => <ellipse key={angle} cx={w / 2} cy="12" rx="6" ry="12" fill={i % 2 ? '#6f9160' : '#3d7356'} transform={`rotate(${angle} ${w / 2} ${h / 2})`} />)}
    <circle cx={w / 2} cy={h / 2} r="5" fill="#a0b67b" />
  </g>;
  if (id === 'dresser') return <g>
    <rect x="1" y="1" width={w - 2} height={h - 2} rx="2" fill="#c2a27b" stroke="#927453" strokeWidth="2" />
    <rect x="4" y="4" width={w - 8} height={h - 11} fill="#e0c4a0" />
    <path d={`M4 ${h - 7}H${w - 4} M${w / 2} ${h - 7}v6`} stroke="#8c7254" />
    <path d={`M12 ${h - 4}h15 M${w - 27} ${h - 4}h15`} stroke="#695c49" strokeWidth="2" />
  </g>;
  if (id === 'white_wardrobe') return <g>
    <rect x="1" y="1" width={w - 2} height={h - 2} rx="4" fill="#fbfbfa" stroke="#aeb3b2" strokeWidth="2" />
    <rect x="6" y="6" width={w / 2 - 9} height={h - 12} rx="2" fill="#ffffff" stroke="#e1e4e3" />
    <rect x={w / 2 + 3} y="6" width={w / 2 - 9} height={h - 12} rx="2" fill="#f7f8f7" stroke="#e1e4e3" />
    <path d={`M${w / 2} 5V${h - 5}`} stroke="#c5c9c8" strokeWidth="2" />
    <circle cx={w / 2 - 5} cy={h / 2} r="2" fill="#a9aeac" />
    <circle cx={w / 2 + 5} cy={h / 2} r="2" fill="#a9aeac" />
  </g>;
  if (id === 'bookshelf') return <g>
    <rect width={w} height={h} rx="2" fill="#a98b67" stroke="#816b51" strokeWidth="2" />
    <rect x="4" y="4" width={w - 8} height={h - 6} fill="#e5d7c0" />
    {['#7e9e9d', '#c7a27e', '#d3c6a7', '#889ba7', '#b2bca0', '#b48170'].map((color, i) => <rect key={color} x={8 + i * 10} y="6" width="8" height={h - 9} fill={color} stroke="#fff" strokeWidth=".5" />)}
  </g>;
  if (id === 'white_partition') return <g>
    <rect x="1" y="1" width={w - 2} height={h - 2} rx="3" fill="#fbfbfa" stroke="#aeb3b2" strokeWidth="2" />
    <path d={`M${w * .22} 4V${h - 4} M${w * .5} 4V${h - 4} M${w * .78} 4V${h - 4}`} stroke="#e1e4e3" strokeWidth="2" />
    <path d={`M5 ${h / 2}H${w - 5}`} stroke="#ffffff" strokeWidth="2" />
    <rect x="2" y="2" width="5" height={h - 4} rx="2" fill="#e4e6e5" />
    <rect x={w - 7} y="2" width="5" height={h - 4} rx="2" fill="#e4e6e5" />
  </g>;
  if (id === 'coffee_table') return <g>
    <rect x="1" y="1" width={w - 2} height={h - 2} rx="19" fill="#dfc7a2" stroke="#ad906d" strokeWidth="2" />
    <rect x="17" y="12" width="22" height="25" rx="1" fill="#f3ede1" transform="rotate(-8 28 24)" />
    <circle cx="58" cy="27" r="7" fill="#f9f8f0" stroke="#c3ae8c" /><circle cx="58" cy="27" r="4" fill="#8c6650" />
  </g>;
  if (id === 'floor_lamp') return <g>
    <circle cx={w / 2} cy={h / 2} r={w * .41} fill="#fff4d8" stroke="#c4ae82" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r={w * .29} fill="none" stroke="#e1cd9f" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r={w * .11} fill="#a88d61" stroke="#806b4c" strokeWidth="2" />
    <path d={`M${w / 2} 1V${w * .12} M${w / 2} ${h - 1}V${h - w * .12} M1 ${h / 2}H${w * .12} M${w - 1} ${h / 2}H${w - w * .12}`} stroke="#cfb777" strokeWidth="2" strokeLinecap="round" />
  </g>;
  if (id === 'fabric_bed') return <g>
    <rect width={w} height={h} rx="10" fill="#b49a82" stroke="#917860" strokeWidth="3" />
    <rect x="5" y="8" width={w - 10} height={h - 16} rx="9" fill="#f8f5ee" stroke="#ded8cc" strokeWidth="2" />
    <rect x="11" y="15" width={w - 22} height="38" rx="8" fill="#fffdf8" stroke="#e7e0d5" strokeWidth="2" />
    <path d={`M8 67 H${w - 8} V${h - 9} Q${w / 2} ${h - 1} 8 ${h - 9} Z`} fill="#d7b7a8" />
    <path d={`M8 67 H${w - 8} V91 H8 Z`} fill="#c99f8d" />
    <path d={`M${w / 2} 96 V${h - 12}`} stroke="#ead6cd" strokeWidth="2" />
    <path d={`M15 60 Q${w / 2} 66 ${w - 15} 60`} fill="none" stroke="#b99585" strokeWidth="2" />
  </g>;
  if (id === 'white_round_rug') return <g>
    <circle cx={w / 2} cy={h / 2} r={w / 2 - 3} fill="#fffefa" stroke="#cfd1cf" strokeWidth="4" />
    <circle cx={w / 2} cy={h / 2} r={w * .39} fill="none" stroke="#e5e4df" strokeWidth="3" />
    <circle cx={w / 2} cy={h / 2} r={w * .29} fill="none" stroke="#efede7" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r={w * .08} fill="#f5f2eb" stroke="#e1ded6" strokeWidth="2" />
  </g>;
  if (id === 'beige_bean_bag') return <g>
    <path d={`M${w * .49} 4 C${w * .7} 5 ${w * .9} ${h * .19} ${w * .92} ${h * .42} C${w * .96} ${h * .65} ${w * .78} ${h * .91} ${w * .53} ${h * .94} C${w * .29} ${h * .98} ${w * .08} ${h * .79} ${w * .07} ${h * .55} C${w * .05} ${h * .31} ${w * .21} ${h * .1} ${w * .39} ${h * .06} Q${w * .45} 4 ${w * .49} 4 Z`} fill="#d8c5a8" stroke="#aa967b" strokeWidth="3" />
    <path d={`M${w * .19} ${h * .67} Q${w * .48} ${h * .56} ${w * .79} ${h * .66}`} fill="none" stroke="#b9a588" strokeWidth="2" />
    <path d={`M${w * .43} ${h * .12} Q${w * .57} ${h * .23} ${w * .64} ${h * .38}`} fill="none" stroke="#eee2ce" strokeWidth="3" />
  </g>;
  if (id === 'bed' || id === 'omons_bed') return <g>
    <rect width={w} height={h} rx="5" fill="#9b8066" />
    <rect x="4" y="9" width={w - 8} height={h - 14} rx="8" fill="#f9f7f2" stroke="#d4d1c9" strokeWidth="2" />
    <rect x="11" y="17" width={w - 22} height="35" rx="7" fill="#fffefa" stroke="#dedbd3" />
    <path d={`M7 66 H${w - 7} V${h - 9} H7 Z`} fill="#a9bbc2" />
    <path d={`M7 66 H${w - 7} V85 H7 Z`} fill="#c9d5d8" />
    {[0.25, 0.5, 0.75].map(p => <path key={p} d={`M${w * p} 87 V${h - 13}`} stroke="#e4ecec" opacity=".32" strokeWidth="2" />)}
    <path d={`M4 4 H${w - 4}`} stroke="#715b49" strokeWidth="7" />
  </g>;
  if (id === 'desk') return <g>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="3" fill="#c2a27b" stroke="#987b58" strokeWidth="2" />
    <path d={`M7 12 H${w - 7} M7 18 H${w - 7}`} stroke="#dfc19b" opacity=".5" />
    <rect x={w * .34} y="10" width={w * .36} height="25" rx="2" fill="#57636a" stroke="#e2e6e7" strokeWidth="3" />
    <rect x={w * .3} y="36" width={w * .44} height="13" rx="2" fill="#e6e9e8" />
    <circle cx="18" cy="39" r="7" fill="#faf9f1" />
  </g>;
  if (id === 'sofa') return <g>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="15" fill="#b6aa96" stroke="#8e8372" strokeWidth="2" />
    <rect x="13" y="24" width={w - 26} height={h - 33} rx="10" fill="#dcd2bf" stroke="#b7ab96" />
    <rect x="10" y="5" width={w - 20} height="23" rx="9" fill="#e6dccb" stroke="#b7ab96" />
    <rect x="2" y="20" width="13" height={h - 28} rx="6" fill="#cfc3ad" />
    <rect x={w - 15} y="20" width="13" height={h - 28} rx="6" fill="#cfc3ad" />
  </g>;
  if (id === 'rug' || id === 'luxury_rug') return <g>
    <rect width={w} height={h} rx="3" fill="#c6b497" stroke="#b09c7f" strokeWidth="2" />
    <rect x="9" y="9" width={w - 18} height={h - 18} rx="2" fill="none" stroke="#eae0cf" strokeWidth="3" />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M14 ${15 + i * (h - 30) / 21} H${w - 14}`} stroke="#eee5d4" opacity=".38" />)}
  </g>;
  return <g>
    <circle cx={w / 2} cy={h / 2} r={w / 2 - 1} fill="#e7dfce" stroke="#b7a58c" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r={w * .31} fill="#fff6d9" />
    <circle cx={w / 2} cy={h / 2} r="3" fill="#ad9872" />
  </g>;
}

export default function RoomPlan({ room, floorColor, items, selectedId, onSelect, onChange, onDelete, onRotate, exportRef, zoom = 1 }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const canvasRef = useRef(null);
  const pan = useRef(null);
  const { width: w, height: h } = room;
  const { outline, entry } = roomLayout(room);
  const entryDoor = entry ? Math.min(70, entry.height - 16) : 70;
  const doorX = room.type === 'B' ? w - 120 : 40;
  const windowX = room.type === 'B' ? 0 : w;
  const floorPalette = { wood: ['#e9dfcf', '#d9cdbb', '#f6f0e6'], black: ['#272b2d', '#373c3f', '#464b4e'], white: ['#f5f5f1', '#e1e3de', '#ffffff'] }[floorColor || 'wood'];
  const selected = items.find(item => item.uid === selectedId);
  const point = e => new DOMPoint(e.clientX, e.clientY).matrixTransform(svgRef.current.getScreenCTM().inverse());
  const move = e => {
    if (!drag.current) return;
    e.preventDefault();
    const p = point(e);
    onChange({ ...drag.current.item, x: p.x - drag.current.dx, y: p.y - drag.current.dy });
  };
  const finish = e => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const startCanvasPointer = e => {
    if (e.target.closest?.('[data-furniture]')) return;
    onSelect(null);
    if (zoom <= 1 || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
    e.preventDefault();
    pan.current = { x: e.clientX, y: e.clientY, scrollLeft: e.currentTarget.scrollLeft, scrollTop: e.currentTarget.scrollTop };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveCanvas = e => {
    if (!pan.current || !canvasRef.current) return;
    e.preventDefault();
    canvasRef.current.scrollLeft = pan.current.scrollLeft - (e.clientX - pan.current.x);
    canvasRef.current.scrollTop = pan.current.scrollTop - (e.clientY - pan.current.y);
  };
  const finishCanvas = e => {
    pan.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return <section className="plan-stage" aria-label="2D 방꾸미기">
    <div ref={canvasRef} className="plan-canvas" onPointerDown={startCanvasPointer} onPointerMove={moveCanvas} onPointerUp={finishCanvas} onPointerCancel={finishCanvas} onLostPointerCapture={() => { pan.current = null; }}>
      <div className="plan-zoom-content" style={{width: `${zoom * 100}%`, height: `${zoom * 100}%`}}>
      <svg ref={node => { svgRef.current = node; if (exportRef) exportRef.current = node; }} viewBox={`-24 -24 ${w + (room.type === 'B' ? 105 : 48)} ${h + 70}`} aria-label="주방과 화장실이 있는 원룸 평면도" onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { drag.current = null; }}>
        <defs>
          <pattern id="entry-tile" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#f7f8f7" /><path d="M0 0h10v10H0z M10 10h10v10H10z" fill="#e3e6e5" /></pattern>
          <pattern id="wood" width="44" height="170" patternUnits="userSpaceOnUse"><rect width="44" height="170" fill={floorPalette[0]} /><path d="M0 0V170 M22 0V170 M0 75H22 M22 130H44" stroke={floorPalette[1]} strokeWidth=".8" /><path d="M5 0V170 M14 0V170 M29 0V170 M37 0V170" stroke={floorPalette[2]} opacity=".6" strokeWidth="1" /></pattern>
          <pattern id="tile" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="#eef0ed" /><path d="M0 25V0H25" fill="none" stroke="#d4dbd8" strokeWidth="1" /></pattern>
          <filter id="furniture-shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#40372c" floodOpacity=".22" /></filter>
        </defs>
        <path d={outline} fill="url(#wood)" />
        <RoomFixtures room={room} />
        {room.type === 'B' ? <>
          <path d={outline} fill="none" stroke="#484944" strokeWidth="8" />
          <path d={`M${w} ${entry.y + 8}V${entry.y + 8 + entryDoor}`} stroke="#f6f7f6" strokeWidth="9" />
          <path d={`M${w} ${entry.y + 8}h${entryDoor} M${w + entryDoor} ${entry.y + 8}A${entryDoor} ${entryDoor} 0 0 1 ${w} ${entry.y + 8 + entryDoor}`} fill="none" stroke="#9da39a" strokeWidth="1.5" />
        </> : <>
          <path d={`M${doorX} ${h}H0V0H${w}V${h}H${doorX + 80}`} fill="none" stroke="#484944" strokeWidth="12" />
          <path d={`M${doorX} ${h}v-80 M${doorX} ${h - 80}A80 80 0 0 1 ${doorX + 80} ${h}`} fill="none" stroke="#9da39a" strokeWidth="1.5" />
        </>}
        <rect x={windowX - 4} y={h * .48} width="8" height={h * .27} fill="#d5e8e8" stroke="#a1b9b9" /><path d={`M${windowX} ${h * .48}v${h * .27}`} stroke="#fff" strokeWidth="2" />
        <text x={w / 2} y={h + 27} textAnchor="middle" fill="#919a9d" fontSize="11">{(w / 100).toFixed(2)} m × {(h / 100).toFixed(2)} m</text>
        {[...items].sort((a, b) => (isRug(a) ? 0 : 1) - (isRug(b) ? 0 : 1)).map(item => {
          const active = selectedId === item.uid;
          const bounds = footprint(item);
          return <g key={item.uid} data-furniture={item.id} data-rotation={item.rotation} role="button" tabIndex={0} aria-label={`${item.name}, ${item.rotation}도, 방향키로 이동`} aria-pressed={active}
            transform={`translate(${item.x} ${item.y})`} style={{ cursor: 'grab', touchAction: 'none', outline: 'none' }}
            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onSelect(item.uid); const p = point(e); drag.current = { item, dx: p.x - item.x, dy: p.y - item.y }; svgRef.current.setPointerCapture(e.pointerId); }}
            onFocus={() => onSelect(item.uid)}
            onKeyDown={e => {
              if (e.key === 'Escape') { onSelect(null); e.currentTarget.blur(); }
              if (!item.protected && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); onDelete(item.uid); }
              if (e.key.toLowerCase() === 'r') { e.preventDefault(); onRotate(item.uid); }
              const delta = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
              if (delta) { e.preventDefault(); onChange({ ...item, x: item.x + delta[0], y: item.y + delta[1] }); }
            }}>
            <g transform={`rotate(${item.rotation}) translate(${-item.width / 2} ${-item.height / 2})`} filter={isRug(item) ? undefined : 'url(#furniture-shadow)'}><FurnitureShape item={item} /></g>
            {active && <rect data-selection="true" x={-bounds.width / 2 - 5} y={-bounds.height / 2 - 5} width={bounds.width + 10} height={bounds.height + 10} rx="5" fill="none" stroke="#20b8de" strokeWidth="2" strokeDasharray="6 4" pointerEvents="none" />}
          </g>;
        })}
      </svg>
      </div>
    </div>
    <div className="selection-bar" aria-live="polite">
      {selected ? <><span><b>{selected.name}</b><small>{selected.width} × {selected.height} cm · {selected.protected ? '기본 설비 · 삭제 불가' : `${selected.rotation}°`}</small></span><button onClick={() => onRotate(selected.uid)} aria-label="선택한 가구 90도 회전"><RotateCw size={17} /> 회전</button>{!selected.protected && <button onClick={() => onDelete(selected.uid)} aria-label="선택한 가구 삭제"><Trash2 size={17} /></button>}<button onClick={() => onSelect(null)} aria-label="배치 완료"><Check size={18} /></button></> : <p>{items.length ? '가구를 눌러 이동 · 회전해 보세요' : '아래에서 가구를 골라 나만의 방을 꾸며보세요'}</p>}
    </div>
  </section>;
}
