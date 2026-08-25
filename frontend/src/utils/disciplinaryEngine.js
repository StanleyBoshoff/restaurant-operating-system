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
 * Keyword-to-Theme Mapping (Basic)
 */
export const getThemeFromDescription = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('late') || d.includes('shift') || d.includes('early')) return 'TIMEKEEPING';
  if (d.includes('punch') || d.includes('hit') || d.includes('fight')) return 'VIOLENCE';
  return 'GENERAL';
};

