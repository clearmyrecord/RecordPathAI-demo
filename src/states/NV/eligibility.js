import {
  addYears,
  getLatestCompletionDate,
  isPastOrToday
} from "../../core/date-utils.js";

export function calculateEligibility(caseFile) {
  const latestCompletionDate = getLatestCompletionDate(caseFile.charges);

  if (!latestCompletionDate) {
    return {
      status: "manual_review",
      reason: "Missing sentence completion data.",
      estimatedEligibleDate: "",
      filingType: caseFile.filingType,
      warnings: ["Need sentence completion date for Nevada review."]
    };
  }

  // Starter rule only. Replace with actual Nevada record sealing timing.
  const estimatedEligibleDate = addYears(latestCompletionDate, 2);

  return {
    status: isPastOrToday(estimatedEligibleDate)
      ? "eligible"
      : "not_yet_eligible",
    reason: isPastOrToday(estimatedEligibleDate)
      ? "Nevada waiting period appears satisfied."
      : "Nevada waiting period appears not yet satisfied.",
    estimatedEligibleDate,
    filingType: "sealing",
    warnings: [
      "Starter Nevada rule in use. Replace with full offense-level and disposition-based logic."
    ]
  };
}
