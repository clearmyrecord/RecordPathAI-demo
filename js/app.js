let offenseCount = 0;

function addOffense() {
  const container = document.getElementById("offenses");

  const id = offenseCount++;

  const div = document.createElement("div");
  div.className = "offense";
  div.id = "offense-" + id;

  div.innerHTML = `
    <div class="form-field">
      <label>State</label>
      <select id="state-${id}">
        <option value="ohio">Ohio</option>
      </select>
    </div>

    <div class="form-field">
      <label>Category</label>
      <select onchange="updateLevels(${id})" id="category-${id}">
        <option value="">Select</option>
        <option value="misdemeanor">Misdemeanor</option>
        <option value="felony">Felony</option>
      </select>
    </div>

    <div class="form-field">
      <label>Level</label>
      <select id="level-${id}"></select>
    </div>

    <div class="form-field">
      <label>Final Disposition Date</label>
      <input type="date" id="date-${id}" />
    </div>

    <div class="form-field">
      <label>Fines Paid</label>
      <select id="fines-${id}">
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </div>

    <div class="form-field">
      <label>Open Cases</label>
      <select id="open-${id}">
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
    </div>
  `;

  container.appendChild(div);
}

function updateLevels(id) {
  const category = document.getElementById(`category-${id}`).value;
  const levelSelect = document.getElementById(`level-${id}`);

  const levels = {
    misdemeanor: ["MM","M4","M3","M2","M1"],
    felony: ["F5","F4","F3","F2","F1"]
  };

  levelSelect.innerHTML = "";

  levels[category]?.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    levelSelect.appendChild(opt);
  });
}

function collectOffenses() {
  const offenses = [];

  for (let i = 0; i < offenseCount; i++) {
    if (!document.getElementById(`state-${i}`)) continue;

    offenses.push({
      state: document.getElementById(`state-${i}`).value,
      category: document.getElementById(`category-${i}`).value,
      level: document.getElementById(`level-${i}`).value,
      date: document.getElementById(`date-${i}`).value,
      finesPaid: document.getElementById(`fines-${i}`).value === "true",
      openCases: document.getElementById(`open-${i}`).value === "true"
    });
  }

  return offenses;
}

function checkAllEligibility() {
  const offenses = collectOffenses();
  const result = evaluateAllOffenses(offenses);

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
