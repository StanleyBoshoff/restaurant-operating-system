import { OFFENCE_REGISTRY, DISCIPLINARY_LEVELS } from './registry';
import { COMPANY_RULES } from './companyRules';

/**
 * Universal Disciplinary Judge
 * Evaluates the 5 Pillars of Assessment based on structured facts and code configuration.
 */

export const performAssessment = (incident, history) => {
  const offence = OFFENCE_REGISTRY.find(o => o.id === incident.offence_id);

  if (incident.status === 'INSUFFICIENT') {
    return {
      outcome: 'INSUFFICIENT_INFORMATION',
      explanation: "Critical investigation facts remain unknown. A responsible recommendation cannot be made."
    };
  }

  if (!offence) {
    return {
      outcome: 'RECOMMEND_INVESTIGATION',
      explanation: "The established facts do not clearly map to a standard disciplinary offence. Professional HR review is recommended."
    };
  }

  // --- PILLAR 1: Occurrence (Progression) ---
  const sameOffenceActiveCount = history.same_offence_count;
  let recommendedLevel = 'VERBAL';

  if (offence.sanction_type === 'PROGRESSIVE') {
    recommendedLevel = offence.ladder[Math.min(sameOffenceActiveCount, offence.ladder.length - 1)];
  } else if (offence.sanction_type === 'SERIOUS_MISCONDUCT') {
    recommendedLevel = offence.options[0]; // e.g. FINAL
  } else if (offence.sanction_type === 'SEVERITY') {
    recommendedLevel = 'WRITTEN'; // Base level, can be increased by gravity rules
  }

  // --- PILLAR 2: Behavioural Context ---
  const patternFound = history.behavioural_patterns.length > 0;

  // --- PILLAR 3: Current Severity (Gravity Rules) ---
  const aggravating = [];
  const mitigating = [];

  // Evaluate Gravity Rules (Conceptual Rule Evaluator)
  if (incident.facts.minutes_late > COMPANY_RULES.attendance_severe_threshold_mins) {
      aggravating.push("Extensive delay exceeding company threshold.");
  }
  if (incident.facts.q_notification_status === false) {
      aggravating.push("Failure to follow notification procedure.");
  } else if (incident.facts.q_notification_status === true) {
      mitigating.push("Proactive notification provided.");
  }

  if (incident.facts.q_instruction_authorised === false) {
      return {
          outcome: 'INSUFFICIENT_INFORMATION',
          explanation: "The instruction was given by an unauthorised person. Disciplinary action is likely invalid."
      };
  }

  return {
    outcome: 'RECOMMEND_WARNING',
    recommendation: recommendedLevel,
    offence: offence,
    supporting_reasons: offence.supporting_reasons || COMPANY_RULES.standard_supporting_reasons,
    pillars: {
      occurrence: sameOffenceActiveCount + 1,
      has_pattern: patternFound,
      aggravating,
      mitigating,
      total_active: history.total_active_warnings
    },
    explanation: generateExplanation(recommendedLevel, history, incident)
  };
};

const generateExplanation = (level, history, incident) => {
  const occ = history.same_offence_count + 1;
  let txt = `Recommended: ${level}. `;

  if (history.same_offence_count > 0) {
      txt += `This is the ${occ}${occ === 2 ? 'nd' : 'rd'} active occurrence of this specific offence. `;
  } else {
      txt += `This is recorded as the first active instance for this code. `;
  }

  if (history.behavioural_patterns.length > 0) {
      txt += `Note: Related behavioural patterns detected in history. `;
  }

  return txt;
};
