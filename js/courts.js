const courtConfigs = {
  ohio: {
    wood: {
      courtName: "Wood County Court of Common Pleas",
      courtAddress: "One Courthouse Square, Bowling Green, OH 43402",
      filingType: "Application for Sealing of Record of Conviction",
      filingFee: "$100 filing fee may apply",
      courtWebsite: "https://www.co.wood.oh.us/clerk/",
      lookupLabel: "Wood County Clerk of Courts",
      lookupUrl: "https://clerk.woodcountyohio.gov/",
      lookupInstructions: [
        "Search by your name or case number if available.",
        "Confirm the exact case number and offense title.",
        "Write down the final disposition date.",
        "Verify the court that handled the conviction."
      ],
      instructions: [
        "Confirm the exact case number before filing.",
        "File in the same court that handled the conviction.",
        "Attach any required supporting statement or rehabilitation letter.",
        "Bring or mail the application to the clerk of courts.",
        "Keep a stamped copy for your records."
      ]
    }
  },

  nevada: {
    clark: {
      courtName: "Clark County / Las Vegas Area Record Sealing Workflow",
      courtAddress: "Confirm the exact court based on the original case",
      filingType: "Petition / Record Sealing Packet Draft",
      filingFee: "Fees may vary depending on the court and filing path",
      courtWebsite: "https://www.clarkcountycourts.us/",
      lookupLabel: "Clark County Courts",
      lookupUrl: "https://www.clarkcountycourts.us/",
      lookupInstructions: [
        "Determine which court handled the original matter.",
        "Use the court portal or clerk contact information to locate the case.",
        "Write down the exact case number and disposition date.",
        "Confirm whether additional agencies must be served."
      ],
      instructions: [
        "Confirm which court handled the underlying matter.",
        "Obtain the full criminal history and disposition details if required.",
        "Prepare the petition, affidavit, and proposed order if applicable.",
        "Serve any required agencies or prosecutors.",
        "Retain copies of everything submitted."
      ]
    }
  }
};

function normalizeCountyName(county) {
  if (!county) return "";
  return county.toLowerCase().replace("county", "").trim();
}

function getCourtConfig(state, county) {
  const normalizedState = (state || "").toLowerCase();
  const normalizedCounty = normalizeCountyName(county);

  if (
    courtConfigs[normalizedState] &&
    courtConfigs[normalizedState][normalizedCounty]
  ) {
    return courtConfigs[normalizedState][normalizedCounty];
  }

  return {
    courtName: "Court not yet mapped in MVP",
    courtAddress: "Please confirm the exact court manually.",
    filingType: "Draft record sealing application",
    filingFee: "Check with the clerk for current fees",
    courtWebsite: "",
    lookupLabel: "Case lookup source not yet mapped",
    lookupUrl: "",
    lookupInstructions: [
      "Confirm the exact court that handled the case.",
      "Search by your name or contact the clerk.",
      "Write down the case number and disposition date.",
      "Verify all filing requirements before submitting."
    ],
    instructions: [
      "Confirm the exact court and case number.",
      "Review local filing rules.",
      "Verify that all supporting materials are complete.",
      "Print and review before filing."
    ]
  };
}
