/**
 * Scenario Configuration Registry
 * Defines investigation paths, branching logic, and narrative templates.
 */

export const INVESTIGATION_NODES = {
  // --- Attendance ---
  'q_scheduled_time': {
    id: 'q_scheduled_time',
    label: 'What time was the employee rostered to start?',
    type: 'time',
    purpose: 'FACT_ESTABLISHMENT'
  },
  'q_arrival_time': {
    id: 'q_arrival_time',
    label: 'What time did the employee actually report for duty?',
    type: 'time',
    purpose: 'FACT_ESTABLISHMENT'
  },
  'q_notification_status': {
    id: 'q_notification_status',
    label: 'Did the employee notify management before the shift started?',
    type: 'boolean_tristate',
    purpose: 'MITIGATION_AGGRAVATION'
  },
  'q_attendance_frequency': {
    id: 'q_attendance_frequency',
    label: 'Is this an isolated incident or part of a frequent pattern of lateness?',
    type: 'select',
    options: [
      { value: 'isolated', label: 'Isolated Instance' },
      { value: 'habitual', label: 'Habitual / Frequent' },
      { value: 'unknown', label: 'Unknown' }
    ],
    purpose: 'OFFENCE_RESOLUTION'
  },

  // --- Authority ---
  'q_instruction_authorised': {
    id: 'q_instruction_authorised',
    label: 'Was the instruction given by an authorised person?',
    type: 'boolean_tristate',
    purpose: 'VALIDITY'
  },
  'q_instruction_reasonable': {
    id: 'q_instruction_reasonable',
    label: 'Was the instruction lawful and reasonable?',
    type: 'boolean_tristate',
    purpose: 'VALIDITY'
  },
  'q_refusal_nature': {
    id: 'q_refusal_nature',
    label: 'What was the nature of the employee response?',
    type: 'select',
    options: [
      { value: 'calm', label: 'Calm / Direct Refusal' },
      { value: 'insolent', label: 'Disrespectful / Cheeky' },
      { value: 'abusive', label: 'Abusive / Aggressive' },
      { value: 'unknown', label: 'Unknown' }
    ],
    purpose: 'OFFENCE_RESOLUTION'
  }
};

export const SCENARIO_REGISTRY = [
  {
    id: 'LATECOMING',
    label: 'Late for Work',
    entry_keywords: ['late', 'shift', 'arrival', 'time'],
    investigation_path: ['q_scheduled_time', 'q_arrival_time', 'q_notification_status', 'q_attendance_frequency'],
    dna: ['ATTENDANCE', 'TIMEKEEPING'],

    // Logic to resolve which Offence ID (from registry.js) applies
    resolution_rules: [
      { if: { q_attendance_frequency: 'habitual' }, then_offence_id: 2 },
      { if: { q_attendance_frequency: 'isolated' }, then_offence_id: 1 }
    ],

    // Narrative Template for the Passive Narrator
    narrative_template: (facts) => {
        const { q_scheduled_time, q_arrival_time, q_notification_status, minutes_late } = facts;

        let msg = `On [DATE], the employee was scheduled to start work at ${q_scheduled_time}. `;
        msg += `They arrived at ${q_arrival_time}, making them ${minutes_late} minutes late for their shift. `;

        if (q_notification_status === true) {
            msg += "The employee informed management of the intended latecoming prior to the commencement of the shift.";
        } else if (q_notification_status === false) {
            msg += "The employee did not inform management of their intended latecoming.";
        } else {
            msg += "Notification status prior to shift remains unconfirmed.";
        }

        return msg;
    }
  },
  {
    id: 'INSUBORDINATION',
    label: 'Refusal / Insubordination',
    entry_keywords: ['refused', 'instruction', 'shouted', 'abusive', 'no'],
    investigation_path: ['q_instruction_authorised', 'q_instruction_reasonable', 'q_refusal_nature'],
    dna: ['AUTHORITY', 'INSUBORDINATION'],
    critical_facts: ['q_instruction_authorised', 'q_instruction_reasonable'],

    resolution_rules: [
      { if: { q_refusal_nature: 'abusive' }, then_offence_id: 66 },
      { if: { q_refusal_nature: 'insolent' }, then_offence_id: 67 },
      { if: { q_refusal_nature: 'calm' }, then_offence_id: 18 }
    ]
  }
];
