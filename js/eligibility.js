function evaluateAllOffenses(offenses) {
  if (!offenses.length) {
    return { eligible: false, reason: "No offenses entered." };
  }

  let latestDate = null;

  for (let offense of offenses) {

    if (offense.openCases) {
      return { eligible: false, reason: "Open cases must be resolved." };
    }

    if (!offense.finesPaid) {
      return { eligible: false, reason: "Fines must be paid." };
    }

    const rule = sealingRules?.[offense.state]?.[offense.category]?.[offense.level];

    if (!rule || !rule.eligible) {
      return { eligible: false, reason: `Offense ${offense.level} is not eligible.` };
    }

    const base = new Date(offense.date);
    const eligibilityDate = new Date(base);

    if (rule.unit === "years") {
      eligibilityDate.setFullYear(base.getFullYear() + rule.wait);
    }

    if (rule.unit === "months") {
      eligibilityDate.setMonth(base.getMonth() + rule.wait);
    }

    if (!latestDate || eligibilityDate > latestDate) {
      latestDate = eligibilityDate;
    }
  }

  const today = new Date();

  return {
    eligible: latestDate <= today,
    eligibilityDate: latestDate.toISOString().split("T")[0]
  };
}
