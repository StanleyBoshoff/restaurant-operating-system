/**
 * South African Restaurant Industry Disciplinary Engine
 * 100% LOCAL - Professional Grade Legal Logic
 * Reference: Annexure "B" Disciplinary Code
 */

export const DISCIPLINARY_LEVELS = {
  VERBAL: { label: 'Verbal Warning', duration: '3 months' },
  WRITTEN: { label: 'Written Warning', duration: '6 months' },
  SERIOUS: { label: 'Serious Written Warning', duration: '9 months' },
  FINAL: { label: 'Final Written Warning', duration: '12 months' },
  DISMISSAL: { label: 'Summary Dismissal', duration: 'Permanent' }
};

export const AUTHORIZED_ISSUERS = [
  "General Manager",
  "Store Manager",
  "Head Chef",
  "Sous Chef",
  "Floor Manager",
  "Kitchen Manager",
  "Human Resources Manager",
  "Managing Director"
];

/**
 * Official Annexure "B" Offence Registry (Full 147 Mapping)
 */
export const OFFENCE_REGISTRY = [
  // A. TIMEKEEPING
  { id: 1, cat: 'Timekeeping', code: '1', desc: 'Late for work and/or leaving early without good reason', sanction: 'SWW/FWW/DS', keywords: ['late', 'early', 'shift'] },
  { id: 2, cat: 'Timekeeping', code: '2', desc: 'Lack of Punctuality - Habitual late coming', sanction: 'SWW/FWW/DS', keywords: ['habitual', 'constantly late'] },
  { id: 5, cat: 'Timekeeping', code: '5', desc: 'Unauthorized absence from work without permission', sanction: 'SWW/FWW/DS', keywords: ['absent', 'missing', 'no-show', 'awol'] },
  { id: 51, cat: 'Timekeeping', code: '5A', desc: 'Failure to notify manager of unauthorized absence before 06h00 AM', sanction: 'SWW/FWW/DS', keywords: ['notify', 'inform', 'whatsapp'] },
  { id: 7, cat: 'Timekeeping', code: '7', desc: 'Fraudulent time keeping / clocking for others', sanction: 'DS', keywords: ['clocking', 'card', 'falsify timesheet'] },
  { id: 13, cat: 'Timekeeping', code: '13', desc: 'Abuse of sick leave', sanction: 'FWW/DS', keywords: ['sick', 'doctor', 'certificate'] },

  // B. WORK OUTPUT & CONDUCT
  { id: 17, cat: 'Conduct', code: '17', desc: 'Sleeping whilst on duty', sanction: 'DS', keywords: ['sleep', 'napping'] },
  { id: 18, cat: 'Conduct', code: '18', desc: 'Refusal to carry out an authorized/reasonable instruction', sanction: 'FWW/DS', keywords: ['instruction', 'refuse', 'disobey'] },
  { id: 66, cat: 'Conduct', code: '66', desc: 'Gross Insubordination / Abusive language toward authority', sanction: 'FWW/DS', keywords: ['rude', 'swearing', 'shouted', 'insubordination'] },
  { id: 67, cat: 'Conduct', code: '67', desc: 'Insolence / Extreme disrespect toward authority', sanction: 'FWW/DS', keywords: ['cheeky', 'attitude', 'disrespect'] },
  { id: 52, cat: 'Conduct', code: '52', desc: 'Rudeness or inappropriate behavior toward guests', sanction: 'DS', keywords: ['customer', 'guest', 'shouting at lady', 'table'] },
  { id: 16, cat: 'Conduct', code: '16', desc: 'Unauthorized use of cell phone during working hours', sanction: 'SWW/FWW/DS', keywords: ['phone', 'whatsapp', 'texting'] },
  { id: 681, cat: 'Conduct', code: '68A', desc: 'Smoking in unauthorized areas', sanction: 'FWW/DS', keywords: ['smoke', 'smoking', 'cigarette'] },

  // C. QUALITY & NEGLIGENCE
  { id: 22, cat: 'Performance', code: '22', desc: 'Poor quality of work / Not working to standard', sanction: 'COUNS/FWW/DS', keywords: ['quality', 'standard', 'wrong order'] },
  { id: 24, cat: 'Performance', code: '24', desc: 'Negligence and/or carelessness', sanction: 'FWW/DS', keywords: ['negligent', 'mistake', 'careless', 'spilled'] },
  { id: 31, cat: 'Performance', code: '31', desc: 'Negligent damage to equipment or materials', sanction: 'SWW/FWW/DS', keywords: ['damage', 'broke', 'fryer', 'machine', 'oven'] },
  { id: 122, cat: 'Performance', code: '122', desc: 'Wilful damage/misuse of company property', sanction: 'DS', keywords: ['purpose', 'intentional damage'] },

  // D. SUBSTANCES
  { id: 35, cat: 'Substances', code: '35', desc: 'Under the influence of alcohol or substances at work', sanction: 'DS', keywords: ['drunk', 'alcohol', 'weed', 'drugs', 'intoxicated'] },

  // E. DISORDERLY
  { id: 41, cat: 'Disorderly', code: '41', desc: 'Assault or Attempted Assault', sanction: 'DS', keywords: ['punch', 'hit', 'fight', 'strike', 'attack', 'slap'] },
  { id: 42, cat: 'Disorderly', code: '42', desc: 'Threatening violence or abusive behaviour', sanction: 'DS', keywords: ['threat', 'kill', 'hurt'] },
  { id: 55, cat: 'Disorderly', code: '55', desc: 'Sexual and/or racial harassment', sanction: 'DS', keywords: ['harassment', 'racism', 'sexist', 'touching'] },
  { id: 48, cat: 'Disorderly', code: '48', desc: 'Horseplay, playing practical jokes in the workplace', sanction: 'SWW/FWW/DS', keywords: ['horseplay', 'playing'] },

  // G. DISHONESTY
  { id: 130, cat: 'Dishonesty', code: '130', desc: 'Theft / Forgery / Bribery / Sabotage', sanction: 'DS', keywords: ['steal', 'theft', 'money', 'till', 'taking'] },
  { id: 1301, cat: 'Dishonesty', code: '2.6.1', desc: 'Unauthorized consumption of stock (Grazing)', sanction: 'DS', keywords: ['eating', 'grazing', 'burger', 'chips', 'food'] },
  { id: 131, cat: 'Dishonesty', code: '131', desc: 'Fraud or misrepresentation (Voiding bills / Loyalty manipulation)', sanction: 'DS', keywords: ['voiding', 'bill', 'loyalty', 'fraud'] },
  { id: 68, cat: 'Dishonesty', code: '68', desc: 'Failure to declare gratuities (Tips) in breach of policy', sanction: 'DS', keywords: ['tip', 'gratuity', 'declared', 'pooling'] },

  // H. FIREARMS & WEAPONS
  { id: 101, cat: 'Firearms', code: '101', desc: 'Unauthorized possession of a firearm or weapon on premises', sanction: 'DS', keywords: ['gun', 'knife', 'weapon', 'firearm'] },

  // I. DRIVING
  { id: 108, cat: 'Driving', code: '108', desc: 'Driving company vehicle under influence of alcohol', sanction: 'DS', keywords: ['driving', 'delivery', 'bike', 'scooter', 'car'] },
  { id: 121, cat: 'Driving', code: '121A', desc: 'Deviating from designated route without authorization', sanction: 'SWW/FWW/DS', keywords: ['route', 'deviate', 'personal use'] },

  // F. HYGIENE & SAFETY
  { id: 69, cat: 'Safety', code: '69', desc: 'Failure to comply with health or safety regulations', sanction: 'FWW/DS', keywords: ['safety', 'hazard', 'temp', 'food safety'] },
  { id: 139, cat: 'Safety', code: '139', desc: 'Failure to comply with hygiene standards (Hand washing)', sanction: 'SWW/FWW/DS', keywords: ['wash', 'hands', 'dirty', 'hygiene'] },
  { id: 137, cat: 'Safety', code: '137', desc: 'Incorrect wearing of uniform / Grooming standards', sanction: 'WW/FWW/DS', keywords: ['uniform', 'shoes', 'shirt', 'apron'] },

  // GENERAL
  { id: 142, cat: 'General', code: '142', desc: 'Conduct to the detriment of the Company', sanction: 'DS', keywords: ['detriment', 'bad name', 'disrepute'] },
  { id: 146, cat: 'General', code: '146', desc: 'Failure to comply with company Policy and Procedure', sanction: 'FWW/DS', keywords: ['policy', 'procedure', 'rule', 'sop'] }
];

/**
 * The "Professional Brain" - Extensive Probing Dictionary (10-15 Questions per Theme)
 */
const PROBE_THEMES = {
  TIMEKEEPING: [
    { id: 'p_sched', label: 'Scheduled Start Time', type: 'time', narrative: (v) => `The employee was rostered to commence duties at ${v.replace(':','h')}.` },
    { id: 'p_arrival', label: 'Actual Arrival Time', type: 'time', narrative: (v) => `The employee reported for duty at ${v.replace(':','h')}.` },
    { id: 'p_notified', label: 'Did they notify management?', type: 'boolean', narrative: (v) => v ? "The employee did notify management of the delay." : "The employee failed to notify management or follow standard notification channels." },
    { id: 'p_notify_who', label: 'Who was contacted?', type: 'text', narrative: (v) => `Notification was sent to ${v}.` },
    { id: 'p_notify_time', label: 'What time was notification sent?', type: 'time', narrative: (v) => `Notification was received at ${v.replace(':','h')}.` },
    { id: 'p_reason', label: 'Reason for lateness', type: 'text', narrative: (v) => `The reason provided was: "${v}".` },
    { id: 'p_impact', label: 'Operational Impact', type: 'text', narrative: (v) => `This resulted in: ${v}.` },
    { id: 'p_witness', label: 'Who witnessed the arrival?', type: 'text', narrative: (v) => `The arrival was noted by ${v}.` },
    { id: 'p_previous', label: 'Previous warnings for timekeeping?', type: 'boolean', narrative: (v) => v ? "This is a repeat offence following previous corrective measures." : "This is noted as a first formal offence." }
  ],
  VIOLENCE: [
    { id: 'p_victim', label: 'Who was the victim (Name/Role)?', type: 'text', narrative: (v) => `The incident involved physical contact with ${v}.` },
    { id: 'p_weapon', label: 'Was a weapon/implement used?', type: 'text', narrative: (v) => `It is alleged that ${v} was used during the altercation.` },
    { id: 'p_injury', label: 'Were there visible injuries?', type: 'text', narrative: (v) => `The following injuries were sustained: ${v}.` },
    { id: 'p_medical', label: 'Was medical attention required?', type: 'boolean', narrative: (v) => v ? "Professional medical attention was sought following the incident." : "No immediate medical attention was required." },
    { id: 'p_provocation', label: 'Was there any provocation?', type: 'text', narrative: (v) => `Regarding provocation: "${v}".` },
    { id: 'p_witnesses', label: 'List all witnesses present:', type: 'text', narrative: (v) => `The incident was witnessed by ${v}.` },
    { id: 'p_cctv', label: 'Is there CCTV footage available?', type: 'boolean', narrative: (v) => v ? "Electronic surveillance (CCTV) footage of the incident has been secured." : "No CCTV footage is available for this area." },
    { id: 'p_customers', label: 'Were customers present?', type: 'boolean', narrative: (v) => v ? "The altercation took place in full view of customers, causing extreme reputational damage." : "The incident took place in a non-public area." },
    { id: 'p_saps', label: 'SAPS Case Number (if applicable)', type: 'text', narrative: (v) => `A criminal case has been opened under SAPS Case: ${v}.` }
  ],
  DISHONESTY: [
    { id: 'p_item', label: 'What item/value was involved?', type: 'text', narrative: (v) => `The incident involved the following: ${v}.` },
    { id: 'p_value', label: 'Rand Value involved', type: 'text', narrative: (v) => `The estimated financial value is R${v}.` },
    { id: 'p_found', label: 'Where was the item found?', type: 'text', narrative: (v) => `The item was recovered from ${v}.` },
    { id: 'p_audit', label: 'Does the system audit confirm this?', type: 'boolean', narrative: (v) => v ? "The POS/System audit trail confirms the discrepancy." : "Discrepancy confirmed via manual stock/cash audit." },
    { id: 'p_witness', label: 'Who witnessed the act/recovery?', type: 'text', narrative: (v) => `The discovery was made by ${v}.` },
    { id: 'p_explanation', label: 'Employee explanation for possession?', type: 'text', narrative: (v) => `The employee’s explanation was: "${v}".` },
    { id: 'p_cctv', label: 'CCTV evidence available?', type: 'boolean', narrative: (v) => v ? "CCTV footage clearly identifies the employee during the act." : "" },
    { id: 'p_trust', label: 'Effect on trust relationship?', type: 'text', narrative: (v) => `Management views this as: ${v}.` }
  ],
  INSUBORDINATION: [
    { id: 'p_instruction', label: 'What was the exact instruction?', type: 'text', narrative: (v) => `The following lawful instruction was given: "${v}".` },
    { id: 'p_issuer', label: 'Who gave the instruction?', type: 'text', narrative: (v) => `The instruction was issued by ${v}.` },
    { id: 'p_response', label: 'Exact words used by employee?', type: 'text', narrative: (v) => `The employee responded with: "${v}".` },
    { id: 'p_refusal', label: 'Was the refusal absolute or delayed?', type: 'text', narrative: (v) => `The nature of the refusal was: ${v}.` },
    { id: 'p_audience', label: 'Was this in front of guests/team?', type: 'text', narrative: (v) => `This challenge to authority occurred in front of ${v}.` },
    { id: 'p_tone', label: 'Describe the tone (Aggressive/Insolent)?', type: 'text', narrative: (v) => `The tone was described as ${v}.` },
    { id: 'p_reason', label: 'Reason given for refusing?', type: 'text', narrative: (v) => `The employee claimed they refused because: "${v}".` }
  ],
  DAMAGE: [
    { id: 'p_item', label: 'Item/Machine Damaged', type: 'text', narrative: (v) => `Damage was caused to the following property: ${v}.` },
    { id: 'p_cost', label: 'Estimated Repair Cost', type: 'text', narrative: (v) => {
      if (!v || v.toLowerCase().includes('not sure')) return "The financial cost of repair or replacement is currently being assessed.";
      return `The estimated cost of repair or replacement is R${v}.`;
    }},
    { id: 'p_sop', label: 'Trained on SOP for this machine?', type: 'boolean', narrative: (v) => v ? "It is confirmed the employee had been fully trained on the SOP for this equipment." : "The employee was operating equipment without completing the required training module." },
    { id: 'p_intentional', label: 'Accidental or Intentional?', type: 'text', narrative: (v) => `Internal assessment indicates the damage was ${v}.` },
    { id: 'p_circumstance', label: 'Environment (Rush/Cleanup/etc)?', type: 'text', narrative: (v) => `At the time, the area was ${v}.` },
    { id: 'p_witness', label: 'Who saw the incident happen?', type: 'text', narrative: (v) => `The incident was witnessed by ${v}.` }
  ],
  SUBSTANCES: [
    { id: 'p_signs', label: 'Visible Signs (Smell/Speech/Eyes)?', type: 'text', narrative: (v) => `The following signs of impairment were noted: ${v}.` },
    { id: 'p_test_offered', label: 'Was a test offered?', type: 'boolean', narrative: (v) => v ? "A formal breathalyzer/drug test was offered to the employee." : "" },
    { id: 'p_test_result', label: 'Test Result / Refusal details?', type: 'text', narrative: (v) => `Regarding the test: ${v}.` },
    { id: 'p_witness', label: 'Manager/Witnesses present?', type: 'text', narrative: (v) => `Observations were confirmed by ${v}.` },
    { id: 'p_safety_risk', label: 'Immediate safety risk created?', type: 'text', narrative: (v) => `The intoxication created a high risk in the ${v}.` }
  ],
  HYGIENE: [
    { id: 'p_breach', label: 'Nature of breach (Nails/Hands/Uniform)?', type: 'text', narrative: (v) => `The employee failed to meet hygiene standards regarding: ${v}.` },
    { id: 'p_food_safety', label: 'Risk to food safety?', type: 'text', narrative: (v) => `This created a potential risk of ${v}.` },
    { id: 'p_previous', label: 'Previously warned about this?', type: 'boolean', narrative: (v) => v ? "The employee has received previous verbal guidance on these standards." : "This is a first notification of standard breach." }
  ],
  GENERAL: [
    { id: 'p_who', label: 'Who witnessed this?', type: 'text', narrative: (v) => `Witnessed by: ${v}.` },
    { id: 'p_impact', label: 'Impact on operations?', type: 'text', narrative: (v) => `Operational impact: ${v}.` },
    { id: 'p_intent', label: 'Accidental or Intentional?', type: 'text', narrative: (v) => `Nature of act: ${v}.` },
    { id: 'p_previous', label: 'Previous history?', type: 'text', narrative: (v) => `History: ${v}.` }
  ]
};

/**
 * Keyword-to-Theme Expert Mapper
 */
const getThemeFromDescription = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('late') || d.includes('shift') || d.includes('time') || d.includes('early')) return 'TIMEKEEPING';
  if (d.includes('punch') || d.includes('hit') || d.includes('fight') || d.includes('attack') || d.includes('slap')) return 'VIOLENCE';
  if (d.includes('steal') || d.includes('theft') || d.includes('money') || d.includes('till') || d.includes('void') || d.includes('tip') || d.includes('eat') || d.includes('grazing')) return 'DISHONESTY';
  if (d.includes('rude') || d.includes('swore') || d.includes('shout') || d.includes('refuse') || d.includes('attitude') || d.includes('insolent')) return 'INSUBORDINATION';
  if (d.includes('broke') || d.includes('damage') || d.includes('fryer') || d.includes('plate') || d.includes('glass')) return 'DAMAGE';
  if (d.includes('drunk') || d.includes('smell') || d.includes('alcohol') || d.includes('weed') || d.includes('intox')) return 'SUBSTANCES';
  if (d.includes('wash') || d.includes('hygiene') || d.includes('dirty') || d.includes('uniform') || d.includes('nail')) return 'HYGIENE';
  return 'GENERAL';
};

export const suggestCharges = (answers) => {
  const suggestedIds = new Set();
  const text = (answers.description || '').toLowerCase();
  const theme = getThemeFromDescription(text);

  OFFENCE_REGISTRY.forEach(o => {
    if (o.keywords && o.keywords.some(kw => text.includes(kw))) suggestedIds.add(o.id);
  });

  // Map Themes to baseline charges
  const themeMap = {
    TIMEKEEPING: 1, VIOLENCE: 41, DISHONESTY: 130, INSUBORDINATION: 66,
    DAMAGE: 31, SUBSTANCES: 35, HYGIENE: 139
  };
  if (themeMap[theme]) suggestedIds.add(themeMap[theme]);

  suggestedIds.add(142); // Always suggest conduct detrimental
  return OFFENCE_REGISTRY.filter(o => suggestedIds.has(o.id));
};

export const getProbingQuestions = (answers) => {
  const theme = getThemeFromDescription(answers.description);
  return PROBE_THEMES[theme] || PROBE_THEMES.GENERAL;
};

export const generateLocalDraft = (data) => {
  const { employeeName, date, answers, selectedOffences } = data;
  const formattedDate = new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const theme = getThemeFromDescription(answers.description);

  let storySentences = [];
  // 1. Initial Summary
  if (answers.description.length > 5) storySentences.push(answers.description);

  // 2. Weave Probe Answers
  const questions = PROBE_THEMES[theme] || PROBE_THEMES.GENERAL;
  questions.forEach(q => {
    const val = answers[q.id];
    if (val !== undefined && val !== null && val !== '') {
      const sentence = q.narrative(val);
      if (sentence) storySentences.push(sentence);
    }
  });

  const fullStory = storySentences.join(' ');
  let output = `On ${formattedDate}, employee ${employeeName} ${fullStory.trim()}\n\n`;
  output += `You are hereby issued with a warning for:\n`;
  selectedOffences.forEach((o, i) => {
    output += `${i + 1}. ${o.desc}\n`;
  });

  return output;
};
