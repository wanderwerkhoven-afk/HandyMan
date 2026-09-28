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
let buildStep=1;
const buildSteps=[
 {title:"Prepare the parts",copy:"Review the verified source plan, gather the required materials and tools, then mark every cut before starting."},
 {title:"Build the main assembly",copy:"Follow the verified source plan for this stage. Measure carefully, dry-fit parts before fastening, and keep the assembly square."},
 {title:"Fit and check",copy:"Test the fit of the assembled parts and correct alignment before moving on to the finishing stage."},
 {title:"Sand and finish",copy:"Prepare the surfaces and apply the finish specified by the source plan or a finish appropriate for the material and intended use."},
 {title:"Final check",copy:"Inspect the completed project, confirm all fasteners and joints are secure, and compare the result with the source plan."}
];

function currentBuildProject(){return projects[0]||null}
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
 renderBuildStep();
}
function renderBuildStep(){
 const s=buildSteps[buildStep];
 document.querySelector("#stepKicker").textContent=`Step ${buildStep+1} of ${buildSteps.length}`;
 document.querySelector("#stepTitle").textContent=s.title;
 document.querySelector("#stepCopy").textContent=s.copy;
 document.querySelector("#progressFill").style.width=(buildStep/(buildSteps.length-1)*100)+"%";
 document.querySelectorAll("[data-step]").forEach((b,i)=>{b.classList.toggle("active",i===buildStep);b.classList.toggle("done",i<buildStep)});
 document.querySelector("#prevStep").disabled=buildStep===0;
 document.querySelector("#nextStep span").textContent=buildStep===buildSteps.length-1?"Finish":"Next step";
}
function openBuild(){
 document.body.classList.add("build-mode");buildPage.hidden=false;renderBuildProject();window.scrollTo({top:0,behavior:"smooth"});
}
function closeBuild(){document.body.classList.remove("build-mode");buildPage.hidden=true;window.scrollTo({top:0,behavior:"smooth"})}

document.querySelector(".bottom-nav").addEventListener("click",e=>{
 const b=e.target.closest(".nav-item");if(!b)return;
 if(b.dataset.page==="home")return;
 if(b.dataset.page==="build"){openBuild();return}
 toast(b.querySelector("span").textContent+" is coming next — Home is the active prototype.");
});
document.querySelector("#seeAll").addEventListener("click",()=>toast("Projects page will be added next."));
document.querySelector(".round-arrow").addEventListener("click",openBuild);
document.querySelector(".build-back").addEventListener("click",closeBuild);
document.querySelector("#prevStep").addEventListener("click",()=>{if(buildStep>0){buildStep--;renderBuildStep()}});
document.querySelector("#nextStep").addEventListener("click",()=>{if(buildStep<buildSteps.length-1){buildStep++;renderBuildStep()}else{toast("Build complete — nice work.")}});
document.querySelector(".build-progress").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(!b)return;buildStep=Number(b.dataset.step);renderBuildStep()});
document.querySelector(".build-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-build-tab]");if(!b)return;document.querySelectorAll("[data-build-tab]").forEach(x=>x.classList.toggle("active",x===b));if(b.dataset.buildTab!=="steps")toast(b.textContent+" content will be connected to verified project data next.")});
document.querySelector(".build-side").addEventListener("change",()=>{const boxes=[...document.querySelectorAll(".build-panel input[type=checkbox]")];document.querySelector("#checkCount").textContent=boxes.filter(x=>x.checked).length+"/"+boxes.length});
document.querySelector("#buildSave").addEventListener("click",e=>{e.currentTarget.classList.toggle("saved");e.currentTarget.textContent=e.currentTarget.classList.contains("saved")?"♥":"♡"});


loadProjects();
