/**
 * South African Restaurant Industry Disciplinary Engine
 * 100% LOCAL - Industry Expert Logic
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
 * Official Annexure "B" Offence Registry (Comprehensive Mapping)
 */
export const OFFENCE_REGISTRY = [
  // --- Group: Timekeeping & Attendance ---
  { id: 1, cat: 'Timekeeping', code: '1', desc: 'Late for work and/or leaving work early', sanction: 'SWW/FWW/DS', keywords: ['late', 'early', 'shift'] },
  { id: 2, cat: 'Timekeeping', code: '2', desc: 'Habitual late coming / Lack of Punctuality', sanction: 'SWW/FWW/DS', keywords: ['habitual', 'constantly late'] },
  { id: 5, cat: 'Timekeeping', code: '5', desc: 'Unauthorized absence from work without permission', sanction: 'SWW/FWW/DS', keywords: ['absent', 'missing', 'no-show', 'awol'] },
  { id: 51, cat: 'Timekeeping', code: '5A', desc: 'Failure to notify manager of unauthorized absence before 06h00 AM', sanction: 'SWW/FWW/DS', keywords: ['notify', 'call', 'inform'] },
  { id: 7, cat: 'Timekeeping', code: '7', desc: 'Fraudulent time keeping / clocking for others', sanction: 'DS', keywords: ['clocking', 'fraud', 'cheat', 'card'] },
  { id: 8, cat: 'Timekeeping', code: '8', desc: 'Abscondment / Desertion (More than 5 consecutive days)', sanction: 'FWW/DS', keywords: ['desertion', 'abscond'] },
  { id: 13, cat: 'Timekeeping', code: '13', desc: 'Abuse of sick leave', sanction: 'FWW/DS', keywords: ['sick', 'doctor', 'certificate'] },

  // --- Group: Dishonesty & Theft ---
  { id: 130, cat: 'Dishonesty', code: '130', desc: 'Theft / Forgery / Bribery / Sabotage', sanction: 'DS', keywords: ['steal', 'theft', 'money', 'till', 'pocketing', 'taking'] },
  { id: 1301, cat: 'Dishonesty', code: '2.6.1', desc: 'Unauthorized consumption of stock (Grazing)', sanction: 'DS', keywords: ['eating', 'grazing', 'burger', 'chips', 'food', 'drink', 'beverage'] },
  { id: 131, cat: 'Dishonesty', code: '131', desc: 'Fraud or misrepresentation (Voiding bills / Fake loyalty)', sanction: 'DS', keywords: ['fraud', 'voiding', 'bill', 'loyalty', 'manipulation'] },
  { id: 68, cat: 'Dishonesty', code: '68', desc: 'Failure to declare gratuities (Tips) in breach of policy', sanction: 'DS', keywords: ['tip', 'gratuity', 'declared', 'pooling'] },
  { id: 132, cat: 'Dishonesty', code: '132', desc: 'Making a secret profit at the expense of the Company', sanction: 'DS', keywords: ['secret profit', 'selling', 'markup'] },
  { id: 133, cat: 'Dishonesty', code: '133', desc: 'Deliberately supplying incorrect or falsified information', sanction: 'DS', keywords: ['lie', 'falsify', 'incorrect info'] },

  // --- Group: Conduct & Insubordination ---
  { id: 17, cat: 'Conduct', code: '17', desc: 'Sleeping whilst on duty', sanction: 'DS', keywords: ['sleep', 'napping'] },
  { id: 18, cat: 'Conduct', code: '18', desc: 'Refusal to carry out an authorized/reasonable instruction', sanction: 'FWW/DS', keywords: ['instruction', 'refuse', 'refusal'] },
  { id: 66, cat: 'Conduct', code: '66', desc: 'Gross Insubordination / Abusive language toward authority', sanction: 'FWW/DS', keywords: ['rude', 'swearing', 'talk back', 'shouted', 'abusive'] },
  { id: 67, cat: 'Conduct', code: '67', desc: 'Insolence / Disrespectful behavior toward authority', sanction: 'FWW/DS', keywords: ['attitude', 'disrespect', 'cheeky'] },
  { id: 52, cat: 'Conduct', code: '52', desc: 'Rudeness or inappropriate behavior toward guests', sanction: 'DS', keywords: ['customer', 'guest', 'lady', 'arguing'] },
  { id: 16, cat: 'Conduct', code: '16', desc: 'Private cell phone calls/texting during working hours', sanction: 'SWW/FWW/DS', keywords: ['phone', 'whatsapp', 'texting', 'cellphone'] },
  { id: 681, cat: 'Conduct', code: '68A', desc: 'Smoking in unauthorized areas', sanction: 'FWW/DS', keywords: ['smoke', 'smoking', 'cigarette'] },
  { id: 140, cat: 'Conduct', code: '140', desc: 'Bringing unauthorized visitors onto company property', sanction: 'FWW/DS', keywords: ['visitor', 'friends', 'guests at back'] },

  // --- Group: Quality & Negligence ---
  { id: 22, cat: 'Performance', code: '22', desc: 'Poor quality of work / Not working to standard', sanction: 'COUNS/FWW/DS', keywords: ['quality', 'standard', 'wrong order', 'cold food'] },
  { id: 24, cat: 'Performance', code: '24', desc: 'Negligence and/or carelessness', sanction: 'FWW/DS', keywords: ['negligent', 'mistake', 'careless', 'spilled'] },
  { id: 25, cat: 'Performance', code: '25', desc: 'Gross negligence', sanction: 'DS', keywords: ['huge error', 'catastrophic'] },
  { id: 31, cat: 'Performance', code: '31', desc: 'Negligent damage to equipment or materials', sanction: 'SWW/FWW/DS', keywords: ['damage', 'broke', 'fryer', 'plate', 'machine', 'oven', 'glass'] },
  { id: 122, cat: 'Performance', code: '122', desc: 'Wilful damage/misuse of company property', sanction: 'DS', keywords: ['purpose', 'intentional damage', 'vandalism'] },

  // --- Group: Hygiene & Safety ---
  { id: 69, cat: 'Safety', code: '69', desc: 'Failure to comply with health or safety regulations', sanction: 'FWW/DS', keywords: ['safety', 'hazard', 'temp', 'food safety', 'cross contamination'] },
  { id: 139, cat: 'Safety', code: '139', desc: 'Failure to comply with hygiene standards (Hand washing)', sanction: 'SWW/FWW/DS', keywords: ['wash', 'hands', 'dirty', 'hygiene', 'nails', 'hair'] },
  { id: 137, cat: 'Safety', code: '137', desc: 'Incorrect wearing of uniform / Grooming', sanction: 'WW/FWW/DS', keywords: ['uniform', 'shoes', 'shirt', 'hat', 'apron'] },
  { id: 74, cat: 'Safety', code: '74', desc: 'Expectorating (spitting) on company premises', sanction: 'WW/SWW/FWW/DS', keywords: ['spit', 'spitting'] },
  { id: 75, cat: 'Safety', code: '75', desc: 'Littering on company premises', sanction: 'WW/SWW/FWW/DS', keywords: ['litter', 'trash', 'mess'] },
  { id: 77, cat: 'Safety', code: '77', desc: 'Failure to report injury on duty', sanction: 'FWW/DS', keywords: ['injury', 'cut', 'burn', 'iod'] },

  // --- Group: Substances ---
  { id: 35, cat: 'Substances', code: '35', desc: 'Under the influence of alcohol or substances at work', sanction: 'DS', keywords: ['drunk', 'influence', 'weed', 'drugs', 'alcohol', 'smelling'] },

  // --- Group: Disorderly Behaviour ---
  { id: 41, cat: 'Disorderly', code: '41', desc: 'Assault or Attempted Assault', sanction: 'DS', keywords: ['punch', 'hit', 'fight', 'strike', 'attack', 'slap', 'shove'] },
  { id: 42, cat: 'Disorderly', code: '42', desc: 'Threatening violence or abusive behaviour', sanction: 'DS', keywords: ['threat', 'kill', 'hurt'] },
  { id: 55, cat: 'Disorderly', code: '55', desc: 'Sexual and/or racial harassment', sanction: 'DS', keywords: ['harassment', 'racism', 'sexist', 'slur', 'touching'] },
  { id: 48, cat: 'Disorderly', code: '48', desc: 'Horseplay, playing practical jokes', sanction: 'SWW/FWW/DS', keywords: ['horseplay', 'running', 'playing'] },
  { id: 143, cat: 'Disorderly', code: '143', desc: 'Gambling or wagering on company premises', sanction: 'FWW/DS', keywords: ['gamble', 'betting', 'cards'] },

  // --- Group: IT & POS ---
  { id: 81, cat: 'IT', code: '81', desc: 'Loading unauthorized software or material onto POS/Computer', sanction: 'FWW/DS', keywords: ['software', 'download', 'pos', 'computer'] },
  { id: 96, cat: 'IT', code: '96', desc: 'Sharing usernames/passwords or security codes', sanction: 'DS', keywords: ['password', 'login', 'share codes'] },
  { id: 127, cat: 'IT', code: '127', desc: 'Disclosure of confidential information (Recipes/Financials)', sanction: 'DS', keywords: ['recipe', 'confidential', 'financial', 'secret'] },

  // --- Group: Driving & Vehicles ---
  { id: 108, cat: 'Driving', code: '108', desc: 'Driving company vehicle under influence of alcohol', sanction: 'DS', keywords: ['driving', 'delivery', 'bike', 'scooter', 'drunk driving'] },
  { id: 121, cat: 'Driving', code: '121A', desc: 'Deviating from designated route without authorization', sanction: 'SWW/FWW/DS', keywords: ['route', 'deviate', 'personal use'] },

  // --- Group: General ---
  { id: 142, cat: 'General', code: '142', desc: 'Conduct to the detriment of the Company', sanction: 'DS', keywords: ['detriment', 'bad name', 'disrepute', 'unprofessional'] },
  { id: 146, cat: 'General', code: '146', desc: 'Failure to comply with company Policy and Procedure', sanction: 'FWW/DS', keywords: ['policy', 'procedure', 'rule', 'sop'] }
];

/**
 * The "Professional Brain" - Deep Probing Dictionary (10-15 Questions per Theme)
 */
const PROBE_THEMES = {
  TIMEKEEPING: [
    { id: 'p_sched', label: 'Scheduled Start Time', type: 'time', narrative: (v) => `The employee was rostered to commence duties at ${v.replace(':','h')}.` },
    { id: 'p_arrival', label: 'Actual Arrival Time', type: 'time', narrative: (v) => `The employee reported for duty at ${v.replace(':','h')}.` },
    { id: 'p_notified', label: 'Did they notify management?', type: 'boolean', narrative: (v) => v ? "The employee did notify management of the delay." : "The employee failed to notify management or follow standard notification channels." },
    { id: 'p_notify_who', label: 'Who was contacted?', type: 'text', narrative: (v) => `Notification was sent to ${v}.` },
    { id: 'p_reason', label: 'Reason provided for lateness', type: 'text', narrative: (v) => `The reason provided was: "${v}".` },
    { id: 'p_impact', label: 'Operational Impact (e.g. Prep not done)', type: 'text', narrative: (v) => `This resulted in: ${v}.` },
    { id: 'p_previous', label: 'Is this a repeat offence?', type: 'boolean', narrative: (v) => v ? "This is noted as a repeat offence following previous corrective measures." : "This is recorded as a first instance of this nature." }
  ],
  STOCK: [
    { id: 'p_item', label: 'What stock item was involved?', type: 'text', narrative: (v) => `The incident involved the following stock: ${v}.` },
    { id: 'p_value', label: 'Estimated Rand Value', type: 'text', narrative: (v) => `The estimated financial value involved is R${v}.` },
    { id: 'p_intent', label: 'Personal use or "quality testing"?', type: 'text', narrative: (v) => `The employee stated the intent was ${v}.` },
    { id: 'p_auth', label: 'Did they have manager permission?', type: 'boolean', narrative: (v) => v ? "The employee claimed to have permission, which is currently being verified." : "It is confirmed that no prior authorization was granted for this action." },
    { id: 'p_witness', label: 'Who witnessed this?', type: 'text', narrative: (v) => `The discovery was witnessed by ${v}.` },
    { id: 'p_found', label: 'Where was the item recovered?', type: 'text', narrative: (v) => `The item was found in ${v}.` }
  ],
  CASH: [
    { id: 'p_amount', label: 'Total Rand value involved', type: 'text', narrative: (v) => `The total financial amount involved is R${v}.` },
    { id: 'p_audit', label: 'Does the POS audit confirm this?', type: 'boolean', narrative: (v) => v ? "The POS system audit trail provides electronic proof of the discrepancy." : "Discrepancy confirmed via physical cash/stock audit." },
    { id: 'p_void_reason', label: 'If voiding, what was the reason given?', type: 'text', narrative: (v) => `Regarding the voided transaction: "${v}".` },
    { id: 'p_witness', label: 'Manager present during cash-up?', type: 'text', narrative: (v) => `The cash-up was supervised by ${v}.` }
  ],
  CONDUCT: [
    { id: 'p_words', label: 'Exact words or behavior used', type: 'text', narrative: (v) => `Specifically, the employee ${v}.` },
    { id: 'p_audience', label: 'In front of guests or team?', type: 'text', narrative: (v) => `This incident occurred in the presence of ${v}.` },
    { id: 'p_instruction', label: 'Was the instruction lawful and reasonable?', type: 'boolean', narrative: (v) => v ? "It is confirmed the management instruction was both lawful and reasonable." : "The instruction is being reviewed for procedural compliance." },
    { id: 'p_repute', label: 'Reputational damage level?', type: 'text', narrative: (v) => `The impact on company reputation is viewed as ${v}.` }
  ],
  VIOLENCE: [
    { id: 'p_victim', label: 'Who was the victim?', type: 'text', narrative: (v) => `The altercation involved ${v}.` },
    { id: 'p_weapon', label: 'Weapon or implement used?', type: 'text', narrative: (v) => `It is alleged that ${v} was utilized during the incident.` },
    { id: 'p_injury', label: 'Description of injuries', type: 'text', narrative: (v) => `Visible injuries noted: ${v}.` },
    { id: 'p_medical', label: 'Doctor/Medical attention required?', type: 'boolean', narrative: (v) => v ? "Professional medical assistance was required following the incident." : "No immediate medical assistance was required." },
    { id: 'p_provocation', label: 'Was there any provocation?', type: 'text', narrative: (v) => `Regarding the claim of provocation: "${v}".` },
    { id: 'p_cctv', label: 'CCTV footage available?', type: 'boolean', narrative: (v) => v ? "CCTV footage of the incident has been secured as evidence." : "No video evidence is available for this location." }
  ],
  DAMAGE: [
    { id: 'p_item', label: 'Property/Machine Damaged', type: 'text', narrative: (v) => `Damage was caused to: ${v}.` },
    { id: 'p_cost', label: 'Estimated Repair Cost', type: 'text', narrative: (v) => {
        if (!v || v.toLowerCase().includes('not sure')) return "The financial cost of repair or replacement is currently being assessed.";
        return `The estimated cost of repair or replacement is R${v}.`;
    }},
    { id: 'p_sop', label: 'Trained on SOP for this machine?', type: 'boolean', narrative: (v) => v ? "The employee had previously received formal training on the correct SOP for this equipment." : "The employee was operating equipment without the required SOP training." },
    { id: 'p_intent', label: 'Accidental or Intentional?', type: 'text', narrative: (v) => `Initial investigation suggests the act was ${v}.` }
  ],
  HYGIENE: [
    { id: 'p_breach', label: 'Nature of breach (Nails/Hands/Apron)?', type: 'text', narrative: (v) => `The hygiene breach related to: ${v}.` },
    { id: 'p_food_safety', label: 'Immediate risk to food safety?', type: 'text', narrative: (v) => `This created an immediate risk of ${v}.` },
    { id: 'p_previous', label: 'Previous coaching on this?', type: 'boolean', narrative: (v) => v ? "The employee has received previous documented coaching on these standards." : "This is a first formal notification of standard breach." }
  ],
  SAFETY: [
    { id: 'p_hazard', label: 'Hazard created (Fire/Chemical/etc)?', type: 'text', narrative: (v) => `The act created a significant hazard regarding ${v}.` },
    { id: 'p_ppe', label: 'Wearing required PPE?', type: 'boolean', narrative: (v) => v ? "PPE was worn, but other safety protocols were ignored." : "The employee was in breach of mandatory PPE requirements." },
    { id: 'p_reported', label: 'Did they report the hazard immediately?', type: 'boolean', narrative: (v) => v ? "The employee reported the matter, allowing for mitigation." : "The employee failed to report the safety risk to management." }
  ],
  IT: [
    { id: 'p_act', label: 'Describe the digital breach', type: 'text', narrative: (v) => `The IT breach involved ${v}.` },
    { id: 'p_sec_risk', label: 'Risk to store data/security?', type: 'text', narrative: (v) => `This action compromised ${v}.` }
  ],
  DRIVING: [
    { id: 'p_vehicle', label: 'Which vehicle was involved?', type: 'text', narrative: (v) => `The incident involved company vehicle: ${v}.` },
    { id: 'p_route', label: 'Was it a route deviation?', type: 'boolean', narrative: (v) => v ? "The employee deviated from the authorized delivery route for personal reasons." : "" },
    { id: 'p_speed', label: 'Speeding or reckless driving?', type: 'text', narrative: (v) => `Specifically, the employee ${v}.` }
  ],
  GENERAL: [
    { id: 'p_who', label: 'Who witnessed this?', type: 'text', narrative: (v) => `The incident was witnessed by ${v}.` },
    { id: 'p_impact', label: 'What was the impact on service?', type: 'text', narrative: (v) => `Operational impact: ${v}.` },
    { id: 'p_previous', label: 'Any previous history?', type: 'text', narrative: (v) => `Note on history: ${v}.` }
  ]
};

/**
 * Keyword-to-Theme Mapping
 */
const getThemeFromDescription = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('late') || d.includes('shift') || d.includes('early')) return 'TIMEKEEPING';
  if (d.includes('punch') || d.includes('hit') || d.includes('fight') || d.includes('attack') || d.includes('slap')) return 'VIOLENCE';
  if (d.includes('steal') || d.includes('theft') || d.includes('money') || d.includes('till') || d.includes('void') || d.includes('tip') || d.includes('eat') || d.includes('grazing')) return 'DISHONESTY';
  if (d.includes('rude') || d.includes('swore') || d.includes('shout') || d.includes('refuse') || d.includes('attitude') || d.includes('abusive')) return 'CONDUCT';
  if (d.includes('broke') || d.includes('damage') || d.includes('fryer') || d.includes('plate') || d.includes('oven')) return 'DAMAGE';
  if (d.includes('drunk') || d.includes('smell') || d.includes('alcohol') || d.includes('weed') || d.includes('intox')) return 'SUBSTANCES';
  if (d.includes('wash') || d.includes('hygiene') || d.includes('dirty') || d.includes('nail') || d.includes('uniform')) return 'HYGIENE';
  if (d.includes('safety') || d.includes('hazard') || d.includes('fire') || d.includes('chemical')) return 'SAFETY';
  if (d.includes('pos') || d.includes('password') || d.includes('software') || d.includes('recipe')) return 'IT';
  if (d.includes('driving') || d.includes('route') || d.includes('vehicle') || d.includes('speeding')) return 'DRIVING';
  return 'GENERAL';
};

export const suggestCharges = (answers) => {
  const suggestedIds = new Set();
  const text = (answers.description || '').toLowerCase();
  const theme = getThemeFromDescription(text);

  OFFENCE_REGISTRY.forEach(o => {
    if (o.keywords && o.keywords.some(kw => text.includes(kw))) suggestedIds.add(o.id);
  });

  const themeMap = {
    TIMEKEEPING: 1, VIOLENCE: 41, DISHONESTY: 130, CONDUCT: 66,
    DAMAGE: 31, SUBSTANCES: 35, HYGIENE: 139, SAFETY: 69, IT: 96, DRIVING: 108
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
  if (answers.description.length > 5) storySentences.push(answers.description + '.');

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
