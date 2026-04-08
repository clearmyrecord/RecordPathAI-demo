export const NV_COUNTIES = [
  "Carson City",
  "Churchill",
  "Clark",
  "Douglas",
  "Elko",
  "Esmeralda",
  "Eureka",
  "Humboldt",
  "Lander",
  "Lincoln",
  "Lyon",
  "Mineral",
  "Nye",
  "Pershing",
  "Storey",
  "Washoe",
  "White Pine"
];

export function listCounties() {
  return NV_COUNTIES;
}

export function listCourts(county = "") {
  const map = {
    Clark: [
      "Las Vegas Justice Court",
      "Eighth Judicial District Court",
      "Henderson Justice Court",
      "North Las Vegas Municipal Court"
    ],
    Washoe: [
      "Second Judicial District Court",
      "Reno Justice Court"
    ]
  };

  return map[county] || [];
}
