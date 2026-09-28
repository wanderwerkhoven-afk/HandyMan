let projects=[];
let active="woodworking";
let query="";
const cards=document.querySelector("#projectCards");
const projectsPage=document.querySelector("#projectsPage");
const projectsGrid=document.querySelector("#projectsGrid");
let projectsFilter="all";
let projectsQuery="";
let selectedProjectId=null;
const SAVED_PROJECTS_KEY="handyman-saved-projects-v1";
function loadBewaardProjects(){try{return new Set(JSON.parse(localStorage.getItem(SAVED_PROJECTS_KEY)||"[]"))}catch{return new Set()}}
let savedProjects=loadBewaardProjects();
function persistBewaardProjects(){try{localStorage.setItem(SAVED_PROJECTS_KEY,JSON.stringify([...savedProjects]))}catch(error){console.warn("Bewaard projects could not be persisted.",error)}}
function isBewaard(id){return savedProjects.has(id)}
function toggleBewaard(id){
 if(isBewaard(id))savedProjects.delete(id);else savedProjects.add(id);
 persistBewaardProjects();render();renderProjectsPage();
}

function projectMatches(p){
  const haystack=[p.id,p.title,p.description,p.difficulty,...p.category].join(" ").toLowerCase();
  return (active==="woodworking"||p.category.includes(active))&&(!query||haystack.includes(query));
}

function render(){
  const filtered=projects.filter(projectMatches);
  cards.innerHTML=filtered.length?filtered.map(p=>`<article class="card" data-project-id="${p.id}"><div class="card-img"><img src="${p.hero.url}" alt="${escapeHtml(p.title)}" loading="lazy"><button class="heart ${isBewaard(p.id)?"saved":""}" aria-label="${isBewaard(p.id)?"Verwijder":"Bewaar"} ${escapeHtml(p.title)}" data-save="${p.id}">${isBewaard(p.id)?"♥":"♡"}</button></div><div class="card-body"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><div class="meta"><span class="level">▥ &nbsp;${escapeHtml(p.difficulty)}</span><span class="project-id">${p.id}</span></div></div></article>`).join(""):`<p style="grid-column:1/-1;color:#756f66">Geen projecten gevonden voor dit filter.</p>`;
}

function projectPageMatches(p){
 const haystack=[p.id,p.title,p.description,p.difficulty,...p.category].join(" ").toLowerCase();
 const categoryMatch=projectsFilter==="all"||projectsFilter==="beginner"?p.difficulty.toLowerCase()==="beginner":p.category.includes(projectsFilter);
 return categoryMatch&&(!projectsQuery||haystack.includes(projectsQuery));
}
function renderProjectsPage(){
 if(!projectsGrid)return;
 const filtered=projects.filter(projectPageMatches);
 const labels={all:"Alle projecten",furniture:"Meubels",decor:"Decoratie",outdoor:"Buiten",beginner:"Beginnerprojecten"};
 document.querySelector("#projectsTotal").textContent=projects.length;
 document.querySelector("#filterCountAll").textContent=projects.length;
 document.querySelector("#filterCountMeubels").textContent=projects.filter(p=>p.category.includes("furniture")).length;
 document.querySelector("#filterCountDecoratie").textContent=projects.filter(p=>p.category.includes("decor")).length;
 document.querySelector("#filterCountBuiten").textContent=projects.filter(p=>p.category.includes("outdoor")).length;
 document.querySelector("#filterCountBeginner").textContent=projects.filter(p=>p.difficulty.toLowerCase()==="beginner").length;
 document.querySelector("#projectsResultTitle").textContent=projectsQuery?"Zoekresultaten":labels[projectsFilter];
 document.querySelector("#projectsResultCount").textContent=`${filtered.length} ${filtered.length===1?"project":"projecten"}`;
 projectsGrid.innerHTML=filtered.length?filtered.map(p=>{
   const ready=!!p.build;
   return `<article class="project-library-card" data-project-id="${p.id}" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.title)}">
     <div class="project-library-image"><img src="${p.hero.url}" alt="${escapeHtml(p.title)}" loading="lazy"><span class="project-number">${p.id}</span><button class="heart ${isBewaard(p.id)?"saved":""}" aria-label="${isBewaard(p.id)?"Verwijder":"Bewaar"} ${escapeHtml(p.title)}" data-save="${p.id}">${isBewaard(p.id)?"♥":"♡"}</button></div>
     <div class="project-library-body"><div class="project-library-tags"><span>${escapeHtml(p.difficulty)}</span><span>${escapeHtml((p.category.find(c=>c!=="woodworking")||"woodworking").replace(/^./,c=>c.toUpperCase()))}</span></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><div class="project-library-footer"><span>${ready?"Plan gereed":"Bron wordt uitgewerkt"}</span><strong>${ready?"Start bouwen":"Bekijk project"} <i>›</i></strong></div></div>
   </article>`;
 }).join(""):`<div class="projects-empty"><span>⌕</span><h3>Geen projecten gevonden</h3><p>Probeer een andere zoekopdracht van reset de filters.</p><button type="button" data-reset-projects>Toon alle projecten</button></div>`;
}

async function loadProjects(){
  try{
    const response=await fetch("data/projects.json");
    if(!response.ok)throw new Error(`Project catalog request failed: ${response.status}`);
    const catalog=await response.json();
    projects=catalog.projects;
    selectedProjectId=projects[0]?.id||null;
    render();
    renderProjectsPage();
  }catch(error){
    console.error(error);
    cards.innerHTML='<p style="grid-column:1/-1;color:#756f66">Projecten konden niet worden geladen. Open HandyMan via een lokale van statische webserver in plaats van het bestand rechtstreeks te openen.</p>';
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
  const save=e.target.closest(".heart");
  if(save){e.stopPropagation();toggleBewaard(save.dataset.save);return}
  const card=e.target.closest("[data-project-id]");
  if(card)openProject(card.dataset.projectId);
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

function currentBuildProject(){return projects.find(p=>p.id===selectedProjectId)||projects[0]||null}
function openProject(id){
 const project=projects.find(p=>p.id===id);if(!project)return;
 if(!project.build){toast(project.id+" is catalogued — build details are still being verified.");return}
 selectedProjectId=id;openBuild();
}
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
 if(buildTab==="overview") host.innerHTML=`<section class="tab-intro overview-intro"><span class="tab-kicker">Projectoverzicht</span><h2>Bouw een moderne wandplank met eenvoudige houtverbindingen</h2><p>Deze compacte wandplank is een toegankelijk beginnersproject. Slechts drie houten delen vormen de hoofdconstructie, terwijl de ingekeepte verbindingen de plank een strakke, ambachtelijke uitstraling geven. Het project is klein genoeg voor een beperkte werkruimte en levert een bruikbaar meubelstuk op voor hal, slaapkamer van woonkamer.</p></section><div class="overview-summary"><article><span>01</span><small>Niveau</small><b>${escapeHtml(p.difficulty)}</b></article><article><span>02</span><small>Budget</small><b>${escapeHtml(p.estimatedCost)}</b></article><article><span>03</span><small>Hoofdonderdelen</small><b>${data.cutList?.reduce((sum,c)=>sum+Number(c.quantity||0),0)||0}</b></article><article><span>04</span><small>Bouwfasen</small><b>${data.steps?.length||0}</b></article></div><div class="overview-content"><article class="build-panel project-story"><span class="panel-eyebrow">Wat je maakt</span><h3>Een kleine wandplank met een slimme constructie</h3><p>Het ontwerp maakt van één plank drie in elkaar grijpende delen. De inkepingen vormen de kenmerkende moderne vorm en twee subtiele metalen hoekbeugels bevestigen de afgewerkte plank aan de wand.</p><p>Door de korte materiaallijst en compacte montage is dit geschikt als eerste houtbewerkingsproject, terwijl je technieken oefent die ook bij grotere meubelprojecten terugkomen.</p></article><article class="build-panel skills-panel"><span class="panel-eyebrow">Technieken die je oefent</span><h3>Technieken die je leert</h3><div class="skill-list"><div><i>01</i><span><b>Nauwkeurig meten & aftekenen</b><small>Teken zaagsneden zorgvuldig af met rolmaat, potlood en winkelhaak.</small></span></div><div><i>02</i><span><b>Ingekeepte houtverbindingen</b><small>Zaag en werk inkepingen bij zodat de onderdelen netjes in elkaar passen.</small></span></div><div><i>03</i><span><b>Droogpassen & haaks stellen</b><small>Test de montage vóór het lijmen en houd de plank goed uitgelijnd.</small></span></div><div><i>04</i><span><b>Schuren & afwerken</b><small>Bereid het hout voor op de gekozen binnenafwerking.</small></span></div><div><i>05</i><span><b>Wandmontage</b><small>Leer de basis van veilige beugelplaatsing en wandverankering.</small></span></div></div></article></div>`;
 if(buildTab==="materials") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Boodschappenlijst</span><h2>Verzamel je materialen</h2><p>Alles wat in van aan de afgewerkte plank wordt gebruikt. Vink onderdelen af tijdens het inkopen van voorbereiden.</p></section><article class="build-panel"><div class="panel-head"><h3>Benodigde materialen</h3><span>${data.materials?.length||0} onderdelen</span></div><div class="prep-list">${(data.materials||[]).map((m,i)=>`<label><input type="checkbox"><span><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.spec)}</small></span><strong>${escapeHtml(m.quantity)}</strong></label>`).join("")}</div></article>`;
 if(buildTab==="tools") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Werkplaats voorbereiden</span><h2>Leg je gereedschap klaar</h2><p>Leg het gereedschap klaar dat je nodig hebt om veilig te meten, zagen, boren en afwerken.</p></section><article class="build-panel"><div class="panel-head"><h3>Gereedschapschecklist</h3><span>${data.tools?.length||0} onderdelen</span></div><div class="tool-checklist">${(data.tools||[]).map(t=>`<label><input type="checkbox"><span>${escapeHtml(t)}</span></label>`).join("")}</div></article>`;
 if(buildTab==="plans") host.innerHTML=`<section class="tab-intro"><span class="tab-kicker">Meten & zagen</span><h2>Bereid de drie plankdelen voor</h2><p>This view owns dimensions and cut preparation. Complete these cuts before moving into the guided Bouwfasen.</p></section><article class="build-panel plan-sheet"><div class="panel-head"><h3>Geverifieerde zaaglijst</h3><span>1×6 materiaal</span></div><div class="cut-table"><div class="cut-row cut-head"><span>Aantal</span><span>Materiaal</span><span>Zaaglengte</span></div>${(data.cutList||[]).map(c=>`<div class="cut-row"><span>${c.quantity}</span><b>${escapeHtml(c.materiaal)}</b><strong>${escapeHtml(c.length)}</strong></div>`).join("")}</div><div class="plan-warning"><b>Indeling inkepingen</b><p>De brontekening bevat de posities van de inkepingen. HandyMan reconstrueert geen maten die niet in geverifieerde brondata staan.</p><a class="source-button" href="${escapeHtml(p.source.url)}" target="_blank" rel="noopener">Open geverifieerde brontekening ↗</a></div></article>`;
}
function renderBuildStep(){
 const p=currentBuildProject();if(!p||!p.build?.steps?.length)return;
 const steps=p.build.steps,s=steps[buildStep];
 document.querySelector("#stepKicker").textContent=`Stap ${buildStep+1} van ${steps.length}`;
 document.querySelector("#stepTitle").textContent=s.title;
 document.querySelector("#stepCopy").textContent=s.summary;
 document.querySelector("#stepSideTitle").textContent=s.title;
 document.querySelector("#stepSideCopy").textContent=buildStep===0?"Focus in deze fase op nauwkeurig aftekenen en zagen van de inkepingen.":buildStep===1?"Focus in deze fase op passing, verlijming en het haaks houden van de constructie.":"Focus in deze fase op veilige wandmontage en passende verankering.";
 const stageDone=document.querySelector("#stageDone");if(stageDone)stageDone.checked=false;
 document.querySelector("#checkCount").textContent="0/1";
 document.querySelector("#progressFill").style.width=(buildStep/(steps.length-1)*100)+"%";
 const progress=document.querySelector(".build-progress");
 progress.innerHTML=`<div class="progress-line"><span id="progressFill" style="width:${buildStep/(steps.length-1)*100}%"></span></div>`+steps.map((step,i)=>`<button data-step="${i}" class="${i===buildStep?"active":i<buildStep?"done":""}"><i>${i+1}</i><span>${escapeHtml(step.title)}</span></button>`).join("");
 document.querySelector("#prevStep").disabled=buildStep===0;
 document.querySelector("#nextStap span").textContent=buildStep===steps.length-1?"Afronden":"Volgende stap";
}
const homePage=document.querySelector("#home");
const profilePage=document.querySelector("#profilePage");
let currentPage="home";
let buildReturnPage="home";

function setActiveNav(page){
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
}
function hideAllPages(){
 homePage.hidden=true;
 projectsPage.hidden=true;
 buildPage.hidden=true;
 profilePage.hidden=true;
 document.body.classList.remove("profile-mode","build-mode","projects-mode");
}
function openBuild(){
 buildReturnPage=currentPage==="projects"?"projects":"home";
 hideAllPages();
 currentPage="build";
 document.body.classList.add("build-mode");
 buildPage.hidden=false;
 buildTab="overview";buildStep=0;renderBuildProject();
 setActiveNav("build");
 window.scrollTo({top:0,behavior:"smooth"});
}
function closeBuild(){
 if(buildReturnPage==="projects")openProjects();else openHome();
}
function openHome(){
 hideAllPages();currentPage="home";homePage.hidden=false;setActiveNav("home");window.scrollTo({top:0,behavior:"smooth"});
}
function openProjects(){
 hideAllPages();currentPage="projects";document.body.classList.add("projects-mode");projectsPage.hidden=false;renderProjectsPage();setActiveNav("projects");window.scrollTo({top:0,behavior:"smooth"});
}
function openProfile(){
 hideAllPages();currentPage="profile";document.body.classList.add("profile-mode");profilePage.hidden=false;setActiveNav("profile");window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelector(".bottom-nav").addEventListener("click",e=>{
 const b=e.target.closest(".nav-item");if(!b)return;
 if(b.dataset.page==="home"){openHome();return}
 if(b.dataset.page==="projects"){openProjects();return}
 if(b.dataset.page==="profile"){openProfile();return}
 if(b.dataset.page==="build"){openBuild();return}
 toast(b.querySelector("span").textContent+" volgt later.");
});
const PROFILE_KEY="handyman-profile-v1";
const defaultProfile={name:"Wander",role:"DIY builder & woodworking enthusiast",bio:"I love building useful things for my home and learning new skills along the way. Always up for the next project.",units:"Imperial (in)",notifications:true,skill:"Intermediate",appearance:"Light",avatar:""};
function loadProfile(){try{return {...defaultProfile,...JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")}}catch(error){console.warn("Invalid saved profile; using defaults.",error);return {...defaultProfile}}}
let profile=loadProfile();
const profileDialog=document.querySelector("#profileDialog"),profileDialogBody=document.querySelector("#profileDialogBody"),profileDialogBewaar=document.querySelector("#profileDialogBewaar");
let profileAction=null;
function persistProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile))}catch(error){console.warn("Profile could not be persisted.",error);toast("Profile saved for this session only")}renderProfile()}
function renderProfile(){
 document.querySelector("#profileName").textContent=profile.name;document.querySelector("#profileRole").textContent=profile.role;document.querySelector("#profileBio").textContent=profile.bio;
 const avatar=document.querySelector("#profileAvatarPreview");avatar.textContent=profile.avatar?"":(profile.name.trim()[0]||"H").toUpperCase();avatar.style.backgroundImage=profile.avatar?'url("'+profile.avatar+'")':"";avatar.classList.toggle("has-image",!!profile.avatar);
 const vals={units:profile.units,notifications:profile.notifications?"On":"Off",skill:profile.skill,appearance:profile.appearance};Object.entries(vals).forEach(([k,v])=>{const el=document.querySelector('[data-setting="'+k+'"] em');if(el)el.textContent=v});
 document.documentElement.dataset.theme=profile.appearance.toLowerCase();
}
function openProfileDialog(type){profileAction=type;const title=document.querySelector("#profileDialogTitle"),kicker=document.querySelector("#profileDialogKicker");kicker.textContent="Profile settings";profileDialogBewaar.hidden=false;
 if(type==="edit"){title.textContent="Edit profile";profileDialogBody.innerHTML='<label>Name<input id="pfName" maxlength="40" value="'+escapeHtml(profile.name)+'"></label><label>Profile line<input id="pfRole" maxlength="70" value="'+escapeHtml(profile.role)+'"></label><label>About you<textarea id="pfBio" maxlength="220" rows="4">'+escapeHtml(profile.bio)+'</textarea></label>'}
 if(type==="units"){title.textContent="Measurement units";profileDialogBody.innerHTML='<div class="choice-grid"><label><input type="radio" name="pfUnits" value="Imperial (in)" '+(profile.units==="Imperial (in)"?"checked":"")+'><span><b>Imperial</b><small>Inches and feet</small></span></label><label><input type="radio" name="pfUnits" value="Metric (mm)" '+(profile.units==="Metric (mm)"?"checked":"")+'><span><b>Metric</b><small>Millimetres and centimetres</small></span></label></div>'}
 if(type==="notifications"){title.textContent="Notifications";profileDialogBody.innerHTML='<label class="toggle-row"><span><b>Project notifications</b><small>Updates, tips and reminders</small></span><input id="pfNotifications" type="checkbox" '+(profile.notifications?"checked":"")+'></label>'}
 if(type==="skill"){title.textContent="Niveau";profileDialogBody.innerHTML='<div class="choice-grid">'+["Beginner","Intermediate","Advanced"].map(v=>'<label><input type="radio" name="pfSkill" value="'+v+'" '+(profile.skill===v?"checked":"")+'><span><b>'+v+'</b><small>'+(v==="Beginner"?"New to woodworking":v==="Intermediate"?"Comfortable with common tools":"Experienced maker")+'</small></span></label>').join("")+'</div>'}
 if(type==="appearance"){title.textContent="Appearance";profileDialogBody.innerHTML='<div class="choice-grid">'+["Light","Dark","System"].map(v=>'<label><input type="radio" name="pfAppearance" value="'+v+'" '+(profile.appearance===v?"checked":"")+'><span><b>'+v+'</b><small>'+(v==="System"?"Follow device preference":v+" HandyMan theme")+'</small></span></label>').join("")+'</div>'}
 if(["downloads","favorites","help"].includes(type)){title.textContent=type==="downloads"?"Downloaded plans":type==="favorites"?"Favorites":"Help & Safety";profileDialogBewaar.hidden=true;profileDialogBody.innerHTML=type==="downloads"?'<div class="empty-panel"><b>Downloaded plans</b><p>Offline project plans will appear here as projects are downloaded.</p></div>':type==="favorites"?'<div class="empty-panel"><b>Your saved collection</b><p>Projects you heart are available from Bewaard. Tool and material favorites will appear here when those catalogs are connected.</p></div>':'<div class="help-list"><article><b>Workshop safety</b><p>Wear appropriate eye and hearing protection and follow manufacturer instructions for every tool.</p></article><article><b>Plan accuracy</b><p>HandyMan keeps unverified measurements explicit rather than inventing dimensions.</p></article></div>'}
 profileDialog.showModal();
}
profileDialogBewaar.addEventListener("click",()=>{if(profileAction==="edit"){profile.name=document.querySelector("#pfName").value.trim()||defaultProfile.name;profile.role=document.querySelector("#pfRole").value.trim();profile.bio=document.querySelector("#pfBio").value.trim()}if(profileAction==="units")profile.units=document.querySelector('input[name="pfUnits"]:checked')?.value||profile.units;if(profileAction==="notifications")profile.notifications=document.querySelector("#pfNotifications").checked;if(profileAction==="skill")profile.skill=document.querySelector('input[name="pfSkill"]:checked')?.value||profile.skill;if(profileAction==="appearance")profile.appearance=document.querySelector('input[name="pfAppearance"]:checked')?.value||profile.appearance;persistProfile();profileDialog.close();toast("Bewaard")});
document.querySelector(".settings-list").addEventListener("click",e=>{const b=e.target.closest("[data-setting]");if(b)openProfileDialog(b.dataset.setting)});
document.querySelector("#editProfile").addEventListener("click",()=>openProfileDialog("edit"));
document.querySelector("#editAvatar").addEventListener("click",()=>document.querySelector("#profileAvatarInput").click());
document.querySelector("#profileAvatarInput").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){toast("Choose an image under 2 MB");return}const reader=new FileReader();reader.onload=()=>{profile.avatar=reader.result;persistProfile();toast("Profile photo updated")};reader.readAsDataURL(file)});
renderProfile();
document.querySelector("#seeAll").addEventListener("click",openProjects);
document.querySelector("#projectFilters").addEventListener("click",e=>{const b=e.target.closest("[data-project-filter]");if(!b)return;projectsFilter=b.dataset.projectFilter;document.querySelectorAll("[data-project-filter]").forEach(x=>x.classList.toggle("active",x===b));renderProjectsPage()});
document.querySelector("#projectsSearchInput").addEventListener("input",e=>{projectsQuery=e.target.value.trim().toLowerCase();document.querySelector("#projectsClearSearch").hidden=!projectsQuery;renderProjectsPage()});
document.querySelector("#projectsSearchForm").addEventListener("submit",e=>e.preventDefault());
document.querySelector("#projectsClearSearch").addEventListener("click",()=>{document.querySelector("#projectsSearchInput").value="";projectsQuery="";document.querySelector("#projectsClearSearch").hidden=true;renderProjectsPage()});
function resetProjects(){projectsFilter="all";projectsQuery="";document.querySelector("#projectsSearchInput").value="";document.querySelector("#projectsClearSearch").hidden=true;document.querySelectorAll("[data-project-filter]").forEach(x=>x.classList.toggle("active",x.dataset.projectFilter==="all"));renderProjectsPage()}
document.querySelector("#projectsReset").addEventListener("click",resetProjects);
projectsGrid.addEventListener("click",e=>{const save=e.target.closest(".heart");if(save){e.stopPropagation();toggleBewaard(save.dataset.save);return}if(e.target.closest("[data-reset-projects]")){resetProjects();return}const card=e.target.closest("[data-project-id]");if(card)openProject(card.dataset.projectId)});
projectsGrid.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".project-library-card")){e.preventDefault();openProject(e.target.dataset.projectId)}});
document.querySelector(".round-arrow").addEventListener("click",openBuild);
document.querySelector(".build-back").addEventListener("click",closeBuild);
document.querySelector("#prevStep").addEventListener("click",()=>{if(buildStep>0){buildStep--;renderBuildStep()}});
document.querySelector("#nextStep").addEventListener("click",()=>{const n=currentBuildProject()?.build?.steps?.length||0;if(buildStep<n-1){buildStep++;renderBuildStep()}else{toast("Project afgerond — mooi werk.")}});
document.querySelector(".build-progress").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(!b)return;buildStep=Number(b.dataset.step);renderBuildStep()});
document.querySelector(".build-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-build-tab]");if(!b)return;buildTab=b.dataset.buildTab;renderBuildTab();if(buildTab==="steps")renderBuildStep();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector("#buildTabContent").addEventListener("click",e=>{const b=e.target.closest("[data-jump-tab]");if(!b)return;buildTab=b.dataset.jumpTab;renderBuildTab();if(buildTab==="steps")renderBuildStep();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector(".build-side").addEventListener("change",()=>{const boxes=[...document.querySelectorAll(".build-panel input[type=checkbox]")];document.querySelector("#checkCount").textContent=boxes.filter(x=>x.checked).length+"/"+boxes.length});
document.querySelector("#buildBewaar").addEventListener("click",e=>{e.currentTarget.classList.toggle("saved");e.currentTarget.textContent=e.currentTarget.classList.contains("saved")?"♥":"♡"});
const imageSpotlight=document.querySelector("#imageSpotlight");
document.querySelector("#buildHero").addEventListener("click",()=>imageSpotlight.showModal());
document.querySelector(".spotlight-close").addEventListener("click",()=>imageSpotlight.close());
imageSpotlight.addEventListener("click",e=>{if(e.target===imageSpotlight)imageSpotlight.close()});


loadProjects();
