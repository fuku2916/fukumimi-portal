// HUKU BASE（本番）とのつながり。HUKU BASE と同じ住所（fuku2916.github.io）にあるので、
// このスマホで HUKU BASE にログインしていれば、そのログインをそのまま使う（ここで別にログインはしない）。
// ほとんどは「読む」だけ。書き込むのは Q&A（ai.js）の質問と、申請（有給・休みの希望）を出すときだけ。
const HB=(()=>{
  const db=supabase.createClient('https://hwctwbnzjjdllqsmlvqm.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y3R3Ym56ampkbGxxc21sdnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzkzMDQsImV4cCI6MjA5NjQ1NTMwNH0.quP2UmR59c1ULUgZkqaq0kzeD8VlOY3cKH4ZaZJwtf0');
  const must=({data,error})=>{if(error)throw new Error(error.message);return data};
  const hb={db,must};
  hb.ready=db.auth.getSession().then(r=>!!(r.data&&r.data.session)).catch(()=>false);
  hb.uid=async()=>(await db.auth.getSession()).data.session?.user.id;
  // 自分（名前・職種）
  hb.me=async()=>must(await db.from('profiles').select('id, display_name, job, role').eq('id',await hb.uid()).maybeSingle());
  // 見られる掲示板（自分の院と全体）。未読数つき
  hb.boards=async()=>must(await db.from('board_summaries').select('id, name, sort_order, unread_count').order('sort_order'));
  // 掲示板ごとの新しいお知らせ（固定を先に、新しい順）
  hb.posts=async(boardId,n)=>must(await db.from('post_summaries').select('id, title, created_at, is_read, pinned').eq('board_id',boardId).eq('kind','notice')
      .order('pin_active',{ascending:false}).order('created_at',{ascending:false}).limit(n));
  // HUKU BASE のメッセージの未読数
  hb.unreadMessages=async()=>{const {count}=await db.from('messages').select('id',{count:'exact',head:true}).eq('recipient_id',await hb.uid()).is('read_at',null);return count??0};
  // 申請（有給・休みの希望）：受け箱 leave_requests に1件入れる。社員番号と名前はデータベースが本人のものを付ける。
  // シフト管理アプリが取り込むと status が imported（同じ日にすでに申請があれば duplicate）になる
  hb.sendLeave=async(type,date,memo)=>must(await db.from('leave_requests').insert({type,date,memo:memo||null}).select('id').single());
  hb.myLeaves=async()=>must(await db.from('leave_requests').select('id, type, date, memo, status, created_at').eq('profile_id',await hb.uid())
      .order('created_at',{ascending:false}).limit(30));
  return hb;
})();
