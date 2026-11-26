// マイページの「アイコンを変える」：色・絵文字・写真（シフト管理アプリの「アイコン設定」と同じ中身）
// 保存すると avatar_requests に入り、シフト管理アプリが取り込んで打刻のビー玉にも同じアイコンが出る
const AVEDIT=(()=>{
  const PALETTE=['#7C3AED','#2563EB','#0891B2','#059669','#65A30D','#CA8A04','#EA580C','#DC2626','#DB2777','#475569'];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // 写真の位置合わせ（ドラッグで移動・2本指かスライダーで拡大）→ 144px の丸に切り抜いた JPEG
  function crop(file,onDone){
    const rd=new FileReader();
    rd.onload=()=>{
      const raw=new Image();
      raw.onload=()=>{
        if(Math.max(raw.width,raw.height)>1200){
          const k=1200/Math.max(raw.width,raw.height),cc=document.createElement('canvas');
          cc.width=Math.round(raw.width*k);cc.height=Math.round(raw.height*k);
          cc.getContext('2d').drawImage(raw,0,0,cc.width,cc.height);
          const small=new Image();small.onload=()=>build(small);small.src=cc.toDataURL('image/jpeg',0.9);
        }else build(raw);
      };
      raw.onerror=()=>alert('画像を読み込めませんでした');
      raw.src=rd.result;
    };
    rd.onerror=()=>alert('画像を読み込めませんでした');
    rd.readAsDataURL(file);

    function build(img){
      const V=Math.min(300,Math.floor(Math.min(innerWidth,innerHeight)*0.72)),w=img.width,h=img.height,s0=V/Math.min(w,h);
      let k=1,ox=(V-w*s0)/2,oy=(V-h*s0)/2;
      const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
      const clampPos=()=>{const s=s0*k;ox=cl(ox,V-w*s,0);oy=cl(oy,V-h*s,0)};
      const bg=document.createElement('div');bg.className='ae-bg';bg.style.zIndex=60;
      bg.innerHTML=`<div class="ae-box" style="text-align:center">
        <h3>写真の位置合わせ</h3><p class="note" style="margin:0 0 10px">丸の中に入れたいところを <b>指で動かす</b>・<b>2本指かスライダーで大きく</b></p>
        <div id="cVp" style="position:relative;width:${V}px;height:${V}px;overflow:hidden;border-radius:12px;background:#0f172a;margin:0 auto;touch-action:none">
          <img id="cImg" src="${img.src}" draggable="false" style="position:absolute;left:0;top:0;pointer-events:none;max-width:none">
          <div style="position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 9999px rgba(15,23,42,.55);pointer-events:none"></div>
          <div style="position:absolute;left:0;top:0;width:${V-4}px;height:${V-4}px;border-radius:50%;border:2px solid rgba(255,255,255,.95);pointer-events:none"></div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin:12px 0 4px">🔍−<input id="cZoom" type="range" min="100" max="400" value="100" style="width:${V-90}px">🔍＋</div>
        <button class="big-btn" id="cOk">この位置で切り抜く</button><button class="big-btn sub-btn" id="cNo">やめる</button></div>`;
      document.body.appendChild(bg);
      const vp=bg.querySelector('#cVp'),im=bg.querySelector('#cImg'),zoom=bg.querySelector('#cZoom');
      const draw=()=>{const s=s0*k;im.style.width=(w*s)+'px';im.style.height=(h*s)+'px';im.style.left=ox+'px';im.style.top=oy+'px'};
      draw();
      const pts=new Map();let pinchD=0;
      vp.addEventListener('pointerdown',e=>{try{vp.setPointerCapture(e.pointerId)}catch(_){}
        pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(pts.size===2){const a=[...pts.values()];pinchD=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}
        e.preventDefault()});
      vp.addEventListener('pointermove',e=>{
        if(!pts.has(e.pointerId))return;
        const p=pts.get(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(pts.size===1){ox+=e.clientX-p.x;oy+=e.clientY-p.y;clampPos();draw()}
        else if(pts.size===2){
          const a=[...pts.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
          if(pinchD>0){const r=vp.getBoundingClientRect(),mx=(a[0].x+a[1].x)/2-r.left,my=(a[0].y+a[1].y)/2-r.top,kN=cl(k*(d/pinchD),1,4),f=kN/k;
            ox=mx-(mx-ox)*f;oy=my-(my-oy)*f;k=kN;clampPos();draw();zoom.value=Math.round(k*100)}
          pinchD=d;
        }
        e.preventDefault()});
      const lift=e=>{pts.delete(e.pointerId);if(pts.size<2)pinchD=0};
      ['pointerup','pointercancel','pointerleave'].forEach(t=>vp.addEventListener(t,lift));
      zoom.oninput=()=>{const kN=cl(+zoom.value/100,1,4),f=kN/k,m=V/2;ox=m-(m-ox)*f;oy=m-(m-oy)*f;k=kN;clampPos();draw()};
      bg.querySelector('#cNo').onclick=()=>bg.remove();
      bg.querySelector('#cOk').onclick=()=>{
        const N=144,out=document.createElement('canvas');out.width=N;out.height=N;
        const sc=N/V,s=s0*k;out.getContext('2d').drawImage(img,ox*sc,oy*sc,w*s*sc,h*s*sc);
        let q=0.82,url=out.toDataURL('image/jpeg',q);
        while(url.length>60000&&q>0.4){q-=0.12;url=out.toDataURL('image/jpeg',q)}
        bg.remove();onDone(url);
      };
    }
  }

  // 編集の画面を開く。cur={color,icon,img}。保存できたら onSaved(新しいアイコン)
  function open(cur,name,onSaved){
    const d={color:/^#[0-9A-Fa-f]{6}$/.test((cur&&cur.color)||'')?cur.color:PALETTE[0],icon:(cur&&cur.icon)||'',img:(cur&&cur.img)||''};
    const bg=document.createElement('div');bg.className='ae-bg';
    bg.innerHTML=`<div class="ae-box"><h3>🎨 アイコンを変える</h3>
      <div class="ae-prev" id="aePrev"></div>
      <div class="ae-lbl">色 <small>（打刻のビー玉の色。写真も絵文字もないときは、ここにも出ます）</small></div>
      <div class="ae-pal" id="aePal">${PALETTE.map(c=>`<button type="button" data-c="${c}" style="background:${c}" aria-label="色 ${c}"></button>`).join('')}</div>
      <div class="ae-lbl">絵文字（1〜2文字・なくてもよい）</div>
      <input id="aeIcon" class="ae-in" maxlength="4" placeholder="例：🍓" value="${esc(d.icon)}">
      <div class="ae-lbl">📷 写真（丸く切り抜きます）</div>
      <div class="ae-row"><label class="ae-sbtn">写真を選ぶ<input type="file" accept="image/*" id="aeFile" hidden></label><button type="button" class="ae-sbtn" id="aeNoImg">写真を消す</button></div>
      <p class="note" style="margin:4px 0 0">写真があるときは、色と絵文字より写真が出ます。</p>
      <div class="error" id="aeErr" hidden></div>
      <button class="big-btn" id="aeSave">保存する</button><button class="big-btn sub-btn" id="aeNo">やめる</button>
      <p class="note">保存すると、すぐここに出ます。打刻（iPadのビー玉）とシフト管理アプリには、シフト管理アプリが取り込んだあとに出ます。</p></div>`;
    document.body.appendChild(bg);
    const $=s=>bg.querySelector(s);
    const show=()=>{
      $('#aePrev').innerHTML=ME.avatarHTML({color:d.color,icon:d.icon,img:d.img||null},name);
      bg.querySelectorAll('#aePal button').forEach(b=>b.classList.toggle('on',b.dataset.c===d.color));
      $('#aeNoImg').hidden=!d.img;
    };
    show();
    $('#aePal').onclick=e=>{const c=e.target.dataset&&e.target.dataset.c;if(c){d.color=c;show()}};
    $('#aeIcon').oninput=e=>{d.icon=e.target.value.trim();show()};
    $('#aeFile').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f)crop(f,url=>{d.img=url;show()})};
    $('#aeNoImg').onclick=()=>{d.img='';show()};
    $('#aeNo').onclick=()=>bg.remove();
    $('#aeSave').onclick=async()=>{
      const b=$('#aeSave');b.disabled=true;b.textContent='保存しています…';$('#aeErr').hidden=true;
      try{await HB.setMyAvatar(d.color,d.icon,d.img);bg.remove();onSaved({color:d.color,icon:d.icon,img:d.img||null,pending:true})}
      catch(e){$('#aeErr').textContent='保存できませんでした（'+e.message+'）';$('#aeErr').hidden=false;b.disabled=false;b.textContent='保存する'}
    };
  }
  return {open,crop,PALETTE};
})();
