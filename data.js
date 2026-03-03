(function (global) {
  const CONFIG = Object.freeze({
    STORAGE_KEY: 'clawbot_v21',
    LEGACY_STORAGE_KEY: 'clawbot_v2',
    STAGES: Object.freeze(['Qualified','Briefing','Proposal','Negotiation','Verbal','Closed']),
    STAGE_MULT: Object.freeze({
      Qualified: 0.30,
      Briefing: 0.50,
      Proposal: 0.70,
      Negotiation: 0.85,
      Verbal: 0.95,
      Closed: 1.0,
      Archived: 0
    }),
    DEFAULT_NBA: Object.freeze({
      Qualified: 'Send first-touch email',
      Briefing: 'Follow up within 48h',
      Proposal: 'Schedule discovery call',
      Negotiation: 'Address objections directly',
      Verbal: 'Prepare contract terms',
      Closed: 'Secure expansion opportunity',
      Archived: 'Re-qualify before outreach'
    }),
    HARD_CONSTRAINTS: Object.freeze([
      'NEVER send more than 1 outreach touch per lead per 72h',
      'NEVER discount beyond 10% without Roman approval',
      'NEVER submit proposal without Roman review',
      'NEVER represent capability Trestleboard cannot deliver',
      'NEVER use aggressive/manipulative language',
      'NEVER override MANUAL HOLD',
      'NEVER engage prospect under active legal dispute',
      'ALWAYS respect federal procurement blackout periods',
      'ALWAYS maintain ITAR compliance',
      'ALWAYS escalate GO/SES-3+/Congressional to Roman directly'
    ]),
    AGENT_DEFINITIONS: Object.freeze([
      { id: 'leadAnalyst', name: 'Lead Analyst', role: 'Pipeline Intelligence', confidence: 75 },
      { id: 'campaignStrategist', name: 'Campaign Strategist', role: 'Sequencing & Cadence', confidence: 80 },
      { id: 'copywritingAgent', name: 'Copywriting Agent', role: 'Message Crafting', confidence: 85 },
      { id: 'negotiationAgent', name: 'Negotiation Agent', role: 'Counter-Objection', confidence: 90 },
      { id: 'revenueForecaster', name: 'Revenue Forecaster', role: 'EV Modeling', confidence: 95 },
      { id: 'riskMonitor', name: 'Risk Monitor', role: 'Decay & Compliance', confidence: 60 }
    ]),
    SCENARIO_PRESETS: Object.freeze({
      outreach_freq: { label: 'Increase outreach frequency 20%', convDelta: 8, cycleDelta: -7, recommendation: 'PROCEED', confidence: 78, urgency: 1.08, notes: 'Campaign Strategist: tighten cadences across IC + DoD seeds.' },
      linkedin_pivot: { label: 'Shift primary channel to LinkedIn (IC vertical)', convDelta: 12, cycleDelta: -10, recommendation: 'PROCEED', confidence: 82, urgency: 1.05, notes: 'Lead Analyst: IC personas need Roman video context.' },
      discount_5: { label: 'Add 5% pricing discount for FY Q4 close', convDelta: 15, cycleDelta: -14, recommendation: 'CAUTION', confidence: 71, urgency: 1.0, notes: 'Negotiation Agent: secure Roman approval before any discount language.' },
      roman_touch: { label: 'Deploy Roman as personal touch on top 3 deals', convDelta: 22, cycleDelta: -21, recommendation: 'PROCEED', confidence: 89, urgency: 1.2, notes: 'Roman engages directly on highest priority stack leads.' },
      callbot: { label: 'Activate call bot on stalled email sequences', convDelta: 6, cycleDelta: -5, recommendation: 'PROCEED', confidence: 75, urgency: 1.02, notes: 'Risk Monitor: confirm disclosure + compliance.' },
      custom: { label: 'Custom scenario', convDelta: 0, cycleDelta: 0, recommendation: 'ASSESS', confidence: 70, urgency: 1, notes: '' }
    }),
    AUTH: Object.freeze({
      passHash: 'd5670fe9909586f26781025738c1960cfc7686c01bf721144c73cf8b82465440',
      salt: 'trestleboard-v21',
      legacyPass: 'Mufasa1945',
      maxAttempts: 5,
      lockMinutes: 15
    })
  });

  global.CLAW = global.CLAW || {};
  global.CLAW.CONFIG = CONFIG;
})(window);
