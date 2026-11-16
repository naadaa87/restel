// 호스트가 고객에게 보내는 안내 메시지 템플릿 (12개 언어)
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
  id: {
    confirm: 'Halo {name}, sesi Anda di {space} sudah dikonfirmasi.\nWaktu: {date} {time} (waktu Korea) · {people} orang\nJumlah: {amount}\nInfo pembayaran akan segera menyusul. Pantau permintaan Anda di {link}.',
    payment: 'Halo {name}, berikut info pembayaran untuk sesi {space}.\nJumlah: {amount}\nMetode: {method}\n{bank} {account} (a.n. {holder})\nMohon bayar sebelum {deadline}. Setelah pembayaran kami terima, petunjuk masuk akan dikirim. Permintaan {code}',
    entry: 'Halo {name}, petunjuk masuk untuk sesi {date} {time}.\nAlamat: {address}\n{entry}\nAnda bisa masuk 10 menit sebelum sesi dan mohon keluar tepat di jam selesai. RESTEL adalah ruang istirahat untuk tamu usia 19+. Pertanyaan: {phone}',
    reminder: 'Halo {name}, pengingat bahwa sesi {space} Anda besok, {date} pukul {time}. Balas pesan ini jika ada perubahan. Selamat beristirahat.',
    decline: 'Halo {name}, mohon maaf sesi {space} pada {date} pukul {time} tidak bisa kami terima. Kirimkan tanggal atau jam lain dan kami cek lagi. Permintaan {code}',
    cancel: 'Halo {name}, sesi {space} pada {date} pukul {time} telah dibatalkan. Pembayaran, jika ada, diproses sesuai kebijakan pengembalian dana. Permintaan {code}',
    thanks: 'Halo {name}, terima kasih sudah beristirahat bersama kami di {space} hari ini. Datang lagi kapan pun Anda butuh jeda. Masukan Anda boleh dikirim di sini.',
  },
  ru: {
    confirm: 'Здравствуйте, {name}! Ваша сессия в {space} подтверждена.\nКогда: {date} {time} (по корейскому времени) · {people} чел.\nСумма: {amount}\nДетали оплаты пришлём следом. Статус запроса: {link}',
    payment: 'Здравствуйте, {name}! Детали оплаты сессии в {space}.\nСумма: {amount}\nСпособ: {method}\n{bank} {account} (получатель {holder})\nОплатите, пожалуйста, до {deadline}. После поступления оплаты пришлём инструкцию по входу. Запрос {code}',
    entry: 'Здравствуйте, {name}! Инструкция по входу на сессию {date} {time}.\nАдрес: {address}\n{entry}\nВойти можно за 10 минут до начала, а уйти нужно ко времени окончания. RESTEL — пространство для отдыха для гостей от 19 лет. Вопросы: {phone}',
    reminder: 'Здравствуйте, {name}! Напоминаем: ваша сессия в {space} завтра, {date} в {time}. Если что-то изменится, ответьте на это сообщение. Хорошего отдыха.',
    decline: 'Здравствуйте, {name}! К сожалению, мы не можем принять сессию в {space} {date} в {time}. Предложите другую дату или время, и мы проверим ещё раз. Запрос {code}',
    cancel: 'Здравствуйте, {name}! Сессия в {space} {date} в {time} отменена. Если оплата уже была, возврат пройдёт по правилам возврата. Запрос {code}',
    thanks: 'Здравствуйте, {name}! Спасибо, что отдохнули у нас в {space} сегодня. Приходите снова, когда понадобится пауза. Отзывы можно оставить здесь.',
  },
  es: {
    confirm: 'Hola, {name}: tu sesión en {space} está confirmada.\nCuándo: {date} {time} (hora de Corea) · {people} personas\nImporte: {amount}\nEn breve te enviamos los datos de pago. Puedes seguir tu solicitud en {link}.',
    payment: 'Hola, {name}: estos son los datos de pago de tu sesión en {space}.\nImporte: {amount}\nMétodo: {method}\n{bank} {account} (titular: {holder})\nPor favor, paga antes de {deadline}. Cuando recibamos el pago te enviaremos las instrucciones de acceso. Solicitud {code}',
    entry: 'Hola, {name}: instrucciones de acceso para el {date} a las {time}.\nDirección: {address}\n{entry}\nPuedes entrar 10 minutos antes de la sesión y te pedimos salir a la hora de fin. RESTEL es un espacio de descanso para mayores de 19 años. Dudas: {phone}',
    reminder: 'Hola, {name}: te recordamos que tu sesión en {space} es mañana, {date} a las {time}. Si algo cambia, responde a este mensaje. Que descanses.',
    decline: 'Hola, {name}: lo sentimos, no podemos acoger tu sesión en {space} el {date} a las {time}. Envíanos otra fecha u hora y lo revisamos. Solicitud {code}',
    cancel: 'Hola, {name}: tu sesión en {space} del {date} a las {time} se ha cancelado. Si hubo pago, se gestiona según la política de reembolso. Solicitud {code}',
    thanks: 'Hola, {name}: gracias por descansar hoy con nosotros en {space}. Vuelve cuando necesites una pausa. Puedes dejarnos tu opinión aquí.',
  },
  fr: {
    confirm: 'Bonjour {name}, votre session chez {space} est confirmée.\nQuand : {date} {time} (heure coréenne) · {people} personnes\nMontant : {amount}\nLes détails de paiement suivent. Suivez votre demande ici : {link}',
    payment: 'Bonjour {name}, voici les détails de paiement de votre session chez {space}.\nMontant : {amount}\nMoyen : {method}\n{bank} {account} (titulaire : {holder})\nMerci de régler avant {deadline}. Dès réception, nous vous enverrons les instructions d’accès. Demande {code}',
    entry: 'Bonjour {name}, voici les instructions d’accès pour le {date} à {time}.\nAdresse : {address}\n{entry}\nVous pouvez entrer 10 minutes avant la session ; merci de partir à l’heure de fin. RESTEL est un espace de repos réservé aux 19 ans et plus. Questions : {phone}',
    reminder: 'Bonjour {name}, petit rappel : votre session chez {space} a lieu demain, le {date} à {time}. Répondez à ce message en cas de changement. Bon repos.',
    decline: 'Bonjour {name}, nous ne pouvons malheureusement pas accueillir votre session chez {space} le {date} à {time}. Proposez-nous une autre date ou heure et nous vérifierons. Demande {code}',
    cancel: 'Bonjour {name}, votre session chez {space} du {date} à {time} est annulée. Un éventuel paiement est traité selon la politique de remboursement. Demande {code}',
    thanks: 'Bonjour {name}, merci d’être venu vous reposer chez {space} aujourd’hui. Revenez quand vous aurez besoin d’une pause. Vos remarques sont les bienvenues ici.',
  },
  de: {
    confirm: 'Hallo {name}, Ihre Session im {space} ist bestätigt.\nWann: {date} {time} (koreanische Zeit) · {people} Personen\nBetrag: {amount}\nDie Zahlungsdetails folgen gleich. Ihre Anfrage verfolgen Sie unter {link}.',
    payment: 'Hallo {name}, hier die Zahlungsdetails für Ihre Session im {space}.\nBetrag: {amount}\nZahlungsart: {method}\n{bank} {account} (Inhaber: {holder})\nBitte zahlen Sie bis {deadline}. Nach Zahlungseingang schicken wir Ihnen die Zugangsinfos. Anfrage {code}',
    entry: 'Hallo {name}, hier die Zugangsinfos für {date} {time}.\nAdresse: {address}\n{entry}\nSie können 10 Minuten vor Beginn eintreten; bitte verlassen Sie den Raum zur Endzeit. RESTEL ist ein Ruheraum für Gäste ab 19 Jahren. Fragen: {phone}',
    reminder: 'Hallo {name}, zur Erinnerung: Ihre Session im {space} ist morgen, {date} um {time}. Antworten Sie hier, falls sich etwas ändert. Gute Erholung.',
    decline: 'Hallo {name}, leider können wir Ihre Session im {space} am {date} um {time} nicht annehmen. Nennen Sie uns ein anderes Datum oder eine andere Zeit, dann prüfen wir erneut. Anfrage {code}',
    cancel: 'Hallo {name}, Ihre Session im {space} am {date} um {time} wurde storniert. Eine bereits geleistete Zahlung wird nach den Erstattungsregeln behandelt. Anfrage {code}',
    thanks: 'Hallo {name}, danke, dass Sie heute bei uns im {space} ausgeruht haben. Kommen Sie wieder, wenn Sie eine Pause brauchen. Feedback gern hier.',
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
  id: { transfer: 'Transfer bank', onsite: 'Bayar di tempat', card: 'Kartu' },
  ru: { transfer: 'Банковский перевод', onsite: 'Оплата на месте', card: 'Карта' },
  es: { transfer: 'Transferencia bancaria', onsite: 'Pago en el local', card: 'Tarjeta' },
  fr: { transfer: 'Virement bancaire', onsite: 'Paiement sur place', card: 'Carte' },
  de: { transfer: 'Banküberweisung', onsite: 'Zahlung vor Ort', card: 'Karte' },
};

export function templateFor(lang: string, key: TemplateKey) {
  const l = messageTemplates[lang] ? lang : 'en';
  return messageTemplates[l][key];
}
