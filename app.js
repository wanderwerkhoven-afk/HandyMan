let projects=[];
let active="woodworking";
let query="";
const cards=document.querySelector("#projectCards");

function projectMatches(p){
  const haystack=[p.id,p.title,p.description,p.difficulty,...p.category].join(" ").toLowerCase();
  return (active==="woodworking"||p.category.includes(active))&&(!query||haystack.includes(query));
}

function render(){
  const filtered=projects.filter(projectMatches);
  cards.innerHTML=filtered.length?filtered.map(p=>`<article class="card" data-project-id="${p.id}"><div class="card-img"><img src="${p.hero.url}" alt="${p.title}" loading="lazy"><button class="heart" aria-label="Save ${p.title}" data-save="${p.id}">♡</button></div><div class="card-body"><h3>${p.title}</h3><p>${p.description}</p><div class="meta"><span class="level">▥ &nbsp;${p.difficulty}</span><span class="project-id">${p.id}</span></div></div></article>`).join(""):`<p style="grid-column:1/-1;color:#756f66">No builds match this filter yet.</p>`;
}

async function loadProjects(){
  try{
    const response=await fetch("data/projects.json");
    if(!response.ok)throw new Error(`Project catalog request failed: ${response.status}`);
    const catalog=await response.json();
    projects=catalog.projects;
    render();
  }catch(error){
    console.error(error);
    cards.innerHTML='<p style="grid-column:1/-1;color:#756f66">Projects could not be loaded. Serve HandyMan through a local/static web server instead of opening the file directly.</p>';
  }
}

document.querySelector("#chips").addEventListener("click",e=>{
  const b=e.target.closest(".chip");
  if(!b)return;
  document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  active=b.dataset.filter;
  render();
});

document.querySelector("#searchInput").addEventListener("input",e=>{
  query=e.target.value.trim().toLowerCase();
  render();
});
document.querySelector("#searchForm").addEventListener("submit",e=>e.preventDefault());

cards.addEventListener("click",e=>{
  const b=e.target.closest(".heart");
  if(!b)return;
  b.classList.toggle("saved");
  b.textContent=b.classList.contains("saved")?"♥":"♡";
});

function toast(msg){
  const t=document.querySelector("#toast");
  t.textContent=msg;
  t.classList.add("show");
  clearTimeout(window._toast);
  window._toast=setTimeout(()=>t.classList.remove("show"),1800);
}

const buildPage=document.querySelector("#buildPage");
let buildStep=0;
let buildTab="overview";

function currentBuildProject(){return projects[0]||null}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
function renderBuildProject(){
 const p=currentBuildProject();if(!p)return;
 document.querySelector("#buildThumb").src=p.hero.url;
 document.querySelector("#stepImage").src=p.hero.url;
 document.querySelector("#buildThumb").alt=p.title;
 document.querySelector("#stepImage").alt=p.title+" build reference";
 document.querySelector("#buildId").textContent=p.id;
 document.querySelector("#buildTitle").textContent=p.title;
 document.querySelector("#buildDescription").textContent=p.description;
 document.querySelector("#buildDifficulty").textContent=p.difficulty;
 document.querySelector("#sourceLink").href=p.source.url;
 renderBuildTab();
 renderBuildStep();
}
function renderBuildTab(){
 const p=currentBuildProject();if(!p)return;
 const data=p.build||{};
 const host=document.querySelector("#buildTabContent");
 document.querySelectorAll("[data-build-tab]").forEach(x=>x.classList.toggle("active",x.dataset.buildTab===buildTab));
 document.querySelectorAll(".build-steps-only").forEach(x=>x.hidden=buildTab!=="steps");
 if(buildTab==="steps"){host.innerHTML="";return}
 if(buildTab==="overview") host.innerHTML=`<div class="build-info-grid"><article class="build-panel"><h2>Project overview</h2><p>${escapeHtml(p.description)}</p><dl class="project-facts"><div><dt>Difficulty</dt><dd>${escapeHtml(p.difficulty)}</dd></div><div><dt>Estimated cost</dt><dd>${escapeHtml(p.estimatedCost)}</dd></div><div><dt>Type</dt><dd>${escapeHtml(p.projectType)}</dd></div><div><dt>Source status</dt><dd>${escapeHtml(data.sourceStatus)}</dd></div></dl></article><article class="build-panel"><h3>Build at a glance</h3><p>Three-piece wall shelf with notched joinery. Dry-fit the joints before gluing, then mount using two metal angle brackets.</p><a class="source-button" href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener">View original plan ↗</a></article></div>`;
 if(buildTab==="materials") host.innerHTML=`<article class="build-panel"><div class="panel-head"><h2>Materials</h2><span>${data.materials?.length||0} items</span></div><div class="build-data-list">${(data.materials||[]).map(m=>`<div><b>${escapeHtml(m.name)}</b><span>${escapeHtml(m.quantity)}</span><small>${escapeHtml(m.spec)}</small></div>`).join("")}</div></article>`;
 if(buildTab==="tools") host.innerHTML=`<article class="build-panel"><div class="panel-head"><h2>Tools</h2><span>${data.tools?.length||0} tools</span></div><div class="tool-grid">${(data.tools||[]).map(t=>`<div>✓ <span>${escapeHtml(t)}</span></div>`).join("")}</div><p class="safety-note">Use the listed safety glasses and hearing protection and follow each tool manufacturer's instructions.</p></article>`;
 if(buildTab==="plans") host.innerHTML=`<div class="build-info-grid"><article class="build-panel"><div class="panel-head"><h2>Cut list</h2><span>Verified</span></div><div class="cut-table"><div class="cut-row cut-head"><span>Qty</span><span>Stock</span><span>Length</span></div>${(data.cutList||[]).map(c=>`<div class="cut-row"><span>${c.quantity}</span><b>${escapeHtml(c.stock)}</b><span>${escapeHtml(c.length)}</span></div>`).join("")}</div></article><article class="build-panel"><h3>Original plan</h3><p>Notch positions and diagrams remain tied to the verified source drawing. Open the original plan before marking the notches.</p><a class="source-button" href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener">Open Ana White plan ↗</a></article></div>`;
}
function renderBuildStep(){
 const p=currentBuildProject();if(!p||!p.build?.steps?.length)return;
 const steps=p.build.steps,s=steps[buildStep];
 document.querySelector("#stepKicker").textContent=`Step ${buildStep+1} of ${steps.length}`;
 document.querySelector("#stepTitle").textContent=s.title;
 document.querySelector("#stepCopy").textContent=s.summary;
 document.querySelector("#progressFill").style.width=(buildStep/(steps.length-1)*100)+"%";
 const progress=document.querySelector(".build-progress");
 progress.innerHTML=`<div class="progress-line"><span id="progressFill" style="width:${buildStep/(steps.length-1)*100}%"></span></div>`+steps.map((step,i)=>`<button data-step="${i}" class="${i===buildStep?"active":i<buildStep?"done":""}"><i>${i+1}</i><span>${escapeHtml(step.title)}</span></button>`).join("");
 document.querySelector("#prevStep").disabled=buildStep===0;
 document.querySelector("#nextStep span").textContent=buildStep===steps.length-1?"Finish":"Next step";
}
function openBuild(){
 document.body.classList.add("build-mode");buildPage.hidden=false;buildTab="overview";buildStep=0;renderBuildProject();window.scrollTo({top:0,behavior:"smooth"});
}
function closeBuild(){document.body.classList.remove("build-mode");buildPage.hidden=true;window.scrollTo({top:0,behavior:"smooth"})}

function openHome(){document.body.classList.remove("profile-mode","build-mode");document.querySelector("#profilePage").hidden=true;buildPage.hidden=true;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page==="home"));window.scrollTo({top:0,behavior:"smooth"})}
function openProfile(){document.body.classList.remove("build-mode");document.body.classList.add("profile-mode");buildPage.hidden=true;document.querySelector("#profilePage").hidden=false;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page==="profile"));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelector(".bottom-nav").addEventListener("click",e=>{
 const b=e.target.closest(".nav-item");if(!b)return;
 if(b.dataset.page==="home"){openHome();return}
 if(b.dataset.page==="profile"){openProfile();return}
 if(b.dataset.page==="build"){openBuild();return}
 toast(b.querySelector("span").textContent+" is coming next.");
});
document.querySelector(".settings-list").addEventListener("click",e=>{const b=e.target.closest("button");if(b)toast(b.querySelector("b").textContent+" settings are coming next.")});
document.querySelector("#editProfile").addEventListener("click",()=>toast("Profile editing is coming next."));
document.querySelector("#seeAll").addEventListener("click",()=>toast("Projects page will be added next."));
document.querySelector(".round-arrow").addEventListener("click",openBuild);
document.querySelector(".build-back").addEventListener("click",closeBuild);
document.querySelector("#prevStep").addEventListener("click",()=>{if(buildStep>0){buildStep--;renderBuildStep()}});
document.querySelector("#nextStep").addEventListener("click",()=>{const n=currentBuildProject()?.build?.steps?.length||0;if(buildStep<n-1){buildStep++;renderBuildStep()}else{toast("Build complete — nice work.")}});
document.querySelector(".build-progress").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(!b)return;buildStep=Number(b.dataset.step);renderBuildStep()});
document.querySelector(".build-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-build-tab]");if(!b)return;buildTab=b.dataset.buildTab;renderBuildTab();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector(".build-side").addEventListener("change",()=>{const boxes=[...document.querySelectorAll(".build-panel input[type=checkbox]")];document.querySelector("#checkCount").textContent=boxes.filter(x=>x.checked).length+"/"+boxes.length});
document.querySelector("#buildSave").addEventListener("click",e=>{e.currentTarget.classList.toggle("saved");e.currentTarget.textContent=e.currentTarget.classList.contains("saved")?"♥":"♡"});

loadProjects();
