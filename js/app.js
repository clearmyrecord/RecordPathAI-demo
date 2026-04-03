const offenseLevels = {
  misdemeanor: [
    { value: "MM", label: "Minor Misdemeanor" },
    { value: "M4", label: "4th Degree Misdemeanor" },
    { value: "M3", label: "3rd Degree Misdemeanor" },
    { value: "M2", label: "2nd Degree Misdemeanor" },
    { value: "M1", label: "1st Degree Misdemeanor" }
  ],
  felony: [
    { value: "F5", label: "5th Degree Felony" },
    { value: "F4", label: "4th Degree Felony" },
    { value: "F3", label: "3rd Degree Felony" },
    { value: "F2", label: "2nd Degree Felony" },
    { value: "F1", label: "1st Degree Felony" }
  ]
};

document.getElementById("offenseCategory").addEventListener("change", function () {
  const category = this.value;
  const levelSelect = document.getElementById("offenseLevel");

  levelSelect.innerHTML = "";

  offenseLevels[category]?.forEach(level => {
    const option = document.createElement("option");
    option.value = level.value;
    option.textContent = level.label;
    levelSelect.appendChild(option);
  });
});

function checkEligibility() {
  const record = {
    state: document.getElementById("state").value,
    category: document.getElementById("offenseCategory").value,
    level: document.getElementById("offenseLevel").value,
    date: document.getElementById("finalDate").value,
    finesPaid: document.getElementById("finesPaid").value === "true",
    openCases: document.getElementById("openCases").value === "true"
  };

  const result = calculateEligibility(record);

  const output = document.getElementById("result");

  if (!result.eligible) {
    output.innerHTML = `<strong>Not Eligible</strong><br>${result.reason}`;
  } else {
    output.innerHTML = `
      <strong>Eligible</strong><br>
      Eligibility Date: ${result.eligibilityDate}
    `;
  }
}
