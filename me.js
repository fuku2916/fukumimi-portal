// 自分のアイコンとランク（トップ画面の右上・マイページ・チャレンジで使う）
// アイコンはシフト管理アプリの「アイコン設定」（写真／絵文字／色）を、打刻のビー玉と同じ見た目で出す（フルネームつき）
const ME=(()=>{
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // 丸いアイコン：タイムカードの打刻画面の「ビー玉」と同じデザイン（色の玉＋光沢＋フルネーム。写真のときは黒縁取りの白文字）
  // px＝玉の直径（文字の大きさを決める。ビー玉と同じく 半径×0.42、11〜18px）
  function avatarHTML(av,name,px=72){
    const nm=esc(String(name||'').trim());
    const col=(av&&/^#[0-9a-fA-F]{3,8}$/.test(av.color||''))?av.color:'#7C3AED';
    const img=(av&&av.img&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(av.img))?av.img:'';
    const emo=(!img&&av&&av.icon&&av.icon!=='initial')?`<span class="em">${esc(av.icon)}</span>`:'';
    const bg=img?`radial-gradient(circle at 32% 26%, rgba(255,255,255,.55), rgba(255,255,255,0) 46%), url('${img}') center/cover, ${col}`
                :`radial-gradient(circle at 32% 26%, rgba(255,255,255,.75), rgba(255,255,255,0) 46%), ${col}`;
    const fs=Math.max(11,Math.min(18,Math.round(px/2*0.42)));
    return `<div class="mb${img?' photo':''}" style="background:${bg};font-size:${fs}px"><div class="nm">${emo}${nm}</div></div>`;
  }
  // ログインしていれば {me, points, avatar}。していなければ null
  async function load(){
    if(typeof HB==='undefined'||!(await HB.ready)) return null;
    const [me,points,avatar]=await Promise.all([HB.me(),HB.myPoints(),HB.myAvatar().catch(()=>null)]);
    return {me,points,avatar};
  }
  // 2026-11-27：前に読んだ内容をすぐ paint(x) し、新しいのが届いたらもう一度 paint(x)。ログインしていなければ paint(null)
  async function loadSWR(paint){
    if(typeof HB==='undefined'||!(await HB.ready)){paint(null);return null}
    return HB.swr('me_page',async()=>{const [me,points,avatar]=await Promise.all([HB.me(),HB.myPoints(),HB.myAvatar().catch(()=>null)]);return {me,points,avatar}},x=>paint(x));
  }
  return {esc,avatarHTML,load,loadSWR};
})();
