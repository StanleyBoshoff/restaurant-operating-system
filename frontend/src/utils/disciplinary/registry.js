/**
 * Disciplinary Code / Law Library (Annexure B)
 * Primary authority for offences and sanction ladders.
 */

export const AUTHORIZED_ISSUERS = [
  "General Manager",
  "Store Manager",
  "Head Chef",
  "Floor Manager",
  "Managing Director"
];

export const DISCIPLINARY_LEVELS = {
  VERBAL: { label: 'Verbal Warning', duration_months: 3 },
  WRITTEN: { label: 'Written Warning', duration_months: 6 },
  SERIOUS: { label: 'Serious Written Warning', duration_months: 9 },
  FINAL: { label: 'Final Written Warning', duration_months: 12 },
  DISMISSAL: { label: 'Summary Dismissal', duration_months: 999 }
};

export const TAXONOMY = {
  ATTENDANCE: {
    label: 'Attendance & Punctuality',
    sub: {
      TIMEKEEPING: { label: 'Timekeeping' },
      ABSENCE: { label: 'Unauthorised Absence' }
    }
  },
  AUTHORITY: {
    label: 'Authority & Instructions',
    sub: {
      INSTRUCTION: { label: 'Operational Instructions' },
      INSUBORDINATION: { label: 'Insubordination & Respect' }
    }
  },
  INTEGRITY: {
    label: 'Integrity & Honesty',
    sub: {
      DISHONESTY: { label: 'Theft, Fraud & Dishonesty' }
    }
  },
  OPERATIONS: {
    label: 'Operational Standards',
    sub: {
      PERFORMANCE: { label: 'Work Performance' },
      SAFETY: { label: 'Health, Safety & Hygiene' }
    }
  },
  CONDUCT: {
    label: 'General Conduct',
    sub: {
      HARMONY: { label: 'Workplace Harmony' }
    }
  }
};

export const OFFENCE_REGISTRY = [
  // --- Attendance ---
  {
    id: 1,
    code: '1',
    desc: 'Late for work and/or leaving work early',
    dna: ['ATTENDANCE', 'TIMEKEEPING'],
    sanction_type: 'PROGRESSIVE',
    ladder: ['VERBAL', 'WRITTEN', 'SERIOUS', 'FINAL', 'DISMISSAL'],
    supporting_reasons: ['Poor timekeeping', 'Conduct detrimental to the company']
  },
  {
    id: 2,
    code: '2',
    desc: 'Habitual late coming / Lack of Punctuality',
    dna: ['ATTENDANCE', 'TIMEKEEPING'],
    sanction_type: 'PROGRESSIVE',
    ladder: ['WRITTEN', 'SERIOUS', 'FINAL', 'DISMISSAL'],
    supporting_reasons: ['Habitual poor punctuality', 'Conduct detrimental to the company']
  },

  // --- Authority ---
  {
    id: 18,
    code: '18',
    desc: 'Refusal to carry out an authorized/reasonable instruction',
    dna: ['AUTHORITY', 'INSTRUCTION'],
    sanction_type: 'SEVERITY',
    options: ['WRITTEN', 'SERIOUS', 'FINAL', 'DISMISSAL']
  },
  {
    id: 66,
    code: '66',
    desc: 'Gross Insubordination / Abusive language toward authority',
    dna: ['AUTHORITY', 'INSUBORDINATION'],
    sanction_type: 'SERIOUS_MISCONDUCT',
    options: ['FINAL', 'DISMISSAL']
  }
];
