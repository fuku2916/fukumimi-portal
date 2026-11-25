// 本番のアプリの「住所」。ボタンはここへ飛ぶだけで、アプリの中身は一切変えない。
const LINKS=(()=>{
  const BASE='https://fuku2916.github.io/fukumimi-keijiban/';
  const SHIFT='https://fuku2916.github.io/hukumimi-shift/';
  const TC='https://fuku2916.github.io/fukumimi-timecard/';
  const BOARD={ekimae:'c3a70c53-2e76-4789-af50-68ae3f7af593',all:'790b8b10-e742-4165-b4c8-b45caff08c22'};
  const UNIT={'クラーク':'clerk','ナース':'nurse','ドクター':'doctor'};
  const unit=()=>(typeof RM!=='undefined'&&RM.me&&UNIT[RM.me.unit])||'';
  return {
    board:()=>BASE+'#/b/'+BOARD.ekimae,          // 駅前クリニックの掲示板（AIに聞く もここ）
    boardAll:()=>BASE+'#/b/'+BOARD.all,
    boardOf:id=>BASE+'#/b/'+id,                  // ログインした人の院の掲示板
    post:id=>BASE+'#/p/'+id,
    manual:()=>BASE+'#/manual',
    baseMsg:()=>BASE+'#/msg',
    shift:()=>SHIFT+'?clinic=ekimae'+(unit()?'&unit='+unit():''),
    timecard:()=>TC,
  };
})();
