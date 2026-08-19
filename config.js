window.APP_CONFIG={SUPABASE_URL:'https://mymvvqysqdpzgcpviaap.supabase.co',SUPABASE_KEY:'sb_publishable_I_sz8meofTwhNNCnUhAmSQ_jdylbvgX'};
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='./theme.css?v=20260818-mobile-purple';document.head.appendChild(l);})();
(function(){
  document.addEventListener('DOMContentLoaded',function(){
    if(!/admin\.html$/i.test(location.pathname)) return;
    var input=document.getElementById('startDate');
    if(!input || !window.supabase) return;
    var status=document.createElement('div');
    status.style.cssText='font-size:12px;margin-top:6px;color:#6b4a78;font-weight:700;min-height:18px';
    status.textContent='날짜를 선택하면 자동 저장됩니다.';
    input.insertAdjacentElement('afterend',status);
    var autoClient=window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_KEY);
    input.addEventListener('change',async function(){
      var value=input.value;
      status.textContent='시작일 저장 중...';
      try{
        var sessionResult=await autoClient.auth.getSession();
        var session=sessionResult.data&&sessionResult.data.session;
        if(!session){status.textContent='로그인 세션이 만료되었습니다.';return;}
        var q=await autoClient.from('challenges').select('id,round_number').eq('is_active',true).order('round_number',{ascending:false}).limit(1).maybeSingle();
        if(q.error||!q.data){status.textContent='현재 운영 회차를 찾지 못했습니다.';return;}
        var r=await autoClient.from('challenges').update({start_date:value||null,updated_at:new Date().toISOString()}).eq('id',q.data.id);
        if(r.error){status.textContent='저장 실패: '+r.error.message;return;}
        status.textContent=value?'시작일 '+value+' 저장 완료 ✓':'시작일 삭제 완료 ✓';
      }catch(e){status.textContent='시작일 저장 중 오류가 발생했습니다.';}
    });
  });
})();