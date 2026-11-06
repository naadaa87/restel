// 호스트가 고객에게 보내는 안내 메시지 템플릿 (7개 언어)
// 자리표시자: {name} {code} {space} {date} {time} {people} {amount} {method} {bank} {holder} {account} {deadline} {entry} {address} {host} {phone} {link}
// 숙박 어휘를 쓰지 않는다 — "입장/도착", "세션", "휴식 공간"으로 표현한다.

export type TemplateKey = 'confirm' | 'payment' | 'entry' | 'reminder' | 'decline' | 'cancel' | 'thanks';

export const messageTemplates: Record<string, Record<TemplateKey, string>> = {
  ko: {
    confirm: '{name}님, {space} 세션이 확정되었습니다.\n일시: {date} {time} (KST) · 인원 {people}명\n금액: {amount}\n결제 안내는 곧 이어서 보내드립니다. 진행 상황은 {link} 에서 확인하실 수 있습니다.',
    payment: '{name}님, {space} 세션 결제 안내입니다.\n금액: {amount}\n결제 방법: {method}\n{bank} {account} (예금주 {holder})\n입금 기한: {deadline}\n입금이 확인되면 입장 안내를 보내드립니다. 요청 번호 {code}',
    entry: '{name}님, {date} {time} 세션 입장 안내입니다.\n주소: {address}\n{entry}\n세션 시작 10분 전부터 입장하실 수 있고, 종료 시각에 맞춰 정리해 주세요. 레스텔은 휴식 공간이며 19세 이상만 이용할 수 있습니다. 문의: {phone}',
    reminder: '{name}님, 내일 {date} {time} {space} 세션이 예정되어 있습니다. 변동이 있으면 이 메시지로 알려 주세요. 편안한 쉼이 되시길 바랍니다.',
    decline: '{name}님, 요청하신 {date} {time} {space} 세션은 안타깝게도 진행이 어렵습니다. 다른 날짜나 시간을 알려 주시면 다시 확인해 드리겠습니다. 요청 번호 {code}',
    cancel: '{name}님, {date} {time} {space} 세션 요청이 취소되었습니다. 결제가 있었다면 환불 규정에 따라 처리됩니다. 요청 번호 {code}',
    thanks: '{name}님, 오늘 {space}에서 쉬어 가 주셔서 감사합니다. 다음에도 쉼이 필요할 때 레스텔을 찾아 주세요. 후기나 의견이 있으면 이 메시지로 남겨 주세요.',
  },
  en: {
    confirm: 'Hi {name}, your session at {space} is confirmed.\nWhen: {date} {time} (KST) · {people} people\nAmount: {amount}\nPayment details follow shortly. Track your request at {link}.',
    payment: 'Hi {name}, here are the payment details for your {space} session.\nAmount: {amount}\nMethod: {method}\n{bank} {account} (holder: {holder})\nPlease pay by {deadline}. Once we see the payment we will send the entry instructions. Request {code}',
    entry: 'Hi {name}, entry instructions for {date} {time}.\nAddress: {address}\n{entry}\nYou can come in from 10 minutes before the session and we ask you to leave at the end time. RESTEL is a rest space for guests aged 19+. Questions: {phone}',
    reminder: 'Hi {name}, a reminder that your {space} session is tomorrow, {date} at {time}. Reply here if anything changes. Rest well.',
    decline: 'Hi {name}, unfortunately we cannot host your {space} session on {date} at {time}. Send us another date or time and we will check again. Request {code}',
    cancel: 'Hi {name}, your {space} session on {date} at {time} has been cancelled. Any payment is handled under our refund policy. Request {code}',
    thanks: 'Hi {name}, thank you for resting with us at {space} today. Come back whenever you need a pause. Any feedback is welcome here.',
  },
  ja: {
    confirm: '{name}様、{space} のセッションが確定しました。\n日時: {date} {time}（韓国時間）・{people}名\n金額: {amount}\nお支払いのご案内を続けてお送りします。進行状況は {link} でご確認いただけます。',
    payment: '{name}様、{space} セッションのお支払いのご案内です。\n金額: {amount}\n方法: {method}\n{bank} {account}（名義 {holder}）\n期限: {deadline}\n入金確認後、入室のご案内をお送りします。受付番号 {code}',
    entry: '{name}様、{date} {time} セッションの入室のご案内です。\n住所: {address}\n{entry}\n開始10分前から入室でき、終了時刻までにご退出ください。RESTELは19歳以上の方向けの休息スペースです。お問い合わせ: {phone}',
    reminder: '{name}様、明日 {date} {time} に {space} のセッションがあります。変更があればこのメッセージでお知らせください。',
    decline: '{name}様、{date} {time} の {space} セッションは申し訳ありませんがお受けできません。別の日時をお知らせいただければ再度確認します。受付番号 {code}',
    cancel: '{name}様、{date} {time} の {space} セッションはキャンセルされました。お支払い済みの場合は返金規定に沿って処理します。受付番号 {code}',
    thanks: '{name}様、本日は {space} でお休みいただきありがとうございました。また休息が必要なときにお越しください。ご感想もこちらへどうぞ。',
  },
  'zh-tw': {
    confirm: '{name} 您好，您在 {space} 的時段已確認。\n時間：{date} {time}（韓國時間）・{people} 人\n金額：{amount}\n付款說明稍後發送，進度可在 {link} 查詢。',
    payment: '{name} 您好，這是 {space} 時段的付款說明。\n金額：{amount}\n方式：{method}\n{bank} {account}（戶名 {holder}）\n請於 {deadline} 前完成付款，確認後會發送入場說明。申請編號 {code}',
    entry: '{name} 您好，{date} {time} 時段的入場說明。\n地址：{address}\n{entry}\n開始前 10 分鐘可入場，請於結束時間離開。RESTEL 是提供 19 歲以上使用的休息空間。聯絡：{phone}',
    reminder: '{name} 您好，提醒您明天 {date} {time} 在 {space} 有預約時段。若有變動請回覆此訊息。',
    decline: '{name} 您好，很抱歉 {date} {time} 的 {space} 時段無法安排。請告訴我們其他日期或時間，我們會再確認。申請編號 {code}',
    cancel: '{name} 您好，{date} {time} 的 {space} 時段已取消。若已付款將依退款規定處理。申請編號 {code}',
    thanks: '{name} 您好，謝謝您今天在 {space} 休息。需要喘口氣時歡迎再來。歡迎在此留下意見。',
  },
  'zh-cn': {
    confirm: '{name} 您好，您在 {space} 的时段已确认。\n时间：{date} {time}（韩国时间）・{people} 人\n金额：{amount}\n付款说明稍后发送，进度可在 {link} 查询。',
    payment: '{name} 您好，这是 {space} 时段的付款说明。\n金额：{amount}\n方式：{method}\n{bank} {account}（户名 {holder}）\n请于 {deadline} 前完成付款，确认后会发送入场说明。申请编号 {code}',
    entry: '{name} 您好，{date} {time} 时段的入场说明。\n地址：{address}\n{entry}\n开始前 10 分钟可入场，请于结束时间离开。RESTEL 是面向 19 岁以上人士的休息空间。联系：{phone}',
    reminder: '{name} 您好，提醒您明天 {date} {time} 在 {space} 有预约时段。若有变动请回复此消息。',
    decline: '{name} 您好，很抱歉 {date} {time} 的 {space} 时段无法安排。请告诉我们其他日期或时间，我们会再确认。申请编号 {code}',
    cancel: '{name} 您好，{date} {time} 的 {space} 时段已取消。若已付款将按退款规定处理。申请编号 {code}',
    thanks: '{name} 您好，谢谢您今天在 {space} 休息。需要喘口气时欢迎再来。欢迎在此留下意见。',
  },
  th: {
    confirm: 'สวัสดีคุณ {name} เซสชันของคุณที่ {space} ได้รับการยืนยันแล้ว\nเวลา: {date} {time} (เวลาเกาหลี) · {people} ท่าน\nยอดชำระ: {amount}\nรายละเอียดการชำระเงินจะส่งตามมา ติดตามสถานะได้ที่ {link}',
    payment: 'สวัสดีคุณ {name} รายละเอียดการชำระเงินสำหรับเซสชัน {space}\nยอด: {amount}\nวิธี: {method}\n{bank} {account} (ชื่อบัญชี {holder})\nกรุณาชำระภายใน {deadline} เมื่อยืนยันแล้วเราจะส่งคำแนะนำการเข้าใช้ หมายเลขคำขอ {code}',
    entry: 'สวัสดีคุณ {name} คำแนะนำการเข้าใช้สำหรับ {date} {time}\nที่อยู่: {address}\n{entry}\nเข้าได้ก่อนเริ่ม 10 นาที และกรุณาออกตามเวลาสิ้นสุด RESTEL เป็นพื้นที่พักผ่อนสำหรับผู้ที่อายุ 19 ปีขึ้นไป สอบถาม: {phone}',
    reminder: 'สวัสดีคุณ {name} เตือนว่าเซสชัน {space} ของคุณคือพรุ่งนี้ {date} เวลา {time} หากมีการเปลี่ยนแปลงกรุณาตอบกลับข้อความนี้',
    decline: 'สวัสดีคุณ {name} ขออภัย เราไม่สามารถรับเซสชัน {space} ในวันที่ {date} เวลา {time} ได้ กรุณาแจ้งวันหรือเวลาอื่น เราจะตรวจสอบอีกครั้ง หมายเลขคำขอ {code}',
    cancel: 'สวัสดีคุณ {name} เซสชัน {space} วันที่ {date} เวลา {time} ถูกยกเลิกแล้ว หากชำระเงินแล้วจะดำเนินการตามนโยบายคืนเงิน หมายเลขคำขอ {code}',
    thanks: 'สวัสดีคุณ {name} ขอบคุณที่มาพักผ่อนกับเราที่ {space} วันนี้ กลับมาได้ทุกเมื่อที่ต้องการหยุดพัก ยินดีรับความคิดเห็นที่นี่',
  },
  vi: {
    confirm: 'Chào {name}, phiên nghỉ của bạn tại {space} đã được xác nhận.\nThời gian: {date} {time} (giờ Hàn Quốc) · {people} người\nSố tiền: {amount}\nHướng dẫn thanh toán sẽ được gửi ngay sau đây. Theo dõi yêu cầu tại {link}.',
    payment: 'Chào {name}, đây là hướng dẫn thanh toán cho phiên {space}.\nSố tiền: {amount}\nHình thức: {method}\n{bank} {account} (chủ tài khoản {holder})\nVui lòng thanh toán trước {deadline}. Sau khi xác nhận, chúng tôi sẽ gửi hướng dẫn vào không gian. Mã yêu cầu {code}',
    entry: 'Chào {name}, hướng dẫn vào không gian cho phiên {date} {time}.\nĐịa chỉ: {address}\n{entry}\nBạn có thể vào từ 10 phút trước giờ bắt đầu và vui lòng rời đi đúng giờ kết thúc. RESTEL là không gian nghỉ ngơi dành cho người từ 19 tuổi. Liên hệ: {phone}',
    reminder: 'Chào {name}, nhắc bạn phiên {space} diễn ra ngày mai {date} lúc {time}. Nếu có thay đổi, hãy trả lời tin nhắn này.',
    decline: 'Chào {name}, rất tiếc chúng tôi không thể nhận phiên {space} vào {date} lúc {time}. Hãy cho chúng tôi biết ngày hoặc giờ khác để kiểm tra lại. Mã yêu cầu {code}',
    cancel: 'Chào {name}, phiên {space} vào {date} lúc {time} đã bị hủy. Nếu đã thanh toán, khoản tiền sẽ được xử lý theo chính sách hoàn tiền. Mã yêu cầu {code}',
    thanks: 'Chào {name}, cảm ơn bạn đã nghỉ ngơi tại {space} hôm nay. Hãy quay lại bất cứ khi nào bạn cần một khoảng lặng. Mọi góp ý xin để lại tại đây.',
  },
};

export const methodLabels: Record<string, Record<string, string>> = {
  ko: { transfer: '계좌이체', onsite: '현장 결제', card: '카드 결제' },
  en: { transfer: 'Bank transfer', onsite: 'Pay on site', card: 'Card payment' },
  ja: { transfer: '銀行振込', onsite: '現地決済', card: 'カード決済' },
  'zh-tw': { transfer: '銀行轉帳', onsite: '現場付款', card: '信用卡' },
  'zh-cn': { transfer: '银行转账', onsite: '现场付款', card: '信用卡' },
  th: { transfer: 'โอนเงินผ่านธนาคาร', onsite: 'ชำระที่สถานที่', card: 'บัตรเครดิต' },
  vi: { transfer: 'Chuyển khoản', onsite: 'Thanh toán tại chỗ', card: 'Thẻ' },
};

export function templateFor(lang: string, key: TemplateKey) {
  const l = messageTemplates[lang] ? lang : 'en';
  return messageTemplates[l][key];
}
