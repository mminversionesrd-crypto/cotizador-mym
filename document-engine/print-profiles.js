(function(root){
 'use strict';
 const defaults={paper:'Carta',width:215.9,height:279.4,orientation:'portrait',top:12.7,right:12.7,bottom:12.7,left:12.7,font:10,tableFont:9,noteFont:8,lineHeight:1.25,signatureSpace:25,fontFamily:'Arial',showLogos:true,repeatHeader:true,pageNumbers:true};
 const papers={Carta:[215.9,279.4],A4:[210,297],Legal:[215.9,355.6],Custom:null};
 function validate(value={}){
  const p={...defaults,...value};
  if(!Object.hasOwn(papers,p.paper))throw Error('Selecciona un tamaño de papel válido.');
  if(!['Arial','Georgia','Verdana','Myriad Pro'].includes(p.fontFamily))throw Error('Selecciona una tipografía admitida.');
  for(const k of ['showLogos','repeatHeader','pageNumbers']){if(![true,false,'true','false'].includes(p[k]))throw Error('Opción de formato inválida.');p[k]=p[k]===true||p[k]==='true';}
  for(const k of ['width','height','top','right','bottom','left','font','tableFont','noteFont','lineHeight','signatureSpace']){p[k]=Number(p[k]);if(!Number.isFinite(p[k]))throw Error('La configuración contiene medidas inválidas.');}
  if(papers[p.paper])[p.width,p.height]=papers[p.paper];
  if(!['portrait','landscape'].includes(p.orientation))throw Error('Orientación inválida.');
  if(p.orientation==='landscape'&&p.width<p.height)[p.width,p.height]=[p.height,p.width];
  if(p.orientation==='portrait'&&p.width>p.height)[p.width,p.height]=[p.height,p.width];
  if(p.width<80||p.height<100||p.width>600||p.height>600)throw Error('El papel debe medir entre 80 × 100 y 600 × 600 mm.');
  if(['top','right','bottom','left'].some(k=>p[k]<0)||p.width-p.left-p.right<65||p.height-p.top-p.bottom<80)throw Error('Los márgenes dejan un área útil insuficiente.');
  if(p.font<9||p.font>16||p.tableFont<8||p.tableFont>14||p.noteFont<8||p.noteFont>12||p.lineHeight<1||p.lineHeight>2||p.signatureSpace<15||p.signatureSpace>60)throw Error('Revisa los tamaños de texto, interlineado y espacio para firmar.');
  return p;
 }
 const api={defaults,papers,validate,storageKey:'mym-print-profile-v1',version:'20261104-optimal-6'};
 if(typeof module!=='undefined')module.exports=api;else root.PrintProfiles=api;
})(typeof window==='undefined'?globalThis:window);
