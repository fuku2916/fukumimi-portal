// 受信箱の見本データ（本番では2つの表から読む）
//   src:'shift' … シフト管理アプリの notices 表（社員番号ごと）
//   src:'base'  … HUKU BASE の messages 表（ログインした本人あて）
const INBOX_DEMO=[
  {id:'s1',src:'shift',cat:'mismatch',title:'打刻と予定シフトが違います',
   body:'11/24（月）の出勤打刻が 9:52 でした。予定シフトは 8:45 です。\n理由があれば返信で教えてください。',at:'2026-11-25T08:10:00',canReply:true},
  {id:'b1',src:'base',cat:'manual',title:'「電話での検査費用の案内」が更新されました',
   body:'コロナ・インフルエンザの検査費用の案内を、今の金額に直しました。\n電話を受ける前に一度目を通してください。',at:'2026-11-24T18:30:00',link:'業務マニュアルのページ'},
  {id:'s2',src:'shift',cat:'delay_cert',title:'遅延証明書を送ってください',
   body:'11/21（金）電車が遅れた件：☰メニュー →「🚃 遅延証明書を送る」から写真を送ってください。',at:'2026-11-21T09:05:00',read:true,canReply:true},
  {id:'b2',src:'base',cat:'notice',title:'年末調整の書類について',
   body:'年末調整の書類は 12月10日までに事務室の封筒に入れてください。',at:'2026-11-20T12:00:00',read:true,link:'掲示板の投稿'},
  {id:'s3',src:'shift',cat:'notice',title:'12月のシフトを公開しました',
   body:'12月のシフトを公開しました。シフト管理から確かめてください。',at:'2026-11-18T17:00:00',read:true},
  {id:'b3',src:'base',cat:'ai',title:'AIへの質問に回答がつきました',
   body:'「処置室の吸引器のフィルター交換はいつ？」への回答が業務マニュアルに追加されました。',at:'2026-11-15T10:20:00',read:true,link:'業務マニュアルのページ'}
];
// 見出しの頭に付けるバッジ（どこから来たか＋種類）
const BADGE={
  shift:{mismatch:['🗓 シフト','#B45309'],no_punch:['🗓 シフト','#DC2626'],delay_cert:['🗓 シフト','#185FA5'],notice:['🗓 シフト','#185FA5']},
  base:{manual:['📘 マニュアル','#2F7D5B'],notice:['📢 掲示板','#8A5A00'],ai:['🎤 Q&A','#6B4FA0']}
};
const SRC_LABEL={shift:'シフト管理アプリから',base:'HUKU BASE から'};
// 既読の印（見本はこの端末の中だけに保存。本番は元の表の read_at に書く）
const RKEY='portal_mock_read_v1';
function readSet(){try{return new Set(JSON.parse(localStorage.getItem(RKEY)||'[]'))}catch(e){return new Set()}}
function markRead(id){try{const s=readSet();s.add(id);localStorage.setItem(RKEY,JSON.stringify([...s]))}catch(e){}}
function isRead(m){return m.read||readSet().has(m.id)}
function unreadCount(){return INBOX_DEMO.filter(m=>!isRead(m)).length}
// 本物のデータ（Box の控え）で見るときは、見本のメッセージを置き換える
if(typeof RM!=='undefined'&&RM.inbox){INBOX_DEMO.length=0;INBOX_DEMO.push(...RM.inbox)}
