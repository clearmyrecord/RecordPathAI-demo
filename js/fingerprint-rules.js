window.fingerprintRules = {
  defaultRule: {
    mayRequireFingerprints: false,
    message: "No fingerprint requirement has been flagged by the current rule set.",
    instructions: [
      "Check the court's filing instructions before submitting your application.",
      "Requirements can vary by court, county, and filing type."
    ]
  },

  states: {
    OH: {
      mayRequireFingerprints: true,
      message: "Some Ohio courts may require fingerprints with certain sealing or expungement filings.",
      instructions: [
        "Check the court's local filing instructions before submitting.",
        "Ask whether fingerprint cards, local police prints, or other identity verification are required.",
        "Bring a photo ID if fingerprinting is required."
      ]
    },

    NV: {
      mayRequireFingerprints: true,
      message: "Some Nevada courts may require fingerprints depending on the court and filing type.",
      instructions: [
        "Check the court's filing instructions before submitting your packet.",
        "Call the clerk or review the court website to confirm whether fingerprints are required.",
        "If required, ask where the court accepts fingerprint cards or electronic fingerprint submissions."
      ]
    },

    CA: {
      mayRequireFingerprints: true,
      message: "Some California filings may involve fingerprint or identity-verification requirements depending on the court or petition type.",
      instructions: [
        "Check county-specific filing instructions.",
        "Confirm whether fingerprinting is required before filing.",
        "Keep copies of any fingerprint receipt or supporting paperwork."
      ]
    },

    AZ: {
      mayRequireFingerprints: true,
      message: "Some Arizona courts may require fingerprint-related documentation depending on the filing.",
      instructions: [
        "Review local court instructions before filing.",
        "Confirm whether fingerprints or supporting identity documents are required.",
        "Bring identification to any fingerprint appointment."
      ]
    },

    FL: {
      mayRequireFingerprints: true,
      message: "Some Florida courts may require fingerprinting or supporting background documents depending on the filing path.",
      instructions: [
        "Check the court's filing instructions before submitting.",
        "Confirm whether fingerprint cards or agency-issued fingerprints are required.",
        "Keep all supporting receipts and identity documents."
      ]
    },

    TX: {
      mayRequireFingerprints: false,
      message: "No fingerprint requirement is currently flagged by the default Texas rule in this starter engine.",
      instructions: [
        "Still verify local court requirements before filing.",
        "Some counties or filing paths may have additional documentation requirements."
      ]
    }
  }
};

window.normalizeStateCode = function normalizeStateCode(value) {
  const input = String(value || "").trim().toUpperCase();

  const stateMap = {
    ALABAMA: "AL",
    ALASKA: "AK",
    ARIZONA: "AZ",
    ARKANSAS: "AR",
    CALIFORNIA: "CA",
    COLORADO: "CO",
    CONNECTICUT: "CT",
    DELAWARE: "DE",
    FLORIDA: "FL",
    GEORGIA: "GA",
    HAWAII: "HI",
    IDAHO: "ID",
    ILLINOIS: "IL",
    INDIANA: "IN",
    IOWA: "IA",
    KANSAS: "KS",
    KENTUCKY: "KY",
    LOUISIANA: "LA",
    MAINE: "ME",
    MARYLAND: "MD",
    MASSACHUSETTS: "MA",
    MICHIGAN: "MI",
    MINNESOTA: "MN",
    MISSISSIPPI: "MS",
    MISSOURI: "MO",
    MONTANA: "MT",
    NEBRASKA: "NE",
    NEVADA: "NV",
    "NEW HAMPSHIRE": "NH",
    "NEW JERSEY": "NJ",
    "NEW MEXICO": "NM",
    "NEW YORK": "NY",
    "NORTH CAROLINA": "NC",
    "NORTH DAKOTA": "ND",
    OHIO: "OH",
    OKLAHOMA: "OK",
    OREGON: "OR",
    PENNSYLVANIA: "PA",
    RHODE ISLAND: "RI",
    "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD",
    TENNESSEE: "TN",
    TEXAS: "TX",
    UTAH: "UT",
    VERMONT: "VT",
    VIRGINIA: "VA",
    WASHINGTON: "WA",
    "WEST VIRGINIA": "WV",
    WISCONSIN: "WI",
    WYOMING: "WY"
  };

  if (input.length === 2) return input;
  return stateMap[input] || input;
};

window.getFingerprintRuleForState = function getFingerprintRuleForState(stateValue) {
  const code = window.normalizeStateCode(stateValue);
  const rules = window.fingerprintRules || {};
  const states = rules.states || {};
  return states[code] || rules.defaultRule;
};

window.evaluateFingerprintRequirement = function evaluateFingerprintRequirement(offenses) {
  const list = Array.isArray(offenses) ? offenses : [];

  if (!list.length) {
    return {
      triggered: false,
      statesReviewed: [],
      matchedRules: [],
      combinedMessage: "No offenses were available to review for fingerprint requirements.",
      instructions: [
        "Add at least one offense with a state before relying on fingerprint guidance."
      ]
    };
  }

  const matchedRules = [];
  const seenStates = new Set();

  list.forEach((offense) => {
    const stateCode = window.normalizeStateCode(offense.state || "");
    if (!stateCode || seenStates.has(stateCode)) return;

    seenStates.add(stateCode);
    const rule = window.getFingerprintRuleForState(stateCode);

    matchedRules.push({
      state: stateCode,
      mayRequireFingerprints: !!rule.mayRequireFingerprints,
      message: rule.message,
      instructions: Array.isArray(rule.instructions) ? rule.instructions : []
    });
  });

  const triggered = matchedRules.some((rule) => rule.mayRequireFingerprints);

  const instructions = [];
  matchedRules.forEach((rule) => {
    rule.instructions.forEach((item) => {
      if (!instructions.includes(item)) instructions.push(item);
    });
  });

  if (!instructions.length) {
    instructions.push("Verify the court's filing requirements before submitting your application.");
  }

  return {
    triggered,
    statesReviewed: [...seenStates],
    matchedRules,
    combinedMessage: triggered
      ? "One or more states in this application may require fingerprints depending on the court or filing type."
      : "No fingerprint requirement was flagged by the current starter rules, but court-specific requirements should still be verified.",
    instructions
  };
};
