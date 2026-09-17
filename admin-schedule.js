// 2기부터 사용할 날짜 범위 + 휴식일 관리 보강
(function(){
  const REST='__REST__';
  const fmt=d=>{const x=new Date(d+'T00:00:00+09:00');return x};
  const ymd=x=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(x);
  const add=(d,n)=>{const x=fmt(d);x.setDate(x.getDate()+n);return ymd(x)};
  function wait(){if(typeof challenge==='undefined'||!document.getElementById('durationBtns')) return setTimeout(wait,300); mount();}
  function mount(){
    const box=document.getElementById('durationBtns'); const field=box.closest('.field');
    field.querySelector('label').textContent='운영 기간';
    field.innerHTML='<label>운영 기간</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><div class="small">시작일</div><input id="rangeStart" class="input" type="date"></div><div><div class="small">종료일</div><input id="rangeEnd" class="input" type="date"></div></div><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:13px;font-weight:800"><label><input id="restSat" type="checkbox" checked> 토요일 쉬기</label><label><input id="restSun" type="checkbox" checked> 일요일 쉬기</label></div><div class="small" style="margin-top:8px">휴식일은 DAY 인증 횟수에 포함하지 않습니다. DAY별 화면에서 휴식일을 직접 변경할 수도 있습니다.</div>';
    const oldStart=document.getElementById('startDate'); if(oldStart) oldStart.closest('.field').style.display='none';
    const dayActions=document.querySelector('#saveDay')?.parentElement;
    if(dayActions && !document.getElementById('toggleRest')){const b=document.createElement('button');b.id='toggleRest';b.className='btn warn';b.textContent='이 날짜 쉬어가기';b.onclick=toggleRest;dayActions.appendChild(b)}
    sync();
    document.getElementById('saveBasic').addEventListener('click',saveRange,true);
    setInterval(sync,1200);
  }
  function sync(){if(!challenge)return;const s=challenge.start_date||'';const e=s?add(s,(challenge.duration_days||1)-1):'';const rs=document.getElementById('rangeStart'),re=document.getElementById('rangeEnd');if(rs&&!rs.matches(':focus'))rs.value=s;if(re&&!re.matches(':focus'))re.value=e; const d=days.find(x=>x.day_number===selected);const b=document.getElementById('toggleRest');if(b)b.textContent=d?.topic===REST?'쉬어가기 해제':'이 날짜 쉬어가기';}
  async function saveRange(ev){const s=document.getElementById('rangeStart')?.value,e=document.getElementById('rangeEnd')?.value;if(!challenge||!s||!e)return;if(e<s){ev.preventDefault();ev.stopImmediatePropagation();return alert('종료일은 시작일 이후로 선택해주세요.')}const total=Math.floor((fmt(e)-fmt(s))/86400000)+1;duration=total;const r=await client.from('challenges').update({start_date:s,duration_days:total,updated_at:new Date().toISOString()}).eq('id',challenge.id);if(r.error){ev.preventDefault();ev.stopImmediatePropagation();return alert(r.error.message)}
    // 토/일을 휴식일로 자동 표시. 기존에 입력한 주제는 덮어쓰지 않음.
    for(let i=1;i<=total;i++){const date=add(s,i-1),dow=fmt(date).getDay(),rest=(dow===6&&document.getElementById('restSat').checked)||(dow===0&&document.getElementById('restSun').checked);if(!rest)continue;const old=days.find(x=>x.day_number===i);if(old&&old.topic&&old.topic!==REST)continue;if(old){await client.from('challenge_days').update({topic:REST,keywords:[],updated_at:new Date().toISOString()}).eq('id',old.id)}else{await client.from('challenge_days').insert({challenge_id:challenge.id,day_number:i,topic:REST,keywords:[],description:'',styles:[],reference_note:'',updated_at:new Date().toISOString()})}}
    setTimeout(()=>load(),200);
  }
  async function toggleRest(){if(!challenge)return;const old=days.find(x=>x.day_number===selected);if(old?.topic===REST){await client.from('challenge_days').update({topic:'',keywords:[],updated_at:new Date().toISOString()}).eq('id',old.id)}else if(old){await client.from('challenge_days').update({topic:REST,keywords:[],updated_at:new Date().toISOString()}).eq('id',old.id)}else{await client.from('challenge_days').insert({challenge_id:challenge.id,day_number:selected,topic:REST,keywords:[],description:'',styles:[],reference_note:'',updated_at:new Date().toISOString()})}await load()}
  wait();
})();