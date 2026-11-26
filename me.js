// 自分のアイコンとランク（トップ画面の右上・マイページ・チャレンジで使う）
// アイコンはシフト管理アプリの「アイコン設定」（写真／絵文字／色）をそのまま使う。決めていない人は名前の1文字目
const ME=(()=>{
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // 丸いアイコンの中身（HTML）
  function avatarHTML(av,name){
    const nm=String(name||'').trim();
    if(av&&av.img&&/^data:image\/(jpeg|png|webp);base64,/.test(av.img)) return `<img class="av-img" src="${av.img}" alt="">`;
    if(av&&av.icon) return `<span class="av-emoji">${esc(av.icon)}</span>`;
    const col=(av&&/^#[0-9a-fA-F]{3,8}$/.test(av.color||''))?av.color:'#7C3AED';
    return `<span class="av-init" style="background:${col}">${esc(nm.slice(0,1)||'？')}</span>`;
  }
  // ログインしていれば {me, points, avatar}。していなければ null
  async function load(){
    if(typeof HB==='undefined'||!(await HB.ready)) return null;
    const [me,points,avatar]=await Promise.all([HB.me(),HB.myPoints(),HB.myAvatar().catch(()=>null)]);
    return {me,points,avatar};
  }
  return {esc,avatarHTML,load};
})();
