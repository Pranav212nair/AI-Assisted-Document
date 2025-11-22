const API = "http://localhost:8000"
let token = null
let currentProject = null

document.getElementById('btnRegister').onclick = async ()=>{
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const res = await fetch(API+"/register?email="+encodeURIComponent(email)+"&password="+encodeURIComponent(password), {method:'POST'})
  alert((await res.json()).email || 'registered')
}

document.getElementById('btnLogin').onclick = async ()=>{
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const body = new URLSearchParams(); body.append('username', email); body.append('password', password)
  const res = await fetch(API+"/token", {method:'POST', body})
  const j = await res.json()
  if(j.access_token){ token = j.access_token; showDashboard(); } else { alert('login failed') }
}

async function showDashboard(){
  document.getElementById('auth').style.display='none'
  document.getElementById('dashboard').style.display='block'
  await loadProjects()
}

async function loadProjects(){
  const res = await fetch(API+"/projects", {headers:{'Authorization':'Bearer '+token}})
  const projects = await res.json()
  const container = document.getElementById('projects'); container.innerHTML=''
  projects.forEach(p=>{
    const el = document.createElement('div'); el.className='section'
    el.innerHTML = `<strong>${p.title}</strong> <span class='small'>[${p.doc_type}]</span> <button data-id='${p.id}'>Open</button>`
    el.querySelector('button').onclick = ()=>openProject(p)
    container.appendChild(el)
  })
}

document.getElementById('btnCreate').onclick = async ()=>{
  const title = document.getElementById('title').value || 'Untitled'
  const doc_type = document.getElementById('doctype').value
  const prompt = document.getElementById('prompt').value
  const res = await fetch(API+`/projects?title=${encodeURIComponent(title)}&doc_type=${encodeURIComponent(doc_type)}&prompt=${encodeURIComponent(prompt)}`, {method:'POST', headers:{'Authorization':'Bearer '+token}})
  const j = await res.json()
  await loadProjects()
}

function openProject(p){
  currentProject = p
  document.getElementById('dashboard').style.display='none'
  document.getElementById('editor').style.display='block'
  document.getElementById('projTitle').innerText = p.title
  loadSections(p.id)
}

document.getElementById('btnBack').onclick = ()=>{
  document.getElementById('editor').style.display='none'
  document.getElementById('dashboard').style.display='block'
}

async function loadSections(projectId){
  // re-fetch projects list to get updated sections
  const res = await fetch(API+"/projects", {headers:{'Authorization':'Bearer '+token}})
  const projects = await res.json()
  const p = projects.find(x=>x.id===projectId)
  const container = document.getElementById('sections'); container.innerHTML=''
  if(!p) return
  for(let s of p.sections){
    const el = document.createElement('div'); el.className='section'
    el.innerHTML = `<h4>${s.title}</h4><textarea data-id='${s.id}'>${s.content||''}</textarea><div><input placeholder='refinement prompt' class='rprompt' /> <button class='rbtn'>Refine</button> <button class='fb-like'>Like</button><button class='fb-dislike'>Dislike</button></div>`
    el.querySelector('.rbtn').onclick = async ()=>{
      const prompt = el.querySelector('.rprompt').value
      const res = await fetch(API+`/projects/${p.id}/sections/${s.id}/refine?prompt=${encodeURIComponent(prompt)}`, {method:'POST', headers:{'Authorization':'Bearer '+token}})
      const j = await res.json(); el.querySelector('textarea').value = j.new_content
    }
    el.querySelector('.fb-like').onclick = async ()=>{ await fetch(API+`/projects/${p.id}/sections/${s.id}/feedback?liked=true`, {method:'POST', headers:{'Authorization':'Bearer '+token}}); alert('liked') }
    el.querySelector('.fb-dislike').onclick = async ()=>{ await fetch(API+`/projects/${p.id}/sections/${s.id}/feedback?liked=false`, {method:'POST', headers:{'Authorization':'Bearer '+token}}); alert('disliked') }
    container.appendChild(el)
  }
}

document.getElementById('btnGenerate').onclick = async ()=>{
  if(!currentProject) return
  const res = await fetch(API+`/projects/${currentProject.id}/generate`, {method:'POST', headers:{'Authorization':'Bearer '+token}})
  const j = await res.json()
  // simple reload
  await loadSections(currentProject.id)
}

document.getElementById('btnExport').onclick = async ()=>{
  if(!currentProject) return
  const res = await fetch(API+`/projects/${currentProject.id}/export`, {headers:{'Authorization':'Bearer '+token}})
  if(!res.ok){ alert('export failed') ; return }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const ext = currentProject.doc_type === 'docx' ? 'docx' : 'pptx'
  a.download = `${currentProject.title || 'project'}.${ext}`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
