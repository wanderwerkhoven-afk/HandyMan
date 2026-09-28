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
 document.querySelector("#spotlightImage").src=p.hero.url;
 document.querySelector("#spotlightImage").alt=p.title;
 document.querySelector("#spotlightCaption").textContent=p.title;
 document.querySelector("#buildId").textContent=p.id;
 document.querySelector("#buildTitle").textContent=p.title;
 document.querySelector("#buildDescription").textContent=p.description;
 document.querySelector("#buildDifficulty").textContent=p.difficulty;
 renderBuildTab();
 renderBuildStep();
}
function renderBuildTab(){
 const p=currentBuildProject();if(!p)return;
 const data=p.build||{};
 const host=document.querySelector("#buildTabContent");
 document.querySelectorAll("[data-build-tab]").forEach(x=>x.classList.toggle("active",x.dataset.buildTab===buildTab));
 document.querySelector("#buildExecution").hidden=buildTab!=="steps";
 if(buildTab==="steps"){host.innerHTML="";return}
 if(buildTab==="overview") host.innerHTML=`<section class="tab-intro overview-intro"><span class="tab-kicker">Project overview</span><h2>Build a modern shelf with simple joinery</h2><p>This compact wall shelf is a satisfying beginner project: only three wooden pieces form the main structure, while the notched joints give the finished shelf a clean, crafted look. It is small enough to tackle without a large workshop and gives you a useful piece for an entryway, bedroom or living space.</p></section><div class="overview-summary"><article><span>01</span><small>Skill level</small><b>${escapeHtml(p.difficulty)}</b></article><article><span>02</span><small>Budget</small><b>${escapeHtml(p.estimatedCost)}</b></article><article><span>03</span><small>Main pieces</small><b>${data.cutList?.reduce((sum,c)=>sum+Number(c.quantity||0),0)||0}</b></article><article><span>04</span><small>Build stages</small><b>${data.steps?.length||0}</b></article></div><div class="overview-content"><article class="build-panel project-story"><span class="panel-eyebrow">What you’re making</span><h3>A small shelf with a clever construction</h3><p>The design turns a single 1×6 board into three interlocking shelf pieces. The notches create the characteristic modern shape, and two discreet metal angle brackets secure the finished shelf to the wall.</p><p>Because the project uses a short material list and a compact assembly, it is approachable for a first woodworking build while still introducing techniques that carry over to larger furniture projects.</p></article><article class="build-panel skills-panel"><span class="panel-eyebrow">Skills you’ll practice</span><h3>Techniques you’ll learn</h3><div class="skill-list"><div><i>01</i><span><b>Accurate measuring & marking</b><small>Lay out cuts carefully with a tape, pencil and square.</small></span></div><div><i>02</i><span><b>Notched joinery</b><small>Cut and refine notches so separate pieces fit together cleanly.</small></span></div><div><i>03</i><span><b>Dry fitting & squaring</b><small>Test the assembly before glue-up and keep the shelf aligned.</small></span></div><div><i>04</i><span><b>Sanding & finishing</b><small>Prepare the wood surface for your chosen interior finish.</small></span></div><div><i>05</i><span><b>Wall mounting</b><small>Learn the basics of secure bracket placement and anchoring.</small></span></div></div></article></div>`;
 if(buildTab==="materials") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Shopping list</span><h2>Gather your materials</h2><p>Everything consumed or installed in the finished shelf. Check items off while shopping or preparing your workshop.</p></section><article class="build-panel"><div class="panel-head"><h3>Required materials</h3><span>${data.materials?.length||0} items</span></div><div class="prep-list">${(data.materials||[]).map((m,i)=>`<label><input type="checkbox"><span><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.spec)}</small></span><strong>${escapeHtml(m.quantity)}</strong></label>`).join("")}</div></article>`;
 if(buildTab==="tools") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Workshop setup</span><h2>Prepare your tools</h2><p>Set up the equipment needed to measure, cut, drill and finish safely. Materials are intentionally kept out of this view.</p></section><article class="build-panel"><div class="panel-head"><h3>Tool checklist</h3><span>${data.tools?.length||0} items</span></div><div class="tool-checklist">${(data.tools||[]).map(t=>`<label><input type="checkbox"><span>${escapeHtml(t)}</span></label>`).join("")}</div></article>`;
 if(buildTab==="plans") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Measure & cut</span><h2>Prepare the three shelf pieces</h2><p>This view owns dimensions and cut preparation. Complete these cuts before moving into the guided Build stages.</p></section><article class="build-panel plan-sheet"><div class="panel-head"><h3>Verified cut list</h3><span>1×6 stock</span></div><div class="cut-table"><div class="cut-row cut-head"><span>Qty</span><span>Stock</span><span>Cut length</span></div>${(data.cutList||[]).map(c=>`<div class="cut-row"><span>${c.quantity}</span><b>${escapeHtml(c.stock)}</b><strong>${escapeHtml(c.length)}</strong></div>`).join("")}</div><div class="plan-warning"><b>Notch layout</b><p>The source drawing contains the notch positions. HandyMan does not reconstruct dimensions that are not verified in structured source data.</p><a class="source-button" href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener">Open verified source drawing ↗</a></div></article>`;
}
function renderBuildStep(){
 const p=currentBuildProject();if(!p||!p.build?.steps?.length)return;
 const steps=p.build.steps,s=steps[buildStep];
 document.querySelector("#stepKicker").textContent=`Step ${buildStep+1} of ${steps.length}`;
 document.querySelector("#stepTitle").textContent=s.title;
 document.querySelector("#stepCopy").textContent=s.summary;
 document.querySelector("#stepSideTitle").textContent=s.title;
 document.querySelector("#stepSideCopy").textContent=buildStep===0?"Focus only on accurate marking and notch cuts during this stage.":buildStep===1?"Focus on fit, glue-up and keeping the assembly square during this stage.":"Focus on secure wall mounting and appropriate anchoring during this stage.";
 const stageDone=document.querySelector("#stageDone");if(stageDone)stageDone.checked=false;
 document.querySelector("#checkCount").textContent="0/1";
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
const PROFILE_KEY="handyman-profile-v1";
const defaultProfile={name:"Wander",role:"DIY builder & woodworking enthusiast",bio:"I love building useful things for my home and learning new skills along the way. Always up for the next project.",units:"Imperial (in)",notifications:true,skill:"Intermediate",appearance:"Light",avatar:""};
let profile={...defaultProfile,...JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")};
const profileDialog=document.querySelector("#profileDialog"),profileDialogBody=document.querySelector("#profileDialogBody"),profileDialogSave=document.querySelector("#profileDialogSave");
let profileAction=null;
function persistProfile(){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));renderProfile()}
function renderProfile(){
 document.querySelector("#profileName").textContent=profile.name;document.querySelector("#profileRole").textContent=profile.role;document.querySelector("#profileBio").textContent=profile.bio;
 const avatar=document.querySelector("#profileAvatarPreview");avatar.textContent=profile.avatar?"":(profile.name.trim()[0]||"H").toUpperCase();avatar.style.backgroundImage=profile.avatar?'url("'+profile.avatar+'")':"";avatar.classList.toggle("has-image",!!profile.avatar);
 const vals={units:profile.units,notifications:profile.notifications?"On":"Off",skill:profile.skill,appearance:profile.appearance};Object.entries(vals).forEach(([k,v])=>{const el=document.querySelector('[data-setting="'+k+'"] em');if(el)el.textContent=v});
 document.documentElement.dataset.theme=profile.appearance.toLowerCase();
}
function openProfileDialog(type){profileAction=type;const title=document.querySelector("#profileDialogTitle"),kicker=document.querySelector("#profileDialogKicker");kicker.textContent="Profile settings";profileDialogSave.hidden=false;
 if(type==="edit"){title.textContent="Edit profile";profileDialogBody.innerHTML='<label>Name<input id="pfName" maxlength="40" value="'+escapeHtml(profile.name)+'"></label><label>Profile line<input id="pfRole" maxlength="70" value="'+escapeHtml(profile.role)+'"></label><label>About you<textarea id="pfBio" maxlength="220" rows="4">'+escapeHtml(profile.bio)+'</textarea></label>'}
 if(type==="units"){title.textContent="Measurement units";profileDialogBody.innerHTML='<div class="choice-grid"><label><input type="radio" name="pfUnits" value="Imperial (in)" '+(profile.units==="Imperial (in)"?"checked":"")+'><span><b>Imperial</b><small>Inches and feet</small></span></label><label><input type="radio" name="pfUnits" value="Metric (mm)" '+(profile.units==="Metric (mm)"?"checked":"")+'><span><b>Metric</b><small>Millimetres and centimetres</small></span></label></div>'}
 if(type==="notifications"){title.textContent="Notifications";profileDialogBody.innerHTML='<label class="toggle-row"><span><b>Project notifications</b><small>Updates, tips and reminders</small></span><input id="pfNotifications" type="checkbox" '+(profile.notifications?"checked":"")+'></label>'}
 if(type==="skill"){title.textContent="Skill level";profileDialogBody.innerHTML='<div class="choice-grid">'+["Beginner","Intermediate","Advanced"].map(v=>'<label><input type="radio" name="pfSkill" value="'+v+'" '+(profile.skill===v?"checked":"")+'><span><b>'+v+'</b><small>'+(v==="Beginner"?"New to woodworking":v==="Intermediate"?"Comfortable with common tools":"Experienced maker")+'</small></span></label>').join("")+'</div>'}
 if(type==="appearance"){title.textContent="Appearance";profileDialogBody.innerHTML='<div class="choice-grid">'+["Light","Dark","System"].map(v=>'<label><input type="radio" name="pfAppearance" value="'+v+'" '+(profile.appearance===v?"checked":"")+'><span><b>'+v+'</b><small>'+(v==="System"?"Follow device preference":v+" HandyMan theme")+'</small></span></label>').join("")+'</div>'}
 if(["downloads","favorites","help"].includes(type)){title.textContent=type==="downloads"?"Downloaded plans":type==="favorites"?"Favorites":"Help & Safety";profileDialogSave.hidden=true;profileDialogBody.innerHTML=type==="downloads"?'<div class="empty-panel"><b>Downloaded plans</b><p>Offline project plans will appear here as projects are downloaded.</p></div>':type==="favorites"?'<div class="empty-panel"><b>Your saved collection</b><p>Projects you heart are available from Saved. Tool and material favorites will appear here when those catalogs are connected.</p></div>':'<div class="help-list"><article><b>Workshop safety</b><p>Wear appropriate eye and hearing protection and follow manufacturer instructions for every tool.</p></article><article><b>Plan accuracy</b><p>HandyMan keeps unverified measurements explicit rather than inventing dimensions.</p></article></div>'}
 profileDialog.showModal();
}
profileDialogSave.addEventListener("click",()=>{if(profileAction==="edit"){profile.name=document.querySelector("#pfName").value.trim()||defaultProfile.name;profile.role=document.querySelector("#pfRole").value.trim();profile.bio=document.querySelector("#pfBio").value.trim()}if(profileAction==="units")profile.units=document.querySelector('input[name="pfUnits"]:checked')?.value||profile.units;if(profileAction==="notifications")profile.notifications=document.querySelector("#pfNotifications").checked;if(profileAction==="skill")profile.skill=document.querySelector('input[name="pfSkill"]:checked')?.value||profile.skill;if(profileAction==="appearance")profile.appearance=document.querySelector('input[name="pfAppearance"]:checked')?.value||profile.appearance;persistProfile();profileDialog.close();toast("Saved")});
document.querySelector(".settings-list").addEventListener("click",e=>{const b=e.target.closest("[data-setting]");if(b)openProfileDialog(b.dataset.setting)});
document.querySelector("#editProfile").addEventListener("click",()=>openProfileDialog("edit"));
document.querySelector("#editAvatar").addEventListener("click",()=>document.querySelector("#profileAvatarInput").click());
document.querySelector("#profileAvatarInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){toast("Choose an image under 2 MB");return}const reader=new FileReader();reader.onload=()=>{profile.avatar=reader.result;persistProfile();toast("Profile photo updated")};reader.readAsDataURL(file)});
renderProfile();
document.querySelector("#seeAll").addEventListener("click",()=>toast("Projects page will be added next."));
document.querySelector(".round-arrow").addEventListener("click",openBuild);
document.querySelector(".build-back").addEventListener("click",closeBuild);
document.querySelector("#prevStep").addEventListener("click",()=>{if(buildStep>0){buildStep--;renderBuildStep()}});
document.querySelector("#nextStep").addEventListener("click",()=>{const n=currentBuildProject()?.build?.steps?.length||0;if(buildStep<n-1){buildStep++;renderBuildStep()}else{toast("Build complete — nice work.")}});
document.querySelector(".build-progress").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(!b)return;buildStep=Number(b.dataset.step);renderBuildStep()});
document.querySelector(".build-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-build-tab]");if(!b)return;buildTab=b.dataset.buildTab;renderBuildTab();if(buildTab==="steps")renderBuildStep();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector("#buildTabContent").addEventListener("click",e=>{const b=e.target.closest("[data-jump-tab]");if(!b)return;buildTab=b.dataset.jumpTab;renderBuildTab();if(buildTab==="steps")renderBuildStep();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector(".build-side").addEventListener("change",()=>{const boxes=[...document.querySelectorAll(".build-panel input[type=checkbox]")];document.querySelector("#checkCount").textContent=boxes.filter(x=>x.checked).length+"/"+boxes.length});
document.querySelector("#buildSave").addEventListener("click",e=>{e.currentTarget.classList.toggle("saved");e.currentTarget.textContent=e.currentTarget.classList.contains("saved")?"♥":"♡"});
const imageSpotlight=document.querySelector("#imageSpotlight");
document.querySelector("#buildHero").addEventListener("click",()=>imageSpotlight.showModal());
document.querySelector(".spotlight-close").addEventListener("click",()=>imageSpotlight.close());
imageSpotlight.addEventListener("click",e=>{if(e.target===imageSpotlight)imageSpotlight.close()});


loadProjects();
