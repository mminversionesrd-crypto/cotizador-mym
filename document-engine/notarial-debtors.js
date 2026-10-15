((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FinanNotarialDebtors = api;
})(typeof globalThis === 'object' ? globalThis : this, () => {
  const escape = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const upper = (value) => escape(String(value ?? '').toLocaleUpperCase('es-DO'));
  const isFemale = (person) => person.gender === 'female';
  const roleOf = (person) => isFemale(person) ? 'LA DEUDORA' : 'EL DEUDOR';
  const describe = (person) => {
    const female = isFemale(person);
    return `${female ? 'la señora' : 'el señor'} <strong>${upper(person.name)}</strong>, <strong>${upper(person.nationality)}</strong>, mayor de edad, <strong>${upper(person.civilStatus)}</strong>, <strong>${upper(person.occupation)}</strong>, identificad${female ? 'a' : 'o'} con la cédula de identidad y electoral marcada con el número <strong>${escape(person.id)}</strong>, domiciliad${female ? 'a' : 'o'} y residente en <strong>${upper(person.address)}</strong>`;
  };
  const composeDebtorParties = ({ principal, codebtor = null }) => {
    const role = roleOf(principal);
    if (!codebtor) return {
      appearance: `${describe(principal)}, quien en lo adelante se denominará <strong>${role}</strong>. Quien me ha <strong>DECLARADO LO SIGUIENTE:</strong>`,
      firstClause: `Que <strong>${role}</strong> declara y reconoce ser deudor${isFemale(principal) ? 'a' : ''} personal, pur${isFemale(principal) ? 'a' : 'o'}, simple y sin condición de ninguna especie a favor de <strong>EL ACREEDOR</strong>, por la suma de`,
      secondClause: `Que, para seguridad de los valores adeudados a <strong>EL ACREEDOR</strong>, <strong>${role}</strong> consiente suscribir el presente pagaré notarial a favor de la primera parte;`,
      thirdClause: `Que los valores que <strong>${role} RECONOCE ADEUDAR</strong> a <strong>EL ACREEDOR</strong> son productivos de un`,
      fourthClause: `Queda entendido, y así lo declara y acepta <strong>EL DEUDOR</strong>, que, en caso de incumplimiento en el pago de cualquier cuota`,
      fourthConsequence: `perderá de pleno derecho el beneficio del término, lo cual facultará a`,
      fifthClause: `Que, para seguridad de la suma adeudada, <strong>${role}</strong> compromete <strong>TODOS SUS BIENES UNIVERSALES HASTA LA TOTAL CANCELACIÓN DE LA DEUDA, RENUNCIANDO DESDE AHORA Y PARA SIEMPRE, DE MANERA FORMAL, DEFINITIVA Y EXPRESA, AL BENEFICIO DE EXCUSIÓN</strong>;`,
      signatures: [{ name: String(principal.name || '').toLocaleUpperCase('es-DO'), role: role.replace('LA ', '').replace('EL ', '') }]
    };
    const codebtorRole = isFemale(codebtor) ? 'CODEUDORA SOLIDARIA' : 'CODEUDOR SOLIDARIO';
    const bothFemale = isFemale(principal) && isFemale(codebtor);
    const groupRole = bothFemale ? 'LAS DEUDORAS' : 'LOS DEUDORES';
    return {
      appearance: `${describe(principal)}, quien comparece como <strong>DEUDOR${isFemale(principal) ? 'A' : ''} PRINCIPAL</strong>; y ${describe(codebtor)}, quien comparece como <strong>${codebtorRole}</strong>; ${bothFemale ? 'ambas serán denominadas' : 'ambos serán denominados'} en lo adelante <strong>${groupRole}</strong>. ${bothFemale ? 'Ambas' : 'Ambos'} me han <strong>DECLARADO LO SIGUIENTE:</strong>`,
      firstClause: `Que <strong>${groupRole}</strong> declaran y reconocen adeudar solidariamente a <strong>EL ACREEDOR</strong>, por la suma de`,
      solidarityClause: `${isFemale(codebtor) ? 'La codeudora' : 'El codeudor'} asume expresamente, junto con ${isFemale(principal) ? 'la deudora' : 'el deudor'} principal, la obligación solidaria de pagar el capital y los intereses pactados; el acreedor podrá reclamar a cualquiera de ${bothFemale ? 'las deudoras' : 'los deudores'} el saldo exigible, sin cobrar más de lo efectivamente adeudado;`,
      secondClause: `Que, para seguridad de los valores adeudados a <strong>EL ACREEDOR</strong>, <strong>${groupRole}</strong> consienten suscribir el presente pagaré notarial a favor de la primera parte;`,
      thirdClause: `Que los valores que <strong>${groupRole} RECONOCEN ADEUDAR</strong> a <strong>EL ACREEDOR</strong> son productivos de un`,
      fourthClause: `Queda entendido, y así lo declaran y aceptan <strong>${groupRole}</strong>, que, en caso de incumplimiento en el pago de cualquier cuota`,
      fourthConsequence: `perderán de pleno derecho el beneficio del término, lo cual facultará a`,
      fifthClause: `Que, para seguridad de la suma adeudada, <strong>${groupRole}</strong> comprometen <strong>SUS RESPECTIVOS BIENES HASTA LA TOTAL CANCELACIÓN DE LA DEUDA</strong>;`,
      signatures: [
        { name: String(principal.name || '').toLocaleUpperCase('es-DO'), role: `DEUDOR${isFemale(principal) ? 'A' : ''} PRINCIPAL` },
        { name: String(codebtor.name || '').toLocaleUpperCase('es-DO'), role: codebtorRole }
      ]
    };
  };
  return { composeDebtorParties };
});
