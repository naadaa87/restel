// 직영 지점(플래그십) 데이터 — 운영자가 GitHub에서 직접 수정할 수 있습니다.
// 가격은 원(KRW) 단위이며, 기본 인원 가격입니다. 숫자는 운영 데이터에 맞춰 조정하세요.
import type { Locale } from '@/config/site';

type I18n = Record<Locale, string>;
type I18nList = Record<Locale, string[]>;

export interface SessionDef {
  code: 'nap60' | 'rest180' | 'dayrest' | 'krest90';
  durationMin: number;
  maxDurationMin?: number;
  priceWeekday: number;
  priceWeekend: number;
  basePeople: number;
  maxPeople: number;
  extraPersonPrice: number;
  perPerson?: boolean; // 1인 단위 가격(K-REST 90)
  startWindow: string; // 표시용
}

export interface FlagshipStore {
  slug: string;
  type: 'flagship';
  region: I18n;
  name: I18n;
  tagline: I18n;
  description: I18nList;
  features: I18nList;
  rules: I18nList;
  directions: I18nList;
  address: I18n;
  lat: number;
  lng: number;
  photos: { src: string; sm: string; alt: I18n }[];
  sessions: SessionDef[];
  hours: { open: string; close: string };
  capacityBase: number;
  capacityMax: number;
  areaM2: string;
  operator: string;
}

export const flagships: FlagshipStore[] = [
  {
    slug: 'sinchon',
    type: 'flagship',
    region: { ko: '서울 신촌', en: 'Sinchon, Seoul', ja: 'ソウル 新村', 'zh-tw': '首爾 新村', 'zh-cn': '首尔 新村', th: 'ชินชน โซล', vi: 'Sinchon, Seoul' },
    name: { ko: '레스텔 신촌', en: 'RESTEL Sinchon', ja: 'レステル新村', 'zh-tw': 'RESTEL 新村', 'zh-cn': 'RESTEL 新村', th: 'RESTEL ชินชน', vi: 'RESTEL Sinchon' },
    tagline: {
      ko: '기와 담장선 아래, 신발을 벗고 올라서는 쉼의 단',
      en: 'A wooden rest platform under a line of black roof tiles',
      ja: '黒瓦のラインの下、靴を脱いで上がる休息の小上がり',
      'zh-tw': '黑瓦屋脊線下，脫鞋踏上的休息平台',
      'zh-cn': '黑瓦屋脊线下，脱鞋踏上的休息平台',
      th: 'แท่นไม้พักผ่อนใต้แนวกระเบื้องหลังคาสีดำ',
      vi: 'Bục gỗ nghỉ ngơi dưới hàng ngói đen',
    },
    description: {
      ko: [
        '신촌역에서 가까운 상층부, 도시 야경이 보이는 긴 창을 가진 공간입니다. 긴 벽을 따라 한 단 올라선 좌식 단상이 있고, 그 위 벽에는 검은 기와가 담장선처럼 이어져 간접조명을 받습니다. 가운데에는 달을 닮은 아치 니치가 빛을 품고 있습니다.',
        '단상 위에는 접이식 매트와 담요, 메밀·라텍스 베개가 준비되어 있습니다. 침대는 없습니다. 가운데에는 함께 차를 마시거나 조용히 앉아 있을 수 있는 테이블이 있고, 창가에는 차림 코너(정수기·차·다식)가 있으며, 유리문 너머 테라스에서는 바깥 공기를 쐬거나 통화를 할 수 있습니다.',
        '레스텔 신촌은 숙박시설이 아닌 휴식 공간대여입니다. 모든 세션은 자정 전에 끝나며, 샤워 설비 없이 세면대만 있습니다.',
      ],
      en: [
        'An upper-floor space near Sinchon Station with a long window over the city. Along the main wall runs a raised wooden platform; above it, a line of black roof tiles catches soft indirect light, and a moon-shaped arched niche glows in the centre.',
        'On the platform you will find folding mats, blankets and buckwheat or latex pillows — no beds. In the middle, a table where you can sit quietly over tea; by the window, a tea corner with a water dispenser, tea and small sweets. Through the glass door, a terrace for fresh air and phone calls.',
        'RESTEL Sinchon is a rest space rental, not an accommodation. Every session ends before midnight, and there is a washbasin but no shower.',
      ],
      ja: [
        '新村駅から近い上層階、都市の夜景が見える長い窓のある空間です。長い壁に沿って一段上がった小上がりがあり、その上の壁には黒瓦が塀の線のように続いて間接照明を受けています。中央には月に似たアーチのニッチが光を抱いています。',
        '小上がりには折りたたみマットとブランケット、そば殻・ラテックスの枕を用意しています。ベッドはありません。中央にはお茶を飲みながら静かに座れるテーブル、窓際にはティーコーナー(ウォーターサーバー・お茶・茶菓子)、ガラス戸の向こうのテラスでは外の空気を吸ったり通話したりできます。',
        'レステル新村は宿泊施設ではなく休憩スペースのレンタルです。すべてのセッションは深夜0時前に終わり、シャワー設備はなく洗面台のみです。',
      ],
      'zh-tw': [
        '位於新村站附近的高樓層，有一整面可眺望城市夜景的長窗。沿著主牆是一段墊高的木平台，上方牆面延伸著一排黑瓦如圍牆屋脊線，承接間接照明；中央是形似月亮的拱形壁龕，含著柔光。',
        '平台上備有折疊墊、毯子、蕎麥枕與乳膠枕——沒有床。中央是一張可以安靜喝茶、坐著休息的桌子，窗邊是茶水角 (飲水機、茶、茶點)，玻璃門外的露台可以呼吸戶外空氣或講電話。',
        'RESTEL 新村是休息空間租借，不是住宿設施。所有方案在午夜前結束，有洗手台但沒有淋浴設備。',
      ],
      'zh-cn': [
        '位于新村站附近的高楼层，有一整面可眺望城市夜景的长窗。沿着主墙是一段垫高的木平台，上方墙面延伸着一排黑瓦如围墙屋脊线，承接间接照明；中央是形似月亮的拱形壁龛，含着柔光。',
        '平台上备有折叠垫、毯子、荞麦枕与乳胶枕——没有床。中央是一张可以安静喝茶、坐着休息的桌子，窗边是茶水角 (饮水机、茶、茶点)，玻璃门外的露台可以呼吸户外空气或打电话。',
        'RESTEL 新村是休息空间租赁，不是住宿设施。所有方案在午夜前结束，有洗手台但没有淋浴设备。',
      ],
      th: [
        'พื้นที่ชั้นบนใกล้สถานีชินชน มีหน้าต่างยาวมองเห็นวิวเมืองยามค่ำ ตามผนังหลักมีแท่นไม้ยกพื้น เหนือขึ้นไปเป็นแนวกระเบื้องหลังคาสีดำรับแสงอ้อม และซุ้มโค้งรูปพระจันทร์ตรงกลางเรืองแสงนุ่มนวล',
        'บนแท่นมีเบาะพับ ผ้าห่ม และหมอนบัควีตหรือหมอนยางพารา — ไม่มีเตียง ตรงกลางมีโต๊ะสำหรับนั่งจิบชาเงียบ ๆ ริมหน้าต่างเป็นมุมชา (ตู้กดน้ำ ชา ขนม) ผ่านประตูกระจกออกไปเป็นระเบียงสำหรับรับอากาศและคุยโทรศัพท์',
        'RESTEL ชินชนเป็นบริการเช่าพื้นที่พักผ่อน ไม่ใช่ที่พักค้างคืน ทุกแพ็กเกจสิ้นสุดก่อนเที่ยงคืน มีอ่างล้างหน้าแต่ไม่มีฝักบัว',
      ],
      vi: [
        'Không gian trên tầng cao gần ga Sinchon với ô cửa sổ dài nhìn ra thành phố về đêm. Dọc bức tường chính là bục gỗ nâng; phía trên, hàng ngói đen chạy dài đón ánh sáng gián tiếp, và hốc vòm hình trăng ở giữa phát sáng dịu.',
        'Trên bục có nệm gấp, chăn và gối kiều mạch hoặc cao su — không có giường. Ở giữa là một chiếc bàn để ngồi uống trà yên tĩnh; cạnh cửa sổ là góc trà với máy nước, trà và bánh nhỏ. Qua cửa kính là sân hiên để hít thở và nghe điện thoại.',
        'RESTEL Sinchon là dịch vụ cho thuê không gian nghỉ ngơi, không phải cơ sở lưu trú. Mọi gói kết thúc trước nửa đêm, có bồn rửa nhưng không có vòi sen.',
      ],
    },
    features: {
      ko: ['쉼의 단 (좌식 단상·접이식 매트·담요)', '담장선 (기와 몰딩 간접조명)', '달문 (아치 니치 조명)', '바람마루 (테라스)', '차림 코너 (정수기·차 3종·다식)', '조명 3단계', '사운드 채널·가이드 명상', '세면대 (샤워 없음)'],
      en: ['Rest platform (raised floor, folding mats, blankets)', 'Roofline (black tile moulding with indirect light)', 'Moon gate (lit arched niche)', 'Wind terrace', 'Tea corner (water dispenser, 3 teas, sweets)', 'Three light levels', 'Sound channels & guided meditation', 'Washbasin (no shower)'],
      ja: ['休息の小上がり(座式の段・折りたたみマット・ブランケット)', '瓦のライン(黒瓦モールディングの間接照明)', '月の門(アーチのニッチ照明)', '風のテラス', 'ティーコーナー(ウォーターサーバー・お茶3種・茶菓子)', '3段階照明', 'サウンドチャンネル・ガイド瞑想', '洗面台(シャワーなし)'],
      'zh-tw': ['休息平台 (席地木台・折疊墊・毯子)', '屋脊線 (黑瓦線板間接照明)', '月門 (拱形壁龕燈光)', '風之露台', '茶水角 (飲水機・3 種茶・茶點)', '三段燈光', '聲音頻道・引導冥想', '洗手台 (無淋浴)'],
      'zh-cn': ['休息平台 (席地木台・折叠垫・毯子)', '屋脊线 (黑瓦线条间接照明)', '月门 (拱形壁龛灯光)', '风之露台', '茶水角 (饮水机・3 种茶・茶点)', '三档灯光', '声音频道・引导冥想', '洗手台 (无淋浴)'],
      th: ['แท่นพักผ่อน (พื้นยก เบาะพับ ผ้าห่ม)', 'แนวหลังคา (บัวกระเบื้องดำพร้อมแสงอ้อม)', 'ประตูจันทร์ (ซุ้มโค้งมีไฟ)', 'ระเบียงรับลม', 'มุมชา (ตู้กดน้ำ ชา 3 ชนิด ขนม)', 'แสง 3 ระดับ', 'ช่องเสียงและสมาธินำทาง', 'อ่างล้างหน้า (ไม่มีฝักบัว)'],
      vi: ['Bục nghỉ (sàn nâng, nệm gấp, chăn)', 'Hàng ngói (phào ngói đen với đèn gián tiếp)', 'Cổng trăng (hốc vòm có đèn)', 'Sân hiên đón gió', 'Góc trà (máy nước, 3 loại trà, bánh)', 'Ba mức ánh sáng', 'Kênh âm thanh & thiền có hướng dẫn', 'Bồn rửa (không vòi sen)'],
    },
    rules: {
      ko: ['운영 07:00~24:00, 세션은 자정 전 종료', '만 19세 이상', '최대 6인 (기본 2인 + 추가 인원)', '통화는 테라스에서, 스피커 음량 3 이하', '간단한 간식만, 조리·음주 불가', '금연 · 반려동물 동반 불가'],
      en: ['Open 07:00–24:00; sessions end before midnight', 'Ages 19+', 'Up to 6 people (2 included + extras)', 'Calls on the terrace; speaker volume 3 or below', 'Light snacks only; no cooking or alcohol', 'No smoking · no pets'],
      ja: ['営業 07:00〜24:00、セッションは深夜0時前に終了', '19歳以上', '最大6名(基本2名+追加)', '通話はテラスで、スピーカー音量3以下', '軽い間食のみ、調理・飲酒不可', '禁煙 · ペット同伴不可'],
      'zh-tw': ['營業 07:00–24:00，方案於午夜前結束', '19 歲以上', '最多 6 人 (含 2 人 + 加人)', '通話請至露台，喇叭音量 3 以下', '僅限簡單點心，禁止烹飪與飲酒', '禁菸 · 不可攜帶寵物'],
      'zh-cn': ['营业 07:00–24:00，方案于午夜前结束', '19 岁以上', '最多 6 人 (含 2 人 + 加人)', '通话请至露台，音箱音量 3 以下', '仅限简单零食，禁止烹饪与饮酒', '禁烟 · 不可携带宠物'],
      th: ['เปิด 07:00–24:00 แพ็กเกจจบก่อนเที่ยงคืน', 'อายุ 19 ปีขึ้นไป', 'สูงสุด 6 คน (รวม 2 คน + เพิ่ม)', 'คุยโทรศัพท์ที่ระเบียง เสียงลำโพงไม่เกิน 3', 'ของว่างเบา ๆ เท่านั้น ห้ามทำอาหารและแอลกอฮอล์', 'ห้ามสูบบุหรี่ · ห้ามนำสัตว์เลี้ยง'],
      vi: ['Mở 07:00–24:00; gói kết thúc trước nửa đêm', 'Từ 19 tuổi', 'Tối đa 6 người (gồm 2 + thêm)', 'Nghe điện thoại ở sân hiên; âm lượng loa ≤ 3', 'Chỉ đồ ăn nhẹ; không nấu nướng, không rượu bia', 'Không hút thuốc · không thú cưng'],
    },
    directions: {
      ko: ['지하철 2호선 신촌역에서 도보 약 5분', '건물 공동 현관 비밀번호와 층수는 예약 확정 안내에 포함됩니다', '주차는 제공하지 않습니다. 인근 공영주차장을 이용해 주세요'],
      en: ['About 5 minutes on foot from Sinchon Station (Line 2)', 'The building entrance code and floor are included in your confirmation', 'No parking; please use nearby public car parks'],
      ja: ['地下鉄2号線 新村駅から徒歩約5分', '建物の共用玄関の暗証番号と階数は予約確定のご案内に記載します', '駐車場はありません。近隣の公営駐車場をご利用ください'],
      'zh-tw': ['地鐵 2 號線新村站步行約 5 分鐘', '大樓共用門禁密碼與樓層會寫在確認訊息中', '不提供停車，請使用鄰近公共停車場'],
      'zh-cn': ['地铁 2 号线新村站步行约 5 分钟', '大楼公用门禁密码与楼层会写在确认信息中', '不提供停车，请使用附近公共停车场'],
      th: ['เดินประมาณ 5 นาทีจากสถานีชินชน (สาย 2)', 'รหัสประตูอาคารและชั้นจะระบุในข้อความยืนยัน', 'ไม่มีที่จอดรถ กรุณาใช้ลานจอดสาธารณะใกล้เคียง'],
      vi: ['Khoảng 5 phút đi bộ từ ga Sinchon (tuyến 2)', 'Mã cửa tòa nhà và tầng được ghi trong tin nhắn xác nhận', 'Không có bãi đỗ xe; vui lòng dùng bãi công cộng gần đó'],
    },
    address: { ko: '서울특별시 서대문구 신촌 (상세 주소는 확정 안내에 포함)', en: 'Sinchon, Seodaemun-gu, Seoul (full address in your confirmation)', ja: 'ソウル特別市 西大門区 新村(詳細住所は確定案内に記載)', 'zh-tw': '首爾特別市西大門區新村 (詳細地址見確認訊息)', 'zh-cn': '首尔特别市西大门区新村 (详细地址见确认信息)', th: 'ชินชน เขตซอแดมุน โซล (ที่อยู่เต็มในข้อความยืนยัน)', vi: 'Sinchon, quận Seodaemun, Seoul (địa chỉ đầy đủ trong tin xác nhận)' },
    lat: 37.5559,
    lng: 126.9368,
    photos: [
      { src: '/images/sinchon/hall.webp', sm: '/images/sinchon/hall-sm.webp', alt: { ko: '레스텔 신촌 전체 공간 — 테이블과 좌식 단상', en: 'RESTEL Sinchon — main room with table and rest platform', ja: 'レステル新村 全体 — テーブルと小上がり', 'zh-tw': 'RESTEL 新村整體空間 — 桌子與休息平台', 'zh-cn': 'RESTEL 新村整体空间 — 桌子与休息平台', th: 'RESTEL ชินชน — ห้องหลักพร้อมโต๊ะและแท่นพัก', vi: 'RESTEL Sinchon — phòng chính với bàn và bục nghỉ' } },
      { src: '/images/sinchon/mats.webp', sm: '/images/sinchon/mats-sm.webp', alt: { ko: '좌식 단상 위 매트와 달문 조명', en: 'Mats on the platform and the lit moon-gate niche', ja: '小上がりのマットと月の門の照明', 'zh-tw': '平台上的墊子與月門燈光', 'zh-cn': '平台上的垫子与月门灯光', th: 'เบาะบนแท่นและซุ้มประตูจันทร์ที่มีไฟ', vi: 'Nệm trên bục và hốc cổng trăng có đèn' } },
      { src: '/images/sinchon/terrace.webp', sm: '/images/sinchon/terrace-sm.webp', alt: { ko: '바람마루 테라스 야간', en: 'The terrace at night', ja: '夜のテラス', 'zh-tw': '夜晚的露台', 'zh-cn': '夜晚的露台', th: 'ระเบียงยามค่ำคืน', vi: 'Sân hiên về đêm' } },
      { src: '/images/sinchon/amenities.webp', sm: '/images/sinchon/amenities-sm.webp', alt: { ko: '차림 코너와 가전', en: 'Tea corner and amenities', ja: 'ティーコーナーと家電', 'zh-tw': '茶水角與設備', 'zh-cn': '茶水角与设备', th: 'มุมชาและสิ่งอำนวยความสะดวก', vi: 'Góc trà và tiện nghi' } },
      { src: '/images/sinchon/family.webp', sm: '/images/sinchon/family-sm.webp', alt: { ko: '좌식 단상에서 함께 쉬는 장면 (연출)', en: 'Resting together on the platform (staged)', ja: '小上がりで一緒に休む様子(演出)', 'zh-tw': '在平台上一起休息 (情境示意)', 'zh-cn': '在平台上一起休息 (情境示意)', th: 'พักผ่อนด้วยกันบนแท่น (จัดฉาก)', vi: 'Cùng nghỉ trên bục (dàn dựng)' } },
    ],
    sessions: [
      { code: 'nap60', durationMin: 60, priceWeekday: 18000, priceWeekend: 20000, basePeople: 2, maxPeople: 6, extraPersonPrice: 6000, startWindow: '07:00–22:30' },
      { code: 'rest180', durationMin: 180, priceWeekday: 39000, priceWeekend: 45000, basePeople: 2, maxPeople: 6, extraPersonPrice: 6000, startWindow: '07:00–20:30' },
      { code: 'dayrest', durationMin: 480, maxDurationMin: 480, priceWeekday: 89000, priceWeekend: 99000, basePeople: 4, maxPeople: 6, extraPersonPrice: 6000, startWindow: '07:00–15:30' },
      { code: 'krest90', durationMin: 90, priceWeekday: 39000, priceWeekend: 39000, basePeople: 2, maxPeople: 6, extraPersonPrice: 0, perPerson: true, startWindow: '13:00–18:00' },
    ],
    hours: { open: '07:00', close: '24:00' },
    capacityBase: 2,
    capacityMax: 6,
    areaM2: '약 60㎡ + 테라스',
    operator: 'RESTEL',
  },
];

export function getFlagship(slug: string) {
  return flagships.find((f) => f.slug === slug) || null;
}
