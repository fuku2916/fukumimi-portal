// 「本物のデータ（Box の控え）」で表示するための切り替え。real-data.js が無ければ何もしない。
// 切り替えとだれとして見るかは、この端末の中（localStorage）だけに覚える。
const RM=(()=>{
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const has=typeof REAL!=='undefined';
  const on=has&&get('portal_mock_real')==='1';
  const people=has?REAL.people:[];
  const me=people.find(p=>p.code===get('portal_mock_me'))||people.find(p=>p.unit==='クラーク'&&p.hasBase)||people[0]||null;
  // 自分の院（見本は駅前）と「本部＝全体」の掲示
  const myBoard=on?REAL.board.filter(b=>b.badge==='駅前'||b.badge==='本部'):[];
  const isRead=id=>!!(me&&me.readPosts.includes(id));
  const NCAT={mismatch:'mismatch',no_punch:'no_punch',long:'no_punch',delay_cert:'delay_cert'};
  const inbox=on&&me?(REAL.notices[me.code]||[]).map(n=>({id:'n'+n.id,src:'shift',cat:NCAT[n.category]||'notice',
     title:n.category==='no_punch'?'打刻がありません':n.category==='mismatch'?'打刻と予定シフトが違います':n.category==='long'?'退勤打刻もれの可能性':n.category==='delay_cert'?'遅延証明書を送ってください':'管理者からのお知らせ',
     body:(n.target_date?n.target_date+'：':'')+(n.body||''),at:n.created_at,read:!!n.read_at,canReply:true})):null;
  return {has,on,people,me,myBoard,isRead,inbox,
    set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
    label:has?REAL.source:''};
})();
const rmDate=s=>{const d=new Date(s);return `${d.getMonth()+1}/${d.getDate()}`};
