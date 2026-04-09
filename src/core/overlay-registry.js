export const OVERLAY_REGISTRY = [
  {
    id: "oh-wood-sealing-overlay",
    state: "OH",
    county: "Wood",
    court: "Wood County Court of Common Pleas",
    filingType: "sealing",
    path: "/assets/oh/wood/sealing.pdf",
    version: "1.0",
    pageCount: 2,
    defaultFontSize: 11
  }
];

export const OVERLAY_FIELDS = {
  "oh-wood-sealing-overlay": [
    {
      name: "full_name",
      page: 1,
      x: 142,
      y: 611,
      width: 180,
      fontSize: 11,
      align: "left",
      sourcePath: "person.fullName",
      color: "#000000"
    },
    {
      name: "case_number",
      page: 1,
      x: 420,
      y: 611,
      width: 120,
      fontSize: 11,
      align: "left",
      sourcePath: "caseNumber",
      color: "#000000"
    }
  ]
};
