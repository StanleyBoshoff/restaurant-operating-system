import { BLUEPRINTS } from './blueprints';
import { SYSTEM_OFFENCES } from './constants';

/**
 * Universal Disciplinary Engine
 * Manages the transition from Allegation -> Investigation -> Facts.
 */
export class UniversalEngine {
  constructor(allegationText) {
    this.allegation = allegationText || "";
    this.blueprint = this._findBlueprint(this.allegation);
    this.answers = { description: this.allegation };
    this.currentQuestionIndex = 0;
    this.status = this.blueprint ? 'INVESTIGATING' : 'UNKNOWN_SCENARIO';
  }

  _findBlueprint(text) {
    const lowText = text.toLowerCase();
    // Simple keyword matching for the foundation
    return BLUEPRINTS.find(bp =>
      bp.matchers.some(m => lowText.includes(m.toLowerCase()))
    ) || null;
  }

  getCurrentQuestion() {
    if (this.status !== 'INVESTIGATING' || !this.blueprint) return null;
    if (this.currentQuestionIndex >= this.blueprint.questions.length) return null;

    return {
      ...this.blueprint.questions[this.currentQuestionIndex],
      phase: `Question ${this.currentQuestionIndex + 1} of ${this.blueprint.questions.length}`
    };
  }

  submitAnswer(questionId, value) {
    this.answers[questionId] = value;
    this.currentQuestionIndex++;
  }

  isInvestigationComplete() {
    if (!this.blueprint) return true;
    return this.currentQuestionIndex >= this.blueprint.questions.length;
  }

  getStructuredIncident() {
    if (!this.blueprint) {
      return {
        scenario_id: 'GENERAL',
        facts: this.answers,
        offence_id: SYSTEM_OFFENCES.POLICY_FAILURE,
        narrative: this.answers.description,
        supportingReasonRules: () => ["Conduct detrimental to the company."]
      };
    }

    const facts = this.blueprint.deriveFacts(this.answers);

    // Find matching offence(s) from mapping
    const potentialOffences = this.blueprint.offenceMapping
      .filter(m => m.condition(facts))
      .map(m => m.offence_id);

    return {
      scenario_id: this.blueprint.id,
      facts: facts,
      offence_id: potentialOffences[0] || SYSTEM_OFFENCES.GENERAL_MISCONDUCT,
      other_offences: potentialOffences.slice(1),
      narrativeTemplate: this.blueprint.narrativeTemplate,
      supportingReasonRules: this.blueprint.supportingReasonRules
    };
  }
}
