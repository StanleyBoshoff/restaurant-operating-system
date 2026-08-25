/**
 * Disciplinary Investigation Blueprints
 * DATA-DRIVEN configuration for incident types.
 */

export const BLUEPRINTS = [
  {
    id: 'LATECOMING',
    label: 'Late for Work',
    matchers: ['late', 'shift', 'start', 'arrival', 'time'],
    questions: [
      { id: 'q_scheduled', label: 'Scheduled Start Time', type: 'time', required: true },
      { id: 'q_arrival', label: 'Actual Arrival Time', type: 'time', required: true },
      { id: 'q_notified', label: 'Did the employee notify management?', type: 'boolean_tristate' },
      { id: 'q_reason', label: 'Reason for lateness', type: 'text' }
    ],
    deriveFacts: (answers) => {
      const facts = { ...answers };
      if (answers.q_scheduled && answers.q_arrival) {
        const [sH, sM] = answers.q_scheduled.split(':').map(Number);
        const [aH, aM] = answers.q_arrival.split(':').map(Number);
        facts.minutes_late = (aH * 60 + aM) - (sH * 60 + sM);
      }

      // Generic Fact Protocol
      if (facts.minutes_late > 30) {
        facts.has_operational_impact = true;
      }
      if (facts.minutes_late > 60) {
        facts.is_severe_breach = true;
      }

      return facts;
    },
    offenceMapping: [
      { offence_id: 1, condition: (f) => f.minutes_late > 0 && f.minutes_late < 60 },
      { offence_id: 2, condition: (f) => f.minutes_late >= 60 }
    ],
    narrativeTemplate: (f, dateStr) => {
      let msg = `On ${dateStr}, the employee was scheduled to start at ${f.q_scheduled}. They arrived at ${f.q_arrival}`;
      if (f.minutes_late > 0) msg += `, making them ${f.minutes_late} minutes late.`;
      if (f.q_notified === true) msg += " The employee notified management.";
      else if (f.q_notified === false) msg += " The employee failed to notify management.";
      if (f.q_reason) msg += ` Reason provided: "${f.q_reason}".`;
      return msg;
    },
    supportingReasonRules: (f) => {
      const reasons = ["Poor timekeeping."];
      if (f.q_notified === false) reasons.push("Failure to follow notification procedure.");
      return reasons;
    }
  },
  {
    id: 'VIOLENCE',
    label: 'Disorderly Conduct / Violence',
    matchers: ['punch', 'hit', 'fight', 'strike', 'attack', 'assault', 'slap', 'shove', 'violence'],
    questions: [
      { id: 'q_victim', label: 'Who was involved / attacked?', type: 'text', required: true },
      { id: 'q_injury', label: 'Were there any visible injuries?', type: 'boolean_tristate' },
      { id: 'q_weapon', label: 'Was a weapon or implement used?', type: 'text' },
      { id: 'q_provocation', label: 'Was there any provocation?', type: 'text' }
    ],
    deriveFacts: (answers) => ({
      ...answers,
      has_operational_impact: true,
      is_severe_breach: true
    }),
    offenceMapping: [
      { offence_id: 41, condition: () => true }
    ],
    narrativeTemplate: (f, dateStr) => {
      let msg = `On ${dateStr}, an altercation occurred involving ${f.q_victim}.`;
      if (f.q_injury === true) msg += " Visible injuries were reported.";
      if (f.q_weapon) msg += ` A ${f.q_weapon} was involved.`;
      if (f.q_provocation) msg += ` Regarding provocation: "${f.q_provocation}".`;
      return msg;
    },
    supportingReasonRules: (f) => {
      const reasons = ["Violent and aggressive physical conduct."];
      if (f.q_injury === true) reasons.push("Conduct causing physical harm.");
      return reasons;
    }
  },
  {
    id: 'UNAUTHORIZED_BREAK',
    label: 'Unauthorized Break / Absence from Post',
    matchers: ['break', 'post', 'station', 'missing', 'vanished', 'left early'],
    questions: [
      { id: 'q_duration', label: 'Duration of absence (minutes)', type: 'number' },
      { id: 'q_permission', label: 'Did they have permission?', type: 'boolean_tristate' },
      { id: 'q_impact', label: 'Operational Impact', type: 'text' }
    ],
    deriveFacts: (answers) => ({
      ...answers,
      has_operational_impact: !!answers.q_impact
    }),
    offenceMapping: [
      { offence_id: 5, condition: () => true }
    ],
    narrativeTemplate: (f, dateStr) => {
      let msg = `On ${dateStr}, the employee was absent from their post without authorization`;
      if (f.q_duration) msg += ` for approximately ${f.q_duration} minutes.`;
      if (f.q_impact) msg += ` Impact: ${f.q_impact}.`;
      return msg;
    },
    supportingReasonRules: (f) => {
      return ["Unauthorised absence from workstation."];
    }
  },
  {
    id: 'INSUBORDINATION',
    label: 'Insubordination / Instruction',
    matchers: ['refuse', 'refused', 'no', 'won\'t', 'instruction', 'order'],
    questions: [
      { id: 'q_instruction', label: 'What was the instruction?', type: 'text', required: true },
      { id: 'q_lawful', label: 'Was the instruction lawful and reasonable?', type: 'boolean_tristate' },
      { id: 'q_refusal_direct', label: 'Did they state a direct refusal?', type: 'boolean_tristate' }
    ],
    deriveFacts: (answers) => ({
      ...answers,
      has_operational_impact: answers.q_refusal_direct === true
    }),
    offenceMapping: [
      { offence_id: 18, condition: (f) => f.q_lawful === true },
      { offence_id: 66, condition: (f) => f.q_refusal_direct === true && f.q_lawful === true }
    ],
    narrativeTemplate: (f, dateStr) => {
      let msg = `On ${dateStr}, the employee refused to carry out an instruction: "${f.q_instruction}".`;
      if (f.q_lawful === true) msg += " The instruction was confirmed as lawful and reasonable.";
      return msg;
    },
    supportingReasonRules: (f) => {
      const reasons = [];
      if (f.q_lawful === true) reasons.push("Refusal to carry out a lawful and reasonable instruction.");
      if (f.q_refusal_direct === true) reasons.push("Direct defiance of authority.");
      return reasons;
    }
  },
  {
    id: 'ABSENCE',
    label: 'Failure to Report / Absent',
    matchers: ['show up', 'appeared', 'missing', 'absent', 'awol', 'no-show', 'not come', 'did not report'],
    questions: [
      { id: 'q_notified_early', label: 'Did they notify before 06h00?', type: 'boolean_tristate' },
      { id: 'q_contacted', label: 'Did management manage to contact them?', type: 'boolean_tristate' },
      { id: 'q_days', label: 'How many days absent so far?', type: 'number', required: true }
    ],
    deriveFacts: (answers) => ({
      ...answers,
      has_operational_impact: true
    }),
    offenceMapping: [
      { offence_id: 5, condition: (f) => f.q_days < 5 },
      { offence_id: 8, condition: (f) => f.q_days >= 5 },
      { offence_id: 51, condition: (f) => f.q_notified_early === false }
    ],
    narrativeTemplate: (f, dateStr) => {
      let msg = `On ${dateStr}, the employee failed to report for duty.`;
      if (f.q_notified_early === false) msg += " No notification was received before the 06h00 deadline.";
      msg += ` Absence has continued for ${f.q_days} day(s).`;
      return msg;
    },
    supportingReasonRules: (f) => {
      const reasons = ["Unauthorised absence from work."];
      if (f.q_notified_early === false) reasons.push("Failure to follow notification procedure.");
      return reasons;
    }
  }
];
