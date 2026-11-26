// ポイント制：お話を読んだら 1P、質問に答えたら 4P、ポイントアップチャレンジは正解1問 3P（1日3問まで）。1日 最大 14P。
// 2026-11-26：HUKU BASE にログインしていれば、ポイントはデータベース（my_points）のものを使う（me.js）。ランクの基準は 50/120/200/250。
// 集計期間は毎月11日〜翌月10日（給与の締めと同じ）。期間が変わると 0P から。
// 見本ではこの端末の中（localStorage）だけに記録する。本番はクラウドに1日1行で記録する予定。
const PTS=(()=>{
  const RANKS=[ // 「〜を超えたら」
    {min:250,name:'プラチナ',bg:'linear-gradient(135deg,#8E9EB5,#C9D3E3 45%,#7D8BA3)',fg:'#fff'},
    {min:200,name:'ゴールド',bg:'linear-gradient(135deg,#C9A227,#F2D46B 45%,#B8901A)',fg:'#fff'},
    {min:120,name:'シルバー',bg:'linear-gradient(135deg,#8F969E,#D3D7DB 45%,#858C94)',fg:'#fff'},
    {min:50, name:'ブロンズ',bg:'linear-gradient(135deg,#A0612D,#D9955A 45%,#8E5426)',fg:'#fff'},
    {min:-1, name:'ブルー',  bg:'#3aa7e8',fg:'#fff'},
  ];
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function period(now=new Date()){
    const s=now.getDate()>=11?new Date(now.getFullYear(),now.getMonth(),11):new Date(now.getFullYear(),now.getMonth()-1,11);
    const e=new Date(s.getFullYear(),s.getMonth()+1,10);
    return {start:ymd(s),end:ymd(e),label:`${s.getMonth()+1}/11〜${e.getMonth()+1}/10`};
  }
  const who=()=>(typeof RM!=='undefined'&&RM.me)?RM.me.code:'demo';
  const key=()=>`portal_mock_pts_${who()}_${period().start}`;
  const load=()=>{try{return JSON.parse(localStorage.getItem(key())||'{}')}catch(e){return {}}};
  const save=o=>{try{localStorage.setItem(key(),JSON.stringify(o))}catch(e){}};
  function total(){const o=load();return Object.keys(o).reduce((a,d)=>a+(o[d].read||0)+(o[d].ans||0),0)+(o._adj||0)}
  function today(){return load()[ymd(new Date())]||{}}
  function add(kind){ // kind: 'read' → 1P, 'ans' → 4P（1日1回ずつ）
    const o=load(),d=ymd(new Date()),t=o[d]||{};
    if(t[kind])return 0;
    t[kind]=kind==='read'?1:4; o[d]=t; save(o); return t[kind];
  }
  function rank(p){return RANKS.find(r=>p>r.min)}
  function next(p){const up=RANKS.slice().reverse().find(r=>r.min>=p);return up?{name:up.name,need:up.min+1-p}:null}
  function setForTest(p){const o=load();o._adj=0;save(o);const o2=load();o2._adj=p-total();save(o2)}
  function paint(el,p=total()){const r=rank(p);el.textContent=p+'P';el.style.background=r.bg;el.style.color=r.fg;el.title=r.name;return r}
  return {RANKS,period,total,today,add,rank,next,paint,setForTest};
})();
