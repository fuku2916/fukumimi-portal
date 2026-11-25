// 本番の HUKU BASE の「AIに聞く」と同じ AI係に質問する。
// HUKU BASE と同じ住所（fuku2916.github.io）にあるので、このスマホで HUKU BASE にログインしていれば、そのログインをそのまま使う。
// ここでできるのは「質問を送る・答えを読む・役に立ったかを付ける」だけ（HUKU BASE の画面でできることと同じ）。
const AI=(()=>{
  const db=supabase.createClient('https://hwctwbnzjjdllqsmlvqm.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y3R3Ym56ampkbGxxc21sdnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NzkzMDQsImV4cCI6MjA5NjQ1NTMwNH0.quP2UmR59c1ULUgZkqaq0kzeD8VlOY3cKH4ZaZJwtf0');
  const must=({data,error})=>{if(error)throw new Error(error.message);return data};
  const me={ok:false};
  me.ready=db.auth.getSession().then(r=>me.ok=!!(r.data&&r.data.session)).catch(()=>false);
  me.ask=async(question,parentId)=>must(await db.from('ai_questions').insert({question,parent_id:parentId||null}).select('*').single());
  me.get=async id=>must(await db.from('ai_questions').select('*').eq('id',id).single());
  me.status=async()=>must(await db.from('ai_status').select('*').eq('id',1).maybeSingle());
  me.rate=async(id,r)=>must(await db.rpc('ai_rate',{q:id,r}));
  // 答えが出るまで2秒ごとに見る（最長5分）
  me.wait=async id=>{const t0=Date.now();let r;
    while(Date.now()-t0<5*60*1000){await new Promise(f=>setTimeout(f,2000));
      try{r=await me.get(id)}catch(_){continue}
      if(r.status!=='pending'&&r.status!=='answering')return r}
    return r};
  return me;
})();
