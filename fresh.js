// この入口の中のページへ移るときは、毎回いちばん新しい版を開く。
// （iPhone の Safari は前に開いたページを覚えていて、古い版を出すことがあるため、リンクに時刻の印を付けて開き直させる）
// HUKU BASE やシフト管理など、ほかのアプリへのリンクには何もしない。
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('a[href]');
  if(!a||a.target==='_blank'||a.getAttribute('href').startsWith('#')) return;
  const u=new URL(a.href,location.href), here=location.pathname.replace(/[^/]*$/,'');
  if(u.origin!==location.origin||!u.pathname.startsWith(here)) return;
  if(!/(\.html|\/)$/.test(u.pathname)) return;
  u.searchParams.set('t',Date.now().toString(36));
  a.href=u.href;
},true);
