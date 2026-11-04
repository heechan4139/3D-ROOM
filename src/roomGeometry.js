// All plan coordinates and furniture dimensions are in centimeters.
export const CATALOG_ITEMS = [
  { id: 'bed', name: '침대', width: 110, height: 200, isLocked: false },
  { id: 'desk', name: '책상', width: 120, height: 60, isLocked: false },
  { id: 'sofa', name: '1인용 소파', width: 80, height: 85, isLocked: false },
  { id: 'rug', name: '러그', width: 150, height: 200, isLocked: false },
  { id: 'lamp', name: '조명', width: 35, height: 35, isLocked: false },
  { id: 'plant', name: '화분', width: 45, height: 45, isLocked: false },
  { id: 'dresser', name: '서랍장', width: 80, height: 45, isLocked: false },
  { id: 'bookshelf', name: '책장', width: 80, height: 30, isLocked: false },
  { id: 'coffee_table', name: '소파 테이블', width: 80, height: 50, isLocked: false },
  { id: 'omons_bed', name: "오늘의 p!ck 침대", width: 150, height: 200, isLocked: true },
  { id: 'luxury_rug', name: "오늘의 p!ck 러그", width: 170, height: 230, isLocked: true },
];

export function roomDimensions(size, type = 'A') {
  const ratio = type === 'B' ? .48 : 1.18;
  const notchArea = type === 'B' ? 9900 : 0;
  const width = Math.sqrt((size * 3.3058 * 10000 + notchArea) / ratio);
  return { width, height: width * ratio, type };
}

export const KITCHEN_ITEMS = [
  { id: 'fridge', name: '냉장고', width: 60, height: 70 },
  { id: 'sink', name: '싱크대', width: 80, height: 60 },
  { id: 'induction', name: '인덕션', width: 60, height: 60 },
  { id: 'washer', name: '세탁기', width: 60, height: 60 },
];

export function roomLayout(room) {
  const { width: w, height: h } = room;
  const isB = room.type === 'B';
  const bathroom = isB ? { x: w - 240, y: h - 160, width: 200, height: 160 } : { x: w - 140, y: 0, width: 140, height: 160 };
  const kitchen = KITCHEN_ITEMS.filter(item => ['sink', 'induction'].includes(item.id)).map((item, i) => ({
    ...item, x: isB ? w - 310 + (i ? 80 : 0) : (i ? 156 : 76), y: 8, rotation: 0,
    boundsWidth: item.width, boundsHeight: item.height,
  }));
  const entry = isB ? { x: w - 90, y: 68, width: 90, height: h - 228 } : null;
  const closet = isB ? { x: w - 285, y: h - 160, width: 45, height: 160 } : null;
  const obstacles = isB ? [
    { x: w - 285, y: h - 160, width: 285, height: 160 }, entry,
  ] : [bathroom];
  obstacles.push(...kitchen.map(item => ({ x: item.x, y: item.y, width: item.width, height: item.height })));
  const outline = isB ? `M0 0H${w}V${h - 160}H${w - 40}V${h - 50}H${w - 110}V${h}H0Z` : `M0 0H${w}V${h}H0Z`;
  return { bathroom, kitchen, entry, closet, obstacles, outline };
}

export function defaultAppliances(room) {
  const fridge = KITCHEN_ITEMS.find(item => item.id === 'fridge');
  const washer = KITCHEN_ITEMS.find(item => item.id === 'washer');
  return [
    { ...fridge, uid: 'required-fridge', protected: true, rotation: 0, x: 38, y: 43 },
    { ...washer, uid: 'required-washer', protected: true, rotation: room.type === 'B' ? 0 : 270, x: room.type === 'B' ? 114 : 38, y: room.type === 'B' ? 38 : 230 },
  ];
}

export function placementObstacles(item, room, peers = []) {
  return [...roomLayout(room).obstacles, ...peers.filter(peer => peer.uid !== item.uid && !['rug', 'luxury_rug'].includes(peer.id) && !['rug', 'luxury_rug'].includes(item.id)).map(peer => {
    const bounds = footprint(peer);
    return { x: peer.x - bounds.width / 2, y: peer.y - bounds.height / 2, ...bounds };
  })];
}

export function isValidPosition(item, room, peers = []) {
  const { width, height } = footprint(item);
  const left = item.x - width / 2, top = item.y - height / 2;
  const right = left + width, bottom = top + height;
  const epsilon = .00001;
  if (left < 8 - epsilon || top < 8 - epsilon || right > room.width - 8 + epsilon || bottom > room.height - 8 + epsilon) return false;
  return placementObstacles(item, room, peers).every(rect =>
    right <= rect.x - 8 + epsilon || left >= rect.x + rect.width + 8 - epsilon ||
    bottom <= rect.y - 8 + epsilon || top >= rect.y + rect.height + 8 - epsilon);
}

export function footprint(item) {
  return item.rotation % 180 === 0
    ? { width: item.width, height: item.height }
    : { width: item.height, height: item.width };
}

export function constrainItem(item, room, peers = []) {
  const { width: w, height: h } = footprint(item);
  const clampX = x => Math.max(w / 2 + 8, Math.min(room.width - w / 2 - 8, x));
  const clampY = y => Math.max(h / 2 + 8, Math.min(room.height - h / 2 - 8, y));
  const desired = { ...item, x: clampX(item.x), y: clampY(item.y) };
  if (isValidPosition(desired, room, peers)) return desired;
  // The closest legal point lies on an obstacle or room boundary.
  const xs = [desired.x, clampX(0), clampX(room.width)];
  const ys = [desired.y, clampY(0), clampY(room.height)];
  for (const rect of placementObstacles(item, room, peers)) {
    xs.push(clampX(rect.x - 8 - w / 2), clampX(rect.x + rect.width + 8 + w / 2));
    ys.push(clampY(rect.y - 8 - h / 2), clampY(rect.y + rect.height + 8 + h / 2));
  }
  let best = null, distance = Infinity;
  for (const x of xs) for (const y of ys) {
    const candidate = { ...item, x, y };
    const score = (x - desired.x) ** 2 + (y - desired.y) ** 2;
    if (score < distance && isValidPosition(candidate, room, peers)) { best = candidate; distance = score; }
  }
  if (!best) return null;
  return best;
}
