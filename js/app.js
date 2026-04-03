function goToDetails() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const state = document.getElementById("state").value;
  const offense = document.getElementById("offense").value;

  if (!fullName || !email || !state || !offense) {
    alert("Please complete all fields before continuing.");
    return;
  }

  localStorage.setItem("fullName", fullName);
  localStorage.setItem("email", email);
  localStorage.setItem("state", state);
  localStorage.setItem("offense", offense);

  window.location.href = "record-details.html";
}

function checkEligibility() {
  const county = document.getElementById("county").value.trim();
  const felony = document.getElementById("felony").value;
  const violent = document.getElementById("violent").value;
  const years = Number(document.getElementById("years").value);
  const fines = document.getElementById("fines").value;
  const openCases = document.getElementById("openCases").value;
  const convictions = Number(document.getElementById("convictions").value);
  const state = localStorage.getItem("state");

  if (!felony || !violent || Number.isNaN(years) || !fines || !openCases || !convictions) {
    alert("Please complete all required fields before continuing.");
    return;
  }

  localStorage.setItem("county", county);
  localStorage.setItem("felony", felony);
  localStorage.setItem("violent", violent);
  localStorage.setItem("years", String(years));
  localStorage.setItem("fines", fines);
  localStorage.setItem("openCases", openCases);
  localStorage.setItem("convictions", String(convictions));

  const result = evaluateEligibility({
    state,
    felony,
    violent,
    years,
    fines,
    openCases,
    convictions,
    county
  });

  localStorage.setItem("eligibilityResult", JSON.stringify(result));
  initializeChecklist();
  window.location.href = "results.html";
}

function evaluateEligibility(data) {
  const stateRules = sealingRules[data.state];

  if (!stateRules) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This MVP does not yet support that state.",
      nextStep: "Please contact support or check back later for expanded state coverage.",
      courtHint: "",
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  const ruleKey = `felony${data.felony}`;
  const rule = stateRules[ruleKey];

  if (!rule) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This MVP does not yet support that offense level.",
      nextStep: "A manual review may be needed.",
      courtHint: "",
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  if (rule.violentDisallowed && data.violent === "yes") {
    return {
      status: "not-eligible",
      title: "Not Eligible Yet",
      message: "Violent offenses are not eligible under this simplified MVP rule set.",
      nextStep: "You may need a more detailed legal review.",
      courtHint: rule.courtHint,
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  if (rule.openCasesDisallowed && data.openCases === "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Open criminal cases may block sealing until resolved.",
      nextStep: "Resolve any open cases first, then recheck eligibility.",
      courtHint: rule.courtHint,
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  if (rule.requiresPaidFines && data.fines !== "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Outstanding fines may prevent record sealing until they are paid.",
      nextStep: "Pay any required fines, then recheck eligibility.",
      courtHint: rule.courtHint,
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  if (data.convictions > rule.maxConvictions) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This simplified MVP supports only limited conviction scenarios.",
      nextStep: "A manual review may be needed for multiple convictions.",
      courtHint: rule.courtHint,
      yearsRemaining: null,
      estimatedEligibleDate: null
    };
  }

  if (data.years >= rule.waitingPeriodYears) {
    return {
      status: "eligible",
      title: "You May Be Eligible",
      message: rule.messageEligible,
      nextStep: "Next, gather your case number, court name, and filing documents.",
      courtHint: rule.courtHint,
      yearsRemaining: 0,
      estimatedEligibleDate: new Date().toISOString().split("T")[0]
    };
  }

  const yearsRemaining = rule.waitingPeriodYears - data.years;
  const estimatedEligibleDate = calculateFutureDate(yearsRemaining);

  return {
    status: "not-eligible",
    title: "Not Eligible Yet",
    message: `${rule.messageWait} Estimated time remaining: ${yearsRemaining} year(s).`,
    nextStep: "Set a reminder and come back when the waiting period has passed.",
    courtHint: rule.courtHint,
    yearsRemaining,
    estimatedEligibleDate
  };
}

function calculateFutureDate(yearsRemaining) {
  const today = new Date();
  const future = new Date(today);
  future.setFullYear(today.getFullYear() + Number(yearsRemaining));
  return future.toISOString().split("T")[0];
}

function goToPacket() {
  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) {
    alert("Please complete the eligibility check first.");
    return;
  }
  window.location.href = "packet.html";
}

window.onload = function () {
  renderResultPage();
  renderReminderBox();
  renderChecklist("checklist-box");
  renderPacketPage();
  renderChecklist("packet-checklist-box");
  renderCourtFinder();
};

function renderResultPage() {
  const resultBox = document.getElementById("result-box");
  if (!resultBox) return;

  const raw = localStorage.getItem("eligibilityResult");

  if (!raw) {
    resultBox.innerHTML = `
      <div class="result-card review">
        <div class="result-status">No result found</div>
        <p>Please complete the eligibility check first.</p>
      </div>
    `;
    return;
  }

  const result = JSON.parse(raw);
  const fullName = localStorage.getItem("fullName") || "there";
  const state = localStorage.getItem("state") || "";
  const county = localStorage.getItem("county") || "";

  resultBox.innerHTML = `
    <div class="result-card ${result.status}">
      <div class="result-status">${escapeHtml(result.title)}</div>
      <h3>Hello, ${escapeHtml(fullName)}</h3>
      <p>${escapeHtml(result.message)}</p>
      ${county ? `<p><strong>County entered:</strong> ${escapeHtml(county)}</p>` : ""}
      ${state ? `<p><strong>State:</strong> ${escapeHtml(capitalize(state))}</p>` : ""}
      ${result.courtHint ? `<p><strong>Where to file:</strong> ${escapeHtml(result.courtHint)}</p>` : ""}
      <div class="next-step-box">
        <strong>Suggested next step:</strong>
        <p>${escapeHtml(result.nextStep)}</p>
      </div>
    </div>
  `;
}

function renderCourtFinder() {
  const box = document.getElementById("court-finder-box");
  if (!box) return;

  const stateRaw = localStorage.getItem("state") || "";
  const county = localStorage.getItem("county") || "";
  const court = getCourtConfig(stateRaw, county);

  box.innerHTML = `
    <div class="finder-card">
      <h3>Court Finder + Case Lookup Helper</h3>
      <p class="finder-subtext">
        Based on your state and county, this is the best starting point for locating your case.
      </p>

      <table class="finder-table">
        <tr>
          <th>Likely Court</th>
          <td>${escapeHtml(court.courtName)}</td>
        </tr>
        <tr>
          <th>Address / Location</th>
          <td>${escapeHtml(court.courtAddress)}</td>
        </tr>
        <tr>
          <th>Lookup Source</th>
          <td>${escapeHtml(court.lookupLabel)}</td>
        </tr>
        <tr>
          <th>Website</th>
          <td>
            ${
              court.lookupUrl
                ? `<a href="${escapeHtml(court.lookupUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(court.lookupUrl)}</a>`
                : "Not yet mapped"
            }
          </td>
        </tr>
      </table>

      <div class="finder-checklist">
        <h4>How to find your case number</h4>
        <ul>
          ${court.lookupInstructions.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="finder-fields">
        <label for="caseNumber">Case Number</label>
        <input id="caseNumber" type="text" placeholder="Enter case number if found" value="${escapeHtml(localStorage.getItem("caseNumber") || "")}" />

        <label for="dispositionDate">Disposition / Final Discharge Date</label>
        <input id="dispositionDate" type="text" placeholder="MM/DD/YYYY or YYYY-MM-DD" value="${escapeHtml(localStorage.getItem("dispositionDate") || "")}" />

        <div class="finder-actions">
          <button class="primary-btn" onclick="saveCaseLookupData()">Save Lookup Info</button>
        </div>

        <div id="finder-success"></div>
      </div>
    </div>
  `;
}

function saveCaseLookupData() {
  const caseNumber = document.getElementById("caseNumber")?.value.trim() || "";
  const dispositionDate = document.getElementById("dispositionDate")?.value.trim() || "";
  const success = document.getElementById("finder-success");

  localStorage.setItem("caseNumber", caseNumber);
  localStorage.setItem("dispositionDate", dispositionDate);

  if (success) {
    success.innerHTML = `
      <div class="finder-success">
        Case lookup info saved.
      </div>
    `;
  }
}

function renderReminderBox() {
  const reminderBox = document.getElementById("reminder-box");
  if (!reminderBox) return;

  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) return;

  const result = JSON.parse(raw);
  const email = localStorage.getItem("email") || "";

  if (result.status !== "not-eligible" || !result.estimatedEligibleDate) {
    reminderBox.innerHTML = "";
    return;
  }

  reminderBox.innerHTML = `
    <div class="reminder-card">
      <h3>Want a reminder when you may be eligible?</h3>
      <p>
        Estimated eligibility date:
        <strong>${escapeHtml(formatDisplayDate(result.estimatedEligibleDate))}</strong>
      </p>

      <label for="reminderEmail">Email</label>
      <input id="reminderEmail" type="email" value="${escapeHtml(email)}" placeholder="you@example.com" />

      <div class="reminder-actions">
        <button class="primary-btn" onclick="saveReminder()">Save Reminder</button>
        <button class="secondary-btn" onclick="downloadReminder()">Download Reminder Data</button>
      </div>

      <div id="reminder-success"></div>
    </div>
  `;
}

function saveReminder() {
  const emailField = document.getElementById("reminderEmail");
  const successBox = document.getElementById("reminder-success");
  const raw = localStorage.getItem("eligibilityResult");

  if (!emailField || !raw || !successBox) return;

  const email = emailField.value.trim();
  if (!email) {
    alert("Please enter an email address.");
    return;
  }

  const result = JSON.parse(raw);

  const reminder = {
    fullName: localStorage.getItem("fullName") || "",
    email,
    state: localStorage.getItem("state") || "",
    county: localStorage.getItem("county") || "",
    offense: localStorage.getItem("offense") || "",
    estimatedEligibleDate: result.estimatedEligibleDate,
    yearsRemaining: result.yearsRemaining,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("eligibilityReminder", JSON.stringify(reminder));

  successBox.innerHTML = `
    <div class="reminder-success">
      Reminder saved for <strong>${escapeHtml(email)}</strong>.<br />
      Estimated reminder date: <strong>${escapeHtml(formatDisplayDate(result.estimatedEligibleDate))}</strong>
    </div>
  `;
}

function downloadReminder() {
  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) {
    alert("No reminder data found.");
    return;
  }

  const result = JSON.parse(raw);

  const reminder = {
    fullName: localStorage.getItem("fullName") || "",
    email: document.getElementById("reminderEmail")?.value.trim() || localStorage.getItem("email") || "",
    state: localStorage.getItem("state") || "",
    county: localStorage.getItem("county") || "",
    offense: localStorage.getItem("offense") || "",
    estimatedEligibleDate: result.estimatedEligibleDate,
    yearsRemaining: result.yearsRemaining,
    createdAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(reminder, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clearmyrecord-reminder.json";
  a.click();
  URL.revokeObjectURL(url);
}

function initializeChecklist() {
  const stateRaw = localStorage.getItem("state") || "";
  const county = localStorage.getItem("county") || "";
  const resultRaw = localStorage.getItem("eligibilityResult");
  const result = resultRaw ? JSON.parse(resultRaw) : null;
  const court = getCourtConfig(stateRaw, county);

  const checklistItems = [
    `Confirm the exact court${court.courtName ? `: ${court.courtName}` : ""}`,
    "Use the lookup helper to find your case number",
    "Save your case number and disposition date",
    "Confirm final discharge / disposition date",
    "Confirm all fines and fees are paid",
    "Review your generated packet",
    "Print or save your packet as PDF",
    "Sign the application and attachment letter",
    "File the packet with the clerk",
    "Keep a stamped or saved copy for your records"
  ];

  if (result && result.status === "not-eligible") {
    checklistItems.unshift("Save a reminder for your estimated eligibility date");
  }

  localStorage.setItem("filingChecklistItems", JSON.stringify(checklistItems));

  const existing = localStorage.getItem("filingChecklistState");
  if (!existing) {
    const initialState = checklistItems.map(() => false);
    localStorage.setItem("filingChecklistState", JSON.stringify(initialState));
  }
}

function renderChecklist(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const itemsRaw = localStorage.getItem("filingChecklistItems");
  if (!itemsRaw) return;

  const items = JSON.parse(itemsRaw);
  let state = JSON.parse(localStorage.getItem("filingChecklistState") || "[]");

  if (!Array.isArray(state) || state.length !== items.length) {
    state = items.map(() => false);
    localStorage.setItem("filingChecklistState", JSON.stringify(state));
  }

  const completed = state.filter(Boolean).length;
  const percent = items.length ? Math.round((completed / items.length) * 100) : 0;

  container.innerHTML = `
    <div class="checklist-card">
      <div class="checklist-header">
        <div>
          <h3>Your Filing Checklist</h3>
          <p class="checklist-subtext">Track your progress from eligibility to filing.</p>
        </div>
        <div class="checklist-progress-badge">${percent}% Complete</div>
      </div>

      <div class="checklist-progress-bar">
        <div class="checklist-progress-fill" style="width:${percent}%"></div>
      </div>

      <div class="checklist-items">
        ${items.map((item, index) => {
          const checked = state[index] ? "checked" : "";
          return `
            <label class="checklist-item">
              <input type="checkbox" ${checked} onchange="toggleChecklistItem(${index})" />
              <span>${escapeHtml(item)}</span>
            </label>
          `;
        }).join("")}
      </div>

      <div class="checklist-footer">
        <button class="secondary-btn" onclick="resetChecklist()">Reset Checklist</button>
      </div>
    </div>
  `;
}

function toggleChecklistItem(index) {
  let state = JSON.parse(localStorage.getItem("filingChecklistState") || "[]");
  state[index] = !state[index];
  localStorage.setItem("filingChecklistState", JSON.stringify(state));
  renderChecklist("checklist-box");
  renderChecklist("packet-checklist-box");
}

function resetChecklist() {
  const items = JSON.parse(localStorage.getItem("filingChecklistItems") || "[]");
  const resetState = items.map(() => false);
  localStorage.setItem("filingChecklistState", JSON.stringify(resetState));
  renderChecklist("checklist-box");
  renderChecklist("packet-checklist-box");
}

function renderPacketPage() {
  const packet = document.getElementById("packet-content");
  if (!packet) return;

  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) {
    packet.innerHTML = `
      <div class="packet-section">
        <h2>No packet data found</h2>
        <p>Please complete the eligibility check first.</p>
      </div>
    `;
    return;
  }

  const result = JSON.parse(raw);

  const data = {
    fullName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    state: capitalize(localStorage.getItem("state") || ""),
    stateRaw: localStorage.getItem("state") || "",
    offense: formatOffense(localStorage.getItem("offense") || ""),
    county: localStorage.getItem("county") || "",
    felony: localStorage.getItem("felony") || "",
    violent: localStorage.getItem("violent") || "",
    years: localStorage.getItem("years") || "",
    fines: localStorage.getItem("fines") || "",
    openCases: localStorage.getItem("openCases") || "",
    convictions: localStorage.getItem("convictions") || "",
    caseNumber: localStorage.getItem("caseNumber") || "",
    dispositionDate: localStorage.getItem("dispositionDate") || ""
  };

  const court = typeof getCourtConfig === "function"
    ? getCourtConfig(data.stateRaw, data.county)
    : {
        courtName: "Court not yet mapped in MVP",
        courtAddress: "Please confirm the exact court manually.",
        filingFee: "Check with the clerk for current fees",
        lookupLabel: "Court website",
        lookupUrl: "",
        lookupInstructions: [
          "Search by your name",
          "Search by case number",
          "Confirm the final disposition date"
        ]
      };

  const form = typeof getOfficialFormConfig === "function"
    ? getOfficialFormConfig(data.stateRaw, data.county)
    : {
        courtCaption: "IN THE APPROPRIATE COURT",
        applicantLabel: "Applicant",
        caseLabel: "Case No.",
        packetTitle: "Draft Record Sealing Application",
        introText: "The applicant respectfully submits this draft application for review and completion.",
        checklist: ["Confirm the correct court.", "Complete all blank fields."],
        signatureLabel: "Signature"
      };

  packet.innerHTML = `
    <div class="finder-card no-print">
      <h3>Court Finder + Case Lookup Helper</h3>
      <p class="finder-subtext">
        Based on your state and county, this is the best starting point for locating your case.
      </p>

      <table class="finder-table">
        <tr>
          <th>Likely Court</th>
          <td>${escapeHtml(court.courtName)}</td>
        </tr>
        <tr>
          <th>Address / Location</th>
          <td>${escapeHtml(court.courtAddress)}</td>
        </tr>
        <tr>
          <th>Lookup Source</th>
          <td>${escapeHtml(court.lookupLabel || "Not yet mapped")}</td>
        </tr>
        <tr>
          <th>Website</th>
          <td>
            ${
              court.lookupUrl
                ? `<a href="${escapeHtml(court.lookupUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(court.lookupUrl)}</a>`
                : "Not yet mapped"
            }
          </td>
        </tr>
      </table>

      <div class="finder-checklist">
        <h4>How to find your case number</h4>
        <ul>
          ${(court.lookupInstructions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="finder-fields">
        <label for="caseNumber">Case Number</label>
        <input id="caseNumber" type="text" placeholder="Enter case number if found" value="${escapeHtml(localStorage.getItem("caseNumber") || "")}" />

        <label for="dispositionDate">Disposition / Final Discharge Date</label>
        <input id="dispositionDate" type="text" placeholder="MM/DD/YYYY or YYYY-MM-DD" value="${escapeHtml(localStorage.getItem("dispositionDate") || "")}" />

        <div class="finder-actions">
          <button class="primary-btn" onclick="saveCaseLookupData()">Save Lookup Info</button>
        </div>

        <div id="finder-success"></div>
      </div>
    </div>

    <div class="official-form">
      <div class="official-caption">
        <div class="caption-line">${escapeHtml(form.courtCaption)}</div>
      </div>

      <div class="official-case-grid">
        <div class="official-left">
          <div class="official-party-block">
            <div><strong>${escapeHtml(form.applicantLabel)}:</strong></div>
            <div>${escapeHtml(data.fullName || "[Applicant Name]")}</div>
          </div>
        </div>

        <div class="official-right">
          <div class="official-case-box">
            <div><strong>${escapeHtml(form.caseLabel)}</strong> ${escapeHtml(data.caseNumber || "____________________")}</div>
            <div><strong>Court:</strong> ${escapeHtml(court.courtName)}</div>
            <div><strong>County:</strong> ${escapeHtml(data.county || "[County]")}</div>
          </div>
        </div>
      </div>

      <div class="official-title">
        ${escapeHtml(form.packetTitle)}
      </div>

      <div class="official-paragraph">
        ${escapeHtml(form.introText)}
      </div>

      <div class="official-section">
        <h3>Applicant Information</h3>
        <table class="packet-table">
          <tr><th>Full Name</th><td>${escapeHtml(data.fullName)}</td></tr>
          <tr><th>Email</th><td>${escapeHtml(data.email)}</td></tr>
          <tr><th>Current Address</th><td>[To be completed by applicant]</td></tr>
        </table>
      </div>

      <div class="official-section">
        <h3>Case Information</h3>
        <table class="packet-table">
          <tr><th>Offense Type</th><td>${escapeHtml(data.offense)}</td></tr>
          <tr><th>Offense Level</th><td>${escapeHtml(formatFelony(data.felony))}</td></tr>
          <tr><th>Violent Offense</th><td>${escapeHtml(formatYesNo(data.violent))}</td></tr>
          <tr><th>Years Since Final Discharge / Disposition</th><td>${escapeHtml(data.years)}</td></tr>
          <tr><th>Fines Paid</th><td>${escapeHtml(formatYesNo(data.fines))}</td></tr>
          <tr><th>Open Cases</th><td>${escapeHtml(formatYesNo(data.openCases))}</td></tr>
          <tr><th>Convictions Involved</th><td>${escapeHtml(data.convictions)}</td></tr>
          <tr><th>Case Number</th><td>${escapeHtml(data.caseNumber || "____________________")}</td></tr>
          <tr><th>Date of Final Discharge</th><td>${escapeHtml(data.dispositionDate || "____________________")}</td></tr>
        </table>
      </div>

      <div class="official-section">
        <h3>Eligibility Estimate</h3>
        <div class="packet-status ${escapeHtml(result.status)}">${escapeHtml(result.title)}</div>
        <p>${escapeHtml(result.message)}</p>
        <p><strong>Suggested next step:</strong> ${escapeHtml(result.nextStep)}</p>
      </div>

      <div class="official-section">
        <h3>Court-Specific Filing Notes</h3>
        <table class="packet-table">
          <tr><th>Court</th><td>${escapeHtml(court.courtName)}</td></tr>
          <tr><th>Address / Location</th><td>${escapeHtml(court.courtAddress)}</td></tr>
          <tr><th>Fee Note</th><td>${escapeHtml(court.filingFee)}</td></tr>
          <tr><th>Lookup Source</th><td>${escapeHtml(court.lookupLabel || "Not mapped")}</td></tr>
        </table>

        <ul class="packet-list">
          ${(form.checklist || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="official-signature-block">
        <div class="signature-line">____________________________________</div>
        <div>${escapeHtml(form.signatureLabel || "Signature")}</div>
        <div class="signature-date">Date: ____________________</div>
      </div>
    </div>
  `;
}

function formatDisplayDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString();
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatOffense(value) {
  if (value === "drug") return "Drug possession";
  if (value === "theft") return "Theft";
  if (value === "other") return "Other non-violent offense";
  return value || "Not provided";
}

function formatFelony(value) {
  if (value === "3") return "3rd Degree Felony";
  if (value === "4") return "4th Degree Felony";
  if (value === "5") return "5th Degree Felony";
  return "Not provided";
}

function formatYesNo(value) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Not provided";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
