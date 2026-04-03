function getSealingRule(offense) {
  return sealingRules?.[offense.state]?.[offense.outcome]?.[offense.category]?.[offense.level] || null;
}

function getAggregateRules(state) {
  return sealingRules?.[state]?.aggregate || null;
}

function addWaitToDate(baseDate, wait, unit) {
  const result = new Date(baseDate);

  if (unit === "years") {
    result.setFullYear(result.getFullYear() + wait);
  } else if (unit === "months") {
    result.setMonth(result.getMonth() + wait);
  } else if (unit === "days") {
    result.setDate(result.getDate() + wait);
  }

  return result;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function levelRank(level) {
  const ranks = {
    F1: 5,
    F2: 4,
    F3: 3,
    F4: 2,
    F5: 1,
    M1: 5,
    M2: 4,
    M3: 3,
    M4: 2,
    MM: 1
  };

  return ranks[level] || 0;
}

function summarizeRecord(offenses, aggregateRules) {
  const countableOutcomes = aggregateRules?.countOnlyOutcomes || ["conviction"];
  const excludedOutcomes = aggregateRules?.excludedOutcomesFromCount || [];

  let totalConvictions = 0;
  let misdemeanorConvictions = 0;
  let felonyConvictions = 0;
  let highestFelonyLevel = null;

  for (const offense of offenses) {
    const isExcludedOutcome = excludedOutcomes.includes(offense.outcome);
    const isCountable = countableOutcomes.includes(offense.outcome) && !isExcludedOutcome;

    if (!isCountable) continue;

    totalConvictions++;

    if (offense.category === "misdemeanor") {
      misdemeanorConvictions++;
    }

    if (offense.category === "felony") {
      felonyConvictions++;

      if (!highestFelonyLevel || levelRank(offense.level) > levelRank(highestFelonyLevel)) {
        highestFelonyLevel = offense.level;
      }
    }
  }

  return {
    totalConvictions,
    misdemeanorConvictions,
    felonyConvictions,
    highestFelonyLevel
  };
}

function checkAggregateRules(offenses) {
  if (!offenses.length) {
    return { ok: false, reason: "No offenses entered.", summary: null };
  }

  const state = offenses[0].state;
  const aggregateRules = getAggregateRules(state);

  if (!aggregateRules) {
    return { ok: true, reason: null, summary: null };
  }

  const summary = summarizeRecord(offenses, aggregateRules);

  if (
    typeof aggregateRules.maxConvictionsTotal === "number" &&
    summary.totalConvictions > aggregateRules.maxConvictionsTotal
  ) {
    return {
      ok: false,
      reason: `Too many total convictions. Maximum allowed is ${aggregateRules.maxConvictionsTotal}.`,
      summary
    };
  }

  if (
    typeof aggregateRules.maxMisdemeanorConvictions === "number" &&
    summary.misdemeanorConvictions > aggregateRules.maxMisdemeanorConvictions
  ) {
    return {
      ok: false,
      reason: `Too many misdemeanor convictions. Maximum allowed is ${aggregateRules.maxMisdemeanorConvictions}.`,
      summary
    };
  }

  if (
    typeof aggregateRules.maxFelonyConvictions === "number" &&
    summary.felonyConvictions > aggregateRules.maxFelonyConvictions
  ) {
    return {
      ok: false,
      reason: `Too many felony convictions. Maximum allowed is ${aggregateRules.maxFelonyConvictions}.`,
      summary
    };
  }

  if (
    aggregateRules.allowMixedFelonyMisdemeanor === false &&
    summary.felonyConvictions > 0 &&
    summary.misdemeanorConvictions > 0
  ) {
    return {
      ok: false,
      reason: "Mixed felony and misdemeanor convictions are not allowed under the current rules.",
      summary
    };
  }

  if (
    aggregateRules.maxFelonyLevelAllowed &&
    summary.highestFelonyLevel &&
    levelRank(summary.highestFelonyLevel) > levelRank(aggregateRules.maxFelonyLevelAllowed)
  ) {
    return {
      ok: false,
      reason: `Felony conviction level ${summary.highestFelonyLevel} exceeds the current maximum allowed level of ${aggregateRules.maxFelonyLevelAllowed}.`,
      summary
    };
  }

  if (Array.isArray(aggregateRules.excludedCategories) && aggregateRules.excludedCategories.length) {
    const blockedCategory = offenses.find(
      (offense) =>
        offense.outcome === "conviction" &&
        aggregateRules.excludedCategories.includes(offense.category)
    );

    if (blockedCategory) {
      return {
        ok: false,
        reason: `A conviction in category "${blockedCategory.category}" is excluded under the current rules.`,
        summary
      };
    }
  }

  if (Array.isArray(aggregateRules.excludedLevels) && aggregateRules.excludedLevels.length) {
    const blockedLevel = offenses.find(
      (offense) =>
        offense.outcome === "conviction" &&
        aggregateRules.excludedLevels.includes(offense.level)
    );

    if (blockedLevel) {
      return {
        ok: false,
        reason: `A conviction at level "${blockedLevel.level}" is excluded under the current rules.`,
        summary
      };
    }
  }

  if (Array.isArray(aggregateRules.blockedCombinations)) {
    for (const combo of aggregateRules.blockedCombinations) {
      if (typeof combo.test === "function" && combo.test(summary, offenses)) {
        return {
          ok: false,
          reason: combo.message || "This record combination is not allowed under the current rules.",
          summary
        };
      }
    }
  }

  return {
    ok: true,
    reason: null,
    summary
  };
}

function evaluateAllOffenses(offenses) {
  if (!offenses.length) {
    return {
      eligible: false,
      reason: "No offenses entered.",
      offenseResults: []
    };
  }

  let latestEligibilityDate = null;
  const today = new Date();
  const offenseResults = [];

  for (const offense of offenses) {
    if (!offense.category) {
      return { eligible: false, reason: "Every offense must include an offense category.", offenseResults };
    }

    if (!offense.level) {
      return { eligible: false, reason: "Every offense must include an offense level.", offenseResults };
    }

    if (!offense.outcome) {
      return { eligible: false, reason: "Every offense must include a case outcome.", offenseResults };
    }

    if (!offense.date) {
      return { eligible: false, reason: "Every offense must include a final disposition date.", offenseResults };
    }

    if (offense.outcome === "conviction" && offense.openCases) {
      return { eligible: false, reason: "Open cases must be resolved before sealing a conviction.", offenseResults };
    }

    if (offense.outcome === "conviction" && !offense.finesPaid) {
      return { eligible: false, reason: "Fines must be paid before sealing a conviction.", offenseResults };
    }

    const rule = getSealingRule(offense);

    if (!rule) {
      return {
        eligible: false,
        reason: `No rule found for ${offense.outcome} ${offense.category} ${offense.level}.`,
        offenseResults
      };
    }

    if (!rule.eligible) {
      return {
        eligible: false,
        reason: `${rule.label || "This offense"} is not eligible under the current rules.`,
        offenseResults
      };
    }

    const baseDate = new Date(offense.date);
    const eligibilityDate = addWaitToDate(baseDate, rule.wait || 0, rule.unit || "days");
    const offenseEligibleNow = eligibilityDate <= today;

    offenseResults.push({
      ...offense,
      label: rule.label || `${offense.outcome} ${offense.category} ${offense.level}`,
      eligibilityDate: formatDate(eligibilityDate),
      eligibleNow: offenseEligibleNow
    });

    if (!latestEligibilityDate || eligibilityDate > latestEligibilityDate) {
      latestEligibilityDate = eligibilityDate;
    }
  }

  const aggregateCheck = checkAggregateRules(offenses);

  if (!aggregateCheck.ok) {
    return {
      eligible: false,
      reason: aggregateCheck.reason,
      offenseResults,
      summary: aggregateCheck.summary || null
    };
  }

  return {
    eligible: latestEligibilityDate <= today,
    eligibilityDate: formatDate(latestEligibilityDate),
    offenseResults,
    summary: aggregateCheck.summary || null
  };
}
