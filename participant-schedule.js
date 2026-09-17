// 참가자 화면: 쉬는 날 표시 및 인증 잠금
(function(){
 const REST='__REST__';
 function wait(){if(typeof challenge==='undefined'||!document.getElementById('days'))return setTimeout(wait,300);patch();setInterval(patch,700)}
 function patch(){if(!challenge||!Array.isArray(days))return;const active=days.filter(d=>d.topic&&d.topic!==REST).length||challenge.duration_days;const durationEl=document.getElementById('durationCount');if(durationEl)durationEl.textContent=active;const title=document.getElementById('scheduleTitle');if(title)title.textContent=`${challenge.round_number}기 · 운영 일정`;
   const today=days.find(d=>d.day_number===currentDay);if(today?.topic===REST){document.getElementById('dayAlert').textContent='🌿 오늘은 쉬어갑니다. 오늘은 키워드 제시와 인증이 없습니다.';document.getElementById('dayAlert').className='day-alert';document.getElementById('dayTitle').textContent='오늘은 쉬어갑니다 🌿';document.getElementById('mainTopic').textContent='쉬어갑니다';document.getElementById('subTopics').innerHTML='<span class="sub-chip">충전하고 다음 챌린지 날에 만나요.</span>';if(typeof setFormEnabled==='function')setFormEnabled(false)}
   document.querySelectorAll('#days .day').forEach((el,idx)=>{const d=days.find(x=>x.day_number===idx+1);if(d?.topic===REST){el.classList.add('locked');el.innerHTML=`<strong>${dateLabel(idx+1)}</strong><span class="small">🌿 쉬어갑니다</span>`;el.onclick=null}else{const strong=el.querySelector('strong');if(strong)strong.textContent=`DAY ${activeNumber(idx+1)}`}});
   const done=subs.filter(x=>x.proof_image_url&&days.find(d=>d.id===x.challenge_day_id)?.topic!==REST).length;const dc=document.getElementById('doneCount');if(dc)dc.textContent=done;const bar=document.getElementById('progressBar');if(bar)bar.style.width=`${Math.min(100,done/Math.max(1,active)*100)}%`;
 }
 function activeNumber(calendarDay){return days.filter(d=>d.day_number<=calendarDay&&d.topic!==REST).length}
 function dateLabel(n){if(!challenge.start_date)return '휴식';const x=new Date(challenge.start_date+'T00:00:00+09:00');x.setDate(x.getDate()+n-1);return `${x.getMonth()+1}/${x.getDate()}`}
 document.addEventListener('click',e=>{const b=e.target.closest('#saveSubmission');if(!b)return;const d=days.find(x=>x.day_number===selected);if(d?.topic===REST){e.preventDefault();e.stopImmediatePropagation();alert('오늘은 쉬어가는 날입니다. 인증은 다음 챌린지 날에 진행해주세요.') }},true);
 wait();
})();