const officialForms = {
  ohio: {
    wood: {
      modeName: "Ohio Official-Form Mode",
      packetTitle: "Application for Sealing of Record of Conviction",
      courtCaption: "IN THE WOOD COUNTY COURT OF COMMON PLEAS, OHIO",
      applicantLabel: "Applicant",
      caseLabel: "Case No.",
      signatureLabel: "Applicant Signature",
      introText:
        "Now comes the Applicant and respectfully moves this Court for an order sealing the official record in the above-referenced matter, pursuant to applicable Ohio law.",
      checklist: [
        "Confirm the exact case number.",
        "Insert the final discharge date.",
        "Complete the current mailing address.",
        "Review all statements before signing.",
        "File with the Wood County Clerk of Courts."
      ]
    }
  },
  nevada: {
    clark: {
      modeName: "Nevada Official-Form Mode",
      packetTitle: "Petition for Record Sealing",
      courtCaption: "IN THE APPROPRIATE COURT FOR CLARK COUNTY, NEVADA",
      applicantLabel: "Petitioner",
      caseLabel: "Case No.",
      signatureLabel: "Petitioner Signature",
      introText:
        "Petitioner respectfully submits this draft petition for record sealing and requests review of the matter described below under applicable Nevada law.",
      checklist: [
        "Confirm which court handled the underlying matter.",
        "Insert the exact case number and disposition.",
        "Review whether service is required on any agency or prosecutor.",
        "Complete all signature lines.",
        "Print and file with the correct court."
      ]
    }
  }
};

function getOfficialFormConfig(state, county) {
  const normalizedState = (state || "").toLowerCase();
  const normalizedCounty = normalizeCountyName(county);

  if (
    officialForms[normalizedState] &&
    officialForms[normalizedState][normalizedCounty]
  ) {
    return officialForms[normalizedState][normalizedCounty];
  }

  return {
    modeName: "General Official-Form Mode",
    packetTitle: "Draft Record Sealing Application",
    courtCaption: "IN THE APPROPRIATE COURT",
    applicantLabel: "Applicant",
    caseLabel: "Case No.",
    signatureLabel: "Signature",
    introText:
      "The applicant respectfully submits this draft application for review and completion.",
    checklist: [
      "Confirm the correct court.",
      "Insert the exact case number.",
      "Complete all blank fields.",
      "Review before signing and filing."
    ]
  };
}
