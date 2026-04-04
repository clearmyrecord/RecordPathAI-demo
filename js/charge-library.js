window.chargeLibrary = [
  // General / common starter library
  { id: "theft", name: "Theft", category: "Property", aliases: ["stealing", "petit theft", "grand theft"] },
  { id: "shoplifting", name: "Shoplifting", category: "Property", aliases: ["retail theft"] },
  { id: "burglary", name: "Burglary", category: "Property", aliases: [] },
  { id: "robbery", name: "Robbery", category: "Property", aliases: [] },
  { id: "receiving-stolen-property", name: "Receiving Stolen Property", category: "Property", aliases: [] },
  { id: "criminal-trespass", name: "Criminal Trespass", category: "Property", aliases: ["trespassing"] },
  { id: "criminal-damaging", name: "Criminal Damaging", category: "Property", aliases: ["vandalism", "criminal mischief"] },

  { id: "assault", name: "Assault", category: "Violence", aliases: [] },
  { id: "aggravated-assault", name: "Aggravated Assault", category: "Violence", aliases: [] },
  { id: "battery", name: "Battery", category: "Violence", aliases: [] },
  { id: "domestic-violence", name: "Domestic Violence", category: "Violence", aliases: ["dv"] },
  { id: "menacing", name: "Menacing", category: "Violence", aliases: ["aggravated menacing"] },
  { id: "disorderly-conduct", name: "Disorderly Conduct", category: "Public Order", aliases: [] },
  { id: "resisting-arrest", name: "Resisting Arrest", category: "Public Order", aliases: [] },
  { id: "obstruction", name: "Obstruction", category: "Public Order", aliases: ["obstructing official business"] },

  { id: "dui", name: "DUI / OVI / DWI", category: "Driving", aliases: ["dui", "owi", "ovi", "dwi"] },
  { id: "driving-suspended", name: "Driving Under Suspension", category: "Driving", aliases: ["driving on suspended license"] },
  { id: "reckless-driving", name: "Reckless Driving", category: "Driving", aliases: [] },
  { id: "hit-skip", name: "Hit and Skip / Leaving Scene", category: "Driving", aliases: ["leaving the scene"] },

  { id: "drug-possession", name: "Drug Possession", category: "Drugs", aliases: ["possession of controlled substance", "controlled substance possession"] },
  { id: "drug-paraphernalia", name: "Drug Paraphernalia", category: "Drugs", aliases: ["paraphernalia"] },
  { id: "drug-trafficking", name: "Drug Trafficking", category: "Drugs", aliases: ["trafficking"] },
  { id: "drug-distribution", name: "Drug Distribution", category: "Drugs", aliases: ["distribution of controlled substance"] },
  { id: "marijuana-possession", name: "Marijuana Possession", category: "Drugs", aliases: ["cannabis possession"] },

  { id: "weapons-under-disability", name: "Weapons Under Disability", category: "Weapons", aliases: [] },
  { id: "unlawful-possession-weapon", name: "Unlawful Possession of a Weapon", category: "Weapons", aliases: [] },
  { id: "carrying-concealed-weapon", name: "Carrying Concealed Weapon", category: "Weapons", aliases: ["ccw offense"] },

  { id: "forgery", name: "Forgery", category: "Fraud", aliases: [] },
  { id: "identity-fraud", name: "Identity Fraud", category: "Fraud", aliases: ["identity theft"] },
  { id: "passing-bad-checks", name: "Passing Bad Checks", category: "Fraud", aliases: ["bad checks"] },
  { id: "falsification", name: "Falsification", category: "Fraud", aliases: ["false statement"] },
  { id: "unauthorized-use", name: "Unauthorized Use of Property", category: "Fraud", aliases: [] },

  { id: "public-intoxication", name: "Public Intoxication", category: "Public Order", aliases: [] },
  { id: "open-container", name: "Open Container", category: "Public Order", aliases: [] },
  { id: "inducing-panic", name: "Inducing Panic", category: "Public Order", aliases: [] },
  { id: "telephone-harassment", name: "Telephone Harassment", category: "Public Order", aliases: ["harassment"] },

  { id: "probation-violation", name: "Probation Violation", category: "Court / Compliance", aliases: [] },
  { id: "failure-to-appear", name: "Failure to Appear", category: "Court / Compliance", aliases: ["fta"] },
  { id: "contempt", name: "Contempt", category: "Court / Compliance", aliases: [] }
];

window.searchChargeLibrary = function searchChargeLibrary(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  return window.chargeLibrary
    .map((charge) => {
      const nameMatch = charge.name.toLowerCase().includes(q);
      const aliasMatch = (charge.aliases || []).some((alias) => alias.toLowerCase().includes(q));
      const startsMatch = charge.name.toLowerCase().startsWith(q);

      let score = 0;
      if (startsMatch) score += 3;
      if (nameMatch) score += 2;
      if (aliasMatch) score += 1;

      return { ...charge, score };
    })
    .filter((charge) => charge.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 8);
};
