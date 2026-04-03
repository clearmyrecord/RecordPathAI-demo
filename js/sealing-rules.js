const sealingRules = {
  ohio: {
    misdemeanor: {
      MM: { wait: 6, unit: "months", eligible: true },
      M4: { wait: 1, unit: "years", eligible: true },
      M3: { wait: 1, unit: "years", eligible: true },
      M2: { wait: 1, unit: "years", eligible: true },
      M1: { wait: 1, unit: "years", eligible: true }
    },
    felony: {
      F5: { wait: 1, unit: "years", eligible: true },
      F4: { wait: 1, unit: "years", eligible: true },
      F3: { wait: 1, unit: "years", eligible: true },
      F2: { eligible: false },
      F1: { eligible: false }
    }
  }
};
