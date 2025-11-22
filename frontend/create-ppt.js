// create-ppt.js - client-side demo logic for creating PPT slides
document.addEventListener('DOMContentLoaded', function(){
  const prompt = document.getElementById('pptPrompt');
  const numSlides = document.getElementById('numSlides');
  const container = document.getElementById('slidesContainer');
  const btnSuggest = document.getElementById('btnSuggestSlides');
  const btnSave = document.getElementById('btnSavePpt');
  const btnExport = document.getElementById('btnExportPpt');
  let editingProjectId = null;

function mockSuggestSlides(topic, n){
    const base = ['Title', 'Overview', 'Problem', 'Solution', 'Benefits', 'Roadmap', 'Metrics', 'Call to Action'];
    const arr = [];
    
    // Content templates with bullet points and explanations
    const contentTemplates = {
      'Title': [
        { bullet: `${topic} - An Introduction`, text: `This presentation explores the fundamental concepts and emerging trends in ${topic}. We'll examine how these developments are reshaping industries and creating new opportunities for innovation and growth.` },
        { bullet: `Why This Matters Now`, text: `Understanding ${topic} is critical for staying competitive in today's rapidly evolving landscape. Organizations that adapt early gain significant advantages in efficiency, market positioning, and long-term sustainability.` },
        { bullet: `What We'll Cover Today`, text: `Our discussion will span current state analysis, key challenges, innovative solutions, and actionable recommendations. Each section builds on the previous to provide a comprehensive view of ${topic}.` }
      ],
      'Overview': [
        { bullet: `Current State of ${topic}`, text: `The landscape of ${topic} has evolved significantly in recent years, driven by technological advances and changing market demands. Organizations are increasingly recognizing its strategic importance for future growth and competitiveness.` },
        { bullet: `Key Trends and Patterns`, text: `Several major trends are shaping the development of ${topic}, including increased adoption rates, technological convergence, and regulatory changes. These patterns indicate strong momentum and widespread acceptance across industries.` },
        { bullet: `Market Opportunities`, text: `The ${topic} space presents substantial opportunities for innovation and value creation. Early movers are capturing market share while building capabilities that will drive long-term competitive advantages.` }
      ],
      'Problem': [
        { bullet: `Current Challenges in ${topic}`, text: `Organizations face significant obstacles when dealing with ${topic}, including legacy systems, skill gaps, and resource constraints. These challenges often prevent companies from fully leveraging available opportunities and staying competitive.` },
        { bullet: `Impact on Business Operations`, text: `The existing problems in ${topic} create inefficiencies that ripple across entire organizations. Teams struggle with outdated processes, increased costs, and inability to meet customer expectations in a timely manner.` },
        { bullet: `Cost of Inaction`, text: `Failing to address ${topic} challenges leads to missed opportunities, competitive disadvantage, and increasing technical debt. Organizations that delay action risk falling further behind as the market continues to evolve rapidly.` }
      ],
      'Solution': [
        { bullet: `Innovative Approach to ${topic}`, text: `Our solution leverages cutting-edge methodologies and proven frameworks to address the core challenges in ${topic}. By combining strategic thinking with practical implementation, we create sustainable pathways to success.` },
        { bullet: `Implementation Strategy`, text: `The rollout follows a phased approach that minimizes disruption while maximizing value capture. Each phase includes clear milestones, success criteria, and feedback loops to ensure continuous improvement and adaptation.` },
        { bullet: `Expected Outcomes`, text: `Organizations implementing this solution can expect measurable improvements in efficiency, cost reduction, and competitive positioning. The framework is designed to deliver both quick wins and long-term strategic benefits.` }
      ],
      'Benefits': [
        { bullet: `Operational Efficiency Gains`, text: `Adopting best practices in ${topic} streamlines workflows and eliminates bottlenecks across the organization. Teams can accomplish more with existing resources while reducing errors and accelerating time-to-market for key initiatives.` },
        { bullet: `Strategic Advantages`, text: `Organizations gain competitive differentiation through enhanced capabilities in ${topic}. This positioning enables better market response, improved customer satisfaction, and stronger partnerships with key stakeholders.` },
        { bullet: `Financial Impact`, text: `The investment in ${topic} delivers measurable ROI through cost savings, revenue growth, and risk mitigation. Financial benefits typically materialize within the first implementation phase and compound over time.` }
      ],
      'Roadmap': [
        { bullet: `Phase 1: Foundation Building`, text: `Initial efforts focus on establishing core capabilities, assembling the right team, and creating necessary infrastructure for ${topic}. This phase typically spans 2-3 months and sets the stage for all subsequent activities.` },
        { bullet: `Phase 2: Pilot and Optimization`, text: `Selected pilot projects validate approaches and generate early wins that build organizational momentum. Learnings from pilots inform adjustments to strategy and tactics before broader rollout across the organization.` },
        { bullet: `Phase 3: Scaling and Maturity`, text: `Successful pilots expand across departments and business units with refined processes and proven methodologies. This phase emphasizes sustainability, knowledge transfer, and continuous improvement to maximize long-term value.` }
      ],
      'Metrics': [
        { bullet: `Key Performance Indicators`, text: `Success in ${topic} is measured through specific KPIs including efficiency ratios, adoption rates, and quality metrics. Regular tracking ensures accountability and enables data-driven adjustments to strategy and execution.` },
        { bullet: `Business Impact Measures`, text: `Financial and operational metrics quantify the value delivered by ${topic} initiatives. These include cost savings, revenue impact, time savings, and customer satisfaction improvements that tie directly to business objectives.` },
        { bullet: `Leading vs Lagging Indicators`, text: `Balanced scorecards incorporate both leading indicators that predict future success and lagging indicators that confirm results. This dual approach enables proactive management and course correction before issues become critical.` }
      ],
      'Call to Action': [
        { bullet: `Next Steps and Timeline`, text: `We recommend beginning the ${topic} journey with an assessment phase to establish baseline and priorities. This initial step requires minimal investment while providing critical insights to guide subsequent decisions and resource allocation.` },
        { bullet: `Required Resources and Support`, text: `Successful execution requires dedicated team members, executive sponsorship, and appropriate budget allocation. We've identified specific roles and responsibilities that ensure accountability and drive progress toward defined objectives.` },
        { bullet: `Getting Started Today`, text: `The opportunity window for ${topic} leadership is narrowing as more organizations advance their capabilities. Early action positions your organization to capture maximum value and build sustainable competitive advantages in the marketplace.` }
      ]
    };
    
    for(let i=0;i<n;i++){
      const slideType = base[i] || `Slide ${i+1}`;
      const t = (i===0) ? `${slideType}: ${topic}` : slideType;
      
      // Generate content with bullets and explanations
      let content = '';
      if (contentTemplates[slideType]) {
        contentTemplates[slideType].forEach((item, idx) => {
          content += `• ${item.bullet}\n${item.text}\n\n`;
        });
      } else {
        // Generic content for additional slides
        content = `• Key Aspect of ${topic}\nThis section examines important dimensions of ${topic} that contribute to comprehensive understanding. We'll explore how these elements interact and influence overall outcomes.\n\n`;
        content += `• Implementation Considerations\nPractical application requires attention to specific factors including resources, timelines, and organizational readiness. Success depends on careful planning and stakeholder alignment throughout the process.\n\n`;
        content += `• Strategic Implications\nThe long-term impact of ${topic} extends beyond immediate operational benefits. Organizations must consider how these initiatives align with broader strategic objectives and future market positioning.`;
      }
      
      arr.push({ title: t, content: content.trim() });
    }
    return arr;
  }

  function makeSlideCard(title, idx, content, sectionId){
    const el = document.createElement('div'); el.className='section'; el.style.padding='12px'; el.style.marginBottom='10px';
    if (sectionId) el.setAttribute('data-section-id', sectionId);
    el.innerHTML = `
      <h3>${idx+1}. <input class="slide-title" value="${escapeHtml(title)}" style="font-weight:700;border:none;background:transparent;width:70%"/></h3>
      <textarea class="slide-content" placeholder="Slide bullet points / notes">${escapeHtml(content||'')}</textarea>
      <div style="margin-top:8px">
        <select class="slide-action"><option value="">Quick action</option><option value="bullets">To bullets</option><option value="shorten">Shorten</option><option value="expand">Add details</option></select>
        <button class="apply">Apply</button>
        <button class="ai-enhance" style="margin-left:8px;background:#2b6cb0;color:#fff">AI-Enhance</button>
        <button class="remove" style="margin-left:8px;background:#ff4d4f;color:#fff">Remove</button>
      </div>
    `;
    el.querySelector('.apply').onclick = ()=>{
      const action = el.querySelector('.slide-action').value;
      const ta = el.querySelector('.slide-content');
      ta.value = pptRefine(ta.value, action);
    };
    el.querySelector('.ai-enhance').onclick = async ()=>{
      const ta = el.querySelector('.slide-content');
      const token = localStorage.getItem('token');
      const secId = el.getAttribute('data-section-id') || null;
      if (token && editingProjectId && secId){
        try{
          const prompt = encodeURIComponent('Enhance and convert to concise slide bullets and speaker notes');
          const res = await fetch(`/projects/${editingProjectId}/sections/${secId}/refine?prompt=${prompt}`, { method:'POST', headers: { 'Authorization':'Bearer '+token } });
          if (res.ok){ const body = await res.json(); ta.value = body.new_content || ta.value; return; }
        }catch(e){ console.warn('Remote refine failed, falling back to local', e); }
      }
      ta.value = await pptEnhanceMock(ta.value);
    };
    el.querySelector('.remove').onclick = ()=>{ el.remove(); updateIdx(); };
    return el;
  }

  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function pptRefine(text, action){
    if (!action) return text;
    if (action==='bullets') {
      const t = (text||'').trim();
      if (!t) return '';
      // split into paragraphs then sentences to create logical items
      const paras = t.split(/\r?\n\s*\r?\n/).filter(Boolean);
      const items = [];
      paras.forEach(p=>{
        // split lines first, then fallback to sentence matching
        const lines = p.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        if (lines.length>1){
          lines.forEach(l=>{
            const cleaned = l.replace(/^(?:\s*(?:[•\-\*\u2022o·]+|\d+\.)\s*)+/, '');
            items.push(cleaned);
          });
        } else {
          // sentence matching
          const sents = p.match(/[^.!?]+[.!?]*/g) || [p];
          sents.map(s=>s.trim()).filter(Boolean).forEach(s=>{
            const cleaned = s.replace(/[.?!]+$/,'').replace(/^(?:\s*(?:[•\-\*\u2022o·]+|\d+\.)\s*)+/, '');
            items.push(cleaned);
          });
        }
      });
      // idempotent: remove any empty and ensure no leading bullets
      return items.map(i=>'• '+i).join('\n');
    }
    if (action==='shorten'){
      const t = (text||'').trim();
      if (!t) return '';
      const words = t.split(/\s+/).filter(Boolean);
      const max = 25;
      return words.length <= max ? t : words.slice(0,max).join(' ') + '...';
    }
    if (action==='expand'){
      const t = (text||'').trim();
      const note = '\n\nNote: Add visuals and speaker notes to illustrate the point.';
      // avoid appending duplicate note
      if (t.includes('Note: Add visuals and speaker notes')) return t;
      return t + note;
    }
    return text;
  }

  function updateIdx(){ Array.from(container.querySelectorAll('.section')).forEach((el,i)=> el.querySelector('h3').innerHTML = (i+1)+'. ' + el.querySelector('.slide-title').outerHTML ); }

  btnSuggest.onclick = ()=>{
    const t = prompt.value || 'Presentation';
    const n = Math.max(1, Math.min(30, parseInt(numSlides.value||6)));
    const titles = mockSuggestSlides(t,n);
    container.innerHTML = '';
    titles.forEach((tt,i)=> container.appendChild(makeSlideCard(tt.title||tt, i, tt.content||'')));
  };

  // Create default slides (single default slide or small set)
  const btnCreateDefault = document.getElementById('btnCreateDefault');
  btnCreateDefault.onclick = ()=>{
    const topic = (prompt.value || '').trim();
    if (!topic) {
      // show a popup when topic is missing
      alert('Please enter a presentation topic before creating default slides.');
      return;
    }
    container.innerHTML = '';
    // Create the same number of empty slides as specified in the Number of slides field
    const n = Math.max(1, Math.min(30, parseInt(numSlides.value||6)));
    const baseTitles = ['Title','Overview','Problem','Solution','Benefits','Roadmap','Metrics','Call to Action'];
    for (let i = 0; i < n; i++){
      // pick recurring sub-topic titles (wrap if n > baseTitles.length)
      const title = baseTitles[i % baseTitles.length] || `Slide ${i+1}`;
      container.appendChild(makeSlideCard(title, i, ''));
    }
    updateIdx();
  };

  btnSave.onclick = ()=>{
    const projTitle = prompt.value || 'Untitled Presentation';
    const slides = Array.from(container.querySelectorAll('.section')).map((el,i)=>({
      title: el.querySelector('.slide-title').value,
      content: el.querySelector('.slide-content').value,
      order: i
    }));
    const token = localStorage.getItem('token');
    if (token && editingProjectId){
      (async ()=>{
        try{
          for (let i=0;i<slides.length;i++){
            const s = slides[i];
            const secEl = container.querySelectorAll('.section')[i];
            const secId = secEl?.dataset?.sectionId || secEl?.getAttribute('data-section-id') || null;
            if (secId){
              await fetch(`/projects/${editingProjectId}/sections/${secId}`, { method:'PUT', headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+token }, body: JSON.stringify({ title: s.title, content: s.content }) });
            }
          }
          alert('Presentation updated on server.');
          window.location.href = 'saved.html';
        }catch(e){ console.error(e); alert('Failed to save to server - falling back to local save.'); localSave(); }
      })();
    } else { localSave(); }
    function localSave(){
      const projects = JSON.parse(localStorage.getItem('projects')||'[]');
      if (editingProjectId){
        const idx = projects.findIndex(p=>String(p.id)===String(editingProjectId));
        if (idx>=0){ projects[idx].title = projTitle; projects[idx].prompt = prompt.value; projects[idx].sections = slides; projects[idx].created_at = new Date().toISOString(); }
        else { projects.push({ id: editingProjectId, title: projTitle, doc_type: 'pptx', prompt: prompt.value, sections: slides, created_at: new Date().toISOString() }); }
      } else { const id = Date.now(); projects.push({ id, title: projTitle, doc_type: 'pptx', prompt: prompt.value, sections: slides, created_at: new Date().toISOString() }); }
      localStorage.setItem('projects', JSON.stringify(projects));
      alert('Presentation saved to local demo storage.');
      window.location.href = 'saved.html';
    }
  };

  // SLIDE-LIKE VIEW: toggle and rendering
  const btnViewSlides = document.getElementById('btnViewSlides');
  const slideView = document.getElementById('slideView');
  let slideViewVisible = false;
  btnViewSlides.onclick = ()=>{
    slideViewVisible = !slideViewVisible;
    if (slideViewVisible){
      document.getElementById('slidesContainer').style.display = 'none';
      btnViewSlides.innerText = 'Back to Editor';
      renderSlideView();
      slideView.style.display = 'block';
    } else {
      // sync edits back to slide editor
      syncSlideViewToSections();
      document.getElementById('slidesContainer').style.display = 'block';
      btnViewSlides.innerText = 'View as Slides';
      slideView.style.display = 'none';
    }
  };

  function renderSlideView(){
    slideView.innerHTML = '';
    const secs = Array.from(container.querySelectorAll('.section'));
    secs.forEach((s,i)=>{
      const st = s.querySelector('.slide-title').value || ('Slide '+(i+1));
      const sc = s.querySelector('.slide-content').value || '';
      const slide = document.createElement('div');
      slide.className = 'slide-preview';
      slide.style.background = '#fff'; slide.style.borderRadius='8px'; slide.style.padding='18px'; slide.style.marginBottom='18px'; slide.style.boxShadow='0 18px 40px rgba(8,24,64,0.10)';
      slide.style.height='360px'; slide.style.display='flex'; slide.style.flexDirection='column'; slide.style.justifyContent='flex-start';
      const h = document.createElement('h2'); h.innerText = st; h.contentEditable='true'; h.style.margin='6px 0'; h.style.fontSize='20px';
      const b = document.createElement('div'); b.contentEditable='true'; b.style.flex='1'; b.style.whiteSpace='pre-wrap'; b.style.marginTop='8px'; b.innerText = sc;
      slide.appendChild(h); slide.appendChild(b);
      slideView.appendChild(slide);
    });
  }

  function syncSlideViewToSections(){
    const slides = Array.from(slideView.children);
    slides.forEach((sl,i)=>{
      const sec = container.querySelectorAll('.section')[i];
      if (!sec) return;
      const titleInput = sec.querySelector('.slide-title');
      const contentTa = sec.querySelector('.slide-content');
      titleInput.value = sl.querySelector('h2').innerText || titleInput.value;
      contentTa.value = sl.querySelector('div').innerText || contentTa.value;
    });
  }

  // AI-enhance mock for slides
  async function pptEnhanceMock(text){
    if (!text || !text.trim()) return 'AI-enhanced slide notes. Add visuals and concise bullets.';
    await new Promise(r=>setTimeout(r,300));
    // Enhance text without adding bullet markers — return cleaned, improved sentences
    const parts = text.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(s=>{
      // remove any existing bullet markers
      let cleaned = s.replace(/^(?:\s*(?:[•\-\*\u2022o·]+|\d+\.)\s*)+/, '');
      // ensure sentence ends with a period
      cleaned = cleaned.replace(/\s+$/,'').replace(/\.$/, '');
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + '.';
    });
    return parts.join('\n\n') + '\n\nSummary: Key points refined for a concise speaker note.';
  }

  // load project when opened via ?projectId=
  (function loadIfEditing(){
    const qs = new URLSearchParams(window.location.search);
    const pid = qs.get('projectId');
    if (!pid) return;
    const token = localStorage.getItem('token');
    if (token){
      fetch(`/projects/${encodeURIComponent(pid)}`, { headers: { 'Authorization': 'Bearer '+token } })
        .then(r=>{ if (!r.ok) throw new Error('not found'); return r.json(); })
        .then(proj=>{
          editingProjectId = proj.id;
          prompt.value = proj.prompt || proj.title || '';
          container.innerHTML = '';
          (proj.sections||[]).forEach((s,i)=> container.appendChild(makeSlideCard(s.title||`Slide ${i+1}`, i)));
          Array.from(container.querySelectorAll('.section')).forEach((el,i)=>{ el.querySelector('.slide-content').value = (proj.sections[i] && proj.sections[i].content) || ''; el.setAttribute('data-section-id', proj.sections[i]?.id || ''); });
        })
        .catch(e=>{ console.warn('Backend load failed, falling back to local', e); fallbackLoad(); });
      return;
    }
    function fallbackLoad(){
      const projects = JSON.parse(localStorage.getItem('projects')||'[]');
      const proj = projects.find(p=>String(p.id)===String(pid));
      if (!proj) return;
      editingProjectId = proj.id;
      prompt.value = proj.prompt || proj.title || '';
      container.innerHTML = '';
      (proj.sections||[]).forEach((s,i)=> container.appendChild(makeSlideCard(s.title||`Slide ${i+1}`, i)));
      Array.from(container.querySelectorAll('.section')).forEach((el,i)=>{ el.querySelector('.slide-content').value = (proj.sections[i] && proj.sections[i].content) || ''; });
    }
    fallbackLoad();
  })();

  btnExport.onclick = ()=>{
    // demo export to plain text file with .ppt extension for convenience
    const title = prompt.value || 'Presentation';
    const slides = Array.from(container.querySelectorAll('.section')).map(el=>({ title: el.querySelector('.slide-title').value, content: el.querySelector('.slide-content').value }));
    let txt = title + '\n\n';
    slides.forEach(s=>{ txt += s.title + '\n' + (s.content || '') + '\n\n'; });
    const blob = new Blob([txt], {type:'text/plain'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (title.replace(/[^a-z0-9]/gi,'_')||'deck') + '.ppt';
    document.body.appendChild(a); a.click(); a.remove();
  };
});
