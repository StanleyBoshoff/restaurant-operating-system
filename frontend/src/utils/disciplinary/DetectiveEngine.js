import { SCENARIO_REGISTRY, INVESTIGATION_NODES } from './scenarios';
import { COMPANY_RULES } from './companyRules';

/**
 * Universal Disciplinary Detective (Core Machinery)
 * Handles branching logic and fact establishment without scenario-specific code.
 */
export class DetectiveEngine {
  constructor(initialAllegation) {
    this.allegation = initialAllegation;
    this.scenario = this._identifyScenario(initialAllegation);
    this.answers = {};
    this.currentNodeIndex = 0;
    this.status = 'IDENTIFIED'; // IDENTIFIED, INVESTIGATING, ESTABLISHED, INSUFFICIENT
  }

  _identifyScenario(text = '') {
    const lowerText = text.toLowerCase();
    return SCENARIO_REGISTRY.find(s =>
      s.entry_keywords.some(kw => lowerText.includes(kw))
    ) || null;
  }

  getCurrentQuestion() {
    if (!this.scenario) return null;
    const nodeId = this.scenario.investigation_path[this.currentNodeIndex];
    return INVESTIGATION_NODES[nodeId] || null;
  }

  submitAnswer(nodeId, value) {
    this.answers[nodeId] = value;

    // 💡 Automatic Calculations (e.g. Minutes Late)
    if (nodeId === 'q_arrival_time' || nodeId === 'q_scheduled_time') {
        this._calculateMinutesLate();
    }

    this.currentNodeIndex++;

    if (this.currentNodeIndex >= this.scenario.investigation_path.length) {
      this.status = 'ESTABLISHED';
      this._finalizeInvestigation();
    }
  }

  _calculateMinutesLate() {
    const sched = this.answers.q_scheduled_time;
    const arrival = this.answers.q_arrival_time;
    if (!sched || !arrival) return;

    const [sh, sm] = sched.split(':').map(Number);
    const [ah, am] = arrival.split(':').map(Number);

    const startMins = sh * 60 + sm;
    const endMins = ah * 60 + am;

    // Handle midnight cross if needed (simplified for now)
    const diff = endMins - startMins;
    this.answers.minutes_late = Math.max(0, diff);
  }

  _finalizeInvestigation() {
    // 1. Check for Critical Uncertainty
    const missingCritical = (this.scenario.critical_facts || []).some(cf =>
        this.answers[cf] === 'unknown' || this.answers[cf] === undefined
    );

    if (missingCritical) {
      this.status = 'INSUFFICIENT';
      return;
    }

    // 2. Generic Offence Resolution (Interpreter)
    this.offence_id = this._resolveOffenceId();
  }

  /**
   * Universal Interpreter: Matches established facts against scenario resolution rules.
   */
  _resolveOffenceId() {
    if (!this.scenario.resolution_rules) return null;

    for (const rule of this.scenario.resolution_rules) {
        // Check if all rule conditions match current answers
        const match = Object.entries(rule.if).every(([key, val]) => this.answers[key] === val);
        if (match) return rule.then_offence_id;
    }

    return null;
  }

  getStructuredIncident() {
    return {
      scenario_id: this.scenario?.id,
      offence_id: this.offence_id,
      status: this.status,
      allegation: this.allegation,
      facts: this.answers,
      dna: this.scenario?.dna || [],
      established_at: new Date().toISOString()
    };
  }
}
