// 本番の HUKU BASE の「AIに聞く」と同じ AI係に質問する（つながりは hb.js）。
// ここでできるのは「質問を送る・答えを読む・役に立ったかを付ける」だけ（HUKU BASE の画面でできることと同じ）。
const AI=(()=>{
  const db=HB.db, must=HB.must;
  const me={ready:HB.ready};
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
