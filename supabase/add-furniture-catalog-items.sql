-- Add new catalog items to an existing project. Safe to run more than once.
-- Existing totals are preserved.
insert into public.furniture_counts (item_id, item_name) values
  ('fabric_bed', '패브릭 침대'),
  ('beige_bean_bag', '베이지 빈백'),
  ('white_round_rug', '흰색 원형 러그'),
  ('floor_lamp', '스탠드 조명'),
  ('white_wardrobe', '화이트 옷장'),
  ('white_partition', '흰색 파티션')
on conflict (item_id) do nothing;
