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
  // 出勤の希望（work_wish）は、勤務できる時間 time_from〜time_to（'HH:MM'）と、取り込む画面 scope（選んだときだけ）も送る
  hb.sendLeave=async(type,date,memo,slots,scope,time_from,time_to)=>must(await db.from('leave_requests').insert(type==='work_wish'?{type,date,memo:memo||null,scope:scope||null,time_from,time_to}:{type,date,memo:memo||null}).select('id').single());
  // 自分の社員番号がいるシフト管理の画面（2つ以上なら、どこのシフトかを選ばせる）と休診日
  hb.mySlots=async()=>must(await db.rpc('my_shift_slots'));
  // 自分の公開済みシフト（シフト管理アプリが置く）：画面ごとに 日付→{s:[{l,t}], r:申請, c:休診}
  hb.myDays=async()=>must(await db.rpc('my_shift_days'));
  hb.myLeaves=async()=>must(await db.from('leave_requests').select('id, type, date, memo, time_from, time_to, status, created_at').eq('profile_id',await hb.uid())
      .order('created_at',{ascending:false}).limit(30));
  return hb;
})();
// ── 2026-11-26 マイページ・ポイント・チャレンジ ──
// ポイント（今の期間の合計とうちわけ、今日のチャレンジの残り）。ランクの基準は points.js
HB.myPoints=async()=>HB.must(await HB.db.rpc('my_points'));
// 自分のアイコン（シフト管理アプリの「アイコン設定」を読むだけ）：{color, icon, img}
HB.myAvatar=async()=>HB.must(await HB.db.rpc('my_avatar'));
// 自分の院（掲示板の所属）
HB.myClinics=async()=>{const r=HB.must(await HB.db.rpc('my_facilities'));return (r||[]).filter(x=>x!=='全体')};
// ポイントアップチャレンジ：今日の次の問題（答えは来ない）と、答える（答え合わせはデータベースの中）
HB.challengeToday=async()=>HB.must(await HB.db.rpc('challenge_today'));
HB.challengeAnswer=async(qid,pick)=>HB.must(await HB.db.rpc('challenge_answer',{qid,p_pick:pick}));
// ログアウト（HUKU BASE もいっしょにログアウトになる）
HB.signOut=async()=>{await HB.db.auth.signOut()};
// 自分のアイコンを決める（マイページ）。シフト管理アプリが取り込んで、打刻のビー玉にも出る
HB.setMyAvatar=async(color,icon,img)=>HB.must(await HB.db.rpc('set_my_avatar',{p_color:color,p_icon:icon||'',p_img:img||''}));
// ── 2026-11-26 シフト管理（案A：スタッフは入口だけを使う） ──
// みんなのシフト（自分が名簿にいる画面の分だけ）：日付→{c:1}または{s:[{l,t,n:[名前]}]}
HB.myTeamDays=async()=>HB.must(await HB.db.rpc('my_team_days'));
// 自分の打刻の記録（タイムカードの控えを読むだけ）：{punch:{日付:{in,out,in2,out2}}, at}
HB.myTimecard=async()=>HB.must(await HB.db.rpc('my_timecard'));
// 打刻の修正：受け箱に1件入れる（シフト管理アプリが取り込んで、管理者が確認する）
HB.sendCorrection=async(date,newIn,newOut,reason,note)=>HB.must(await HB.db.from('correction_requests').insert({date,new_in:newIn||null,new_out:newOut||null,reason,note:note||null}).select('id').single());
HB.myCorrectionRequests=async()=>HB.must(await HB.db.from('correction_requests').select('id, date, new_in, new_out, reason, status, created_at').eq('profile_id',await HB.uid()).order('created_at',{ascending:false}).limit(20));
// 打刻修正の申告と管理者の確認の結果（シフト管理アプリの控えを読むだけ）
HB.myCorrections=async()=>HB.must(await HB.db.rpc('my_corrections'));
// 電車の遅延：遅延証明書を送る（タイムカードの「🚃 遅延証明書」にそのまま届く）。file は data URI
HB.sendDelayCert=async(date,kind,mime,name,file)=>HB.must(await HB.db.rpc('send_delay_cert',{p_date:date,p_kind:kind,p_mime:mime,p_name:name||'',p_file:file}));
// ベースシフト（自分の基本の勤務パターン）：[{scope,label,base:{same,today,note,A:{曜日:[{l,t}]},B:{...}}}]
HB.myBaseShift=async()=>HB.must(await HB.db.rpc('my_base_shift'));
