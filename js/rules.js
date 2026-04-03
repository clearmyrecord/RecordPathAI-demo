const sealingRules = {
  ohio: {
    felony3: {
      waitingPeriodYears: 3,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "File in the court where the case was handled.",
      messageEligible:
        "Based on this simplified Ohio rule set, you may be eligible to seal this third-degree felony now.",
      messageWait:
        "Based on this simplified Ohio rule set, you may need to wait longer before sealing this third-degree felony."
    },
    felony4: {
      waitingPeriodYears: 1,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "File in the court where the case was handled.",
      messageEligible:
        "Based on this simplified Ohio rule set, you may be eligible to seal this fourth-degree felony now.",
      messageWait:
        "Based on this simplified Ohio rule set, you may need to wait longer before sealing this fourth-degree felony."
    },
    felony5: {
      waitingPeriodYears: 1,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "File in the court where the case was handled.",
      messageEligible:
        "Based on this simplified Ohio rule set, you may be eligible to seal this fifth-degree felony now.",
      messageWait:
        "Based on this simplified Ohio rule set, you may need to wait longer before sealing this fifth-degree felony."
    }
  },

  nevada: {
    felony3: {
      waitingPeriodYears: 5,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "You typically file in the court tied to the case or arrest record.",
      messageEligible:
        "Based on this simplified Nevada rule set, you may be eligible to seal this felony now.",
      messageWait:
        "Based on this simplified Nevada rule set, you may need to wait longer before sealing this felony."
    },
    felony4: {
      waitingPeriodYears: 5,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "You typically file in the court tied to the case or arrest record.",
      messageEligible:
        "Based on this simplified Nevada rule set, you may be eligible to seal this felony now.",
      messageWait:
        "Based on this simplified Nevada rule set, you may need to wait longer before sealing this felony."
    },
    felony5: {
      waitingPeriodYears: 5,
      requiresPaidFines: true,
      violentDisallowed: true,
      maxConvictions: 1,
      openCasesDisallowed: true,
      courtHint: "You typically file in the court tied to the case or arrest record.",
      messageEligible:
        "Based on this simplified Nevada rule set, you may be eligible to seal this felony now.",
      messageWait:
        "Based on this simplified Nevada rule set, you may need to wait longer before sealing this felony."
    }
  }
};
