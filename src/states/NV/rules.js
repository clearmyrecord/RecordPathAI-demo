import { validateCommonCase } from "../../core/validation.js";

export function validateCase(caseFile) {
  const base = validateCommonCase(caseFile);
  const errors = [...base.errors];

  if (caseFile.state !== "NV") {
    errors.push("Nevada validator received a non-Nevada case.");
  }

  if (!caseFile.county) {
    errors.push("Nevada county is required.");
  }

  if (!caseFile.court) {
    errors.push("Nevada court is required.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
