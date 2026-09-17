window.APP_CONFIG={SUPABASE_URL:'https://mymvvqysqdpzgcpviaap.supabase.co',SUPABASE_KEY:'sb_publishable_I_sz8meofTwhNNCnUhAmSQ_jdylbvgX'};
(function(){
 var l=document.createElement('link');l.rel='stylesheet';l.href='./theme.css?v=20260917-schedule';document.head.appendChild(l);
 function add(src){var s=document.createElement('script');s.src=src;s.defer=true;document.head.appendChild(s)}
 if(location.pathname.endsWith('/admin.html')){
  add('./admin-enhancements.js?v=20260819-participant-detail');
  add('./admin-schedule.js?v=20260917-range-rest');
  window.addEventListener('DOMContentLoaded',function(){var a=document.createElement('a');a.href='./admin-unlock.html';a.textContent='지난 DAY 예외 열기';a.style.cssText='position:fixed;right:18px;bottom:18px;z-index:9999;background:#4D2865;color:#EFDC4B;text-decoration:none;padding:13px 16px;border-radius:999px;font-weight:900;box-shadow:0 8px 24px rgba(77,40,101,.25)';document.body.appendChild(a)})
 }
 if(location.pathname.endsWith('/index.html')||location.pathname==='/' ){add('./participant-schedule.js?v=20260917-rest')}
})();