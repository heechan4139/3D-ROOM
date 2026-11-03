import React, { useState, useRef } from 'react';
import { 
  BedDouble, Armchair, Monitor, Lamp, Square, 
  ChevronLeft, Lock, Download, Quote, Check, Plus, Box, X, Table, Bed, Layers, ChevronRight
} from 'lucide-react';

// --- 가구 아이콘 렌더링 헬퍼 ---
const renderIcon = (id, size = 24, className = "text-gray-700") => {
  switch (id) {
    case 'bed': return <BedDouble size={size} className={className} />;
    case 'sofa': return <Armchair size={size} className={className} />;
    case 'desk': return <Table size={size} className={className} />;
    case 'lamp': return <Lamp size={size} className={className} />;
    case 'rug': return <Square size={size} className={className} />;
    case 'luxury_rug': return <Layers size={size} className={className} />;
    case 'omons_bed': return <Bed size={size} className={className} />;
    default: return <Box size={size} className={className} />;
  }
};

// --- 가구 카탈로그 데이터 ---
const CATALOG_ITEMS = [
  { id: 'bed', name: '포근한 수납 침대', width: 80, height: 110, isLocked: false, color: 'bg-blue-100' },
  { id: 'sofa', name: '3인용 패브릭 소파', width: 100, height: 60, isLocked: false, color: 'bg-orange-100' },
  { id: 'desk', name: '깔끔한 화이트 책상', width: 90, height: 50, isLocked: false, color: 'bg-gray-100' },
  { id: 'lamp', name: '무드 스탠드 조명', width: 45, height: 45, isLocked: false, color: 'bg-yellow-100' },
  { id: 'rug', name: '포근한 사각 러그', width: 110, height: 110, isLocked: false, color: 'bg-green-100' },
  { id: 'luxury_rug', name: '고급진 러그', width: 120, height: 120, isLocked: true, color: 'bg-purple-100' },
  { id: 'omons_bed', name: 'O몬스 침대', width: 85, height: 115, isLocked: true, color: 'bg-red-100' },
];

// --- 드래그 가능한 가구 아이콘 컴포넌트 ---
const DraggableItem = ({ item, onUpdatePosition, onDelete }) => {
  const [position, setPosition] = useState({ x: item.x, y: item.y });
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    onUpdatePosition(item.uid, position.x, position.y);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.uid);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-xl pointer-events-auto ${item.color || 'bg-white'} rounded-md border border-gray-300`}
      style={{
        width: item.width,
        height: item.height,
        left: position.x,
        top: position.y,
        touchAction: 'none',
        zIndex: isDragging.current ? 50 : 10,
      }}
    >
      <button 
        onPointerDown={handleDelete}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors z-20"
      >
        <X size={16} strokeWidth={3} />
      </button>

      {renderIcon(item.id, Math.min(item.width, item.height) * 0.5, "text-gray-600 opacity-70")}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState('intro');
  const [roomSize, setRoomSize] = useState(7);
  const [viewMode, setViewMode] = useState('2d');
  const [placedItems, setPlacedItems] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  const handleAddToRoom = (catalogItem) => {
    if (catalogItem.isLocked) {
      triggerAppModal('premium');
      return;
    }

    const newItem = {
      ...catalogItem,
      uid: Date.now() + Math.random(),
      x: window.innerWidth > 640 ? 160 + Math.random() * 40 : window.innerWidth / 2 - 40 + Math.random() * 20,
      y: 200 + Math.random() * 40,
    };
    setPlacedItems([...placedItems, newItem]);
  };

  const updateItemPosition = (uid, x, y) => {
    setPlacedItems(items => 
      items.map(item => item.uid === uid ? { ...item, x, y } : item)
    );
  };

  const handleDeleteItem = (uid) => {
    setPlacedItems(items => items.filter(item => item.uid !== uid));
  };

  const triggerAppModal = (type) => {
    setModalState({ isOpen: true, type });
  };

  const getRoomDimensions = (size) => {
    switch(size) {
      case 5: return { width: 200, height: 200 };
      case 7: return { width: 260, height: 260 };
      case 10: return { width: 320, height: 320 };
      default: return { width: 260, height: 260 };
    }
  };

  const roomDim = getRoomDimensions(roomSize);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 text-gray-900 font-sans overflow-hidden sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 relative shadow-2xl pb-5">
      
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
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-y-auto">
          <div className="h-2/5 bg-gradient-to-br from-[#35C5F0] to-[#1DA9D4] rounded-b-[3rem] relative flex items-center justify-center p-6 shadow-sm flex-shrink-0">
            <div className="absolute top-8 left-6 text-white font-bold text-xl tracking-tight">
              오늘의집 <span className="font-light opacity-90">공모전</span>
            </div>
            <div className="text-white text-center mt-6">
              <h1 className="text-3xl font-extrabold mb-2">대국민 방꾸미기<br/>프로젝트</h1>
              <p className="text-blue-50 opacity-90 text-sm">당신의 센스로 누군가의 로망을 이뤄주세요!</p>
            </div>
          </div>

          <div className="flex-1 px-6 -mt-8 relative z-10 pb-6 flex flex-col justify-between">
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

              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === '2d' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                  onClick={() => setViewMode('2d')}
                >
                  2D
                </button>
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all text-gray-500 hover:text-black`}
                  onClick={() => triggerAppModal('3d')}
                >
                  3D
                </button>
              </div>

              <button 
                onClick={() => setStep('success')}
                className="text-white font-bold text-xs px-3 py-1.5 bg-[#35C5F0] rounded-lg shadow-sm hover:bg-[#28AADC] transition-colors"
              >
                응모
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {[5, 7, 10].map((size) => (
                <button
                  key={size}
                  onClick={() => setRoomSize(size)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border ${
                    roomSize === size 
                      ? 'border-[#35C5F0] bg-blue-50 text-[#35C5F0]' 
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {size}평
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <div 
              className="bg-white border-2 border-gray-300 shadow-inner relative transition-all duration-500 ease-out"
              style={{
                width: roomDim.width,
                height: roomDim.height,
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              <div className="absolute bottom-0 right-4 w-12 h-2 bg-blue-200 border border-blue-400 rounded-t-full flex items-center justify-center">
                <span className="text-[8px] text-blue-800 font-bold">문</span>
              </div>
            </div>

            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {placedItems.length === 0 && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-medium shadow-md backdrop-blur-sm whitespace-nowrap">
                  하단에서 가구를 추가해보세요
                </div>
              )}
              {placedItems.map(item => (
                <DraggableItem 
                  key={item.uid} 
                  item={item} 
                  onUpdatePosition={updateItemPosition} 
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>

          <div 
            className="bg-[#FF6B6B] text-white text-xs font-bold py-2.5 px-4 text-center cursor-pointer flex items-center justify-center gap-2 z-30 shadow-md hover:bg-[#fa5a5a] transition-colors"
            onClick={() => triggerAppModal('ad')}
          >
            <span className="animate-bounce">🎉</span> 
            선택한 가구들 오늘의 집에서 최대 30% 할인중!
          </div>

          <div className="h-60 bg-white border-t border-gray-200 flex flex-col z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm">배치 가능 가구</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">좌우 스와이프</span>
            </div>
            
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 scrollbar-hide py-2">
              {CATALOG_ITEMS.map((item) => {
                return (
                  <div key={item.id} className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col h-full justify-between">
                    <div className="flex flex-col items-center mb-1">
                      <div className={`w-16 h-16 rounded-lg ${item.color || 'bg-gray-50'} mb-2 relative overflow-hidden flex items-center justify-center border border-gray-200`}>
                         {renderIcon(item.id, 28, "text-gray-700")}
                         {item.isLocked && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                             <Lock size={20} className="text-white drop-shadow-md" />
                           </div>
                         )}
                      </div>

                      <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-2 h-8">
                        {item.name}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <button 
                        onClick={() => handleAddToRoom(item)}
                        className={`w-full text-white text-[11px] font-bold py-2 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-transform ${item.isLocked ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        {item.isLocked ? <><Lock size={12} /> 앱에서 확인</> : <><Plus size={12} /> 배치하기</>}
                      </button>
                      
                      <button 
                        onClick={() => triggerAppModal('price')}
                        className="w-full bg-blue-50 text-[#35C5F0] text-[11px] font-bold py-2 rounded-md flex items-center justify-center gap-1 hover:bg-blue-100 active:scale-95 transition-transform"
                      >
                        <Lock size={12} /> 앱에서 가격 보기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS SCREEN */}
      {step === 'success' && (
        <div className="flex flex-col h-full bg-white items-center justify-center p-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-blue-50 text-[#35C5F0] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">응모가 완료되었습니다!</h2>
          <p className="text-gray-500 text-center mb-10 leading-relaxed text-sm">
            소중한 인테리어 아이디어를 제출해주셔서 감사합니다.<br/>
            응모 투표 및 상세 결과는 <span className="font-bold text-gray-800">오늘의집 앱</span>에서<br/>
            확인하실 수 있습니다.
          </p>
          
          <button 
            onClick={() => alert("앱 스토어로 이동하는 기능입니다.")}
            className="w-full max-w-xs bg-[#35C5F0] hover:bg-[#28AADC] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mb-3"
          >
            <Download size={20} /> 앱에서 결과 확인하기
          </button>
          
          <button 
            onClick={() => {
              setStep('intro');
              setPlacedItems([]);
            }}
            className="text-gray-400 hover:text-gray-600 font-medium text-sm py-2 mt-2"
          >
            처음으로 돌아가기
          </button>
        </div>
      )}

      {/* 4. MODAL */}
      {modalState.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#35C5F0] p-6 text-center text-white relative">
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-white text-[#35C5F0] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                {modalState.type === '3d' ? <Box size={32} /> : <Lock size={32} />}
              </div>
              <h3 className="text-xl font-bold">
                {modalState.type === '3d' ? '3D 뷰는 앱에서 지원해요!' : 
                 modalState.type === 'premium' ? '프리미엄 가구는 앱에서!' :
                 '가격 및 정보는 앱에서 확인!'}
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {modalState.type === '3d' 
                  ? '더욱 실감나는 3D 인테리어 뷰와 AR 배치는\n오늘의집 앱에서 완벽하게 지원합니다!' 
                  : modalState.type === 'premium'
                  ? '웹 프로토타입에서 제공되는 기본 가구 외에\n더 다양한 프리미엄 가구를 추가하려면\n앱을 다운로드해주세요.'
                  : '선택하신 가구의 실제 가격, 할인 혜택 및\n상세 정보는 앱에서 확인 가능합니다.'}
                <br/><br/>
                <span className="font-bold text-gray-900">앱을 설치하고 공모전에 응모해보세요!</span>
              </p>
              
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-[#35C5F0] hover:bg-[#28AADC] flex justify-center items-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Download size={18} /> 앱 다운로드 및 응모하기
              </button>
              
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="w-full mt-3 py-3 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none bg-white/90 text-[9px] text-gray-400 text-center py-1.5">
        ※ 할인율이나 프로그램 실행은 실제와 다를 수 있습니다.
      </div>
    </div>
  );
}
