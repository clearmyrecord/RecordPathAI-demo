const chargeLibrary = [
  {
    id: "petty_theft",
    label: "Petty Theft",
    category: "misdemeanor",
    tags: ["theft", "non_violent"],
    defaultLevel: "M1"
  },
  {
    id: "shoplifting",
    label: "Shoplifting",
    category: "misdemeanor",
    tags: ["theft", "non_violent"],
    defaultLevel: "M1"
  },
  {
    id: "disorderly_conduct",
    label: "Disorderly Conduct",
    category: "misdemeanor",
    tags: ["public_order", "non_violent"],
    defaultLevel: "M4"
  },
  {
    id: "criminal_trespass",
    label: "Criminal Trespass",
    category: "misdemeanor",
    tags: ["property", "non_violent"],
    defaultLevel: "M4"
  },
  {
    id: "dui",
    label: "Driving Under the Influence (DUI/OVI)",
    category: "misdemeanor",
    tags: ["traffic", "alcohol"],
    defaultLevel: "M1"
  },
  {
    id: "drug_possession_minor",
    label: "Drug Possession (Minor)",
    category: "misdemeanor",
    tags: ["drug", "non_violent"],
    defaultLevel: "M1"
  },
  {
    id: "drug_possession_felony",
    label: "Drug Possession (Felony)",
    category: "felony",
    tags: ["drug"],
    defaultLevel: "F5"
  },
  {
    id: "assault",
    label: "Assault",
    category: "misdemeanor",
    tags: ["violent"],
    defaultLevel: "M1"
  },
  {
    id: "domestic_violence",
    label: "Domestic Violence",
    category: "misdemeanor",
    tags: ["violent", "domestic_violence"],
    defaultLevel: "M1"
  },
  {
    id: "felonious_assault",
    label: "Felonious Assault",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F2"
  },
  {
    id: "burglary",
    label: "Burglary",
    category: "felony",
    tags: ["property"],
    defaultLevel: "F3"
  },
  {
    id: "robbery",
    label: "Robbery",
    category: "felony",
    tags: ["violent"],
    defaultLevel: "F2"
  },
  {
    id: "weapons_violation",
    label: "Weapons Violation",
    category: "felony",
    tags: ["weapon"],
    defaultLevel: "F3"
  },
  {
    id: "sex_offense",
    label: "Sex Offense",
    category: "felony",
    tags: ["sex_offense"],
    defaultLevel: "F2"
  }

function getChargeById(id) {
  return chargeLibrary.find(c => c.id === id) || null;
}

function getChargesByCategory(category) {
  return chargeLibrary.filter(c => c.category === category);
}

function hasTag(offense, tag) {
  const charge = getChargeById(offense.chargeId);
  return charge?.tags?.includes(tag);
}];
