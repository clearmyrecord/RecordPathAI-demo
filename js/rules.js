(function () {
  const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
  const MONTH_MS = YEAR_MS / 12;

  function toDate(value) {
    if (!value) return null;
    const d = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(d.getTime())) return d;

    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  function elapsedSince(dateValue) {
    const date = toDate(dateValue);
    if (!date) return { years: 0, months: 0, ms: 0 };
    const ms = Date.now() - date.getTime();
    return {
      years: ms / YEAR_MS,
      months: ms / MONTH_MS,
      ms
    };
  }

  function addReason(list, message) {
    list.push(message);
  }

  function buildResult({
    eligible,
    status,
    state,
    reliefType,
    reasons = [],
    waitingPeriod = null,
    earliestEligibleDate = null,
    manualReview = false
  }) {
    return {
      eligible,
      status,
      state,
      reliefType,
      reasons,
      waitingPeriod,
      earliestEligibleDate,
      manualReview
    };
  }

  function formatDateISO(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addToDate(baseDateValue, years = 0, months = 0) {
    const d = toDate(baseDateValue);
    if (!d) return null;
    const copy = new Date(d.getTime());
    copy.setFullYear(copy.getFullYear() + years);
    copy.setMonth(copy.getMonth() + months);
    return formatDateISO(copy);
  }

  function normalizeOutcome(value) {
    return (value || "").trim().toLowerCase();
  }

  function normalizeDegree(value) {
    return (value || "").trim().toUpperCase();
  }

  function normalizeState(value) {
    const v = (value || "").trim().toUpperCase();
    const map = {
      OHIO: "OH",
      NEVADA: "NV",
      CALIFORNIA: "CA",
      ARIZONA: "AZ",
      TEXAS: "TX",
      FLORIDA: "FL"
    };
    return map[v] || v;
  }

  function isOhioNonConviction(outcome) {
    return [
      "dismissed",
      "dismissal",
      "not guilty",
      "acquitted",
      "no bill",
      "pardon",
      "intervention in lieu"
    ].includes(normalizeOutcome(outcome));
  }

  function isNevadaNonConviction(outcome) {
    return [
      "dismissed",
      "dismissal",
      "not guilty",
      "acquitted",
      "decriminalized",
      "no bill"
    ].includes(normalizeOutcome(outcome));
  }

  function inferArizonaClass(record) {
    const raw = [
      record.azClass,
      record.azOffenseClass,
      record.degree,
      record.chargeLevel,
      record.notes
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (raw.includes("class 2 felony")) return "AZ_F2";
    if (raw.includes("class 3 felony")) return "AZ_F3";
    if (raw.includes("class 4 felony")) return "AZ_F4";
    if (raw.includes("class 5 felony")) return "AZ_F5";
    if (raw.includes("class 6 felony")) return "AZ_F6";
    if (raw.includes("class 1 misdemeanor")) return "AZ_M1";
    if (raw.includes("class 2 misdemeanor")) return "AZ_M2";
    if (raw.includes("class 3 misdemeanor")) return "AZ_M3";

    return "";
  }

  function evaluateOhio(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const degree = normalizeDegree(record.degree);
    const dischargeDate = record.dischargeDate || record.dispositionDate;
    const dischargeElapsed = elapsedSince(dischargeDate);

    if (record.pendingCharges) {
      addReason(reasons, "Ohio blocks sealing or expungement while any criminal charge is still pending.");
      return buildResult({
        eligible: false,
        status: "not_eligible_yet",
        state: "OH",
        reliefType: "unknown",
        reasons
      });
    }

    if (outcome === "no bill") {
      const eligibleDate = addToDate(record.dispositionDate || record.dischargeDate, 2, 0);
      const eligible = dischargeElapsed.years >= 2;

      addReason(
        reasons,
        eligible
          ? "Ohio no-bill waiting period appears satisfied."
          : "Ohio no-bill cases generally require a 2-year wait before filing."
      );

      return buildResult({
        eligible,
        status: eligible ? "likely_eligible" : "not_eligible_yet",
        state: "OH",
        reliefType: "seal_or_expunge_non_conviction",
        reasons,
        waitingPeriod: "2 years from no-bill date",
        earliestEligibleDate: eligibleDate
      });
    }

    if (["dismissed", "dismissal", "not guilty", "acquitted", "pardon", "intervention in lieu"].includes(outcome)) {
      addReason(reasons, "Ohio non-conviction path appears available now, subject to court-specific review and exclusions.");

      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "OH",
        reliefType: "seal_or_expunge_non_conviction",
        reasons,
        earliestEligibleDate: record.dispositionDate || record.dischargeDate || null
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "OH",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (record.isTraffic) {
      addReason(reasons, "Ohio traffic convictions are excluded from standard sealing or expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isTheftInOffice) {
      addReason(reasons, "Ohio theft-in-office convictions are excluded from standard sealing or expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isFirstOrSecondDegreeFelony) {
      addReason(reasons, "Ohio 1st- and 2nd-degree felonies are excluded from standard sealing or expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isSexOffenseRegistry) {
      addReason(reasons, "Ohio registry-related sexually oriented offenses are excluded from standard sealing or expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.victimUnder13) {
      addReason(reasons, "Ohio offenses with a victim under 13 are generally excluded.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isFelonyViolenceNonSex) {
      addReason(reasons, "Ohio felony offenses of violence that are not sexually oriented offenses are generally excluded.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isDomesticViolenceConviction && !record.dvMisdemeanorSealable) {
      addReason(reasons, "Ohio domestic violence convictions are generally excluded except limited lower-level sealing situations.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    let waitYears = 0;
    let waitMonths = 0;
    let waitingPeriodLabel = "";
    let reliefType = "conviction";

    if (degree === "MM") {
      waitMonths = 6;
      waitingPeriodLabel = "6 months after discharge";
    } else if (degree === "M") {
      waitYears = 1;
      waitingPeriodLabel = "1 year after discharge";
    } else if (degree === "F4" || degree === "F5") {
      if ((record.reliefType || "").toLowerCase() === "expungement") {
        waitYears = 11;
        waitingPeriodLabel = "11 years after discharge";
        reliefType = "expungement";
      } else {
        waitYears = 1;
        waitingPeriodLabel = "1 year after discharge";
        reliefType = "sealing";
      }
    } else if (degree === "F3") {
      if (Number(record.totalFelonies || 0) > 2) {
        addReason(reasons, "Ohio third-degree felony count appears to exceed standard eligibility.");
        return buildResult({
          eligible: false,
          status: "ineligible",
          state: "OH",
          reliefType: "conviction",
          reasons
        });
      }

      if ((record.reliefType || "").toLowerCase() === "expungement") {
        waitYears = 13;
        waitingPeriodLabel = "13 years after discharge";
        reliefType = "expungement";
      } else {
        waitYears = 3;
        waitingPeriodLabel = "3 years after discharge";
        reliefType = "sealing";
      }

      if (Number(record.totalF3 || 0) >= 1) {
        addReason(reasons, "Ohio third-degree felony cases may require clumping analysis or manual review.");
      }
    } else {
      addReason(reasons, "Degree not mapped for Ohio conviction analysis.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "OH",
        reliefType: "conviction",
        reasons,
        manualReview: true
      });
    }

    const requiredMs = waitYears * YEAR_MS + waitMonths * MONTH_MS;
    const eligible = dischargeElapsed.ms >= requiredMs;
    const eligibleDate = addToDate(dischargeDate, waitYears, waitMonths);

    addReason(
      reasons,
      eligible
        ? `Ohio waiting period appears satisfied (${waitingPeriodLabel}).`
        : `Ohio waiting period not yet satisfied (${waitingPeriodLabel}).`
    );

    return buildResult({
      eligible,
      status: eligible ? "likely_eligible" : "not_eligible_yet",
      state: "OH",
      reliefType,
      reasons,
      waitingPeriod: waitingPeriodLabel,
      earliestEligibleDate: eligibleDate,
      manualReview: degree === "F3"
    });
  }

  function evaluateNevada(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const dischargeDate = record.dischargeDate || record.dispositionDate;
    const dischargeElapsed = elapsedSince(dischargeDate);

    if (isNevadaNonConviction(outcome)) {
      addReason(reasons, "Nevada non-conviction matters are generally immediately sealable.");
      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "NV",
        reliefType: "seal_non_conviction",
        reasons,
        earliestEligibleDate: record.dispositionDate || record.dischargeDate || null
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "NV",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (record.isCrimeAgainstChild || record.isSexOffense || record.isFelonyDUI || record.isHomeInvasionDeadlyWeapon) {
      addReason(reasons, "This Nevada offense appears permanently excluded from sealing.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "NV",
        reliefType: "conviction",
        reasons
      });
    }

    let waitYears = 0;
    let waitingPeriodLabel = "";

    if (record.nvCategory === "standard_misdemeanor") {
      waitYears = 1;
      waitingPeriodLabel = "1 year after case closes";
    } else if (record.nvCategory === "listed_misdemeanor") {
      waitYears = 2;
      waitingPeriodLabel = "2 years after case closes";
    } else if (record.nvCategory === "dui_or_dv") {
      waitYears = 7;
      waitingPeriodLabel = "7 years after case closes";
    } else if (record.nvCategory === "felony") {
      waitYears = 5;
      waitingPeriodLabel = "5 years after case closes";
    } else if (record.nvCategory === "violent_or_category_a") {
      waitYears = 10;
      waitingPeriodLabel = "10 years after case closes";
    } else {
      addReason(reasons, "Nevada category not mapped. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "NV",
        reliefType: "conviction",
        reasons,
        manualReview: true
      });
    }

    const eligible = dischargeElapsed.years >= waitYears;
    const eligibleDate = addToDate(dischargeDate, waitYears, 0);

    addReason(
      reasons,
      eligible
        ? `Nevada waiting period appears satisfied (${waitingPeriodLabel}).`
        : `Nevada waiting period not yet satisfied (${waitingPeriodLabel}).`
    );

    return buildResult({
      eligible,
      status: eligible ? "likely_eligible" : "not_eligible_yet",
      state: "NV",
      reliefType: "conviction",
      reasons,
      waitingPeriod: waitingPeriodLabel,
      earliestEligibleDate: eligibleDate
    });
  }

  function evaluateArizona(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const dischargeDate = record.dischargeDate || record.dispositionDate;
    const dischargeElapsed = elapsedSince(dischargeDate);
    const azClass = inferArizonaClass(record);

    if (record.pendingCharges) {
      addReason(reasons, "Arizona set-aside timing is not clean while other matters may still be pending.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "AZ",
        reliefType: "set_aside",
        reasons,
        manualReview: true
      });
    }

    if (["dismissed", "dismissal", "not guilty", "acquitted", "no bill"].includes(outcome)) {
      addReason(reasons, "Arizona non-conviction matters may be addressed without the conviction waiting period.");
      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "AZ",
        reliefType: "non_conviction_relief",
        reasons,
        earliestEligibleDate: record.dispositionDate || record.dischargeDate || null,
        manualReview: true
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "AZ",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (!azClass) {
      addReason(reasons, "Arizona offense class is missing. Exact waiting period cannot be calculated.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "AZ",
        reliefType: "set_aside",
        reasons,
        manualReview: true
      });
    }

    let waitYears = 0;
    let waitingPeriodLabel = "";

    if (azClass === "AZ_F2" || azClass === "AZ_F3") {
      waitYears = 10;
      waitingPeriodLabel = "10 years after sentence completion";
    } else if (azClass === "AZ_F4" || azClass === "AZ_F5" || azClass === "AZ_F6") {
      waitYears = 5;
      waitingPeriodLabel = "5 years after sentence completion";
    } else if (azClass === "AZ_M1") {
      waitYears = 3;
      waitingPeriodLabel = "3 years after sentence completion";
    } else if (azClass === "AZ_M2" || azClass === "AZ_M3") {
      waitYears = 2;
      waitingPeriodLabel = "2 years after sentence completion";
    }

    const eligible = dischargeElapsed.years >= waitYears;
    const eligibleDate = addToDate(dischargeDate, waitYears, 0);

    addReason(
      reasons,
      eligible
        ? `Arizona waiting period appears satisfied (${waitingPeriodLabel}).`
        : `Arizona waiting period not yet satisfied (${waitingPeriodLabel}).`
    );

    return buildResult({
      eligible,
      status: eligible ? "likely_eligible" : "not_eligible_yet",
      state: "AZ",
      reliefType: "set_aside",
      reasons,
      waitingPeriod: waitingPeriodLabel,
      earliestEligibleDate: eligibleDate,
      manualReview: true
    });
  }

  function evaluateCalifornia(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const dischargeDate = record.dischargeDate || record.dispositionDate;
    const dischargeElapsed = elapsedSince(dischargeDate);

    if (record.pendingCharges) {
      addReason(reasons, "California relief generally requires no active pending criminal matters.");
      return buildResult({
        eligible: false,
        status: "not_eligible_yet",
        state: "CA",
        reliefType: "dismissal_or_reduction",
        reasons
      });
    }

    if (["dismissed", "dismissal", "not guilty", "acquitted"].includes(outcome)) {
      addReason(reasons, "California non-conviction relief may be available now.");
      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "CA",
        reliefType: "non_conviction_relief",
        reasons,
        earliestEligibleDate: record.dispositionDate || record.dischargeDate || null,
        manualReview: true
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "CA",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (record.caReliefTrack === "1203.42") {
      const eligible = dischargeElapsed.years >= 2;
      const eligibleDate = addToDate(dischargeDate, 2, 0);

      addReason(
        reasons,
        eligible
          ? "California 1203.42 timing appears satisfied."
          : "California 1203.42 typically requires 2 years after sentence completion."
      );

      return buildResult({
        eligible,
        status: eligible ? "likely_eligible" : "not_eligible_yet",
        state: "CA",
        reliefType: "1203.42",
        reasons,
        waitingPeriod: "2 years after sentence completion",
        earliestEligibleDate: eligibleDate,
        manualReview: true
      });
    }

    if (record.caNoProbation === true) {
      const baseDate = record.dispositionDate || record.dischargeDate;
      const elapsed = elapsedSince(baseDate);
      const eligible = elapsed.years >= 1;
      const eligibleDate = addToDate(baseDate, 1, 0);

      addReason(
        reasons,
        eligible
          ? "California no-probation misdemeanor timing appears satisfied."
          : "California no-probation misdemeanor relief commonly uses a 1-year timing path."
      );

      return buildResult({
        eligible,
        status: eligible ? "likely_eligible" : "not_eligible_yet",
        state: "CA",
        reliefType: "1203.4a",
        reasons,
        waitingPeriod: "1 year from judgment",
        earliestEligibleDate: eligibleDate,
        manualReview: true
      });
    }

    addReason(reasons, "California relief path depends on probation status and statute track. Manual review is recommended.");
    return buildResult({
      eligible: !!dischargeDate,
      status: dischargeDate ? "likely_eligible" : "needs_review",
      state: "CA",
      reliefType: "dismissal_or_reduction",
      reasons,
      earliestEligibleDate: dischargeDate || null,
      manualReview: true
    });
  }

  function evaluateRecordEligibility(record) {
    const state = normalizeState(record.caseState);

    if (!state) {
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "",
        reliefType: "unknown",
        reasons: ["Case state is missing. Eligibility must be based on where the case was filed, not where the user lives."],
        manualReview: true
      });
    }

    if (state === "OH") return evaluateOhio(record);
    if (state === "NV") return evaluateNevada(record);
    if (state === "AZ") return evaluateArizona(record);
    if (state === "CA") return evaluateCalifornia(record);

    return buildResult({
      eligible: false,
      status: "needs_review",
      state,
      reliefType: "unknown",
      reasons: [`No rules engine loaded yet for ${state}.`],
      manualReview: true
    });
  }

  window.CMRRules = {
    evaluateRecordEligibility
  };
})();
