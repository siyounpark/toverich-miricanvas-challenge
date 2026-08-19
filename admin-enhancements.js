(function(){
  if(!/admin\.html(?:$|\?)/.test(location.pathname+location.search) && !location.pathname.endsWith('/admin.html')) return;
  const wait=()=>{
    if(!window.supabase||!window.APP_CONFIG){setTimeout(wait,100);return;}
    init();
  };
  async function init(){
    const client=supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_KEY);
    const style=document.createElement('style');
    style.textContent=`
      .detail-admin-card{margin-top:20px}.detail-member-list{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
      .detail-member-btn{border:1px solid #d7cadf;background:#fff;color:#4d2865;border-radius:999px;padding:9px 13px;font-weight:800;cursor:pointer}
      .detail-member-btn.active{background:#4d2865;color:#fff;border-color:#4d2865}
      .detail-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 0 14px}.detail-name{font-size:20px;font-weight:900;color:#4d2865}
      .detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.detail-day{border:1px solid #eadff0;border-radius:16px;padding:14px;background:#fff}
      .detail-day.done{border-color:#d7c453;background:#fffef4}.detail-day-top{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px}
      .detail-day-title{font-weight:900}.detail-badge{font-size:11px;font-weight:900;padding:5px 8px;border-radius:999px;background:#f2edf5;color:#6b5577}.detail-day.done .detail-badge{background:#efdc4b;color:#4d2865}
      .detail-thumb{width:100%;height:170px;object-fit:cover;border-radius:12px;border:1px solid #eee;cursor:pointer;background:#f5f3f6}.detail-empty{height:100px;border-radius:12px;background:#f7f4f8;display:grid;place-items:center;color:#9a8ca2;font-size:12px}
      .detail-meta{margin-top:9px;font-size:12px;line-height:1.6;color:#6f6475}.detail-note{margin-top:7px;padding:8px 10px;background:#f8f5fa;border-radius:10px;white-space:pre-wrap;word-break:break-word}
      .image-lightbox{display:none;position:fixed;inset:0;background:rgba(20,8,28,.86);z-index:99999;align-items:center;justify-content:center;padding:20px}.image-lightbox.open{display:flex}.image-lightbox img{max-width:min(960px,95vw);max-height:88vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.image-close{position:fixed;right:22px;top:18px;border:0;background:#fff;color:#4d2865;border-radius:999px;padding:10px 14px;font-weight:900;cursor:pointer}
      @media(max-width:760px){.detail-grid{grid-template-columns:1fr}.detail-thumb{height:220px}.detail-head{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);

    const history=document.getElementById('history');
    const anchor=history?.closest('.card');
    const section=document.createElement('section');
    section.className='card section detail-admin-card';
    section.innerHTML=`<h2>참가자별 인증 상세</h2><div class="small" style="margin-bottom:12px">참가자를 선택하면 DAY별 인증 이미지, 제작 개수, 작업 메모와 제출일을 확인할 수 있습니다.</div><div id="detailMemberList" class="detail-member-list"></div><div id="detailBody"><div class="small">참가자를 선택해주세요.</div></div>`;
    if(anchor) anchor.parentNode.insertBefore(section,anchor); else document.querySelector('main')?.appendChild(section);

    const lightbox=document.createElement('div');
    lightbox.className='image-lightbox';
    lightbox.innerHTML='<button class="image-close">닫기 ✕</button><img alt="인증 이미지 크게 보기">';
    document.body.appendChild(lightbox);
    lightbox.querySelector('.image-close').onclick=()=>lightbox.classList.remove('open');
    lightbox.onclick=e=>{if(e.target===lightbox)lightbox.classList.remove('open')};

    const {data:{session}}=await client.auth.getSession();
    if(!session) return;
    const {data:profile}=await client.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
    if(profile?.role!=='admin') return;
    const {data:challenge}=await client.from('challenges').select('*').eq('is_active',true).order('round_number',{ascending:false}).limit(1).maybeSingle();
    if(!challenge){document.getElementById('detailBody').innerHTML='<div class="small">현재 운영 중인 회차가 없습니다.</div>';return;}
    const {data:participants}=await client.from('challenge_participants').select('*').eq('challenge_id',challenge.id).order('joined_at');
    const rows=participants||[];
    if(!rows.length){document.getElementById('detailMemberList').innerHTML='<span class="small">현재 회차 참가자가 없습니다.</span>';return;}
    const ids=rows.map(r=>r.participant_id);
    const {data:profiles}=await client.from('profiles').select('id,display_name,username').in('id',ids);
    const pmap={};(profiles||[]).forEach(p=>pmap[p.id]=p);
    const list=document.getElementById('detailMemberList');
    rows.forEach((r,i)=>{
      const p=pmap[r.participant_id]||{};
      const b=document.createElement('button');
      b.className='detail-member-btn';
      b.textContent=`${p.display_name||p.username||'참가자'}${p.username?' · '+p.username:''}`;
      b.onclick=()=>showParticipant(r.participant_id,p,b);
      list.appendChild(b);
    });

    async function showParticipant(pid,p,button){
      document.querySelectorAll('.detail-member-btn').forEach(x=>x.classList.remove('active'));button.classList.add('active');
      const body=document.getElementById('detailBody');
      body.innerHTML='<div class="small">데이터를 불러오는 중입니다...</div>';
      const [{data:days},{data:subs,error:subErr}]=await Promise.all([
        client.from('challenge_days').select('*').eq('challenge_id',challenge.id).order('day_number'),
        client.from('submissions').select('*').eq('challenge_id',challenge.id).eq('participant_id',pid)
      ]);
      if(subErr){body.innerHTML='<div class="small">제출 데이터를 불러오지 못했습니다.</div>';return;}
      const dmap={};(days||[]).forEach(d=>dmap[d.id]=d);
      const smap={};(subs||[]).forEach(s=>smap[s.challenge_day_id]=s);
      const cards=[];
      for(let n=1;n<=challenge.duration_days;n++){
        const day=(days||[]).find(d=>d.day_number===n);
        const sub=day?smap[day.id]:null;
        let signed='';
        if(sub?.proof_image_url){
          const {data:signedData}=await client.storage.from('challenge-proofs').createSignedUrl(sub.proof_image_url,3600);
          signed=signedData?.signedUrl||'';
        }
        const submitted=sub?.updated_at||sub?.created_at;
        cards.push(`<div class="detail-day ${sub?.proof_image_url?'done':''}">
          <div class="detail-day-top"><div class="detail-day-title">DAY ${n}${day?.topic?' · '+escapeHtml(day.topic):''}</div><span class="detail-badge">${sub?.proof_image_url?'인증 완료':'미인증'}</span></div>
          ${signed?`<img class="detail-thumb" src="${signed}" data-full="${signed}" alt="DAY ${n} 인증 이미지">`:`<div class="detail-empty">업로드 이미지 없음</div>`}
          <div class="detail-meta"><strong>제작 요소:</strong> ${Number(sub?.element_count||0)}개<br><strong>제출일:</strong> ${submitted?new Date(submitted).toLocaleString('ko-KR'):'-'}</div>
          ${sub?.note?`<div class="detail-note"><strong>메모</strong><br>${escapeHtml(sub.note)}</div>`:''}
        </div>`);
      }
      body.innerHTML=`<div class="detail-head"><div><div class="detail-name">${escapeHtml(p.display_name||p.username||'참가자')}</div><div class="small">아이디 ${escapeHtml(p.username||'-')} · ${challenge.round_number}기</div></div><div class="progress-pill">${(subs||[]).filter(s=>s.proof_image_url).length}/${challenge.duration_days}</div></div><div class="detail-grid">${cards.join('')}</div>`;
      body.querySelectorAll('.detail-thumb').forEach(img=>img.onclick=()=>{lightbox.querySelector('img').src=img.dataset.full;lightbox.classList.add('open')});
    }
    function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  }
  wait();
})();