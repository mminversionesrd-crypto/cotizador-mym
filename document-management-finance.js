(function(root){
 'use strict';
 function calculate(d){
  const C=root.DocumentManagementCore,f=d.finance,principal=C.amounts(d).principal;
  if(!Number.isFinite(principal)||principal<=0||!Number.isInteger(Number(f.term))||f.term<1||f.term>60||!Number.isFinite(Number(f.rate))||f.rate<0)throw Error('Completa monto, plazo y tasa para calcular.');
  if(!RATE_TYPES[f.rateType]||!['monthly','biweekly','weekly','single'].includes(f.frequency))throw Error('Revisa el método y la frecuencia.');
  const single=f.frequency==='single',freq=single?{divisor:1}:FREQUENCIES[f.frequency];
  // Mismo motor, conversión de tasa y calendario usados por el cotizador.
  const monthly=RATE_TYPES[f.rateType].monthlyRate(Number(f.rate)/100);
  const periodRate=single?(f.rateType==='simple'?monthly*Number(f.term):(1+monthly)**Number(f.term)-1):monthly;
  const result=calculatePlan(principal,single?1:Number(f.term),freq,RATE_TYPES[f.rateType],periodRate);
  if(!Number.isFinite(result.total)||!Number.isFinite(result.interest))throw Error('Los importes exceden el límite de cálculo. Revisa monto, tasa y plazo.');
  let remaining=Math.round(principal*100),interestLeft=Math.round(result.interest*100);
  const rows=result.rows.map((row,i)=>{const last=i===result.rows.length-1;const capital=last?remaining:Math.min(remaining,Math.round(row.principal*100));const interest=last?interestLeft:Math.min(interestLeft,Math.round(row.interest*100));remaining-=capital;interestLeft-=interest;return {...row,principal:capital/100,interest:interest/100,payment:(capital+interest)/100,balance:remaining/100,dueDate:f.frequency==='single'?f.firstDate:paymentDate(f.firstDate,i,f.frequency)};});
  return {...result,principal:C.round(principal),interest:C.round(result.interest),total:C.round(principal+result.interest),payment:rows[0]?.payment||0,rows};
 }
 root.DocumentManagementFinance={calculate};
})(window);
