# -*- coding: utf-8 -*-
# 호스트 기능 2차: 7개 언어 사전에 호스트 안내·결제 안내 키를 추가/갱신한다. (1회성 스크립트, 실행 후 보관)
import json, pathlib

BASE = pathlib.Path(__file__).resolve().parent.parent / 'src/i18n/locales'

DATA = {
 'ko': {
  'book': {'closedDate': '선택한 날짜는 휴무일입니다. 다른 날짜를 골라 주세요.', 'pastDate': '지난 날짜는 선택할 수 없습니다.'},
  'request': {
   'statuses': {'noshow': '미방문'},
   'senders': {'customer': '나', 'host': '호스트', 'admin': '레스텔'},
   'payment': {'title': '결제 안내', 'amount': '결제 금액', 'method': '결제 방법', 'methods': {'transfer': '계좌이체', 'onsite': '현장 결제', 'card': '카드 결제'}, 'pending': '호스트가 곧 안내합니다', 'bank': '입금 계좌', 'holder': '예금주', 'deadline': '입금 기한', 'deadlineNote': '확정 안내 후 {hours}시간 이내', 'onsite': '현장 결제', 'onsiteNote': '입장 때 카드 또는 현금으로 결제합니다.', 'paid': '결제가 확인되었습니다', 'refunded': '환불 처리되었습니다', 'refundDefault': '취소·환불: 이용 48시간 전까지 100%, 24시간 전까지 50%, 이후 환불 없음.'}
  },
  'hosts': {
   'lead': '비어 있는 시간이 많은 파티룸, 스튜디오, 공실을 레스텔 기준에 맞춰 휴식 공간으로 전환하세요. 레스텔이 7개 언어 노출, 예약 접수, 결제·입장 안내 템플릿, 정산, 운영 규칙을 함께 제공합니다.',
   'rolesTitle': '역할은 이렇게 나눕니다',
   'roles': [
    {'title': '호스트가 하는 일', 'items': ['공간을 레스텔 기준(접이식 매트·담요, 조명 3단계, 암막, 안전시설)에 맞춥니다', '세션·요금·휴무일을 정하고 사진을 올립니다', '요청에 24시간 안에 응답하고, 결제를 확인하고, 입장 안내를 보냅니다', '세션 사이 정리와 매트 커버 교체, 이용 완료 처리를 합니다']},
    {'title': '레스텔이 하는 일', 'items': ['7개 언어 사이트와 K-REST 콘텐츠로 외국인·국내 고객에게 노출합니다', '예약 요청 접수, 고객 조회 페이지, 7개 언어 안내 템플릿을 제공합니다', '휴식 공간대여 운영 기준과 안내문, 점검표, 응대 가이드를 제공합니다', '월별 정산서를 발행하고 호스트 센터에서 1:1로 지원합니다']}
   ],
   'flowTitle': '예약부터 정산까지',
   'flow': [
    {'title': '요청 접수', 'body': '고객이 세션·날짜·인원을 골라 요청을 보내면 포털과 이메일로 알림이 옵니다.'},
    {'title': '확정 또는 불가', 'body': '가능 여부를 확인하고 금액과 결제 방법을 정해 확정합니다. 안내문은 고객 언어로 자동 작성됩니다.'},
    {'title': '결제 확인', 'body': '계좌이체는 입금 확인, 현장 결제는 입장 때 받습니다. 온라인 카드 결제는 순차 도입됩니다.'},
    {'title': '입장 안내', 'body': '주소·도어락 비밀번호·주의사항을 보냅니다. 전날 리마인더로 미방문을 줄입니다.'},
    {'title': '세션과 정리', 'body': '종료 10분 전 알림, 정리 시간 확보, 이용 완료 처리.'},
    {'title': '월별 정산', 'body': '완료된 세션 매출에 수수료(기본 15%)를 적용해 다음 달 정산서를 발행합니다.'}
   ],
   'fitTitle': '어떤 공간이 맞을까요',
   'fitGood': ['평일 낮 가동률이 낮은 파티룸·모임 공간', '자연광과 암막을 함께 갖춘 스튜디오', '조용한 상가 2층 이상 공실, 10~40㎡', '요가·명상 공간의 빈 시간대', '역에서 도보 10분 이내, 외국인 방문이 많은 동네'],
   'fitBad': ['침대·호텔식 침구를 그대로 두고 싶은 공간', '샤워·세탁을 상품으로 내세워야 하는 공간', '자정 이후까지 운영해야 수익이 나는 공간', '환기가 안 되거나 소방 안전시설을 갖추기 어려운 지하 공간', '같은 공간을 숙박 플랫폼에 숙박 상품으로 올리고 있는 경우'],
   'portalTitle': '호스트 포털에서 할 수 있는 일',
   'portal': [
    {'title': '공간 등록·다국어 소개', 'body': '한국어·영어만 적어도 7개 언어 페이지에 노출됩니다.'},
    {'title': '세션·요금·휴무일', 'body': '세션별 평일/주말 요금, 추가 인원, 휴무 요일과 날짜, 정리 시간.'},
    {'title': '예약 달력과 할 일', 'body': '월 달력, 오늘 세션, 답장이 필요한 메시지, 결제 미완료를 한눈에.'},
    {'title': '결제·입장 안내 템플릿', 'body': '확정·결제·입장·리마인더·취소 메시지를 고객 언어로 불러와 보냅니다.'},
    {'title': '정산 내역', 'body': '월별 매출·수수료·정산액과 세션별 내역, 정산서 상태.'},
    {'title': '호스트 센터', 'body': '운영 가이드, 공지, 1:1 문의, 인쇄용 안내문과 점검표.'}
   ],
   'faqTitle': '입점 전 자주 묻는 질문',
   'faq': [
    {'q': '입점비나 월 이용료가 있나요?', 'a': '없습니다. 레스텔을 통해 들어와 이용이 완료된 세션 매출에 대해서만 수수료(기본 15%)를 정산합니다.'},
    {'q': '숙박업 신고가 필요한가요?', 'a': '레스텔은 숙박시설이 아닌 휴식 공간대여로 운영합니다. 시간 단위 세션, 자정 전 종료, 침대 없음 등 기준을 지키는 것이 조건이며, 소방 관련 다중이용업 기준은 관할 소방서에 확인해 함께 맞춥니다.'},
    {'q': '파티룸 운영과 병행할 수 있나요?', 'a': '네. 낮에는 레스텔 세션, 저녁에는 파티룸으로 운영하는 이중 운영을 권장합니다. 세션 시간에는 파티 장식과 조명을 정돈해 주세요.'},
    {'q': '외국인 고객 응대가 걱정됩니다.', 'a': '확정·결제·입장·리마인더 메시지가 7개 언어 템플릿으로 준비되어 있고, 금액과 시간은 숫자로 전달됩니다. 필요하면 레스텔 운영팀이 돕습니다.'},
    {'q': '결제는 어떻게 받나요?', 'a': '1차 운영은 계좌이체 또는 현장 결제입니다. 확정 후 결제 안내를 보내고 입금을 확인하면 입장 안내로 이어집니다. 온라인 카드 결제는 순차 도입됩니다.'},
    {'q': '승인까지 얼마나 걸리나요?', 'a': '가입 후 사업 정보 확인은 영업일 3일, 공간 검토 요청 후 결과 안내도 영업일 3일 이내입니다. 보완 항목이 있으면 포털에 표시됩니다.'}
   ]
  }
 },
 'en': {
  'book': {'closedDate': 'That date is a closed day for this space. Please pick another date.', 'pastDate': 'Past dates cannot be selected.'},
  'request': {
   'statuses': {'noshow': 'No-show'},
   'senders': {'customer': 'You', 'host': 'Host', 'admin': 'RESTEL'},
   'payment': {'title': 'Payment', 'amount': 'Amount', 'method': 'Method', 'methods': {'transfer': 'Bank transfer', 'onsite': 'Pay on site', 'card': 'Card'}, 'pending': 'The host will send details shortly', 'bank': 'Account', 'holder': 'Holder', 'deadline': 'Pay by', 'deadlineNote': 'within {hours} hours of confirmation', 'onsite': 'On site', 'onsiteNote': 'Pay by card or cash when you arrive.', 'paid': 'Payment received', 'refunded': 'Refund issued', 'refundDefault': 'Cancellation: 100% refund up to 48 hours before, 50% up to 24 hours before, none after that.'}
  },
  'hosts': {
   'lead': 'Turn an under-used party room, studio or vacant unit into a rest space that meets the RESTEL standard. RESTEL brings exposure in seven languages, request handling, payment and entry templates, monthly settlement and the operating rules.',
   'rolesTitle': 'Who does what',
   'roles': [
    {'title': 'The host', 'items': ['Fits the space to the RESTEL standard: folding mats and blankets, three lighting levels, blackout, fire safety', 'Sets sessions, prices and closed days, and uploads photos', 'Answers requests within 24 hours, confirms payment, sends entry instructions', 'Resets the space between sessions and marks sessions complete']},
    {'title': 'RESTEL', 'items': ['Presents the space to international and Korean guests through a seven-language site and K-REST content', 'Provides request intake, a guest tracking page and message templates in seven languages', 'Provides the rest-space operating standard, printable signs, checklists and a service guide', 'Issues monthly settlements and supports hosts one-to-one through the Host Center']}
   ],
   'flowTitle': 'From request to settlement',
   'flow': [
    {'title': 'Request', 'body': 'A guest picks a session, date and group size. You are notified in the portal and by email.'},
    {'title': 'Confirm or decline', 'body': 'Check availability, set the amount and payment method, confirm. The message is drafted in the guest\'s language.'},
    {'title': 'Payment', 'body': 'Bank transfer is confirmed by you; on-site payment is taken at arrival. Online card payment is being added.'},
    {'title': 'Entry instructions', 'body': 'Send the address, door code and house notes. A reminder the day before reduces no-shows.'},
    {'title': 'Session and reset', 'body': 'Chime ten minutes before the end, reset time between sessions, mark complete.'},
    {'title': 'Monthly settlement', 'body': 'Commission (15% by default) applies to completed sessions; a settlement statement is issued the following month.'}
   ],
   'fitTitle': 'Which spaces fit',
   'fitGood': ['Party rooms and meeting spaces with quiet weekday afternoons', 'Studios with daylight and blackout', 'Quiet second-floor-or-higher units of 10–40 m²', 'Idle hours at yoga and meditation studios', 'Within a ten-minute walk of a station, in areas visitors already go'],
   'fitBad': ['Spaces that want to keep hotel-style bedding as is', 'Spaces that depend on selling showers or laundry', 'Spaces that only pay off after midnight', 'Basements without ventilation or fire-safety fittings', 'Spaces listed on accommodation platforms as a place to stay the night'],
   'portalTitle': 'What the host portal does',
   'portal': [
    {'title': 'Listing in seven languages', 'body': 'Write Korean and English; the page appears in all seven languages.'},
    {'title': 'Sessions, prices, closed days', 'body': 'Weekday and weekend prices per session, extra guests, closed weekdays and dates, reset time.'},
    {'title': 'Calendar and to-do', 'body': 'Monthly calendar, today\'s sessions, messages awaiting a reply, unpaid sessions.'},
    {'title': 'Payment and entry templates', 'body': 'Confirmation, payment, entry, reminder and cancellation messages in the guest\'s language.'},
    {'title': 'Settlement', 'body': 'Monthly revenue, commission and payout, session by session.'},
    {'title': 'Host Center', 'body': 'Operating guide, notices, one-to-one support, printable signs and checklists.'}
   ],
   'faqTitle': 'Questions hosts ask',
   'faq': [
    {'q': 'Is there a listing fee or monthly fee?', 'a': 'No. Commission (15% by default) applies only to completed sessions that came through RESTEL.'},
    {'q': 'Do I need an accommodation licence?', 'a': 'RESTEL operates as rest-space rental, not accommodation. The condition is to keep the standard: hourly sessions ending before midnight, no beds, adults only. Fire-safety requirements for multi-use premises are confirmed with the local fire station.'},
    {'q': 'Can I keep running my party room?', 'a': 'Yes. We recommend RESTEL sessions by day and party use in the evening. Tidy away party props and lighting during sessions.'},
    {'q': 'I am worried about international guests.', 'a': 'Confirmation, payment, entry and reminder messages are templated in seven languages, and amounts and times are sent as numbers. The RESTEL team helps when needed.'},
    {'q': 'How do I get paid?', 'a': 'Phase one uses bank transfer or payment on site. After confirming, you send payment details; once paid, you send entry instructions. Online card payment is being added.'},
    {'q': 'How long does approval take?', 'a': 'Business details are checked within three working days of signing up, and a space review is answered within three working days of the request. Anything to fix is shown in the portal.'}
   ]
  }
 },
 'ja': {
  'book': {'closedDate': '選択した日は休業日です。別の日を選んでください。', 'pastDate': '過去の日付は選べません。'},
  'request': {
   'statuses': {'noshow': '未来店'},
   'senders': {'customer': 'あなた', 'host': 'ホスト', 'admin': 'RESTEL'},
   'payment': {'title': 'お支払い', 'amount': '金額', 'method': '方法', 'methods': {'transfer': '銀行振込', 'onsite': '現地決済', 'card': 'カード'}, 'pending': 'ホストから間もなく案内があります', 'bank': '振込先', 'holder': '名義', 'deadline': '期限', 'deadlineNote': '確定案内から{hours}時間以内', 'onsite': '現地', 'onsiteNote': '到着時にカードまたは現金でお支払いください。', 'paid': 'お支払いを確認しました', 'refunded': '返金処理済み', 'refundDefault': 'キャンセル: 48時間前まで100%、24時間前まで50%、以降は返金なし。'}
  },
  'hosts': {
   'lead': '空き時間の多いパーティールームやスタジオ、空き物件をRESTEL基準の休息スペースに。7言語での露出、予約受付、支払い・入室案内テンプレート、月次精算、運営ルールをRESTELが提供します。',
   'rolesTitle': '役割分担',
   'roles': [
    {'title': 'ホストの役割', 'items': ['RESTEL基準（折りたたみマット・ブランケット、3段階照明、遮光、防火設備）に空間を合わせる', 'セッション・料金・休業日を設定し、写真を登録する', '24時間以内に返答し、入金を確認し、入室案内を送る', 'セッション間の整備とマットカバー交換、利用完了処理']},
    {'title': 'RESTELの役割', 'items': ['7言語サイトとK-RESTコンテンツで海外・国内の利用者に露出', '予約受付、利用者向け確認ページ、7言語の案内テンプレートを提供', '休息スペースの運営基準、掲示物、点検表、対応ガイドを提供', '月次精算書の発行とホストセンターでの個別サポート']}
   ],
   'flowTitle': '予約から精算まで',
   'flow': [
    {'title': '受付', 'body': '利用者がセッション・日付・人数を選んで送信。ポータルとメールで通知。'},
    {'title': '確定または辞退', 'body': '可否を確認し、金額と支払い方法を決めて確定。案内文は利用者の言語で自動作成。'},
    {'title': '支払い確認', 'body': '振込は入金確認、現地決済は到着時に。オンラインカード決済は順次導入。'},
    {'title': '入室案内', 'body': '住所・ドアロック番号・注意事項を送信。前日のリマインドで未来店を減らす。'},
    {'title': 'セッションと整備', 'body': '終了10分前の合図、整備時間の確保、利用完了処理。'},
    {'title': '月次精算', 'body': '完了したセッションの売上に手数料（標準15%）を適用し、翌月に精算書を発行。'}
   ],
   'fitTitle': '向いている空間',
   'fitGood': ['平日昼の稼働が低いパーティールーム・集会スペース', '自然光と遮光を備えたスタジオ', '静かな2階以上の空き区画、10〜40㎡', 'ヨガ・瞑想スタジオの空き時間', '駅から徒歩10分以内、旅行者が訪れるエリア'],
   'fitBad': ['ホテル式の寝具をそのまま置きたい空間', 'シャワーや洗濯を売りにする必要がある空間', '深夜営業でなければ採算が合わない空間', '換気や防火設備の整備が難しい地下', '同じ空間を宿泊施設として他のプラットフォームに掲載している場合'],
   'portalTitle': 'ホストポータルでできること',
   'portal': [
    {'title': '7言語の掲載', 'body': '韓国語と英語を書けば7言語のページに表示されます。'},
    {'title': 'セッション・料金・休業日', 'body': '平日/週末料金、追加人数、休業曜日と日付、整備時間。'},
    {'title': 'カレンダーとタスク', 'body': '月間カレンダー、本日のセッション、要返信メッセージ、未決済。'},
    {'title': '支払い・入室テンプレート', 'body': '確定・支払い・入室・リマインド・キャンセルの案内を利用者の言語で。'},
    {'title': '精算', 'body': '月別の売上・手数料・精算額とセッション別明細。'},
    {'title': 'ホストセンター', 'body': '運営ガイド、お知らせ、個別問い合わせ、印刷用掲示物と点検表。'}
   ],
   'faqTitle': 'よくある質問',
   'faq': [
    {'q': '掲載料や月額費用はありますか？', 'a': 'ありません。RESTEL経由で利用完了したセッションの売上に対してのみ手数料（標準15%）を精算します。'},
    {'q': '宿泊業の届出は必要ですか？', 'a': 'RESTELは宿泊施設ではなく休息スペースのレンタルとして運営します。時間単位のセッション、深夜0時前の終了、ベッドなし、成人限定などの基準を守ることが条件です。防火関連の基準は管轄の消防署に確認して整えます。'},
    {'q': 'パーティールーム運営と両立できますか？', 'a': 'はい。昼はRESTELセッション、夜はパーティー利用という二重運営を推奨します。セッション中は装飾や照明を片付けてください。'},
    {'q': '海外からの利用者への対応が不安です。', 'a': '確定・支払い・入室・リマインドの案内は7言語のテンプレートがあり、金額と時間は数字で伝わります。必要に応じてRESTEL運営チームが支援します。'},
    {'q': '支払いはどう受け取りますか？', 'a': '第1段階は銀行振込または現地決済です。確定後に支払い案内を送り、入金確認後に入室案内へ進みます。オンラインカード決済は順次導入します。'},
    {'q': '承認までどのくらいかかりますか？', 'a': '登録後の事業情報確認は営業日3日以内、空間の審査依頼後の結果案内も営業日3日以内です。修正事項があればポータルに表示されます。'}
   ]
  }
 },
 'zh-tw': {
  'book': {'closedDate': '所選日期為此空間的公休日，請改選其他日期。', 'pastDate': '無法選擇已過去的日期。'},
  'request': {
   'statuses': {'noshow': '未到場'},
   'senders': {'customer': '我', 'host': '主理人', 'admin': 'RESTEL'},
   'payment': {'title': '付款資訊', 'amount': '金額', 'method': '方式', 'methods': {'transfer': '銀行轉帳', 'onsite': '現場付款', 'card': '信用卡'}, 'pending': '主理人將很快提供說明', 'bank': '匯款帳戶', 'holder': '戶名', 'deadline': '付款期限', 'deadlineNote': '確認後 {hours} 小時內', 'onsite': '現場', 'onsiteNote': '抵達時以信用卡或現金付款。', 'paid': '已確認付款', 'refunded': '已退款', 'refundDefault': '取消規定：48 小時前全額退款，24 小時前退 50%，之後不退款。'}
  },
  'hosts': {
   'lead': '把閒置時段多的派對空間、工作室或空屋，依 RESTEL 標準改為休息空間。RESTEL 提供七種語言曝光、預約受理、付款與入場說明範本、每月結算與營運規範。',
   'rolesTitle': '分工方式',
   'roles': [
    {'title': '主理人負責', 'items': ['依 RESTEL 標準布置空間：折疊墊與毯子、三段燈光、遮光、消防設備', '設定時段、價格與公休日，上傳照片', '24 小時內回覆申請、確認付款、發送入場說明', '時段之間整理、更換墊套，完成使用登記']},
    {'title': 'RESTEL 負責', 'items': ['透過七語網站與 K-REST 內容向國際與韓國旅客曝光', '提供申請受理、顧客查詢頁與七語訊息範本', '提供休息空間營運標準、列印用告示、檢查表與應對指南', '每月開立結算單，並在主理人中心提供一對一支援']}
   ],
   'flowTitle': '從申請到結算',
   'flow': [
    {'title': '受理申請', 'body': '顧客選擇時段、日期與人數後送出，後台與電子郵件同步通知。'},
    {'title': '確認或婉拒', 'body': '確認可行後設定金額與付款方式並確認。說明訊息會以顧客語言自動產生。'},
    {'title': '確認付款', 'body': '轉帳由您確認入帳，現場付款於抵達時收取。線上刷卡陸續開放。'},
    {'title': '入場說明', 'body': '發送地址、門鎖密碼與注意事項。前一天的提醒可減少未到場。'},
    {'title': '時段與整理', 'body': '結束前 10 分鐘提示、保留整理時間、登記完成。'},
    {'title': '每月結算', 'body': '已完成時段的營收依手續費（預設 15%）計算，次月開立結算單。'}
   ],
   'fitTitle': '哪些空間適合',
   'fitGood': ['平日白天使用率低的派對空間、聚會空間', '兼具自然光與遮光的工作室', '安靜的二樓以上空屋，10～40 ㎡', '瑜伽、冥想空間的閒置時段', '距車站步行 10 分鐘內、旅客常到的區域'],
   'fitBad': ['想保留飯店式寢具的空間', '必須以淋浴或洗衣作為賣點的空間', '只有營業到深夜才划算的空間', '無法通風或難以設置消防設備的地下空間', '同一空間已在住宿平台上架為過夜產品的情況'],
   'portalTitle': '主理人後台可以做什麼',
   'portal': [
    {'title': '七語刊登', 'body': '只需填寫韓文與英文，頁面會以七種語言顯示。'},
    {'title': '時段、價格、公休日', 'body': '各時段平日/週末價格、加人費用、公休星期與日期、整理時間。'},
    {'title': '行事曆與待辦', 'body': '月曆、今日時段、待回覆訊息、未付款項目一目了然。'},
    {'title': '付款與入場範本', 'body': '確認、付款、入場、提醒、取消訊息以顧客語言載入後發送。'},
    {'title': '結算明細', 'body': '每月營收、手續費、結算金額與逐筆明細。'},
    {'title': '主理人中心', 'body': '營運指南、公告、一對一詢問、列印用告示與檢查表。'}
   ],
   'faqTitle': '加入前常見問題',
   'faq': [
    {'q': '有上架費或月費嗎？', 'a': '沒有。僅就經由 RESTEL 完成使用的時段營收收取手續費（預設 15%）。'},
    {'q': '需要住宿業登記嗎？', 'a': 'RESTEL 以休息空間租借而非住宿設施營運。條件是遵守標準：以小時計的時段、午夜前結束、不設床、僅限成人。消防相關的多用途場所規範需向當地消防單位確認並一併符合。'},
    {'q': '可以同時經營派對空間嗎？', 'a': '可以。建議白天為 RESTEL 時段、晚上為派對使用的雙軌模式，時段期間請收起派對裝飾與燈光。'},
    {'q': '擔心接待外國顧客。', 'a': '確認、付款、入場、提醒訊息皆有七語範本，金額與時間以數字傳達。必要時 RESTEL 營運團隊會協助。'},
    {'q': '如何收款？', 'a': '第一階段採銀行轉帳或現場付款。確認後發送付款說明，確認入帳後再發送入場說明。線上刷卡陸續開放。'},
    {'q': '審核需要多久？', 'a': '註冊後的事業資料確認在 3 個工作天內，空間送審後的結果也在 3 個工作天內回覆。需補件的項目會顯示在後台。'}
   ]
  }
 },
 'zh-cn': {
  'book': {'closedDate': '所选日期为此空间的休息日，请改选其他日期。', 'pastDate': '无法选择已过去的日期。'},
  'request': {
   'statuses': {'noshow': '未到场'},
   'senders': {'customer': '我', 'host': '主理人', 'admin': 'RESTEL'},
   'payment': {'title': '付款信息', 'amount': '金额', 'method': '方式', 'methods': {'transfer': '银行转账', 'onsite': '现场付款', 'card': '信用卡'}, 'pending': '主理人将很快提供说明', 'bank': '汇款账户', 'holder': '户名', 'deadline': '付款期限', 'deadlineNote': '确认后 {hours} 小时内', 'onsite': '现场', 'onsiteNote': '抵达时以信用卡或现金付款。', 'paid': '已确认付款', 'refunded': '已退款', 'refundDefault': '取消规定：48 小时前全额退款，24 小时前退 50%，之后不退款。'}
  },
  'hosts': {
   'lead': '把闲置时段多的派对空间、工作室或空置房屋，按 RESTEL 标准改为休息空间。RESTEL 提供七种语言曝光、预约受理、付款与入场说明模板、每月结算与运营规范。',
   'rolesTitle': '分工方式',
   'roles': [
    {'title': '主理人负责', 'items': ['按 RESTEL 标准布置空间：折叠垫与毯子、三档灯光、遮光、消防设备', '设置时段、价格与休息日，上传照片', '24 小时内回复申请、确认付款、发送入场说明', '时段之间整理、更换垫套，完成使用登记']},
    {'title': 'RESTEL 负责', 'items': ['通过七语网站与 K-REST 内容向国际与韩国游客曝光', '提供申请受理、顾客查询页与七语消息模板', '提供休息空间运营标准、打印用告示、检查表与应对指南', '每月开具结算单，并在主理人中心提供一对一支持']}
   ],
   'flowTitle': '从申请到结算',
   'flow': [
    {'title': '受理申请', 'body': '顾客选择时段、日期与人数后提交，后台与电子邮件同步通知。'},
    {'title': '确认或婉拒', 'body': '确认可行后设置金额与付款方式并确认。说明消息会以顾客语言自动生成。'},
    {'title': '确认付款', 'body': '转账由您确认到账，现场付款于抵达时收取。在线刷卡陆续开放。'},
    {'title': '入场说明', 'body': '发送地址、门锁密码与注意事项。前一天的提醒可减少未到场。'},
    {'title': '时段与整理', 'body': '结束前 10 分钟提示、预留整理时间、登记完成。'},
    {'title': '每月结算', 'body': '已完成时段的营收按手续费（默认 15%）计算，次月开具结算单。'}
   ],
   'fitTitle': '哪些空间适合',
   'fitGood': ['工作日白天使用率低的派对空间、聚会空间', '兼具自然光与遮光的工作室', '安静的二楼以上空置房屋，10～40 ㎡', '瑜伽、冥想空间的闲置时段', '距车站步行 10 分钟内、游客常到的区域'],
   'fitBad': ['想保留酒店式寝具的空间', '必须以淋浴或洗衣作为卖点的空间', '只有营业到深夜才划算的空间', '无法通风或难以设置消防设备的地下空间', '同一空间已在住宿平台上架为过夜产品的情况'],
   'portalTitle': '主理人后台可以做什么',
   'portal': [
    {'title': '七语刊登', 'body': '只需填写韩文与英文，页面会以七种语言显示。'},
    {'title': '时段、价格、休息日', 'body': '各时段工作日/周末价格、加人费用、休息星期与日期、整理时间。'},
    {'title': '日历与待办', 'body': '月历、今日时段、待回复消息、未付款项目一目了然。'},
    {'title': '付款与入场模板', 'body': '确认、付款、入场、提醒、取消消息以顾客语言载入后发送。'},
    {'title': '结算明细', 'body': '每月营收、手续费、结算金额与逐笔明细。'},
    {'title': '主理人中心', 'body': '运营指南、公告、一对一咨询、打印用告示与检查表。'}
   ],
   'faqTitle': '加入前常见问题',
   'faq': [
    {'q': '有上架费或月费吗？', 'a': '没有。仅就经由 RESTEL 完成使用的时段营收收取手续费（默认 15%）。'},
    {'q': '需要住宿业登记吗？', 'a': 'RESTEL 以休息空间租借而非住宿设施运营。条件是遵守标准：按小时计的时段、午夜前结束、不设床、仅限成人。消防相关的多用途场所规范需向当地消防部门确认并一并符合。'},
    {'q': '可以同时经营派对空间吗？', 'a': '可以。建议白天为 RESTEL 时段、晚上为派对使用的双轨模式，时段期间请收起派对装饰与灯光。'},
    {'q': '担心接待外国顾客。', 'a': '确认、付款、入场、提醒消息均有七语模板，金额与时间以数字传达。必要时 RESTEL 运营团队会协助。'},
    {'q': '如何收款？', 'a': '第一阶段采用银行转账或现场付款。确认后发送付款说明，确认到账后再发送入场说明。在线刷卡陆续开放。'},
    {'q': '审核需要多久？', 'a': '注册后的经营资料确认在 3 个工作日内，空间送审后的结果也在 3 个工作日内回复。需补充的项目会显示在后台。'}
   ]
  }
 },
 'th': {
  'book': {'closedDate': 'วันที่เลือกเป็นวันปิดของพื้นที่นี้ กรุณาเลือกวันอื่น', 'pastDate': 'ไม่สามารถเลือกวันที่ผ่านมาแล้วได้'},
  'request': {
   'statuses': {'noshow': 'ไม่มาตามนัด'},
   'senders': {'customer': 'ฉัน', 'host': 'โฮสต์', 'admin': 'RESTEL'},
   'payment': {'title': 'การชำระเงิน', 'amount': 'ยอดชำระ', 'method': 'วิธี', 'methods': {'transfer': 'โอนเงินผ่านธนาคาร', 'onsite': 'ชำระที่สถานที่', 'card': 'บัตร'}, 'pending': 'โฮสต์จะส่งรายละเอียดในไม่ช้า', 'bank': 'บัญชี', 'holder': 'ชื่อบัญชี', 'deadline': 'ชำระภายใน', 'deadlineNote': 'ภายใน {hours} ชั่วโมงหลังยืนยัน', 'onsite': 'ที่สถานที่', 'onsiteNote': 'ชำระด้วยบัตรหรือเงินสดเมื่อมาถึง', 'paid': 'ได้รับการชำระเงินแล้ว', 'refunded': 'คืนเงินแล้ว', 'refundDefault': 'การยกเลิก: คืนเงิน 100% ก่อน 48 ชั่วโมง, 50% ก่อน 24 ชั่วโมง, หลังจากนั้นไม่คืนเงิน'}
  },
  'hosts': {
   'lead': 'เปลี่ยนห้องปาร์ตี้ สตูดิโอ หรือพื้นที่ว่างที่มีเวลาว่างมากให้เป็นพื้นที่พักผ่อนตามมาตรฐาน RESTEL โดย RESTEL ดูแลการเข้าถึงลูกค้าใน 7 ภาษา การรับคำขอ เทมเพลตการชำระเงินและการเข้าใช้ การชำระบัญชีรายเดือน และกฎการดำเนินงาน',
   'rolesTitle': 'ใครทำอะไร',
   'roles': [
    {'title': 'โฮสต์', 'items': ['จัดพื้นที่ให้ตรงมาตรฐาน RESTEL: เสื่อพับและผ้าห่ม แสงไฟ 3 ระดับ ม่านทึบแสง อุปกรณ์ดับเพลิง', 'กำหนดเซสชัน ราคา วันปิด และอัปโหลดรูปภาพ', 'ตอบคำขอภายใน 24 ชั่วโมง ยืนยันการชำระเงิน ส่งคำแนะนำการเข้าใช้', 'จัดพื้นที่ระหว่างเซสชัน เปลี่ยนผ้าคลุมเสื่อ และบันทึกเสร็จสิ้น']},
    {'title': 'RESTEL', 'items': ['นำเสนอพื้นที่แก่นักท่องเที่ยวต่างชาติและชาวเกาหลีผ่านเว็บไซต์ 7 ภาษาและเนื้อหา K-REST', 'ให้ระบบรับคำขอ หน้าติดตามสำหรับลูกค้า และเทมเพลตข้อความ 7 ภาษา', 'ให้มาตรฐานการดำเนินงานพื้นที่พักผ่อน ป้ายพิมพ์ รายการตรวจสอบ และคู่มือการดูแลลูกค้า', 'ออกใบชำระบัญชีรายเดือนและสนับสนุนโฮสต์แบบตัวต่อตัวผ่านศูนย์โฮสต์']}
   ],
   'flowTitle': 'จากคำขอถึงการชำระบัญชี',
   'flow': [
    {'title': 'รับคำขอ', 'body': 'ลูกค้าเลือกเซสชัน วันที่ และจำนวนคน คุณจะได้รับแจ้งในพอร์ทัลและอีเมล'},
    {'title': 'ยืนยันหรือปฏิเสธ', 'body': 'ตรวจสอบความพร้อม กำหนดยอดและวิธีชำระ แล้วยืนยัน ข้อความจะถูกร่างในภาษาของลูกค้า'},
    {'title': 'ยืนยันการชำระเงิน', 'body': 'การโอนเงินคุณเป็นผู้ยืนยัน การชำระที่สถานที่รับเมื่อมาถึง การชำระด้วยบัตรออนไลน์กำลังทยอยเปิด'},
    {'title': 'คำแนะนำการเข้าใช้', 'body': 'ส่งที่อยู่ รหัสประตู และข้อควรทราบ การเตือนล่วงหน้าหนึ่งวันช่วยลดการไม่มาตามนัด'},
    {'title': 'เซสชันและการจัดเตรียม', 'body': 'เสียงเตือน 10 นาทีก่อนจบ เวลาจัดเตรียมระหว่างเซสชัน บันทึกเสร็จสิ้น'},
    {'title': 'ชำระบัญชีรายเดือน', 'body': 'ค่าคอมมิชชัน (ค่าเริ่มต้น 15%) คิดจากเซสชันที่เสร็จสิ้น และออกใบชำระบัญชีในเดือนถัดไป'}
   ],
   'fitTitle': 'พื้นที่แบบไหนที่เหมาะ',
   'fitGood': ['ห้องปาร์ตี้และพื้นที่ประชุมที่ว่างในช่วงบ่ายวันธรรมดา', 'สตูดิโอที่มีแสงธรรมชาติและม่านทึบแสง', 'พื้นที่ว่างชั้น 2 ขึ้นไปที่เงียบ ขนาด 10–40 ตร.ม.', 'ช่วงเวลาว่างของสตูดิโอโยคะและสมาธิ', 'เดินจากสถานีไม่เกิน 10 นาที ในย่านที่นักท่องเที่ยวมาอยู่แล้ว'],
   'fitBad': ['พื้นที่ที่ต้องการคงเครื่องนอนแบบโรงแรมไว้', 'พื้นที่ที่ต้องพึ่งการขายห้องอาบน้ำหรือบริการซักผ้า', 'พื้นที่ที่คุ้มทุนเฉพาะเมื่อเปิดหลังเที่ยงคืน', 'ชั้นใต้ดินที่ไม่มีการระบายอากาศหรืออุปกรณ์ดับเพลิง', 'พื้นที่ที่ลงประกาศบนแพลตฟอร์มที่พักเป็นที่ค้างคืน'],
   'portalTitle': 'พอร์ทัลโฮสต์ทำอะไรได้บ้าง',
   'portal': [
    {'title': 'ลงประกาศ 7 ภาษา', 'body': 'เขียนภาษาเกาหลีและอังกฤษ หน้าจะแสดงครบ 7 ภาษา'},
    {'title': 'เซสชัน ราคา วันปิด', 'body': 'ราคาวันธรรมดา/วันหยุดต่อเซสชัน ค่าคนเพิ่ม วันปิดประจำสัปดาห์และวันที่ เวลาจัดเตรียม'},
    {'title': 'ปฏิทินและสิ่งที่ต้องทำ', 'body': 'ปฏิทินรายเดือน เซสชันวันนี้ ข้อความที่รอตอบ รายการที่ยังไม่ชำระ'},
    {'title': 'เทมเพลตการชำระเงินและการเข้าใช้', 'body': 'ข้อความยืนยัน ชำระเงิน เข้าใช้ เตือน และยกเลิกในภาษาของลูกค้า'},
    {'title': 'การชำระบัญชี', 'body': 'รายได้ ค่าคอมมิชชัน และยอดจ่ายรายเดือนพร้อมรายละเอียดแต่ละเซสชัน'},
    {'title': 'ศูนย์โฮสต์', 'body': 'คู่มือการดำเนินงาน ประกาศ การสอบถามตัวต่อตัว ป้ายและรายการตรวจสอบสำหรับพิมพ์'}
   ],
   'faqTitle': 'คำถามที่โฮสต์ถามบ่อย',
   'faq': [
    {'q': 'มีค่าลงประกาศหรือค่าธรรมเนียมรายเดือนไหม', 'a': 'ไม่มี ค่าคอมมิชชัน (ค่าเริ่มต้น 15%) คิดเฉพาะเซสชันที่เสร็จสิ้นและมาจาก RESTEL เท่านั้น'},
    {'q': 'ต้องมีใบอนุญาตที่พักไหม', 'a': 'RESTEL ดำเนินงานในรูปแบบการเช่าพื้นที่พักผ่อน ไม่ใช่ที่พักค้างคืน เงื่อนไขคือรักษามาตรฐาน: เซสชันรายชั่วโมงที่จบก่อนเที่ยงคืน ไม่มีเตียง เฉพาะผู้ใหญ่ ข้อกำหนดด้านอัคคีภัยสำหรับสถานประกอบการอเนกประสงค์ให้ยืนยันกับสถานีดับเพลิงในพื้นที่'},
    {'q': 'เปิดห้องปาร์ตี้ต่อไปได้ไหม', 'a': 'ได้ เราแนะนำเซสชัน RESTEL ตอนกลางวันและใช้เป็นห้องปาร์ตี้ตอนเย็น ระหว่างเซสชันให้เก็บของตกแต่งและไฟปาร์ตี้'},
    {'q': 'กังวลเรื่องลูกค้าต่างชาติ', 'a': 'ข้อความยืนยัน ชำระเงิน เข้าใช้ และเตือนมีเทมเพลต 7 ภาษา ยอดเงินและเวลาส่งเป็นตัวเลข ทีม RESTEL ช่วยเหลือเมื่อจำเป็น'},
    {'q': 'รับเงินอย่างไร', 'a': 'ระยะแรกใช้การโอนเงินหรือชำระที่สถานที่ หลังยืนยันคุณส่งรายละเอียดการชำระเงิน เมื่อชำระแล้วจึงส่งคำแนะนำการเข้าใช้ การชำระด้วยบัตรออนไลน์กำลังทยอยเปิด'},
    {'q': 'การอนุมัติใช้เวลานานแค่ไหน', 'a': 'ตรวจสอบข้อมูลธุรกิจภายใน 3 วันทำการหลังสมัคร และตอบผลการตรวจพื้นที่ภายใน 3 วันทำการหลังส่งคำขอ สิ่งที่ต้องแก้ไขจะแสดงในพอร์ทัล'}
   ]
  }
 },
 'vi': {
  'book': {'closedDate': 'Ngày đã chọn là ngày nghỉ của không gian này. Vui lòng chọn ngày khác.', 'pastDate': 'Không thể chọn ngày đã qua.'},
  'request': {
   'statuses': {'noshow': 'Không đến'},
   'senders': {'customer': 'Tôi', 'host': 'Chủ không gian', 'admin': 'RESTEL'},
   'payment': {'title': 'Thanh toán', 'amount': 'Số tiền', 'method': 'Hình thức', 'methods': {'transfer': 'Chuyển khoản', 'onsite': 'Thanh toán tại chỗ', 'card': 'Thẻ'}, 'pending': 'Chủ không gian sẽ sớm gửi hướng dẫn', 'bank': 'Tài khoản', 'holder': 'Chủ tài khoản', 'deadline': 'Hạn thanh toán', 'deadlineNote': 'trong vòng {hours} giờ sau khi xác nhận', 'onsite': 'Tại chỗ', 'onsiteNote': 'Thanh toán bằng thẻ hoặc tiền mặt khi đến.', 'paid': 'Đã nhận thanh toán', 'refunded': 'Đã hoàn tiền', 'refundDefault': 'Hủy: hoàn 100% trước 48 giờ, 50% trước 24 giờ, sau đó không hoàn.'}
  },
  'hosts': {
   'lead': 'Biến phòng tiệc, studio hoặc mặt bằng trống nhiều giờ rảnh thành không gian nghỉ ngơi theo tiêu chuẩn RESTEL. RESTEL lo phần hiển thị bằng 7 ngôn ngữ, tiếp nhận yêu cầu, mẫu hướng dẫn thanh toán và vào không gian, đối soát hàng tháng và quy tắc vận hành.',
   'rolesTitle': 'Ai làm gì',
   'roles': [
    {'title': 'Chủ không gian', 'items': ['Sắp xếp không gian theo tiêu chuẩn RESTEL: nệm gấp và chăn, ánh sáng 3 mức, rèm chắn sáng, thiết bị phòng cháy', 'Thiết lập phiên, giá, ngày nghỉ và tải ảnh lên', 'Trả lời yêu cầu trong 24 giờ, xác nhận thanh toán, gửi hướng dẫn vào không gian', 'Dọn dẹp giữa các phiên, thay vỏ nệm, đánh dấu hoàn tất']},
    {'title': 'RESTEL', 'items': ['Giới thiệu không gian đến khách quốc tế và Hàn Quốc qua website 7 ngôn ngữ và nội dung K-REST', 'Cung cấp tiếp nhận yêu cầu, trang theo dõi cho khách và mẫu tin nhắn 7 ngôn ngữ', 'Cung cấp tiêu chuẩn vận hành không gian nghỉ, bảng thông báo in, danh sách kiểm tra và hướng dẫn chăm sóc khách', 'Phát hành bảng đối soát hàng tháng và hỗ trợ 1:1 qua Trung tâm chủ không gian']}
   ],
   'flowTitle': 'Từ yêu cầu đến đối soát',
   'flow': [
    {'title': 'Tiếp nhận yêu cầu', 'body': 'Khách chọn phiên, ngày và số người. Bạn được thông báo trên cổng và qua email.'},
    {'title': 'Xác nhận hoặc từ chối', 'body': 'Kiểm tra lịch, đặt số tiền và hình thức thanh toán rồi xác nhận. Tin nhắn được soạn sẵn bằng ngôn ngữ của khách.'},
    {'title': 'Xác nhận thanh toán', 'body': 'Chuyển khoản do bạn xác nhận; thanh toán tại chỗ nhận khi khách đến. Thanh toán thẻ trực tuyến đang được bổ sung.'},
    {'title': 'Hướng dẫn vào không gian', 'body': 'Gửi địa chỉ, mã khóa cửa và lưu ý. Nhắc trước một ngày giúp giảm khách không đến.'},
    {'title': 'Phiên và dọn dẹp', 'body': 'Chuông báo 10 phút trước khi kết thúc, thời gian dọn dẹp giữa các phiên, đánh dấu hoàn tất.'},
    {'title': 'Đối soát hàng tháng', 'body': 'Phí hoa hồng (mặc định 15%) áp dụng cho các phiên đã hoàn tất; bảng đối soát được phát hành vào tháng sau.'}
   ],
   'fitTitle': 'Không gian nào phù hợp',
   'fitGood': ['Phòng tiệc và không gian họp vắng vào buổi chiều ngày thường', 'Studio có ánh sáng tự nhiên và rèm chắn sáng', 'Mặt bằng yên tĩnh từ tầng 2 trở lên, 10–40 m²', 'Giờ trống của studio yoga và thiền', 'Cách ga đi bộ dưới 10 phút, trong khu du khách hay lui tới'],
   'fitBad': ['Không gian muốn giữ nguyên chăn ga kiểu khách sạn', 'Không gian phải dựa vào việc bán dịch vụ tắm hoặc giặt', 'Không gian chỉ có lãi khi mở sau nửa đêm', 'Tầng hầm không thông gió hoặc khó lắp thiết bị phòng cháy', 'Không gian đang được đăng trên nền tảng lưu trú như chỗ ngủ qua đêm'],
   'portalTitle': 'Cổng chủ không gian làm được gì',
   'portal': [
    {'title': 'Đăng tin 7 ngôn ngữ', 'body': 'Chỉ cần viết tiếng Hàn và tiếng Anh, trang sẽ hiển thị ở cả 7 ngôn ngữ.'},
    {'title': 'Phiên, giá, ngày nghỉ', 'body': 'Giá ngày thường/cuối tuần theo phiên, phụ phí thêm người, ngày nghỉ trong tuần và theo ngày, thời gian dọn dẹp.'},
    {'title': 'Lịch và việc cần làm', 'body': 'Lịch tháng, phiên hôm nay, tin nhắn chờ trả lời, phiên chưa thanh toán.'},
    {'title': 'Mẫu thanh toán và vào không gian', 'body': 'Tin nhắn xác nhận, thanh toán, vào không gian, nhắc nhở và hủy bằng ngôn ngữ của khách.'},
    {'title': 'Đối soát', 'body': 'Doanh thu, hoa hồng và số tiền nhận hàng tháng, chi tiết từng phiên.'},
    {'title': 'Trung tâm chủ không gian', 'body': 'Hướng dẫn vận hành, thông báo, hỏi đáp 1:1, bảng thông báo và danh sách kiểm tra để in.'}
   ],
   'faqTitle': 'Câu hỏi thường gặp trước khi tham gia',
   'faq': [
    {'q': 'Có phí đăng tin hay phí hàng tháng không?', 'a': 'Không. Hoa hồng (mặc định 15%) chỉ áp dụng cho các phiên đã hoàn tất đến từ RESTEL.'},
    {'q': 'Có cần giấy phép lưu trú không?', 'a': 'RESTEL vận hành như dịch vụ cho thuê không gian nghỉ ngơi, không phải cơ sở lưu trú. Điều kiện là giữ tiêu chuẩn: phiên theo giờ kết thúc trước nửa đêm, không có giường, chỉ dành cho người lớn. Yêu cầu phòng cháy cho cơ sở đa dụng được xác nhận với trạm cứu hỏa địa phương.'},
    {'q': 'Tôi có thể tiếp tục vận hành phòng tiệc không?', 'a': 'Có. Chúng tôi khuyến nghị phiên RESTEL ban ngày và dùng làm phòng tiệc buổi tối. Trong phiên hãy cất đồ trang trí và đèn tiệc.'},
    {'q': 'Tôi lo về khách nước ngoài.', 'a': 'Tin nhắn xác nhận, thanh toán, vào không gian và nhắc nhở có mẫu sẵn 7 ngôn ngữ; số tiền và giờ được gửi bằng con số. Đội ngũ RESTEL hỗ trợ khi cần.'},
    {'q': 'Nhận tiền như thế nào?', 'a': 'Giai đoạn đầu dùng chuyển khoản hoặc thanh toán tại chỗ. Sau khi xác nhận, bạn gửi hướng dẫn thanh toán; khi đã thanh toán, bạn gửi hướng dẫn vào không gian. Thanh toán thẻ trực tuyến đang được bổ sung.'},
    {'q': 'Phê duyệt mất bao lâu?', 'a': 'Thông tin kinh doanh được kiểm tra trong 3 ngày làm việc sau khi đăng ký, và kết quả xét duyệt không gian được trả lời trong 3 ngày làm việc sau khi gửi. Mục cần bổ sung sẽ hiển thị trên cổng.'}
   ]
  }
 },
}

def deep_merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            deep_merge(dst[k], v)
        else:
            dst[k] = v

for lang, patch in DATA.items():
    p = BASE / f'{lang}.json'
    d = json.loads(p.read_text(encoding='utf-8'))
    deep_merge(d, patch)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(lang, 'ok', len(d['hosts']['faq']))

# ---- 원본과 같은 압축 서식으로 다시 저장 (객체 배열의 원소·짧은 객체는 한 줄) ----
def dump(v, ind=0):
    pad = '  ' * ind
    if isinstance(v, dict):
        if not v: return '{}'
        if all(not isinstance(x, (dict, list)) for x in v.values()) and sum(len(str(x)) for x in v.values()) < 400 and ind >= 2:
            return '{ ' + ', '.join(json.dumps(k, ensure_ascii=False) + ': ' + json.dumps(x, ensure_ascii=False) for k, x in v.items()) + ' }'
        return '{\n' + ',\n'.join(pad + '  ' + json.dumps(k, ensure_ascii=False) + ': ' + dump(x, ind + 1) for k, x in v.items()) + '\n' + pad + '}'
    if isinstance(v, list):
        if not v: return '[]'
        return '[\n' + ',\n'.join(pad + '  ' + dump(x, ind + 1) for x in v) + '\n' + pad + ']'
    return json.dumps(v, ensure_ascii=False)

for lang in DATA:
    p = BASE / f'{lang}.json'
    d = json.loads(p.read_text(encoding='utf-8'))
    p.write_text(dump(d) + '\n', encoding='utf-8')
    json.loads(p.read_text(encoding='utf-8'))
print('reformatted')
