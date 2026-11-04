const $=id=>document.getElementById(id);
const state={pools:[],tab:"all",watch:new Set(JSON.parse(localStorage.getItem("ocr-watch")||"[]")),positions:JSON.parse(localStorage.getItem("ocr-positions")||"[]"),cash:Number(localStorage.getItem("ocr-cash")||100),timer:null};
const fmt=n=>n==null||!Number.isFinite(Number(n))?"—":Number(n).toLocaleString("en-US",{maximumFractionDigits:2});
const money=n=>n==null||!Number.isFinite(Number(n))?"—":"$"+Number(n).toLocaleString("en-US",{maximumFractionDigits:0});
const age=t=>{if(!t)return"—";let h=(Date.now()-new Date(t).getTime())/36e5;return h<1?Math.max(1,Math.round(h*60))+"m ago":h<24?Math.round(h)+"h ago":Math.round(h/24)+"d ago"};
function network(){return $("network").value}
async function fetchPools(){
 $("statusText").textContent="Fetching market data";$("statusDot").style.background="#e7b75a";$("refreshBtn").disabled=true;
 try{
  const net=network(),url=`https://api.geckoterminal.com/api/v2/networks/${encodeURIComponent(net)}/new_pools?page=1`;
  const res=await fetch(url,{headers:{Accept:"application/json;version=20230203"}});
  if(!res.ok)throw Error("Market data service returned "+res.status);
  const json=await res.json(),rows=(json.data||[]).map(x=>{const a=x.attributes||{};return{id:x.id,name:a.name||"Unknown pool",address:a.address||"",base:a.base_token_price_usd,quote:a.quote_token_price_usd,liq:Number(a.reserve_in_usd)||0,volume:Number(a.volume_usd?.h24)||0,created:a.pool_created_at,txns:Number(a.transactions?.h24?.buys||0)+Number(a.transactions?.h24?.sells||0),fdv:Number(a.fdv_usd)||0,network:net};});
  state.pools=rows;render();$("statusText").textContent="Feed connected";$("statusDot").style.background="#68e0a4";$("updatedAt").textContent="Updated "+new Date().toLocaleTimeString()+" · GeckoTerminal public feed";
 }catch(e){$("statusText").textContent="Feed unavailable";$("statusDot").style.background="#ff7c83";$("updatedAt").textContent=e.message+" · Try again in a minute.";if(!state.pools.length)$("feed").innerHTML='<div class="empty">Could not load the public feed. Check your connection or try again shortly.</div>'}
 finally{$("refreshBtn").disabled=false}
}
function filtered(){let min=Number($("minLiq").value),hours=Number($("maxAge").value),arr=state.pools.filter(p=>p.liq>=min&&p.created&&((Date.now()-new Date(p.created).getTime())/36e5)<=hours);arr.sort((a,b)=>$("sort").value==="liquidity"?b.liq-a.liq:$("sort").value==="volume"?b.volume-a.volume:new Date(b.created)-new Date(a.created));return arr}
function render(){let arr=filtered();$("poolCount").textContent=state.pools.length;$("qualifiedCount").textContent=arr.length;$("watchCount").textContent=state.watch.size;
 if(state.tab==="watch")arr=arr.filter(p=>state.watch.has(p.id));
 $("feed").innerHTML=arr.length?arr.map(p=>`<article class="pool"><div class="coin"><b>${esc(p.name)}</b><small>${esc(p.network)} · ${esc(p.address.slice(0,7))}…${esc(p.address.slice(-5))} · ${age(p.created)}</small><a href="https://www.geckoterminal.com/${encodeURIComponent(p.network)}/pools/${encodeURIComponent(p.address)}" target="_blank" rel="noopener">Open pool ↗</a></div><div class="metric"><small>LIQUIDITY</small><b>${money(p.liq)}</b></div><div class="metric"><small>24H VOLUME</small><b>${money(p.volume)}</b></div><div class="metric"><small>24H TXNS</small><b>${fmt(p.txns)}</b></div><div class="actions"><button class="mini star" data-watch="${esc(p.id)}">${state.watch.has(p.id)?"★ Saved":"☆ Watch"}</button><button class="mini" data-buy="${esc(p.id)}">Paper buy</button></div></article>`).join(""):'<div class="empty">No pools match these filters right now. Try lowering minimum liquidity or widening pool age.</div>';
 renderPaper();}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function saveWatch(){localStorage.setItem("ocr-watch",JSON.stringify([...state.watch]))}
function renderPaper(){ $("paperCash").textContent=money(state.cash);$("paperPositions").textContent=state.positions.length;$("positions").innerHTML=state.positions.length?state.positions.map((p,i)=>`<div class="position"><span><b>${esc(p.name)}</b><br><span class="muted">${esc(p.network)} · simulated entry ${money(p.amount)}</span></span><button class="mini" data-close="${i}">Close position</button></div>`).join(""):'<p class="muted">No simulated positions yet. Use “Paper buy” on a pool to practise.</p>';localStorage.setItem("ocr-positions",JSON.stringify(state.positions));localStorage.setItem("ocr-cash",String(state.cash))}
document.addEventListener("click",e=>{let w=e.target.closest("[data-watch]"),b=e.target.closest("[data-buy]"),c=e.target.closest("[data-close]");if(w){let id=w.dataset.watch;state.watch.has(id)?state.watch.delete(id):state.watch.add(id);saveWatch();render()}if(b){let p=state.pools.find(x=>x.id===b.dataset.buy),amt=Math.max(0,Number($("paperAmount").value));if(!p||!amt||amt>state.cash){alert("Enter a valid simulated amount within your virtual cash balance.");return}state.cash-=amt;state.positions.push({name:p.name,network:p.network,amount:amt,entryPrice:p.base||null});render()}if(c){let p=state.positions.splice(Number(c.dataset.close),1)[0];if(p)state.cash+=p.amount;render()}});
["network","minLiq","maxAge","sort"].forEach(id=>$(id).addEventListener("change",()=>id==="network"?fetchPools():render()));
$("refreshBtn").addEventListener("click",fetchPools);
document.querySelectorAll("[data-tab]").forEach(x=>x.addEventListener("click",()=>{state.tab=x.dataset.tab;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===x));render()}));
$("resetPaper").addEventListener("click",()=>{if(confirm("Reset virtual cash and clear all simulated positions?")){state.cash=Math.max(1,Number($("paperStart").value)||100);state.positions=[];render()}});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
fetchPools();state.timer=setInterval(fetchPools,60000);
