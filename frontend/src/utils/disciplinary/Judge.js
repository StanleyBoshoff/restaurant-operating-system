import { OFFENCE_REGISTRY, DISCIPLINARY_LEVELS } from '../disciplinaryEngine';
import { SYSTEM_OFFENCES, SANCTION_LADDER } from './constants';

/**
 * Universal Disciplinary Judge
 * Evaluates facts against Law (Registry) and History.
 */
export class Judge {
  static assess(incident, history) {
    const offence = OFFENCE_REGISTRY.find(o => o.id === incident.offence_id) ||
                    OFFENCE_REGISTRY.find(o => o.id === SYSTEM_OFFENCES.POLICY_FAILURE);

    // 1. History Analysis
    const sameOffenceCount = history.filter(w => w.offence_id === incident.offence_id).length;
    const relatedPatternCount = history.filter(w => w.cat === offence.cat).length;

    // 2. Progression Logic
    let baseLevel = 'VERBAL';

    if (offence.sanction) {
        const parts = offence.sanction.split('/');
        const startSanction = parts[0];
        if (startSanction === 'SWW') baseLevel = 'SERIOUS';
        else if (startSanction === 'FWW') baseLevel = 'FINAL';
        else if (startSanction === 'DS') baseLevel = 'DISMISSAL';
        else if (startSanction === 'WW') baseLevel = 'WRITTEN';
    }

    // Apply progression based on history
    let currentIndex = SANCTION_LADDER.indexOf(baseLevel);
    let recommendedIndex = Math.min(currentIndex + sameOffenceCount, SANCTION_LADDER.length - 1);
    let recommendedLevel = SANCTION_LADDER[recommendedIndex];

    // 3. Narrative Generation
    const dateStr = incident.date || new Date().toLocaleDateString('en-ZA');
    const narrative = incident.narrativeTemplate
      ? incident.narrativeTemplate(incident.facts, dateStr)
      : incident.narrative;

    // 4. Supporting Reasons
    let supportingReasons = [];
    if (incident.supportingReasonRules) {
        supportingReasons = [...incident.supportingReasonRules(incident.facts)];
    }

    // Generic Fact-Supported Reasons
    if (incident.facts.is_severe_breach && !supportingReasons.includes("Failure to comply with company Policy and Procedure.")) {
        supportingReasons.push("Failure to comply with company Policy and Procedure.");
    }

    // Detriment logic based on generic flag
    if (incident.facts.has_operational_impact && offence.id !== SYSTEM_OFFENCES.GENERAL_MISCONDUCT) {
        if (!supportingReasons.includes("Conduct to the detriment of the Company.")) {
            supportingReasons.push("Conduct to the detriment of the Company.");
        }
    }

    return {
      offence,
      recommendation: recommendedLevel,
      explanation: this._generateExplanation(recommendedLevel, sameOffenceCount, relatedPatternCount, offence),
      narrative,
      supportingReasons,
      pillars: {
        occurrence: sameOffenceCount + 1,
        patternCount: relatedPatternCount,
        isProgression: sameOffenceCount > 0
      }
    };
  }

  static _generateExplanation(level, sameCount, patternCount, offence) {
    let txt = `${DISCIPLINARY_LEVELS[level]?.label || level} recommended. `;

    if (sameCount > 0) {
      txt += `This is the ${sameCount + 1}${sameCount + 1 === 2 ? 'nd' : 'rd'} active occurrence of this specific offence (${offence.desc}). `;
    } else {
      txt += `This is recorded as a first instance for this specific offence. `;
    }

    if (patternCount > sameCount) {
      txt += `Note: Related behavioural patterns detected in the "${offence.cat}" category. `;
    }

    return txt;
  }
}
