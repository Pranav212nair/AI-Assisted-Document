// saved.js - display demo projects stored in localStorage
document.addEventListener('DOMContentLoaded', function () {
  const listEl = document.getElementById('projectsList');
  if (!listEl) return;

  // Demo: projects are stored under 'projects' key as an array
  let projects = JSON.parse(localStorage.getItem('projects') || 'null');
  const token = localStorage.getItem('token') || null;
  const authHeader = token ? { 'Authorization': 'Bearer ' + token } : null;
  // If token exists try loading projects from backend
  if (token){
    fetch('/projects', { headers: authHeader })
      .then(r=>{ if (!r.ok) throw new Error('unauth'); return r.json(); })
      .then(data=>{ projects = data; render(); })
      .catch(e=>{ console.warn('Backend projects fetch failed, falling back to local demo', e); if (!projects){ projects = []; localStorage.setItem('projects', JSON.stringify(projects)); render(); } });
  }
  if (!projects) {
    // create a small sample if none exist to help demo the UI
    projects = [
      { id: 1, title: 'Market Analysis - EV 2025', doc_type: 'docx', created_at: new Date().toISOString() },
      { id: 2, title: 'Q4 Investor Deck', doc_type: 'pptx', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('projects', JSON.stringify(projects));
  }

  function render() {
    listEl.innerHTML = '';
    if (!projects.length) {
      listEl.innerHTML = '<p>No projects yet. Create one from the dashboard.</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(260px, 1fr))';
    grid.style.gap = '16px';

    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3'); title.innerText = p.title;
      const meta = document.createElement('p'); meta.className = 'small'; meta.innerText = `${p.doc_type.toUpperCase()} • ${new Date(p.created_at).toLocaleString()}`;
      const btnOpen = document.createElement('button'); btnOpen.className = 'btn'; btnOpen.style.marginTop='10px'; btnOpen.innerText = 'Open';
      // Open: navigate to the appropriate editor and pass the project id in the query string
      btnOpen.addEventListener('click', ()=>{
        const page = p.doc_type && p.doc_type.toLowerCase().startsWith('ppt') ? 'create-ppt.html' : 'create-doc.html';
        window.location.href = `${page}?projectId=${encodeURIComponent(p.id)}`;
      });
      const btnDelete = document.createElement('button'); btnDelete.className='btn'; btnDelete.style.marginLeft='8px'; btnDelete.style.background='#ff4d4f'; btnDelete.style.color='#fff'; btnDelete.innerText='Delete';
      btnDelete.addEventListener('click', ()=>{ if(confirm('Delete '+p.title+'?')){ projects = projects.filter(x=>x.id!==p.id); localStorage.setItem('projects', JSON.stringify(projects)); render(); } });

      card.appendChild(title); card.appendChild(meta);
      const controls = document.createElement('div'); controls.style.marginTop='12px'; controls.appendChild(btnOpen); controls.appendChild(btnDelete);
      card.appendChild(controls);
      grid.appendChild(card);
    });

    listEl.appendChild(grid);
  }

  render();
});
