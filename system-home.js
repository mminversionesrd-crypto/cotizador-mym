'use strict';
(() => {
 const Nav=window.SystemNavigation,Client=window.CRMClient,shell=document.querySelector('.app-shell');if(!Nav||!shell)return;shell.id='systemMain';shell.tabIndex=-1;document.querySelector('.skip-link')?.setAttribute('href','#systemMain');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sidebar=document.createElement('aside');sidebar.id='systemSidebar';sidebar.className='system-sidebar';sidebar.setAttribute('aria-label','Navegación principal');
 const home=document.createElement('section');home.id='systemHome';home.className='system-home';home.hidden=true;shell.append(home);
 const crumb=document.createElement('nav');crumb.className='system-breadcrumb';crumb.setAttribute('aria-label','Ubicación en el sistema');document.querySelector('.app-header').after(crumb);
 const toggle=document.createElement('button');toggle.id='systemMenuToggle';toggle.className='system-menu-toggle';toggle.type='button';toggle.setAttribute('aria-controls','systemSidebar');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú del sistema');toggle.innerHTML='<i class="fa-solid fa-bars" aria-hidden="true"></i>';
 const shade=document.createElement('button');shade.className='system-shade';shade.type='button';shade.setAttribute('aria-label','Cerrar menú');shade.hidden=true;document.body.append(sidebar,toggle,shade);document.body.classList.add('system-ui');
 const expressCalculator=document.querySelector('.express-calculator');
 function quickActions(){
  const items=[['quote','fa-calculator','Cotizar'],['new-operation','fa-folder-open','Mesa de operaciones'],
    ['performance-results','fa-plus','Nueva transacción'],['performance-goals','fa-bullseye','Asignar metas']];
  const available=new Set(groups().flatMap(group=>group.tools.map(tool=>tool.id)));
  return `<section class="system-quick" aria-label="Accesos rápidos"><div>${items.filter(([id])=>available.has(id)).map(([id,icon,label])=>
    `<button type="button" data-system-tool="${id}"><i class="fa-solid ${icon}" aria-hidden="true"></i>${label}<span aria-hidden="true">↗</span></button>`).join('')}</div></section>`;
 }
 function followUps(){
  let due=null;
  try{
   const today=window.PerformanceCore?.day();
   if(today)due=window.OperationRepository?.list().filter(({crm})=>crm?.nextAction&&crm.due&&crm.due<=today&&
    !['completed','rejected','cancelled','archived'].includes(crm.stage)).length;
  }catch{}
  const incidents=window.PerformanceWorkspace?.followUpSummary();
  const tiles=[
   ['financing-crm','fa-clipboard-list','Gestiones de expedientes',due==null?'Abrir bandeja':due+' para hoy o vencidas','due'],
   ['performance-dashboard','fa-chart-line','Metas del equipo','Ventas y desembolsos por ejecutivo',''],
   ['performance-incidents','fa-flag','Incidencias',incidents?incidents.open+' pendientes · '+incidents.overdue+' vencidas':'Abrir lista de seguimiento','']
  ];
  return `<section class="system-followup" aria-labelledby="systemFollowupTitle">
   <div class="system-followup-title"><span>Jornada de trabajo</span><h2 id="systemFollowupTitle">Seguimiento diario</h2></div>
   <div class="system-followup-list">${tiles.map(([id,icon,label,detail,filter])=>`<button type="button" data-system-tool="${id}" data-system-filter="${filter}">
    <i class="fa-solid ${icon}" aria-hidden="true"></i><span><b>${label}</b><small>${detail}</small></span><span class="system-followup-arrow" aria-hidden="true">→</span></button>`).join('')}</div></section>`;
 }
 let area='',query='',subsection='process',currentTool=null;const mobile=matchMedia('(max-width:800px)');shade.tabIndex=-1;
 const role=()=>Client?.mode==='shared'?(Client.actor?.role||'none'):'admin';
 const groups=()=>Nav.groupsFor(role());
 function closeMenu(){const wasOpen=document.body.classList.contains('system-menu-open');document.body.classList.remove('system-menu-open');toggle.setAttribute('aria-expanded','false');shade.hidden=true;sidebar.inert=mobile.matches;shell.inert=false;if(wasOpen&&mobile.matches)toggle.focus();}
 const menuIcons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',business:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 5V3h6v2M8 11h8M8 15h5"/>',credit:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h1m3 0h1m3 0h.1M8 15h1m3 0h1m3 0h.1M8 18h1m3 0h4"/>',evaluation:'<path d="M9 4H6a2 2 0 0 0-2 2v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a2 2 0 0 0-2-2h-3"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',formalization:'<path d="M13 3H5v18h14v-9M13 3v6h6M13 3l6 6m-9 6 8-8 3 3-8 8-4 1Z"/>',control:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2ZM8 7h8M8 11h8M8 15h4"/>',performance:'<path d="M4 4v16h16M7 15l4-4 3 2 5-6m-4 0h4v4"/>',settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>'};
 const menuIcon=id=>`<span class="system-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${menuIcons[id]||menuIcons.business}</svg></span>`;
 const menuHints={'document-management':'Paquetes por producto',business:'Expedientes y seguimiento',credit:'Propuestas y solicitudes',evaluation:'Verificación del crédito',formalization:'Documentos y recepción',control:'Recibos y compromisos',settings:'Equipo y reglas del cotizador',performance:'Ventas, crédito e incidencias'};
 function nav(){
  const user=Client?.actor;
  const scrollTop=sidebar.querySelector('nav')?.scrollTop||0;
  const sections=[
   ['Seguimiento',['business','performance']],
   ['Operación',['credit','evaluation','formalization','document-management','control']],
   ['Administración',['settings']]
  ];
  const areaButton=(id,label,detail)=>`<button type="button" data-system-area="${id}" class="${area===id?'active':''}" ${area===id?'aria-current="page"':''}>
    ${menuIcon(id||'home')}<span class="system-nav-copy"><b>${esc(label)}</b><small>${esc(detail)}</small></span><span class="system-nav-chevron" aria-hidden="true">›</span></button>`;
  const available=new Map(groups().map(group=>[group.id,group]));
  const links=(ids)=>ids.map(id=>available.get(id)).filter(Boolean).map(group=>areaButton(group.id,group.label,menuHints[group.id]||group.description)).join('');
  sidebar.innerHTML=`<div class="system-brand"><span><img src="LOGO%20M%26M.png" alt=""></span><div><b>M&amp;M Inversiones</b><small>Centro de financiamiento</small></div></div>
   <nav aria-label="Áreas del centro">${areaButton('','Inicio general','Tu jornada de trabajo')}
    ${sections.map(([label,ids])=>`<small>${label}</small>${links(ids)}`).join('')}
    ${links([...available.keys()].filter(id=>!sections.some(([,ids])=>ids.includes(id))))}</nav>
   <footer><span class="system-user-avatar">${esc((user?.name||'L').slice(0,1))}</span><div>
    <b>${esc(user?.name||(Client?.mode==='shared'?'Acceso al sistema':'Administrador local'))}</b>
    <small><span class="system-connection-dot" aria-hidden="true"></span>${Client?.mode==='shared'?(role()==='admin'?'Administrador':'Ejecutivo de negocios'):'Modo local · este navegador'}</small></div>
    ${Client?.mode==='shared'&&user?'<button type="button" data-system-logout aria-label="Cerrar sesión">Salir</button>':''}</footer>`;
  sidebar.querySelector('nav').scrollTop=scrollTop;
 }
 function toolsHTML(tools){return `<div class="system-tools">${tools.map(t=>`<button type="button" class="system-tool" data-system-tool="${t.id}" data-tool-area="${t.group}"><div class="system-tool-top">${menuIcon(t.group)}<span class="system-tool-kind">${esc(t.groupLabel||groups().find(g=>g.id===t.group)?.label||'')}</span><span class="system-tool-orbit" aria-hidden="true">↗</span></div><h3>${esc(t.label)}</h3><p>${esc(t.description)}</p><div class="system-tool-bottom"><b>Abrir herramienta</b><span aria-hidden="true">→</span></div></button>`).join('')}</div>`;}

 function metrics(){const s=Client?.state;if(!s)return '';const leadCount=s.opportunities.filter(o=>!['won','lost'].includes(o.stage)).length,pending=s.tasks.filter(t=>t.status==='pending').length;return `<div class="system-pulse"><span><b>${leadCount}</b> oportunidades en desarrollo</span><span><b>${pending}</b> seguimientos pendientes</span><span><b>${s.opportunities.filter(o=>o.operationRef).length}</b> solicitudes vinculadas</span></div>`;}
 function selectedTools(group){const sections=[...new Set(group.tools.map(t=>t.section))];if(!sections.includes(subsection))subsection=sections[0];return `${sections.length>1?`<nav class="system-subnav" aria-label="Opciones del área">${sections.map(section=>`<button type="button" data-system-section="${section}" class="${subsection===section?'active':''}">${section==='documents'?'Formularios y documentos':'Gestión y procesos'}</button>`).join('')}</nav>`:''}${toolsHTML(group.tools.filter(t=>t.section===subsection))}`;}
 function render(){expressCalculator?.remove();nav();const selected=groups().find(g=>g.id===area);home.innerHTML=`<header class="system-intro"><div><span>${selected?'Área de trabajo':'Inicio general'}</span><h1>${selected?selected.label:'Panel de financiamiento'}</h1><p>${selected?selected.description:'Prepara cada financiamiento desde la propuesta hasta la evaluación, la firma y la entrega.'}</p></div><label class="system-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" id="systemSearch" aria-label="Buscar opciones del sistema" placeholder="Buscar una herramienta…" value="${esc(query)}"><kbd aria-hidden="true">Ctrl K</kbd></label></header>${query?`<section><h2 class="system-section-title">Resultados de búsqueda</h2>${Nav.search(query,role()).length?toolsHTML(Nav.search(query,role())):'<p class="system-empty">No hay opciones para esa búsqueda. Prueba con préstamo, pago, lead o reporte.</p>'}</section>`:selected?selectedTools(selected):`${window.PerformanceWorkspace?.officeOverview()||''}${followUps()}${quickActions()}<div id="systemExpressSlot"></div>${window.BankDashboard?.render()||''}${metrics()}<h2 class="system-section-title">Explorar por área</h2><section class="system-groups" aria-label="Áreas del sistema">${groups().map(g=>`<button type="button" class="system-group" data-system-area="${g.id}"><div><span class="system-group-icon"><i class="fa-solid ${g.icon}" aria-hidden="true"></i></span><small>${g.tools.length} opciones</small></div><h2>${g.label}</h2><p>${g.description}</p><b>Ver opciones <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></b></button>`).join('')}</section><section class="system-route"><h2>Una ruta para cada operación</h2><p>Cotizar <i class="fa-solid fa-chevron-right" aria-hidden="true"></i> Solicitar <i class="fa-solid fa-chevron-right" aria-hidden="true"></i> Evaluar <i class="fa-solid fa-chevron-right" aria-hidden="true"></i> Formalizar <i class="fa-solid fa-chevron-right" aria-hidden="true"></i> Cobrar</p><small>Cada formulario se abre desde su área. Completa los pasos y revisa antes de confirmar.</small></section>`}`;const slot=home.querySelector('#systemExpressSlot');if(slot&&expressCalculator)slot.append(expressCalculator);breadcrumbs();}
 function breadcrumbs(){const group=groups().find(g=>g.id===area);crumb.innerHTML=`<button type="button" data-system-area="">Inicio general</button>${group?`<span>/</span><button type="button" data-system-area="${group.id}">${group.label}</button>`:''}${currentTool?`<span>/</span><strong>${esc(currentTool.label)}</strong>`:''}
  <button type="button" class="system-find" data-system-find aria-label="Buscar herramientas" aria-keyshortcuts="Control+K Meta+K"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><span>Buscar</span></button>`;}
 function showArea(id=''){const group=groups().find(g=>g.id===id);if(id&&!group)return;area=id;query='';subsection='process';currentTool=null;document.querySelectorAll('.workspace').forEach(w=>w.hidden=true);document.querySelector('#workspaceMenu').hidden=true;delete document.body.dataset.workspace;document.body.dataset.systemView='home';home.hidden=false;document.querySelector('.app-header h1').textContent='Centro de financiamiento';document.querySelectorAll('#applicationEntryBtn,#newQuoteBtn,#quoteHeaderSettingsBtn,#printBtn,#workspaceHomeBtn').forEach(el=>el.hidden=true);history.replaceState(null,'',location.pathname+location.search+'#inicio');render();closeMenu();window.scrollTo({top:0,behavior:'auto'});}
 const select=window.selectCotizadorWorkspace;
 window.selectCotizadorWorkspace=target=>{home.hidden=true;document.body.dataset.systemView='workspace';return select?.(target);};
 async function openTool(id,filter){const tool=groups().flatMap(g=>g.tools).find(t=>t.id===id);if(!tool)return;area=tool.group;currentTool=tool;closeMenu();if(tool.performanceView){if(filter==='office')window.PerformanceWorkspace.openOffice();else window.PerformanceWorkspace.open(tool.performanceView);nav();breadcrumbs();return;}if(filter==='due'&&tool.target==='financing-crm'){window.FinancingCRM.open({due:'attention'});nav();breadcrumbs();return;}if(tool.documentKind){window.DocumentManagement.open(tool.documentKind);nav();breadcrumbs();return;}if(tool.href){location.href=tool.href;return;}await window.selectCotizadorWorkspace(tool.target);if(tool.target==='crm'&&tool.tab)window.CRMUI.navigate(tool.tab,{stage:tool.stage});if(tool.target==='collections'&&tool.tab)window.PortfolioDesk.navigate(tool.tab);if(tool.launch==='manual')document.querySelector('[data-entry-launch]')?.click();if(tool.click)document.getElementById(tool.click)?.click();nav();breadcrumbs();}
 function error(e){window.CRMUI?.toast(e.message||'No se pudo abrir la opción.');}
 [sidebar,home,crumb].forEach(el=>el.addEventListener('click',event=>{const areaButton=event.target.closest('[data-system-area]'),tool=event.target.closest('[data-system-tool]');if(event.target.closest('[data-system-section]')){subsection=event.target.closest('[data-system-section]').dataset.systemSection;render();return;}if(event.target.closest('[data-system-find]'))focusSearch();else if(areaButton)showArea(areaButton.dataset.systemArea);else if(tool)openTool(tool.dataset.systemTool,tool.dataset.systemFilter).catch(error);else if(event.target.closest('[data-system-logout]')){if(Client.pending){error(new Error('Guarda los cambios de la solicitud antes de cerrar sesión.'));return;}Client.logout().catch(error);}}));
 function focusSearch(){if(home.hidden||area)showArea();home.querySelector('#systemSearch')?.focus();}
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){event.preventDefault();focusSearch();}});
 let searchTimer;home.addEventListener('input',event=>{if(event.target.id!=='systemSearch')return;const value=event.target.value,pos=event.target.selectionStart;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{query=value;render();const input=home.querySelector('#systemSearch');input.focus();input.setSelectionRange(pos,pos);},180);});
 toggle.addEventListener('click',()=>{if(document.body.classList.contains('system-menu-open')){closeMenu();return;}document.body.classList.add('system-menu-open');sidebar.inert=false;shell.inert=mobile.matches;toggle.setAttribute('aria-expanded','true');shade.hidden=false;sidebar.querySelector('nav button')?.focus();});shade.addEventListener('click',closeMenu);document.addEventListener('keydown',event=>{if(!mobile.matches||!document.body.classList.contains('system-menu-open'))return;if(event.key==='Escape'){closeMenu();event.preventDefault();}if(event.key==='Tab'){const nodes=[...sidebar.querySelectorAll('button:not([disabled])'),toggle],first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});mobile.addEventListener('change',closeMenu);closeMenu();
 document.querySelector('#workspaceHomeBtn').addEventListener('click',()=>showArea());
 new MutationObserver(()=>{if(document.body.dataset.workspace){home.hidden=true;document.body.dataset.systemView='workspace';const target=document.body.dataset.workspace;if(currentTool?.target!==target){const match=groups().flatMap(g=>g.tools).find(t=>t.target===target)||(target==='operations'&&role()==='executive'?{target,group:'credit',label:'Solicitud vinculada'}:null);if(match){currentTool=match;area=match.group;nav();breadcrumbs();}}}else if(!document.querySelector('#crmAuth')){home.hidden=false;document.body.dataset.systemView='home';}}).observe(document.body,{attributes:true,attributeFilter:['data-workspace']});
 function startup(){if(location.hash.startsWith('#quote-')&&role()==='admin'){nav();return;}showArea();}
 window.addEventListener('crm:authenticated',startup);window.addEventListener('system:home',()=>showArea());
 window.addEventListener('document-management:product',event=>{if(document.body.dataset.workspace!=='document-management')return;const tool=groups().flatMap(g=>g.tools).find(t=>t.documentKind===event.detail.kind);if(tool){currentTool=tool;area=tool.group;nav();breadcrumbs();}});
 window.SystemHome={show:showArea,openTool};
 if(!Client||Client.mode==='local')startup();else if(Client?.actor)startup();else nav();
})();
