/* One composition is shared by preview and the browser print command. */
(() => {
 'use strict';
 const P=window.PrintProfiles;
 const nativePrint=window.print.bind(window);
 const signatures='.print-signatures,.delivery-letter-signatures,.delivery-print-signatures,.credit-print-signatures,.evaluation-print-signatures,.collection-print-signatures,.collection-print-promise>div,.preapplication-print-signatures,.preapplication-v3-print-signatures,.document-print-signatures,.gdoc-signatures';
 const map={quote:'#printReport',application:'#creditPrintReport .credit-print-sheet',evaluation:'#evaluationPrintReport .evaluation-print-sheet',delivery:'#deliveryPrintReport .delivery-print-sheet',collection:'.collection-print-report .collection-print-sheet',preapplication:'.preapplication-print-report .preapplication-print-sheet','preapplication-v3':'.preapplication-v3-print-sheet','gestion-documental':'#gdocPrint .gdoc-sheet'};
 let dialog,frame,status,profile,sourceSnapshot=[],target='',generation=0,units='mm';
 const lengths=['width','height','top','right','bottom','left','signatureSpace'];
 function el(tag,attrs={},text){const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;}
 function load(){const fallback=target==='preapplication-v3'?{orientation:'landscape'}:{};try{return P.validate({...fallback,...JSON.parse(localStorage.getItem(P.storageKey+':'+target)||'{}')});}catch{return P.validate(fallback);}}
 function printCSS(){
  if(window.PrintStyleBundle){const sheet=new CSSStyleSheet();sheet.replaceSync(window.PrintStyleBundle);const fixed=[];function collect(rules){for(const rule of rules){if(rule.type===CSSRule.PAGE_RULE)continue;if(rule.type===CSSRule.MEDIA_RULE){if(rule.conditionText==='all'||rule.conditionText==='print')collect(rule.cssRules);}else fixed.push(rule.cssText);}}collect(sheet.cssRules);return fixed.join('\n');}
  const result=[];
  function read(rules){for(const r of rules){if(r.type===CSSRule.PAGE_RULE)continue;if(r.type===CSSRule.MEDIA_RULE){if(/print/.test(r.conditionText))read(r.cssRules);else if(!/screen/.test(r.conditionText))result.push(r.cssText);}else result.push(r.cssText);}}
  for(const sheet of document.styleSheets){try{read(sheet.cssRules);}catch(e){if(sheet.href&&new URL(sheet.href).origin===location.origin&&!/^https?:/.test(sheet.href))throw Error('No se pudo leer el formato local. Abre el sistema desde su servidor local.');}}
  return result.join('\n');
 }
 function setup(){
  if(dialog)return;
  dialog=el('dialog',{id:'optimalPrintDialog','aria-label':'Configurar y revisar impresión'});
  const title=el('header',{},'Impresión · revisar antes de imprimir');const close=el('button',{'type':'button','data-op':'close'},'Cerrar');title.append(close);dialog.append(title);
  const form=el('form',{id:'optimalPrintSettings'});
  function field(name,label,options,value){const l=el('label',{},label);let input;
   if(options){input=el('select',{name});for(const [v,t]of options)input.append(el('option',{value:v},t));}
   else input=el('input',{name,type:'number',step:'0.1',value:String(value)});
   l.append(input);form.append(l);
  }
  field('paper','Papel',[['Carta','Carta'],['A4','A4'],['Legal','Legal (215.9 × 355.6 mm)'],['Custom','Personalizado / Oficio']]);
  field('orientation','Orientación',[['portrait','Vertical'],['landscape','Horizontal']]);
  field('fontFamily','Tipografía',[['Arial','Arial'],['Georgia','Georgia'],['Verdana','Verdana'],['Myriad Pro','Myriad Pro']]);
  field('units','Unidad de medida',[['mm','Milímetros'],['in','Pulgadas']]);
  for(const [k,label]of [['showLogos','Logos'],['repeatHeader','Repetir encabezado'],['pageNumbers','Numeración']])field(k,label,[['true','Sí'],['false','No']]);
  for(const [k,label] of Object.entries({width:'Ancho (mm)',height:'Alto (mm)',top:'Margen superior (mm)',right:'Margen derecho (mm)',bottom:'Margen inferior (mm)',left:'Margen izquierdo (mm)',font:'Texto (pt)',tableFont:'Tablas (pt)',noteFont:'Notas (pt)',lineHeight:'Interlineado',signatureSpace:'Espacio para firmar (mm)'}))field(k,label,null,P.defaults[k]);
  const actions=el('div',{class:'op-actions'});
  for(const [action,label]of [['apply','Aplicar y revisar'],['save','Guardar perfil'],['reset','Restaurar valores'],['print','Imprimir / guardar PDF']])actions.append(el('button',{type:'button','data-op':action},label));
  status=el('p',{id:'optimalPrintStatus',role:'status'});frame=el('iframe',{name:'optimalPrintFrame',title:'Páginas listas para imprimir'});
  dialog.append(form,actions,status,frame);document.body.append(dialog);
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('change',e=>{if(e.target.name!=='units')return;const next=e.target.value;for(const key of lengths){const input=form.elements[key];const mm=Number(input.value)*(units==='in'?25.4:1);input.value=String(Number((mm/(next==='in'?25.4:1)).toFixed(8)));input.step=next==='in'?'0.01':'0.1';input.parentElement.firstChild.textContent=input.parentElement.firstChild.textContent.replace(/\((?:mm|in)\)/,'('+next+')');}units=next;});
  form.addEventListener('input',()=>{generation++;dialog.dataset.ready='false';dialog.querySelector('[data-op=print]').disabled=true;status.textContent='Cambiaste el perfil. Pulsa Aplicar y revisar.';});
  dialog.addEventListener('close',()=>{generation++;window.dispatchEvent(new Event('afterprint'));});
  dialog.addEventListener('click',async e=>{const action=e.target.closest('[data-op]')?.dataset.op;if(!action)return;
   if(action==='close'){dialog.close();return;}
   if(action==='reset'){fill(P.validate());await rebuild();return;}
   if(action==='print'){await printPrepared();return;}
   if(action==='save'){try{const valid=readProfile();localStorage.setItem(P.storageKey+':'+target,JSON.stringify(valid));await rebuild();}catch(error){fail(error);}return;}
   await rebuild();
  });
 }
 function fill(p){for(const [k,v]of Object.entries(p)){const input=dialog.querySelector(`[name="${k}"]`);if(input)input.value=lengths.includes(k)&&units==='in'?Number((v/25.4).toFixed(8)):v;}}
 function readProfile(){const p=Object.fromEntries(new FormData(dialog.querySelector('form')));if(units==='in')for(const key of lengths)p[key]=Number(p[key])*25.4;delete p.units;return P.validate(p);}
 function fail(error){dialog.dataset.ready='false';status.textContent=error.message;dialog.querySelector('[data-op=print]').disabled=true;}
 async function printPrepared(){
  if(dialog?.dataset.ready!=='true')return;
  const html=frame.contentDocument.documentElement.outerHTML;
  const popup=window.open('','_blank','popup,width=1000,height=900');
  if(!popup){status.textContent='Permite abrir la ventana de impresión para continuar.';return;}
  try{
   if(popup.closed)return;
   popup.document.open();popup.document.write('<!doctype html>'+html);popup.document.close();popup.document.title='Impresión · Centro de Financiamiento';
   popup.document.body.dataset.printStage='resources';
   popup.document.body.getBoundingClientRect();
   let timer;try{await Promise.race([resources(popup.document),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('No se pudieron cargar todas las imágenes de la impresión. Revisa las imágenes y vuelve a intentarlo.')),15000);})]);}finally{clearTimeout(timer);}
   popup.document.body.getBoundingClientRect();
   if(popup.closed)return;
   popup.document.body.dataset.printStage='printing';popup.focus();popup.print();
   if(!popup.closed)popup.document.body.dataset.printSubmitted='true';
  }catch(error){if(!popup.closed)popup.close();status.textContent=error.message;}
 }
 function clean(node){node.querySelectorAll('script,iframe,object,embed,[data-signature-spacer]').forEach(n=>n.remove());for(const n of [node,...node.querySelectorAll('*')])for(const attr of [...n.attributes])if(/^on/i.test(attr.name))n.removeAttribute(attr.name);return node;}
 function snapshot(nodes){return nodes.map(node=>{
  const clone=clean(node.cloneNode(true));
  for(const image of clone.querySelectorAll('img')){try{const key=decodeURIComponent(new URL(image.getAttribute('src'),document.baseURI).pathname.split('/').pop());if(Object.hasOwn(window.PrintImageBundle||{},key))image.src=window.PrintImageBundle[key];}catch{}}
  const parent=node.parentElement;
  return {node:clone,parent:parent&&(/report/.test(parent.className)||parent.id==='gdocPrint')?parent.cloneNode(false):null};
 });}
 async function resources(doc){
  await doc.fonts.ready;
  await Promise.all(Array.from(doc.images).map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;})));
  const broken=Array.from(doc.images).find(img=>!img.naturalWidth&&img.getAttribute('src'));
  if(broken)throw Error('No se pudo cargar un logo o imagen. Revisa el archivo antes de imprimir.');
 }
 async function rebuild(){
  const version=++generation;dialog.dataset.ready='false';dialog.querySelector('[data-op=print]').disabled=true;status.textContent='Componiendo y comprobando las páginas…';
  try{
   profile=readProfile();fill(profile);
   const d=frame.contentDocument;d.open();d.write('<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body></body></html>');d.close();
   const base=d.createElement('base');base.href=new URL('.',location.href).href;d.head.append(base);
   const styles=d.createElement('style');styles.textContent=printCSS();d.head.append(styles);
   d.body.className=document.body.className;d.body.dataset.printTarget=target;
   const css=d.createElement('style');css.textContent=layoutCSS(profile);d.head.append(css);
   if(profile.fontFamily==='Myriad Pro'){try{await Promise.all([d.fonts.load('10pt "Myriad Pro"'),d.fonts.load('bold 10pt "Myriad Pro"')]);}catch{throw Error('No se pudo cargar Myriad Pro. Verifica que la fuente esté instalada.');}if(version!==generation)return;}
   const staging=d.createElement('div');staging.className='op-staging';d.body.append(staging);
   for(const item of sourceSnapshot){const copy=d.importNode(item.node,true);if(!profile.showLogos)copy.querySelectorAll('img').forEach(n=>{if(/LOGO/i.test(n.getAttribute('src')||''))n.remove();});if(item.parent){const wrap=d.importNode(item.parent,false);wrap.style.setProperty('display','block','important');wrap.append(copy);staging.append(wrap);}else staging.append(copy);}
   await resources(d);if(version!==generation)return;
   const copies=sourceSnapshot.map((_,i)=>staging.children[i].matches('.op-source')?staging.children[i]:sourceSnapshot[i].parent?staging.children[i].firstElementChild:staging.children[i]);
   const output=d.createElement('div');output.id='optimalPages';d.body.append(output);
   const sourceStats=[];
   for(const source of copies){source.style.setProperty('display','block','important');source.style.setProperty('width',profile.width-profile.left-profile.right+'mm','important');sourceStats.push(compose(d,source,output,profile));}
   staging.remove();
   const pages=Array.from(output.querySelectorAll('.op-page'));
   pages.forEach((page,i)=>page.querySelector('.op-number').textContent=`${i+1} / ${pages.length}`);
   if(!pages.length)throw Error('No hay páginas para imprimir.');
   for(const page of pages){const flow=page.querySelector('.op-body');if(flow.scrollHeight>flow.clientHeight+2||page.scrollHeight>page.clientHeight+2||page.scrollWidth>page.clientWidth+2)throw Error('El contenido excede el área útil. Amplía el papel o revisa los textos y márgenes.');}
   for(const page of pages){for(const [key,selector]of [['header','.op-header'],['body','.op-body'],['closing','.op-closing']])page.style.setProperty('--op-'+key+'-height',page.querySelector(selector).getBoundingClientRect().height+'px');}
   if(version!==generation)return;
   dialog.dataset.ready='true';dialog.querySelector('[data-op=print]').disabled=false;
   const warnings=sourceStats.flatMap(s=>s.warnings);
   status.textContent=`${pages.length} página(s) · ${profile.paper} · ${P.version}. Firmas y contenido comprobados.${warnings.length?' '+warnings.join(' '):''} Imprime al 100 %, con papel coincidente y sin encabezados/pies del navegador.`;
   window.OptimalPrint.lastResult={pages:pages.length,profile:{...profile},stats:sourceStats,version:P.version};
  }catch(error){if(version===generation)fail(error);}
 }
 // Keep measured regions fixed in print; native flex pagination must not move the closing.
 // One pixel of clearance absorbs physical-paper rounding without scaling the document.
 function layoutCSS(p){return `
 @font-face{font-family:'Myriad Pro';src:local('Myriad Pro'),local('MyriadPro-Regular');font-weight:400}
 @font-face{font-family:'Myriad Pro';src:local('Myriad Pro Bold'),local('MyriadPro-Bold');font-weight:700}
 @page { size:${p.width}mm ${p.height}mm; margin:${p.top}mm ${p.right}mm ${p.bottom}mm ${p.left}mm; }
 html,body{margin:0!important;padding:0!important;background:#e8edf2!important;min-width:0!important;min-height:0!important;height:auto!important;width:auto!important;color:#172c39}
 .op-staging{position:absolute;left:-20000px;width:${p.width-p.left-p.right}mm}
 #optimalPages{display:block!important;margin:0!important;padding:0!important}
 #optimalPages .op-page{page:auto!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;width:${p.width}mm!important;height:${p.height}mm!important;min-height:${p.height}mm!important;max-height:${p.height}mm!important;margin:0 auto 16px!important;padding:${p.top}mm calc(${p.right}mm + 1px) calc(${p.bottom}mm + 1px) ${p.left}mm!important;background:#fff!important;overflow:visible!important;break-after:page!important;font-family:${p.fontFamily},Arial,sans-serif!important;font-size:${p.font}pt!important;line-height:${p.lineHeight}!important;position:relative!important;transform:none!important;border:0!important;box-shadow:0 2px 8px #0002}
 #optimalPages .op-page:last-child{break-after:auto!important}
 .op-header{flex:0 0 auto!important;display:block!important;margin:0!important}
 .op-body{display:flow-root!important;flex:1 1 auto!important;min-height:0!important;overflow:visible!important;width:100%!important}
 .op-body>*,.op-header>*{flex-shrink:0!important;max-width:100%;box-sizing:border-box}
 #optimalPages .op-closing{display:block!important;flex:0 0 auto!important;padding:0!important;margin:0!important;break-inside:avoid!important}
 #optimalPages .op-signatures{display:flex!important;justify-content:space-around!important;gap:10mm!important;margin:${p.signatureSpace}mm 0 0!important;padding:0!important;min-height:0!important;break-inside:avoid!important;width:100%!important}
 #optimalPages .op-signatures>*{flex:1;min-width:0;text-align:center;overflow-wrap:anywhere}
 #optimalPages .op-signatures>span{border-top:1px solid #49677c;padding-top:3mm}
 #optimalPages .op-signatures>[hidden]{display:none!important}
 #optimalPages .op-signatures :is(b,strong,small){font-size:${p.noteFont}pt!important}
 #optimalPages .op-number{display:${p.pageNumbers?'block':'none'}!important;text-align:right;font:8pt Arial!important;color:#52697b;border-top:1px solid #d5dce4;margin-top:3mm;padding-top:1mm;height:auto;min-height:4mm;line-height:1.2!important;box-sizing:border-box}
 #optimalPages table{width:100%!important;border-collapse:collapse!important;table-layout:auto!important;font-size:${p.tableFont}pt!important}
 #optimalPages :is(th,td){font-size:${p.tableFont}pt!important;overflow-wrap:anywhere;position:static!important}
 #optimalPages :is(.print-terms,.gdoc-note,.document-print-note){font-size:${p.noteFont}pt!important}
 #optimalPages p{overflow-wrap:anywhere;line-height:${p.lineHeight}!important}
 #optimalPages .op-page *{font-family:${p.fontFamily},Arial,sans-serif!important}
 #optimalPages .op-body :is(p,li,dd,dt,label){font-size:${p.font}pt!important;line-height:${p.lineHeight}!important}
 #optimalPages .op-body :is(table,th,td,th p,td p){font-size:${p.tableFont}pt!important}
 #optimalPages .op-body :is(.print-terms,.gdoc-note,.document-print-note){font-size:${p.noteFont}pt!important}
 #optimalPages .op-body dt{font-size:${p.noteFont}pt!important}
 #optimalPages [hidden]{display:none!important}
 #optimalPages .op-page :is(.gdoc-flow,.gdoc-page-bottom){display:contents!important}
 @media print{html,body{background:white!important}.op-staging{display:none!important}#optimalPages .op-page{display:block!important;break-inside:avoid!important;margin:0!important;box-shadow:none!important;width:calc(${p.width-p.left-p.right}mm - 1px)!important;height:calc(${p.height-p.top-p.bottom}mm - 1px)!important;min-height:calc(${p.height-p.top-p.bottom}mm - 1px)!important;max-height:calc(${p.height-p.top-p.bottom}mm - 1px)!important;padding:0!important}
 #optimalPages .op-header{position:absolute!important;top:0!important;left:0!important;right:0!important;height:var(--op-header-height)!important}
 #optimalPages .op-body{position:absolute!important;top:var(--op-header-height)!important;left:0!important;right:0!important;height:var(--op-body-height)!important}
 #optimalPages .op-closing{position:absolute!important;top:calc(var(--op-header-height) + var(--op-body-height))!important;left:0!important;right:0!important;height:var(--op-closing-height)!important}
 }
 `;}
 function compose(d,source,output,p){
  const header=source.querySelector(':scope > header');
  const sigs=Array.from(source.querySelectorAll(signatures)).filter(n=>!n.closest('[hidden]'));
  const footers=Array.from(source.querySelectorAll('footer')).filter(n=>!header?.contains(n));
  const closing=d.createElement('div');closing.className='op-closing';
  for(const sig of sigs){const clone=sig.cloneNode(true);clone.classList.add('op-signatures');closing.append(clone);sig.remove();}
  for(const footer of footers){const copy=footer.cloneNode(true);for(const span of copy.querySelectorAll('span'))if(/^\d+\s*\/\s*\d+$/.test(span.textContent.trim()))span.remove();closing.append(copy);footer.remove();}
  header?.remove();
  // Existing generated-document wrappers must not impose fixed body heights.
  for(const wrap of source.querySelectorAll('.gdoc-flow,.gdoc-page-bottom'))wrap.replaceWith(...wrap.childNodes);
  let page,body;
  const result={rows:0,pages:0,warnings:[]};
  function newPage(){
   page=d.createElement('article');page.className=source.className+' op-page';
   const head=d.createElement('div');head.className='op-header';if(header&&(p.repeatHeader||result.pages===0))head.append(header.cloneNode(true));
   body=d.createElement('main');body.className='op-body';
   const end=d.createElement('div');end.className='op-closing';
   for(const child of closing.children){const reserve=child.cloneNode(true);reserve.dataset.opReserve='';reserve.style.visibility='hidden';end.append(reserve);}
   const number=d.createElement('div');number.className='op-number';number.textContent='1 / 1';end.append(number);
   page.append(head,body,end);output.append(page);result.pages++;return page;
  }
  newPage();
  const fits=()=>body.scrollHeight<=body.clientHeight+1;
  function continuePage(){const last=body.lastElementChild;const heading=last&&(last.matches('h1,h2,h3')||last.children.length===1&&last.firstElementChild.matches('h1,h2,h3'))?last:null;if(heading){if(body.children.length===1)throw Error('El título y el siguiente bloque no caben juntos. Amplía el área útil.');heading.remove();}newPage();if(heading)body.append(heading);}
  function add(node){body.append(node);if(!fits()){node.remove();if(!body.children.length)throw Error('Un bloque no cabe en el área útil. Revisa el perfil o divide su contenido.');continuePage();body.append(node);if(!fits())throw Error('Un bloque es demasiado alto para esta página.');}}
  function splitBlocks(node){
   const tables=node.querySelectorAll('table');
   if(!tables.length||node.matches('table'))return [node];
   const parts=[];
   for(const child of node.childNodes){if(child.nodeType===3){if(child.textContent.trim()){const wrapper=node.cloneNode(false);wrapper.append(child.cloneNode(true));parts.push(wrapper);}continue;}if(child.nodeType!==1||child.hidden)continue;for(const part of splitBlocks(child)){const wrapper=node.cloneNode(false);wrapper.append(part.cloneNode(true));parts.push(wrapper);}}
   return parts;
  }
  const visible=Array.from(source.children).filter(n=>!n.hidden&&d.defaultView.getComputedStyle(n).display!=='none').flatMap(splitBlocks);
  for(const node of visible){
   const table=node.matches('table')?node:node.querySelector('table');
   if(table&&table.tBodies.length===1&&table.tBodies[0].rows.length){
    const allRows=Array.from(table.tBodies[0].rows);result.rows+=allRows.length;
    let wrapper,tbody;
    function tableFragment(){wrapper=node.cloneNode(true);const t=wrapper.matches('table')?wrapper:wrapper.querySelector('table');t.tFoot?.remove();tbody=t.tBodies[0];tbody.replaceChildren();body.append(wrapper);}
    tableFragment();
    for(const row of allRows){const copy=row.cloneNode(true);tbody.append(copy);if(!fits()){copy.remove();if(!tbody.rows.length)wrapper.remove();if(!body.children.length)throw Error('El encabezado y una fila exceden la página.');continuePage();tableFragment();tbody.append(copy);if(!fits())throw Error('Una fila es demasiado alta para el papel seleccionado.');}}
    if(table.tFoot){const t=wrapper.matches('table')?wrapper:wrapper.querySelector('table');t.append(table.tFoot.cloneNode(true));if(!fits()){const last=tbody.lastElementChild;last.remove();t.tFoot.remove();if(!tbody.rows.length)wrapper.remove();newPage();tableFragment();tbody.append(last);(wrapper.matches('table')?wrapper:wrapper.querySelector('table')).append(table.tFoot.cloneNode(true));if(!fits())throw Error('El total y la última fila exceden la página.');}}
   }else add(node.cloneNode(true));
  }
  // Reserve the measured closing while paginating; reveal it only on this document's last page.
  for(const child of page.querySelectorAll('[data-op-reserve]'))child.style.visibility='visible';
  for(const n of output.querySelectorAll('[id]'))n.removeAttribute('id');
  return result;
 }
 async function open(){
  target=document.body.dataset.printTarget||'motorcycle-quote';
  if(/promissory|notarial/.test(target)){nativePrint();return;}
  let selector=map[target];if(target.startsWith('document-'))selector=`#documentPrint-${CSS.escape(target.slice(9))} .document-print-sheet`;
  if(target==='motorcycle-quote')selector='.quotation-sheet,.quote-sheet,.sheet';
  const nodes=selector?Array.from(document.querySelectorAll(selector)):[];
  setup();dialog.dataset.ready='false';if(!dialog.open)dialog.showModal();
  if(!nodes.length){fail(Error('No se encontró el formato de este documento. No se enviará una impresión incompleta.'));return;}
  sourceSnapshot=snapshot(nodes);
  if(target==='gestion-documental'){
   const schedule=sourceSnapshot.filter(item=>item.node.dataset.document==='amortization');
   if(schedule.length>1){const first=schedule[0].node;const tbody=first.querySelector('tbody');for(const item of schedule.slice(1))for(const row of item.node.querySelectorAll('tbody tr'))tbody.append(row.cloneNode(true));const sig=schedule.at(-1).node.querySelector(signatures);if(sig&&!first.querySelector(signatures))first.querySelector('.gdoc-page-bottom').prepend(sig.cloneNode(true));sourceSnapshot=sourceSnapshot.filter(item=>item===schedule[0]||!schedule.includes(item));}
  }
  fill(load());await rebuild();
 }
 window.OptimalPrint={open,rebuild,version:P.version,get profile(){return profile;},lastResult:null};
 window.print=()=>{open().catch(error=>{setup();if(!dialog.open)dialog.showModal();fail(error);});};
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'){
  event.preventDefault();
  if(dialog?.open){printPrepared();return;}
  const workspace=document.body.dataset.workspace;
  const buttons={quote:'#sidebarPlanBtn',application:'#printApplicationBtn',evaluation:'#printEvaluationBtn',delivery:'#printDeliveryBtn',collection:'#printCollectionBtn',preapplication:'#printPreApplicationBtn','document-management':'[data-gdoc-action=print]'};
  const button=document.querySelector(buttons[workspace]||(workspace?'#documentWorkspace-'+CSS.escape(workspace)+' [data-print]':'#printQuote'));
  if(button)button.click();else window.print();
 }});
})();
