// create-doc.js - client-side demo logic for creating Word docs
document.addEventListener('DOMContentLoaded', function () {
  const promptInput = document.getElementById('mainPrompt');
  const outlineEl = document.getElementById('outline');
  const btnSuggest = document.getElementById('btnSuggest');
  const btnCreate = document.getElementById('btnCreate');
  const btnSave = document.getElementById('btnSave');
  const btnExport = document.getElementById('btnExport');
  let editingProjectId = null;

// --- BEGIN: Async AI-powered outline generator ---
async function mockSuggestOutline(prompt) {
    // Determine document type based on keywords
    const lower = prompt.toLowerCase();
    let sections = [];
    if (lower.includes('market') || lower.includes('analysis')) {
      sections = ['Executive Summary', 'Market Overview', 'Key Drivers', 'Competitive Landscape', 'Opportunities & Risks', 'Recommendations', 'Appendix'];
    } else if (lower.includes('plan') || lower.includes('strategy')) {
      sections = ['Objective', 'Current State', 'Strategic Priorities', 'Initiatives', 'Timeline', 'Metrics', 'Conclusion'];
    } else {
      sections = ['Introduction', 'Main Findings', 'Supporting Evidence', 'Recommendations', 'Conclusion'];
    }
    const result = [];
    for (const section of sections) {
      const content = await generateSectionContent(prompt, section);
      result.push({ title: section, content });
    }
    return result;
}

async function generateSectionContent(topic, sectionTitle) {
    const token = localStorage.getItem('token');
    // Try to use backend API if token is available
    if (token) {
      try {
        const promptText = `Generate content for a document section about "${topic}" for the "${sectionTitle}" section. Format the response as 3 bullet points, each with a title and 2-3 lines of explanation. Use this exact format:\n• [Bullet Title 1]\n[2-3 lines of explanation about this point]\n\n• [Bullet Title 2]\n[2-3 lines of explanation about this point]\n\n• [Bullet Title 3]\n[2-3 lines of explanation about this point]`;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [
              { role: 'user', content: promptText }
            ],
          })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.content.map(item => item.type === 'text' ? item.text : '').join('\n');
          if (text.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        console.warn('AI generation failed, using fallback:', error);
      }
    }
    // Fallback: use local generation
    return await generateSectionContentLocal(topic, sectionTitle);
}

async function generateSectionContentLocal(topic, sectionTitle) {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    // Simple fallback: 3 bullets with generic content
    return `• ${sectionTitle} Overview\nThis section introduces the main ideas about ${topic} in the context of ${sectionTitle}.\n\n• Key Considerations\nImportant factors and challenges related to ${topic} for this section.\n\n• Next Steps\nSuggestions or actions to take regarding ${topic} in this area.`;
}
// --- END: Async AI-powered outline generator ---
  function createSectionCard(title, idx, content, sectionId) {
    const wrapper = document.createElement('div');
    if (sectionId) wrapper.setAttribute('data-section-id', sectionId);
    wrapper.className = 'section';
    wrapper.style.padding = '12px';
    wrapper.style.marginBottom = '10px';
    wrapper.innerHTML = `
      <h3>${idx+1}. <input class="sec-title" value="${escapeHtml(title)}" style="font-weight:700;border:none;background:transparent;width:80%"/></h3>
      <textarea class="sec-content">${escapeHtml(content||'')}</textarea>
      <div style="margin-top:8px">
        <select class="quick-action"><option value="">Quick action</option><option value="formal">Make more formal</option><option value="shorten">Shorten</option><option value="examples">Add examples</option></select>
        <button class="do-action" style="margin-left:8px">Apply</button>
        <button class="ai-enhance" style="margin-left:8px;background:#2b6cb0;color:#fff">AI-Enhance</button>
        <button class="remove" style="margin-left:8px;background:#ff4d4f;color:#fff">Remove</button>
      </div>
    `;

    // wire actions
    wrapper.querySelector('.do-action').onclick = ()=>{
      const sel = wrapper.querySelector('.quick-action').value;
      const ta = wrapper.querySelector('.sec-content');
      ta.value = refineMock(ta.value, sel);
    };
    wrapper.querySelector('.ai-enhance').onclick = async ()=>{
      const ta = wrapper.querySelector('.sec-content');
      const original = ta.value || '';
      const token = localStorage.getItem('token');
      const secId = wrapper.getAttribute('data-section-id') || null;
      if (token && editingProjectId && secId){
        try{
          const prompt = encodeURIComponent('Enhance and refine this section for clarity and professional tone');
          const res = await fetch(`/projects/${editingProjectId}/sections/${secId}/refine?prompt=${prompt}`, { method: 'POST', headers: { 'Authorization': 'Bearer '+token } });
          if (res.ok){
            const body = await res.json();
            ta.value = body.new_content || original;
            return;
          }
        }catch(e){ console.warn('Remote refine failed, falling back to local enhance', e); }
      }
      // local fallback
      ta.value = await enhanceMock(original);
    };
    wrapper.querySelector('.remove').onclick = ()=>{ wrapper.remove(); updateIndices(); };
    return wrapper;
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function refineMock(text, action){
    if (!action) return text;
    const t = (text||'').trim();
    // split into paragraphs (preserve paragraph breaks)
    const paragraphs = t ? t.split(/\r?\n\s*\r?\n/) : [];
    // helper: split paragraph into sentences
    function sentencesFrom(p){
      if (!p) return [];
      // match sequences ending with punctuation or end-of-string
      const matches = p.match(/[^.!?]+[.!?]*/g) || [];
      return matches.map(s=>s.trim()).filter(Boolean);
    }

    if (action === 'formal'){
      if (!t) return 'This section has been revised to a more formal tone.';
      const outParas = paragraphs.map(p=>{
        const sents = sentencesFrom(p);
        const processed = sents.map(s=>{
          // ensure capitalization and terminal punctuation
          let s2 = s.replace(/\s+/g,' ').trim();
          s2 = s2.replace(/[.?!]+$/,'');
          s2 = s2.charAt(0).toUpperCase() + s2.slice(1);
          return s2 + '.';
        });
        return processed.join(' ');
      });
      return outParas.join('\n\n');
    }
    if (action === 'shorten'){
      if (!t) return 'Short summary.';
      // Keep first 40 words across the text, preserve whole-sentence endings when possible
      const words = t.split(/\s+/).filter(Boolean);
      const limit = 40;
      if (words.length <= limit) return t;
      return words.slice(0,limit).join(' ') + '...';
    }
    if (action === 'examples'){
      // Append example block in a clear bullet-like structure
      const base = t || 'Add details here.';
      const ex = "\n\nExample 1: A practical scenario that illustrates the point in a real-world context.\nExample 2: A short, concrete use case showing how the recommendation is applied.";
      // avoid duplicate appended examples
      if (base.includes('Example 1:') || base.includes('Example:')) return base;
      return base + ex;
    }
    return text;
  }

  // Simple client-side AI-enhance mock — improves clarity and tone
  async function enhanceMock(text){
    if (!text || !text.trim()) return 'AI-enhanced: Add details here.';
    // small simulated async delay
    await new Promise(r=>setTimeout(r, 350));
    // naive enhancement: expand slightly, improve punctuation and clarity
    let out = text.trim();
    // ensure sentences end with periods
    out = out.split(/\n+/).map(p=>p.trim()).filter(Boolean).map(p=>{
      let s = p.replace(/\s+/g,' ');
      if (!/[.?!]$/.test(s)) s = s + '.';
      // capitalize first letter
      s = s.charAt(0).toUpperCase()+s.slice(1);
      return s;
    }).join('\n\n');
    // add a clarifying sentence
    out += '\n\nThis paragraph has been refined for clarity and professional tone.';
    return out;
  }

  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  function updateIndices(){
    Array.from(outlineEl.querySelectorAll('.section')).forEach((el,i)=>{
      const input = el.querySelector('.sec-title');
      el.querySelector('h3').innerHTML = `${i+1}. ` + input.outerHTML;
    });
  }

  btnSuggest.onclick = async ()=>{
    const prompt = (promptInput.value || '').trim();
    if (!prompt) { alert('Please enter a main topic before using AI-Suggest.'); promptInput.focus(); return; }
    const outline = await mockSuggestOutline(prompt);
    outlineEl.innerHTML = '';
    outline.forEach((h,i)=>{
      if (typeof h === 'string') {
        outlineEl.appendChild(createSectionCard(h,i,''));
      } else {
        outlineEl.appendChild(createSectionCard(h.title||`Section ${i+1}`, i, h.content||''));
      }
    });
  };

  btnCreate.onclick = ()=>{
    const prompt = (promptInput.value || '').trim();
    if (!prompt) { alert('Please enter a main topic before creating a default outline.'); promptInput.focus(); return; }
    const defaults = ['Introduction','Analysis','Recommendations','Conclusion'];
    outlineEl.innerHTML = '';
    defaults.forEach((h,i)=> outlineEl.appendChild(createSectionCard(h,i,'')));
  };

  btnSave.onclick = ()=>{
    const title = promptInput.value || 'Untitled Document';
    const sections = Array.from(outlineEl.querySelectorAll('.section')).map((el,i)=>({
      title: el.querySelector('.sec-title').value,
      content: el.querySelector('.sec-content').value,
      order: i
    }));
    const token = localStorage.getItem('token');
    if (token && editingProjectId){
      // update each section via API
      (async ()=>{
        try{
          for (let i=0;i<sections.length;i++){
            const s = sections[i];
            // assume sections in DOM have data-section-id when loaded from backend; try to find it
            const secEl = outlineEl.querySelectorAll('.section')[i];
            const secId = secEl?.dataset?.sectionId || secEl?.getAttribute('data-section-id') || null;
            if (secId){
              await fetch(`/projects/${editingProjectId}/sections/${secId}`, {
                method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+token }, body: JSON.stringify({ title: s.title, content: s.content })
              });
            }
          }
          // also update project title/prompt if needed by calling create_project? use a quick PUT-like create is not present; skip for now
          alert('Project updated on server.');
          window.location.href = 'saved.html';
        }catch(e){ console.error(e); alert('Failed to save to server - falling back to local save.'); localSave(); }
      })();
    } else {
      // fallback local save
      localSave();
    }
    function localSave(){
      const projects = JSON.parse(localStorage.getItem('projects')||'[]');
      if (editingProjectId){
        const idx = projects.findIndex(p=>String(p.id)===String(editingProjectId));
        if (idx>=0){ projects[idx].title = title; projects[idx].prompt = promptInput.value; projects[idx].sections = sections; projects[idx].created_at = new Date().toISOString(); }
        else { projects.push({ id: editingProjectId, title, doc_type: 'docx', prompt: promptInput.value, sections, created_at: new Date().toISOString() }); }
      } else { const id = Date.now(); projects.push({ id, title, doc_type: 'docx', prompt: promptInput.value, sections, created_at: new Date().toISOString() }); }
      localStorage.setItem('projects', JSON.stringify(projects));
      alert('Project saved to local demo storage.');
      window.location.href = 'saved.html';
    }
  };

  // load project when opened from My Projects (via ?projectId=...)
  (async function loadIfEditing(){
    const qs = new URLSearchParams(window.location.search);
    const pid = qs.get('projectId');
    if (!pid) return;
    const token = localStorage.getItem('token');
    if (token){
      try{
        const res = await fetch(`/projects/${encodeURIComponent(pid)}`, { headers: { 'Authorization': 'Bearer '+token } });
        if (res.ok){
          const proj = await res.json();
          editingProjectId = proj.id;
          promptInput.value = proj.prompt || proj.title || '';
          outlineEl.innerHTML = '';
          (proj.sections||[]).forEach((s,i)=> outlineEl.appendChild(createSectionCard(s.title||`Section ${i+1}`, i, s.content || '', s.id)));
          return;
        }
      }catch(e){ console.warn('Failed to load project from backend, falling back to localStorage', e); }
    }
    // fallback to localStorage behavior
    const projects = JSON.parse(localStorage.getItem('projects')||'[]');
    const proj = projects.find(p=>String(p.id)===String(pid));
    if (!proj) return;
    editingProjectId = proj.id;
    promptInput.value = proj.prompt || proj.title || '';
    outlineEl.innerHTML = '';
    (proj.sections||[]).forEach((s,i)=> outlineEl.appendChild(createSectionCard(s.title||`Section ${i+1}`, i, s.content || '')));
  })();

  btnExport.onclick = ()=>{
    // assemble plain text document and trigger download as .doc (Word can open plain text .doc)
    const title = promptInput.value || 'Untitled Document';
    const sections = Array.from(outlineEl.querySelectorAll('.section')).map((el,i)=>({
      title: el.querySelector('.sec-title').value,
      content: el.querySelector('.sec-content').value
    }));
    let txt = title + '\n\n';
    sections.forEach(s=>{
      txt += s.title + '\n';
      txt += s.content + '\n\n';
    });
    const blob = new Blob([txt], {type:'application/msword'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (title.replace(/[^a-z0-9]/gi,'_')||'document') + '.doc';
    document.body.appendChild(a); a.click(); a.remove();
  };

  // WORD-LIKE VIEW: toggle and rendering
  const btnViewWord = document.getElementById('btnViewWord');
  const docView = document.getElementById('docView');
  let docViewVisible = false;
  btnViewWord.onclick = ()=>{
    docViewVisible = !docViewVisible;
    if (docViewVisible){
      // hide outline editor
      document.getElementById('outline').style.display = 'none';
      btnViewWord.innerText = 'Back to Outline';
      renderDocView();
      docView.style.display = 'block';
    } else {
      // sync edits back to outline
      syncDocViewToSections();
      document.getElementById('outline').style.display = 'block';
      btnViewWord.innerText = 'View as Word';
      docView.style.display = 'none';
    }
  };

  function renderDocView(){
    // create a single contenteditable Word-like page with headings
    const title = promptInput.value || 'Untitled Document';
    const sections = Array.from(outlineEl.querySelectorAll('.section'));
    docView.innerHTML = '';
    const h1 = document.createElement('h1'); h1.style.marginTop='0'; h1.innerText = title; h1.contentEditable = 'true'; h1.style.fontSize='22px';
    docView.appendChild(h1);
    sections.forEach((sec,i)=>{
      const secTitle = sec.querySelector('.sec-title').value || ('Section '+(i+1));
      const secContent = sec.querySelector('.sec-content').value || '';
      const h = document.createElement('h3'); h.innerText = secTitle; h.contentEditable='true'; h.style.marginBottom='6px';
      const p = document.createElement('div'); p.innerHTML = secContent.replace(/\n/g,'<br/>'); p.contentEditable='true'; p.style.marginBottom='18px'; p.style.whiteSpace='pre-wrap';
      docView.appendChild(h); docView.appendChild(p);
    });
    const note = document.createElement('div'); note.style.fontSize='12px'; note.style.opacity='0.8'; note.style.marginTop='6px'; note.innerText='You can edit headings and paragraphs directly here. Click "Back to Outline" to return and Save.';
    docView.appendChild(note);
  }

  function syncDocViewToSections(){
    // map docView editable content back to outline sections
    const nodes = Array.from(docView.children).filter(n=>n.tagName.toLowerCase()!=='script');
    // first node is title
    if (nodes.length===0) return;
    const newTitle = nodes[0].innerText || promptInput.value;
    promptInput.value = newTitle;
    const sectionNodes = nodes.slice(1);
    const secEls = outlineEl.querySelectorAll('.section');
    sectionNodes.forEach((n,i)=>{
      const sec = secEls[i];
      if (!sec) return;
      const titleInput = sec.querySelector('.sec-title');
      const contentTa = sec.querySelector('.sec-content');
      if (n.tagName.toLowerCase()==='h3' || n.tagName.toLowerCase()==='h2' || n.tagName.toLowerCase()==='h1'){
        titleInput.value = n.innerText;
        // next sibling likely the content div
        const next = n.nextElementSibling;
        if (next) contentTa.value = next.innerText || '';
      } else {
        // fallback: put whole text into content
        contentTa.value = n.innerText || '';
      }
    });
  }
});
