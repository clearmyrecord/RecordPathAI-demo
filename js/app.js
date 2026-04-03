let offenseCount = 0;

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

function addOffense() {
  const container = document.getElementById("offenses");
  const id = offenseCount++;

  const wrapper = document.createElement("div");
  wrapper.className = "offense";
  wrapper.id = `offense-${id}`;

  wrapper.innerHTML = `
    <div class="offense-header">
      <div class="offense-title">Offense ${id + 1}</div>
      <button type="button" class="secondary" onclick="removeOffense(${id})">Remove</button>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="state-${id}">State</label>
        <select id="state-${id}">
          <option value="ohio">Ohio</option>
        </select>
      </div>

      <div class="form-field">
        <label for="outcome-${id}">Case Outcome</label>
        <select id="outcome-${id}" onchange="toggleConvictionFields(${id})">
          <option value="">Select outcome</option>
          <option value="conviction">Conviction</option>
          <option value="dismissed">Dismissed</option>
          <option value="not_guilty">Not Guilty</option>
          <option value="no_billed">No Billed</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="form-field">
        <label for="category-${id}">Offense Category</label>
        <select id="category-${id}" onchange="updateLevels(${id})">
          <option value="">Select category</option>
          <option value="misdemeanor">Misdemeanor</option>
          <option value="felony">Felony</option>
        </select>
      </div>

      <div class="form-field">
        <label for="level-${id}">Offense Level</label>
        <select id="level-${id}">
          <option value="">Select level</option>
        </select>
      </div>

      <div class="form-field">
        <label for="date-${id}">Final Disposition Date</label>
        <input type="date" id="date-${id}" />
      </div>

      <div class="form-field conviction-only" id="fines-wrap-${id}">
        <label for="fines-${id}">Fines Paid</label>
        <select id="fines-${id}">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div class="form-field conviction-only" id="open-wrap-${id}">
        <label for="open-${id}">Any Open Cases?</label>
        <select id="open-${id}">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div class="form-field full">
        <label for="notes-${id}">Notes (optional)</label>
        <input type="text" id="notes-${id}" placeholder="Optional internal notes" />
      </div>
    </div>
  `;

  container.appendChild(wrapper);
  toggleConvictionFields(id);
}

function removeOffense(id) {
  const element = document.getElementById(`offense-${id}`);
  if (element) {
    element.remove();
  }
}

function updateLevels(id) {
  const category = document.getElementById(`category-${id}`).value;
  const levelSelect = document.getElementById(`level-${id}`);

  levelSelect.innerHTML = '<option value="">Select level</option>';

  const options = offenseLevels[category] || [];
  options.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.value;
    option.textContent = level.label;
    levelSelect.appendChild(option);
  });
}

function toggleConvictionFields(id) {
  const outcome = document.getElementById(`outcome-${id}`)?.value;
  const finesWrap = document.getElementById(`fines-wrap-${id}`);
  const openWrap = document.getElementById(`open-wrap-${id}`);
  const isConviction = outcome === "conviction";

  if (finesWrap) finesWrap.style.display = isConviction ? "block" : "none";
  if (openWrap) openWrap.style.display = isConviction ? "block" : "none";
}

function collectOffenses() {
  const offenses = [];

  for (let i = 0; i < offenseCount; i++) {
    const stateEl = document.getElementById(`state-${i}`);
    if (!stateEl) continue;

    const outcome = document.getElementById(`outcome-${i}`).value;
    const finesPaid = outcome === "conviction"
      ? document.getElementById(`fines-${i}`).value === "true"
      : true;

    const openCases = outcome === "conviction"
      ? document.getElementById(`open-${i}`).value === "true"
      : false;

    offenses.push({
      state: stateEl.value,
      outcome,
      category: document.getElementById(`category-${i}`).value,
      level: document.getElementById(`level-${i}`).value,
      date: document.getElementById(`date-${i}`).value,
      finesPaid,
      openCases,
      notes: document.getElementById(`notes-${i}`).value.trim()
    });
  }

  return offenses;
}

function renderSummary(summary) {
  if (!summary) return "";

  return `
    <div style="margin-top:12px;">
      <strong>Record summary</strong><br>
      Total conviction count: ${summary.totalConvictions}<br>
      Misdemeanor convictions: ${summary.misdemeanorConvictions}<br>
      Felony convictions: ${summary.felonyConvictions}<br>
      Highest felony level: ${summary.highestFelonyLevel || "None"}
    </div>
  `;
}

function renderOffenseSummary(offenseResults) {
  if (!offenseResults.length) return "";

  const items = offenseResults.map((offense, index) => `
    <li>
      <strong>Offense ${index + 1}:</strong>
      ${offense.label} —
      eligibility date: ${offense.eligibilityDate} —
      ${offense.eligibleNow ? "eligible now" : "not yet eligible"}
    </li>
  `).join("");

  return `<ul class="offense-summary">${items}</ul>`;
}

function renderConfidence(confidence) {
  if (!confidence) return "";

  const reasons = confidence.reasons?.length
    ? `<ul class="offense-summary">${confidence.reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>`
    : "";

  return `
    <div style="margin-top:14px; padding:14px; background:#ffffff; border:1px solid #d9e2ec; border-radius:10px;">
      <strong>Likelihood based on current information: ${confidence.score}%</strong><br>
      ${confidence.label}
      ${reasons}
      <div style="margin-top:8px; font-size:13px; color:#5b6b7f;">
        This percentage is a confidence estimate based on the information entered and current rule matching. It is not legal advice or a guaranteed outcome.
      </div>
    </div>
  `;
}

function checkAllEligibility() {
  const resultBox = document.getElementById("result");
  const offenses = collectOffenses();
  const result = evaluateAllOffenses(offenses);

  if (!result.eligible) {
    resultBox.className = "result-bad";
    resultBox.innerHTML = `
      <strong>Not Eligible</strong><br>
      ${result.reason || "The record is not currently eligible."}
      ${renderConfidence(result.confidence)}
      ${renderSummary(result.summary)}
      ${renderOffenseSummary(result.offenseResults || [])}
    `;
    return;
  }

  const today = new Date();
  const finalEligibleDate = new Date(result.eligibilityDate);
  const isNowEligible = finalEligibleDate <= today;

  resultBox.className = isNowEligible ? "result-good" : "result-neutral";
  resultBox.innerHTML = `
    <strong>${isNowEligible ? "Eligible" : "Not Yet Eligible"}</strong><br>
    Overall eligibility date: ${result.eligibilityDate}
    ${renderConfidence(result.confidence)}
    ${renderSummary(result.summary)}
    ${renderOffenseSummary(result.offenseResults || [])}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  addOffense();
});
