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
      warnings: ["Need probation, jail, sentencing, or conviction completion date."]
    };
  }

  // Starter rule only. Replace with actual Ohio logic by offense/disposition.
  const estimatedEligibleDate = addYears(latestCompletionDate, 1);

  return {
    status: isPastOrToday(estimatedEligibleDate)
      ? "eligible"
      : "not_yet_eligible",
    reason: isPastOrToday(estimatedEligibleDate)
      ? "Ohio waiting period appears satisfied."
      : "Ohio waiting period appears not yet satisfied.",
    estimatedEligibleDate,
    filingType: caseFile.filingType,
    warnings: [
      "Starter Ohio rule in use. Replace with full offense-level and disposition-based timing logic."
    ]
  };
}
