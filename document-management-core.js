(function(root){
 'use strict';
 const COMPANY='VegaMotors y/o M&M Inversiones';
 const ADDRESS='calle José Cabrera, esquina Joaquín Gómez, Villa Rosa, La Vega';
 const STATUS={pending:'Pendiente',done:'Realizado',na:'No aplica'};
 const person=()=>({name:'',firstNames:'',lastNames:'',id:'',maritalStatus:'',occupation:'',address:'',sector:'',province:'',phone:''});
 const fullName=p=>[p?.firstNames,p?.lastNames].filter(v=>String(v||'').trim()).map(v=>String(v).trim()).join(' ')||String(p?.name||'').trim();
 const fullAddress=p=>[p?.address,p?.sector,p?.province].filter(v=>String(v||'').trim()).map(v=>String(v).trim()).join(', ');
 const checkDefinitions=[['application_debtor','Solicitud del deudor'],['authorization_debtor','Autorización de crédito del deudor'],['id_debtor','Cédula del deudor'],['application_codebtor','Solicitud del codeudor',true],['authorization_codebtor','Autorización de crédito del codeudor',true],['id_codebtor','Cédula del codeudor',true],['promissory','Pagaré de crédito (preparado aparte)'],['amortization','Tabla de amortización'],['invoice','Factura',false,true],['received','Recibido conforme',false,true],['warranty','Carta de garantía',false,true],['route','Carta de ruta',false,true],['sale_act','Acto de venta (preparado aparte)',false,true],['registration','Matrícula del vehículo',false,true]];
 function create(kind='loan',date=new Date().toLocaleDateString('en-CA')){
  if(!['loan','motorcycle'].includes(kind))throw Error('Producto documental desconocido.');
  return {version:1,kind,date,city:'La Vega',reference:'',officer:'',debtor:person(),hasCodebtor:false,codebtor:person(),finance:{principal:'',price:'',discount:0,down:0,rate:3,term:12,frequency:'monthly',rateType:'simple',firstDate:'',guaranteeType:'Personal',guarantee:''},vehicle:{type:'Motocicleta',brand:'',model:'',color:'',year:'',chassis:'',engine:'',plate:'Pendiente',registration:'Pendiente',insurance:'En trámite',condition:'new'},invoice:{number:'',clientNumber:'',taxRate:0,other:0},extras:{plate:false,registration:false,insurance:false,delivery:false,plateText:'Matrícula y placa no incluidas en el precio.',registrationText:'Matrícula no incluida en el precio.',insuranceText:'Seguro incluido.',deliveryText:'Los documentos de la motocicleta serán entregados en un término de 6 a 12 meses, dependiendo de la gestión de la DGII.'},routeSigner:'',routeRole:'Administrador',routePhone:'',notes:'',checks:{}};
 }
 const num=x=>x===''||x==null?0:Number(x);
 const round=x=>Math.round((x+Number.EPSILON)*100)/100;
 function amounts(d){const f=d.finance,i=d.invoice;const net=round(num(f.price)-num(f.discount)),tax=round(net*num(i.taxRate)/100),sale=round(net+tax+num(i.other));return {net,tax,sale,principal:d.kind==='motorcycle'?round(sale-num(f.down)):num(f.principal)};}
 function documents(d){const list=[{id:'authorization-debtor',label:'Autorización del deudor',person:'debtor'},{id:'amortization',label:'Tabla de amortización'},{id:'checklist',label:'Checklist de documentos'}];if(d.hasCodebtor)list.splice(1,0,{id:'authorization-codebtor',label:'Autorización del codeudor',person:'codebtor'});if(d.kind==='motorcycle')list.push(...[['invoice','Factura de venta'],['received','Recibido conforme'],['warranty','Carta de garantía'],['route','Carta de ruta']].map(([id,label])=>({id,label,person:'debtor'})));return list;}
 function checklist(d){return checkDefinitions.map(([id,label,codebtor=false,motorcycle=false])=>({id,label,codebtor,motorcycle,status:(codebtor&&!d.hasCodebtor)||(motorcycle&&d.kind!=='motorcycle')?'na':(STATUS[d.checks[id]]?d.checks[id]:'pending')}));}
 function isDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const x=new Date(s+'T12:00:00Z');return Number.isFinite(+x)&&x.toISOString().slice(0,10)===s;}
 function endDate(start,months){if(!isDate(start)||!Number.isInteger(Number(months))||Number(months)<1||Number(months)>60)return '';const [y,m,day]=start.split('-').map(Number);const date=new Date(Date.UTC(y,m-1+Number(months),1));date.setUTCDate(Math.min(day,new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate()));return date.toISOString().slice(0,10);}
 function validate(d){
  const e=[];if(!['loan','motorcycle'].includes(d.kind))e.push('Selecciona un producto válido.');
  if(!isDate(d.date))e.push('Indica una fecha de emisión válida.');if(!String(d.city||'').trim())e.push('Indica la ciudad de emisión.');if(!String(d.reference||'').trim())e.push('Indica la referencia de la gestión.');
  for(const [label,p] of [['deudor',d.debtor],...(d.hasCodebtor?[['codeudor',d.codebtor]]:[])]){for(const k of ['firstNames','lastNames','id','maritalStatus','occupation','address','sector','province','phone'])if(!String(p?.[k]||'').trim())e.push(`Completa ${ {firstNames:'nombres',lastNames:'apellidos',id:'cédula o pasaporte',maritalStatus:'estado civil',occupation:'ocupación',address:'dirección',sector:'sector',province:'provincia',phone:'teléfono'}[k]} del ${label}.`);if(p&&String(p.phone).replace(/\D/g,'').length<10)e.push(`Revisa el teléfono del ${label}.`);}
  if(d.hasCodebtor&&String(d.debtor.id).replace(/[\s-]/g,'')===String(d.codebtor.id).replace(/[\s-]/g,''))e.push('Deudor y codeudor deben tener una identificación distinta.');
  const f=d.finance;for(const key of ['rate','term',...(d.kind==='motorcycle'?['price','discount','down']:['principal'])])if(!Number.isFinite(Number(f[key]))||f[key]===''||num(f[key])<0)e.push(`Revisa el valor de ${key}.`);
  if(!(amounts(d).principal>0))e.push('El capital financiado debe ser mayor que cero; revisa precio, descuento e inicial.');
  if(!Number.isInteger(num(f.term))||num(f.term)<1||num(f.term)>60)e.push('El plazo debe ser de 1 a 60 meses enteros.');
  if(num(f.rate)>100)e.push('La tasa no puede superar 100%.');
  if(!['monthly','biweekly','weekly','single'].includes(f.frequency)||!['simple','monthly','effectiveAnnual','nominalAnnual'].includes(f.rateType))e.push('Selecciona frecuencia y método de interés válidos.');
  if(!isDate(f.firstDate)||f.firstDate<d.date)e.push('La primera cuota debe tener fecha válida igual o posterior a la emisión.');
  if(d.finance.frequency==='single'&&d.finance.firstDate!==endDate(d.date,Number(d.finance.term)))e.push('El vencimiento de cuota única debe coincidir con el final del plazo indicado.');
  if(d.kind==='motorcycle'){
   if(num(f.discount)>num(f.price))e.push('El descuento no puede superar el precio de venta.');
   for(const k of ['type','brand','model','color','year','chassis'])if(!String(d.vehicle[k]||'').trim())e.push('Completa los datos de la motocicleta: '+k+'.');
   if(!Number.isInteger(Number(d.vehicle.year))||num(d.vehicle.year)<1950||num(d.vehicle.year)>2100)e.push('Revisa el año de la motocicleta.');
   if(!['new','used'].includes(d.vehicle.condition))e.push('Selecciona la condición de la motocicleta.');
   if(!String(d.invoice.number||'').trim())e.push('Indica el número real de factura.');
   if(!String(d.routeSigner||'').trim()||!String(d.routePhone||'').trim())e.push('Completa el firmante y teléfono de la carta de ruta.');
   for(const key of ['taxRate','other'])if(!Number.isFinite(Number(d.invoice[key]))||num(d.invoice[key])<0)e.push('Revisa impuestos y otros cargos.');
   if(num(d.invoice.taxRate)>100)e.push('Revisa la tasa de impuesto.');
   for(const key of ['plate','registration','insurance','delivery'])if(d.extras[key]&&!String(d.extras[key+'Text']||'').trim())e.push('Escribe la condición seleccionada: '+key+'.');
  }
  const walk=(v,key='')=>{if(typeof v==='string'&&v.length>(/address|Text|guarantee|notes/i.test(key)?500:140))e.push('Texto demasiado largo en '+key+'.');else if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>walk(x,k));};walk(d);
  return [...new Set(e)];
 }
 function restore(input){if(!input||input.version!==1||!['loan','motorcycle'].includes(input.kind))throw Error('El archivo no corresponde a una gestión documental compatible.');const d=create(input.kind);for(const k of Object.keys(d)){if(['debtor','codebtor','finance','vehicle','invoice','extras','checks'].includes(k)){if(input[k]&&typeof input[k]==='object'&&!Array.isArray(input[k])){for(const key of (k==='checks'?checkDefinitions.map(x=>x[0]):Object.keys(d[k]))){const v=input[k][key];if(['string','number','boolean'].includes(typeof v)&&String(v).length<=1000)d[k][key]=v;}}}else if(typeof input[k]===typeof d[k]&&String(input[k]).length<=1000)d[k]=input[k];}for(const p of [d.debtor,d.codebtor])if(p.firstNames||p.lastNames)p.name=fullName(p);return d;}
 const api={COMPANY,ADDRESS,STATUS,fullName,fullAddress,create,amounts,documents,checklist,validate,restore,isDate,endDate,round};if(typeof module!=='undefined')module.exports=api;else root.DocumentManagementCore=api;
})(typeof window!=='undefined'?window:globalThis);
