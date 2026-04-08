export function validateCommonCase(caseFile) {
  const errors = [];

  if (!caseFile.state) errors.push("State is required.");
  if (!caseFile.person?.fullName) errors.push("Full name is required.");
  if (!caseFile.caseNumber) errors.push("Case number is required.");
  if (!caseFile.court) errors.push("Court is required.");
  if (!caseFile.county) errors.push("County is required.");
  if (!Array.isArray(caseFile.charges) || caseFile.charges.length === 0) {
    errors.push("At least one charge is required.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
