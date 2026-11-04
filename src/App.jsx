import React, { useState, useEffect, useRef } from 'react';
import RoomPlan, { FurnitureShape } from './RoomPlan';
import { CATALOG_ITEMS, roomDimensions, constrainItem, defaultAppliances } from './roomGeometry';
import { ChevronLeft, Lock, Download, Quote, Check, Plus, Box, ChevronRight } from 'lucide-react';

import entryQuestionBase64 from './assets/entry-question.b64?raw';
import instagramFollowBase64 from './assets/instagram-follow.b64?raw';

export default function App() {
  const [step, setStep] = useState('intro');
  const [roomSize, setRoomSize] = useState(7);
  const [roomType, setRoomType] = useState('A');
  const [floorColor, setFloorColor] = useState('wood');
  const [viewMode, setViewMode] = useState('2d');
  const [roomZoom, setRoomZoom] = useState(1);
  const [openRoomControl, setOpenRoomControl] = useState(null);
  const roomControlsRef = useRef(null);
  const [placedItems, setPlacedItems] = useState(() => defaultAppliances(roomDimensions(7, 'A')));
  const [selectedId, setSelectedId] = useState(null);
  const dialogRef = useRef(null);
  const exportRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const furnitureListRef = useRef(null);
  const [furnitureScroll, setFurnitureScroll] = useState(0);
  const roomDim = roomDimensions(roomSize, roomType);
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  const handleAddToRoom = (catalogItem) => {
    if (catalogItem.isLocked) {
      triggerAppModal('premium');
      return;
    }

    const newItem = constrainItem({
      ...catalogItem, uid: crypto.randomUUID(), rotation: 0,
      x: roomDim.width / 2 + (placedItems.length % 3) * 12,
      y: roomDim.height * .62 + (placedItems.length % 3) * 12,
    }, roomDim, placedItems);
    if (!newItem) { setNotice('배치할 공간이 부족해요. 가구를 옮기거나 삭제해 주세요.'); return; }
    setNotice('');
    setPlacedItems(items => [...items, newItem]);
    setSelectedId(null);
  };

  const updateItem = updated => setPlacedItems(items => {
    const next = constrainItem(updated, roomDim, items);
    return next ? items.map(item => item.uid === next.uid ? next : item) : items;
  });
  const rotateItem = uid => setPlacedItems(items => items.map(item => item.uid === uid ? (constrainItem({ ...item, rotation: (item.rotation + 90) % 360 }, roomDim, items) || item) : item));
  const handleDeleteItem = uid => {
    setPlacedItems(items => items.filter(item => item.uid !== uid || item.protected));
    setSelectedId(null);
  };
  const changeRoomSize = (size, type = roomType) => {
    const nextRoom = roomDimensions(size, type);
    const defaults = defaultAppliances(nextRoom);
    const nextItems = [];
    for (const item of [...placedItems].sort((a, b) => Number(Boolean(b.protected)) - Number(Boolean(a.protected)))) {
      const initial = type !== roomType && item.protected ? defaults.find(entry => entry.uid === item.uid) : { ...item, x: item.x * nextRoom.width / roomDim.width, y: item.y * nextRoom.height / roomDim.height };
      const next = constrainItem(initial, nextRoom, nextItems);
      if (!next) { setNotice('선택한 방에 모든 가구를 배치할 수 없어요. 가구를 줄인 후 다시 선택해 주세요.'); return; }
      nextItems.push(next);
    }
    setNotice('');
    setPlacedItems(nextItems);
    setRoomSize(size);
    setRoomType(type);
  };

  const saveRoom = async () => {
    if (!exportRef.current || saving) return;
    setSaving(true);
    setNotice('');
    let sourceUrl;
    try {
      const svg = exportRef.current.cloneNode(true);
      svg.querySelectorAll('[data-selection]').forEach(node => node.remove());
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const box = exportRef.current.viewBox.baseVal;
      const width = 2000, height = Math.round(width * box.height / box.width);
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      sourceUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {type: 'image/svg+xml;charset=utf-8'}));
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = sourceUrl; });
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d');
      context.fillStyle = '#f0f3f4'; context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Image export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `내가-꾸민-방-${roomType}형-${roomSize}평.png`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice('방 이미지를 PNG 파일로 저장했어요.');
    } catch { setNotice('이미지 저장에 실패했어요. 다시 시도해 주세요.'); }
    finally { if (sourceUrl) URL.revokeObjectURL(sourceUrl); setSaving(false); }
  };

  const triggerAppModal = (type) => {
    setModalState({ isOpen: true, type });
  };

  useEffect(() => {
    if (!openRoomControl) return;
    const closeOnOutside = event => {
      if (!roomControlsRef.current?.contains(event.target)) setOpenRoomControl(null);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpenRoomControl(null);
        roomControlsRef.current?.querySelector('[data-room-control-trigger="' + openRoomControl + '"]')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openRoomControl]);

  useEffect(() => {
    if (!modalState.isOpen) return;
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, [modalState.isOpen]);

  return (
    <div className="app-shell flex flex-col w-full bg-gray-100 text-gray-900 font-sans overflow-hidden sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 relative shadow-2xl pb-5">
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. INTRO SCREEN */}
      {step === 'intro' && (
        <div className="intro-screen flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-y-auto">
          <div className="h-2/5 bg-gradient-to-br from-[#35C5F0] to-[#1DA9D4] rounded-b-[3rem] relative flex items-center justify-center p-6 shadow-sm flex-shrink-0">
            <div className="absolute top-8 left-6 text-white font-bold text-xl tracking-tight">
              오늘의집 <span className="font-light opacity-90">공모전</span>
            </div>
            <div className="text-white text-center mt-6">
              <h1 className="text-3xl font-extrabold mb-2">대국민 방꾸미기<br/>프로젝트</h1>
              <p className="text-blue-50 opacity-90 text-sm">당신의 센스로 누군가의 로망을 이뤄주세요!</p>
            </div>
          </div>

          <div className="intro-content flex-1 px-6 -mt-8 relative z-10 pb-6 flex flex-col justify-between">
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 animate-float">
              <div className="flex items-center gap-2 mb-3 text-[#35C5F0]">
                <Quote size={18} className="rotate-180" />
                <span className="font-bold text-xs bg-blue-50 px-2 py-1 rounded-full">OOO님의 사연</span>
              </div>
              <h2 className="text-[1.1rem] font-bold text-gray-800 leading-snug mb-2">
                "사회초년생 원룸 거주중입니다. 깔끔하고 모던한 방을 만들고 싶은데 너무 어려워요 도와주세요!"
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">
                자취방을 얻었지만 어떻게 꾸며야 할지 막막한 사회초년생의 사연입니다. 평수를 고르고 가구를 배치해 모던한 방을 완성해 주세요.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Check size={14} className="text-[#35C5F0] flex-shrink-0" /> 공모전 참여시 100% 포인트 지급
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Check size={14} className="text-[#35C5F0] flex-shrink-0" /> 1등 상금 500만원 수여 및 커뮤니티 공식 인플루언서 기회 제공
                </div>
              </div>
            </div>

            {/* 참여하기 버튼 */}
            <div className="mt-4 mb-2">
              <button 
                onClick={() => setStep('editor')}
                className="w-full bg-[#35C5F0] hover:bg-[#28AADC] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                참여하기 <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDITOR SCREEN */}
      {step === 'editor' && (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-500 bg-[#f7f8fa]">
          
          <header className="flex flex-col px-4 py-3 bg-white border-b border-gray-200 z-30 shadow-sm gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => setStep('intro')} className="p-1 -ml-1 text-gray-600 hover:text-black">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-gray-800 hidden sm:block text-sm">이전</h1>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerAppModal('entry')}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:text-amber-600 whitespace-nowrap"
                  aria-label="응모방법 보기"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    <img src={"data:image/png;base64," + entryQuestionBase64.trim()} alt="" className="w-full h-full object-contain" />
                  </span>
                  응모방법
                </button>
                <button
                  onClick={saveRoom} disabled={saving}
                  className="text-white font-bold text-xs px-3 py-1.5 bg-[#35C5F0] rounded-lg shadow-sm hover:bg-[#28AADC] transition-colors"
                >
                  {saving ? '저장 중…' : '저장'}
                </button>
              </div>
            </div>

            <div className="editor-view-row">
              <div className="editor-view-toggle" role="group" aria-label="방 보기 방식">
                <button type="button" aria-pressed={viewMode === '2d'} onClick={() => setViewMode('2d')}>2D</button>
                <button type="button" aria-pressed="false" onClick={() => triggerAppModal('3d')}>3D</button>
              </div>
              <button type="button" className="story-button" onClick={() => triggerAppModal('story')}>
                <Quote size={14} /> 사연보기
              </button>
            </div>
          </header>

          {notice && <p className="editor-notice" role="status">{notice}</p>}
          <div className="room-workspace">
            <div className="room-workspace-heading">
              <span className="room-workspace-title">MY ROOM <b>· {roomType}형 · 2D</b></span>
              <div className="room-workspace-meta">
                <span className="room-workspace-detail">화장실 포함 · 가구 실측 비율</span>
                <div className="zoom-controls" role="group" aria-label="화면 확대 축소">
                  <button type="button" aria-label="축소" disabled={roomZoom <= 1} onClick={() => setRoomZoom(zoom => Math.max(1, zoom - .25))}>−</button>
                  <button type="button" aria-label="화면 맞춤" onClick={() => setRoomZoom(1)}>{Math.round(roomZoom * 100)}%</button>
                  <button type="button" aria-label="확대" disabled={roomZoom >= 3} onClick={() => setRoomZoom(zoom => Math.min(3, zoom + .25))}>＋</button>
                </div>
              </div>
            </div>
            <div className="room-editor-body">
              <aside ref={roomControlsRef} className="room-controls" aria-label="방 설정">
              <div className={openRoomControl === 'size' ? 'room-control-item is-open' : 'room-control-item'}>
                <button type="button" className="room-control-trigger" data-room-control-trigger="size"
                  aria-label={roomSize + '평 선택'} aria-expanded={openRoomControl === 'size'} aria-controls="room-size-options"
                  onClick={() => setOpenRoomControl(current => current === 'size' ? null : 'size')}>
                  <span className="room-control-value">{roomSize}평</span><span className="room-control-label">평수</span>
                </button>
                <div className="room-control-menu" id="room-size-options" role="group" aria-label="평수 선택" hidden={openRoomControl !== 'size'}>
                  <span className="room-control-menu-title">평수 선택</span>
                  {[5, 7, 10].map(size => <button type="button" key={size} className="room-control-option" aria-pressed={roomSize === size} onClick={() => { changeRoomSize(size); setOpenRoomControl(null); }}>{size}평</button>)}
                </div>
              </div>
              <div className={openRoomControl === 'type' ? 'room-control-item is-open' : 'room-control-item'}>
                <button type="button" className="room-control-trigger" data-room-control-trigger="type"
                  aria-label={roomType + '형 선택'} aria-expanded={openRoomControl === 'type'} aria-controls="room-type-options"
                  onClick={() => setOpenRoomControl(current => current === 'type' ? null : 'type')}>
                  <span className="room-control-value">{roomType}형</span><span className="room-control-label">구조</span>
                </button>
                <div className="room-control-menu" id="room-type-options" role="group" aria-label="방 구조 선택" hidden={openRoomControl !== 'type'}>
                  <span className="room-control-menu-title">구조 선택</span>
                  {['A', 'B'].map(type => <button type="button" key={type} className="room-control-option" aria-pressed={roomType === type} onClick={() => { changeRoomSize(roomSize, type); setOpenRoomControl(null); }}>{type}형</button>)}
                </div>
              </div>
              <div className={openRoomControl === 'floor' ? 'room-control-item is-open' : 'room-control-item'}>
                <button type="button" className="room-control-trigger" data-room-control-trigger="floor"
                  aria-label={(floorColor === 'wood' ? '우드' : floorColor === 'black' ? '검정' : '흰색') + ' 바닥 선택'}
                  aria-expanded={openRoomControl === 'floor'} aria-controls="room-floor-options"
                  onClick={() => setOpenRoomControl(current => current === 'floor' ? null : 'floor')}>
                  <span className={`floor-swatch floor-${floorColor} room-control-floor-swatch`} aria-hidden="true" />
                  <span className="room-control-value">{floorColor === 'wood' ? '우드' : floorColor === 'black' ? '검정' : '흰색'}</span><span className="room-control-label">바닥</span>
                </button>
                <div className="room-control-menu" id="room-floor-options" role="group" aria-label="바닥 색 선택" hidden={openRoomControl !== 'floor'}>
                  <span className="room-control-menu-title">바닥 선택</span>
                  {[['wood', '우드'], ['black', '검정'], ['white', '흰색']].map(([value, label]) => <button type="button" key={value} className="room-control-option" aria-pressed={floorColor === value} onClick={() => { setFloorColor(value); setOpenRoomControl(null); }}><span className={`floor-swatch floor-${value}`} aria-hidden="true" />{label}</button>)}
                </div>
              </div>
              </aside>
              <RoomPlan exportRef={exportRef} room={roomDim} floorColor={floorColor} items={placedItems} selectedId={selectedId} onSelect={setSelectedId} onChange={updateItem} onDelete={handleDeleteItem} onRotate={rotateItem} zoom={roomZoom} />
            </div>
          </div>

          <div 
            className="bg-[#FF6B6B] text-white text-xs font-bold py-2.5 px-4 text-center cursor-pointer flex items-center justify-center gap-2 z-30 shadow-md hover:bg-[#fa5a5a] transition-colors"
            onClick={() => triggerAppModal('ad')}
          >
            <span className="animate-bounce">🎉</span> 
            선택한 가구들 오늘의 집에서 최대 30% 할인중!
          </div>

          <div className="furniture-panel bg-white border-t border-gray-200 flex flex-col z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm">가구 추가</span>

            </div>
            
            <div ref={furnitureListRef}
              onScroll={e => {
                const list = e.currentTarget;
                const max = list.scrollWidth - list.clientWidth;
                setFurnitureScroll(max > 0 ? list.scrollLeft / max * 100 : 0);
              }}
              className="furniture-list flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 py-2">
              {CATALOG_ITEMS.map((item) => {
                return (
                  <div key={item.id} className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col h-full justify-between">
                    <div className="flex flex-col items-center mb-1">
                      <div className={`w-16 h-16 rounded-lg ${item.color || 'bg-gray-50'} mb-2 relative overflow-hidden flex items-center justify-center border border-gray-200`}>
                         <svg viewBox={`-8 -8 ${item.width + 16} ${item.height + 16}`} className="w-14 h-14" aria-hidden="true"><FurnitureShape item={item} /></svg>
                         {item.isLocked && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                             <Lock size={20} className="text-white drop-shadow-md" />
                           </div>
                         )}
                      </div>

                      <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-2 h-5">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-gray-400">{item.width} × {item.height} cm</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <button 
                        onClick={() => handleAddToRoom(item)}
                        aria-label={`${item.name} ${item.isLocked ? '앱에서 확인' : '배치하기'}`}
                        className={`w-full text-white text-[11px] font-bold py-2 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-transform ${item.isLocked ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        {item.isLocked ? <><Lock size={12} /> 앱에서 확인</> : <><Plus size={12} /> 배치하기</>}
                      </button>
                      

                    </div>
                  </div>
                );
              })}
              <button onClick={() => triggerAppModal('more')} className="more-furniture flex-shrink-0 w-36 h-full rounded-xl flex flex-col items-center justify-center gap-3 px-3">
                <span className="rounded-full bg-white p-3"><Plus size={24} /></span>
                <b className="text-xs">더 다양한 가구 추가</b>
                <span className="text-[10px] text-gray-500">오늘의집 앱에서 만나보세요</span>
              </button>
            </div>
            <div className="furniture-scroll-control">
              <span aria-hidden="true">‹</span>
              <input type="range" min="0" max="100" step="0.1" value={furnitureScroll}
                aria-label="가구 목록 좌우 스크롤"
                onChange={e => {
                  const value = Number(e.target.value);
                  setFurnitureScroll(value);
                  const list = furnitureListRef.current;
                  if (list) list.scrollLeft = (list.scrollWidth - list.clientWidth) * value / 100;
                }} />
              <span aria-hidden="true">›</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL */}
      {modalState.isOpen && modalState.type !== 'entry' && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="app-modal-title" tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') setModalState({ isOpen: false, type: '' });
            if (e.key === 'Tab') {
              const controls = [...e.currentTarget.querySelectorAll('button, a[href]')];
              const first = controls[0], last = controls[controls.length - 1];
              if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#35C5F0] p-6 text-center text-white relative">
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-white text-[#35C5F0] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                {modalState.type === 'story' ? <Quote size={32} /> : modalState.type === '3d' ? <Box size={32} /> : <Lock size={32} />}
              </div>
              <h3 id="app-modal-title" className="text-xl font-bold">
                {modalState.type === 'story' ? 'OOO님의 사연' : modalState.type === '3d' ? '3D 뷰는 앱에서 지원해요!' : 
                 modalState.type === 'more' ? '더 다양한 가구를 만나보세요!' :
                 modalState.type === 'premium' ? '오늘의 p!ck은 앱에서!' :
                 '가격 및 정보는 앱에서 확인!'}
              </h3>
            </div>
            
            <div className="p-6 text-center">
              {modalState.type === 'story' ? <div className="story-content">
                <p>“사회초년생 원룸 거주중입니다. 깔끔하고 모던한 방을 만들고 싶은데 너무 어려워요. 도와주세요!”</p>
                <h4>방 꾸미기 조건</h4>
                <ul><li>선택한 {roomSize}평 · {roomType}형 안에서 깔끔하고 모던하게 꾸며 주세요.</li><li>냉장고와 세탁기는 유지하되 위치와 방향을 바꿀 수 있어요.</li><li>주방·화장실·현관을 비우고, 러그 외 가구는 겹치지 않게 배치해 주세요.</li><li>완성한 방은 저장 버튼으로 이미지로 간직하세요.</li></ul>
                <button className="story-close" onClick={() => setModalState({isOpen:false,type:''})}>방 꾸미기 계속하기</button>
              </div> : <>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed whitespace-pre-line">
                {modalState.type === '3d' 
                  ? '더욱 실감나는 3D 인테리어 뷰와 AR 배치는\n오늘의집 앱에서 완벽하게 지원합니다!' 
                  : (modalState.type === 'premium' || modalState.type === 'more')
                  ? '나에게 꼭 맞는 가구부터 오늘의 p!ck까지,\n더 다양한 가구로 방을 완성해 보세요.\n앱을 다운로드해주세요.'
                  : '선택하신 가구의 실제 가격, 할인 혜택 및\n상세 정보는 앱에서 확인 가능합니다.'}
                <br/><br/>
                <span className="font-bold text-gray-900">앱을 설치하고 공모전에 응모해보세요!</span>
              </p>
              
              <a href="https://play.google.com/store/apps/details?id=net.bucketplace&gl=KR" target="_blank" rel="noreferrer"
                className="w-full py-3.5 rounded-xl font-bold text-white bg-[#35C5F0] hover:bg-[#28AADC] flex justify-center items-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Download size={18} /> Google Play에서 다운로드
              </a>
              <a href="https://apps.apple.com/kr/app/id1008236892" target="_blank" rel="noreferrer" className="block mt-3 text-sm font-bold text-sky-600">App Store에서 다운로드</a>
              
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="w-full mt-3 py-3 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                나중에 하기
              </button>
              </>}
            </div>
          </div>
        </div>
      )}
      {modalState.isOpen && modalState.type === 'entry' && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-guide-title"
          tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') setModalState({ isOpen: false, type: '' });
            if (e.key === 'Tab') {
              const controls = [...e.currentTarget.querySelectorAll('button, a[href]')];
              const first = controls[0], last = controls[controls.length - 1];
              if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <section className="relative w-full max-w-sm max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="flex-shrink-0 bg-[#35C5F0] text-white px-5 py-4">
              <button
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="absolute top-3 right-3 p-1 text-white/80 hover:text-white"
                aria-label="응모방법 닫기"
              >
                ✕
              </button>
              <p className="text-xs font-bold text-white/80 mb-1">오늘의집 공모전</p>
              <h2 id="entry-guide-title" className="text-xl font-extrabold">응모 방법</h2>
            </header>

            <div className="overflow-y-auto p-5">
              <figure className="mb-5">
                <img
                  src={"data:image/jpeg;base64," + instagramFollowBase64.trim()}
                  alt="오늘의집 인스타그램 프로필과 팔로우 버튼 예시"
                  className="w-full rounded-xl border border-gray-100 shadow-sm"
                />
                <figcaption className="mt-2 text-center text-[11px] text-gray-500">
                  오늘의집 인스타그램 팔로우 화면 예시
                </figcaption>
              </figure>

              <ol className="space-y-3">
                <li className="flex gap-3 rounded-xl bg-gray-50 p-3.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35C5F0] text-white text-xs font-extrabold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">인스타그램 및 유튜브 팔로우</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">오늘의집 인스타그램과 유튜브 계정을 모두 팔로우해 주세요.</p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl bg-gray-50 p-3.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35C5F0] text-white text-xs font-extrabold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">해시태그와 함께 인스타그램 게시물 올리기</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">완성한 공간과 사연을 인스타그램 게시물로 올리고 아래 해시태그를 달아 주세요.</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">#챌린지이름</span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">#오늘의집</span>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-gray-500">챌린지 이름이 정해지면 #챌린지이름 부분을 실제 해시태그로 바꿔 주세요.</p>
                  </div>
                </li>
              </ol>

              <section className="mt-8 border-t-2 border-gray-100 pt-5">
                <p className="text-[11px] font-bold tracking-wide text-[#35C5F0] mb-1">WINNER SELECTION</p>
                <h3 className="text-lg font-extrabold text-gray-900 mb-3">평가 방식</h3>
                <ul className="space-y-3 text-xs leading-relaxed text-gray-700">
                  <li><strong className="text-gray-900">대중 공감 지수 (50%)</strong><br />SNS를 뜨겁게 달군 좋아요(반응) 수</li>
                  <li><strong className="text-gray-900">전문가 심사 지수 (30%)</strong><br />마케팅·콘텐츠 전문가의 완성도 및 독창성 평가</li>
                  <li><strong className="text-gray-900">스토리텔링 지수 (20%)</strong><br />마음을 울리는 사연자(주인공)의 진정성 평가</li>
                </ul>
              </section>

              <div className="mt-5 rounded-xl bg-blue-50 p-3.5 text-center">
                <p className="text-sm font-bold text-gray-900">응모 결과는 오늘의집 앱에서 확인할 수 있어요.</p>
                <p className="mt-1 text-[11px] text-gray-600">오늘의집 앱을 다운로드해 공모전 소식과 결과를 확인해 주세요.</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="https://play.google.com/store/apps/details?id=net.bucketplace"
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-2 rounded-xl font-bold text-white text-xs bg-gray-900 hover:bg-black flex justify-center items-center gap-1.5 shadow-sm"
                >
                  <Download size={16} /> Google Play
                </a>
                <a
                  href="https://apps.apple.com/kr/app/%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-%EB%9D%BC%EC%9D%B4%ED%94%84%EC%8A%A4%ED%83%80%EC%9D%BC-%EC%8A%88%ED%8D%BC%EC%95%B1/id1008236892"
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-2 rounded-xl font-bold text-white text-xs bg-gray-900 hover:bg-black flex justify-center items-center gap-1.5 shadow-sm"
                >
                  <Download size={16} /> App Store
                </a>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none bg-white/90 text-[9px] text-gray-400 text-center py-1.5">
        ※ 할인율이나 프로그램 실행은 실제와 다를 수 있습니다.
      </div>
    </div>
  );
}
