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

document.querySelector(".bottom-nav").addEventListener("click",e=>{
  const b=e.target.closest(".nav-item");
  if(!b||b.dataset.page==="home")return;
  toast(b.querySelector("span").textContent+" is coming next — Home is the active prototype.");
});
document.querySelector("#seeAll").addEventListener("click",()=>toast("Projects page will be added next."));
document.querySelector(".round-arrow").addEventListener("click",()=>toast("Project detail will be connected in the next build."));

loadProjects();
