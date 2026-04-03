window.chargeLibrary = [
  {
    id: "petty_theft",
    label: "Petty Theft",
    category: "misdemeanor",
    tags: ["non_violent"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  },
  {
    id: "shoplifting",
    label: "Shoplifting",
    category: "misdemeanor",
    tags: ["non_violent"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  },
  {
    id: "criminal_trespass",
    label: "Criminal Trespass",
    category: "misdemeanor",
    tags: ["non_violent"],
    defaultLevel: "M4",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  },
  {
    id: "drug_possession_minor",
    label: "Drug Possession (Minor)",
    category: "misdemeanor",
    tags: ["drug", "non_violent"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  },
  {
    id: "drug_possession_felony",
    label: "Drug Possession (Felony)",
    category: "felony",
    tags: ["drug"],
    defaultLevel: "F5",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  },
  {
    id: "traffic_conviction",
    label: "Traffic Conviction",
    category: "misdemeanor",
    tags: ["traffic"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "Traffic convictions are excluded."
    }
  },
  {
    id: "theft_in_office",
    label: "Theft in Office",
    category: "felony",
    tags: ["theft"],
    defaultLevel: "F4",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "Theft in Office convictions are excluded."
    }
  },
  {
    id: "assault",
    label: "Assault",
    category: "misdemeanor",
    tags: ["violent"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense is listed as an offense of violence."
    }
  },
  {
    id: "aggravated_assault",
    label: "Aggravated Assault",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F4",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense is listed as an offense of violence."
    }
  },
  {
    id: "domestic_violence",
    label: "Domestic Violence",
    category: "misdemeanor",
    tags: ["violent", "domestic_violence"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "Domestic violence convictions are generally excluded, except 3rd/4th degree misdemeanor sealing."
    }
  },
  {
    id: "violating_protection_order",
    label: "Violating Protection Order",
    category: "misdemeanor",
    tags: ["protection_order"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false,
      notes: "Handout notes sealing allowed."
    }
  },
  {
    id: "felonious_assault",
    label: "Felonious Assault",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F2",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "Felony offenses of violence that are not sexually oriented offenses are excluded."
    }
  },
  {
    id: "burglary_2911_12_a1_a3",
    label: "Burglary (R.C. 2911.12(A)(1)-(3))",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F3",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense is listed as an offense of violence."
    }
  },
  {
    id: "robbery",
    label: "Robbery",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F2",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense is listed as an offense of violence."
    }
  },
  {
    id: "sex_offense",
    label: "Sex Offense",
    category: "felony",
    tags: ["sex_offense"],
    defaultLevel: "F2",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "Many sexually oriented offenses are excluded."
    }
  },
  {
    id: "sexual_imposition",
    label: "Sexual Imposition",
    category: "misdemeanor",
    tags: ["sex_offense"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense is listed among excluded sexually oriented offenses."
    }
  },
  {
    id: "public_indecency",
    label: "Public Indecency",
    category: "misdemeanor",
    tags: ["sex_offense"],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: true,
      excludedForExpungement: true,
      exclusionReason: "This offense can be excluded depending on statute details."
    }
  },
  {
    id: "rc_2921_43",
    label: "R.C. 2921.43 Offense",
    category: "felony",
    tags: ["special_wait_rule"],
    defaultLevel: "F4",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false,
      specialWaitRule: "seven_year_sealing"
    }
  },
  {
    id: "custom_other",
    label: "Other / Not Listed",
    category: "misdemeanor",
    tags: [],
    defaultLevel: "M1",
    ohio: {
      excludedForSealing: false,
      excludedForExpungement: false
    }
  }
];

window.getChargeById = function (id) {
  var i;
  for (i = 0; i < window.chargeLibrary.length; i++) {
    if (window.chargeLibrary[i].id === id) {
      return window.chargeLibrary[i];
    }
  }
  return null;
};

window.chargeHasTag = function (chargeId, tag) {
  var charge = window.getChargeById(chargeId);
  if (!charge || !charge.tags) {
    return false;
  }
  return charge.tags.indexOf(tag) !== -1;
};

window.isOhioChargeExcluded = function (chargeId, remedyType, offenseLevel) {
  var charge = window.getChargeById(chargeId);

  if (!charge || !charge.ohio) {
    return { excluded: false, reason: "" };
  }

  if (chargeId === "domestic_violence") {
    if (remedyType === "sealing" && (offenseLevel === "M3" || offenseLevel === "M4")) {
      return { excluded: false, reason: "" };
    }

    return {
      excluded: true,
      reason: charge.ohio.exclusionReason || "Domestic violence is excluded for this remedy."
    };
  }

  if (remedyType === "sealing" && charge.ohio.excludedForSealing) {
    return {
      excluded: true,
      reason: charge.ohio.exclusionReason || "This charge is excluded from sealing."
    };
  }

  if (remedyType === "expungement" && charge.ohio.excludedForExpungement) {
    return {
      excluded: true,
      reason: charge.ohio.exclusionReason || "This charge is excluded from expungement."
    };
  }

  return { excluded: false, reason: "" };
};
