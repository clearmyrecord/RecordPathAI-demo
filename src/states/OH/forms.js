const OH_CHARGES = [
  { label: "Possession of Drugs", statute: "2925.11" },
  { label: "Drug Paraphernalia", statute: "2925.14" },
  { label: "Theft", statute: "2913.02" },
  { label: "Disorderly Conduct", statute: "2917.11" }
];

export function getChargeOptions() {
  return OH_CHARGES;
}
