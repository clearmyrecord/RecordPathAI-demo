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
      courtHint: ""
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
      courtHint: ""
    };
  }

  if (rule.violentDisallowed && data.violent === "yes") {
    return {
      status: "not-eligible",
      title: "Not Eligible Yet",
      message: "Violent offenses are not eligible under this simplified MVP rule set.",
      nextStep: "You may need a more detailed legal review.",
      courtHint: rule.courtHint
    };
  }

  if (rule.openCasesDisallowed && data.openCases === "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Open criminal cases may block sealing until resolved.",
      nextStep: "Resolve any open cases first, then recheck eligibility.",
      courtHint: rule.courtHint
    };
  }

  if (rule.requiresPaidFines && data.fines !== "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Outstanding fines may prevent record sealing until they are paid.",
      nextStep: "Pay any required fines, then recheck eligibility.",
      courtHint: rule.courtHint
    };
  }

  if (data.convictions > rule.maxConvictions) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This simplified MVP supports only limited conviction scenarios.",
      nextStep: "A manual review may be needed for multiple convictions.",
      courtHint: rule.courtHint
    };
  }

  if (data.years >= rule.waitingPeriodYears) {
    return {
      status: "eligible",
      title: "You May Be Eligible",
      message: rule.messageEligible,
      nextStep: "Next, gather your case number, court name, and filing documents.",
      courtHint: rule.courtHint
    };
  }

  const yearsRemaining = rule.waitingPeriodYears - data.years;

  return {
    status: "not-eligible",
    title: "Not Eligible Yet",
    message: `${rule.messageWait} Estimated time remaining: ${yearsRemaining} year(s).`,
    nextStep: "Set a reminder and come back when the waiting period has passed.",
    courtHint: rule.courtHint
  };
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
  renderPacketPage();
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
    convictions: localStorage.getItem("convictions") || ""
  };

  const court = getCourtConfig(data.stateRaw, data.county);
  const form = getOfficialFormConfig(data.stateRaw, data.county);

  packet.innerHTML = `
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
            <div><strong>${escapeHtml(form.caseLabel)}</strong> ____________________</div>
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
          <tr><th>Case Number</th><td>____________________</td></tr>
          <tr><th>Date of Final Discharge</th><td>____________________</td></tr>
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
        </table>

        <ul class="packet-list">
          ${form.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="official-signature-block">
        <div class="signature-line">____________________________________</div>
        <div>${escapeHtml(form.signatureLabel)}</div>
        <div class="signature-date">Date: ____________________</div>
      </div>
    </div>

    <div class="packet-section page-break">
      <h3>Attachment A - Supporting Letter</h3>
      <div class="letter-block">
        <p>To the Honorable Court,</p>

        <p>
          I respectfully submit this draft application for review concerning the matter described above.
        </p>

        <p>
          The case information in this packet is associated with ${escapeHtml(data.county || "[County]")},
          ${escapeHtml(data.state || "[State]")}, and is intended to help prepare a formal filing draft.
        </p>

        <p>
          I respectfully ask the Court to consider the application and any supporting materials submitted with it.
        </p>

        <p>Thank you for your time and consideration.</p>

        <p>
          Respectfully submitted,<br><br>
          ${escapeHtml(data.fullName || "[Your Name]")}
        </p>
      </div>
    </div>

    <div class="packet-section">
      <h3>Internal Data Snapshot</h3>
      <pre class="packet-json">${escapeHtml(JSON.stringify({ data, result, court, form }, null, 2))}</pre>
    </div>
  `;
}

function downloadPacketJson() {
  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) {
    alert("No packet data found.");
    return;
  }

  const exportData = {
    fullName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    state: localStorage.getItem("state") || "",
    offense: localStorage.getItem("offense") || "",
    county: localStorage.getItem("county") || "",
    felony: localStorage.getItem("felony") || "",
    violent: localStorage.getItem("violent") || "",
    years: localStorage.getItem("years") || "",
    fines: localStorage.getItem("fines") || "",
    openCases: localStorage.getItem("openCases") || "",
    convictions: localStorage.getItem("convictions") || "",
    result: JSON.parse(raw),
    court: getCourtConfig(
      localStorage.getItem("state") || "",
      localStorage.getItem("county") || ""
    ),
    form: getOfficialFormConfig(
      localStorage.getItem("state") || "",
      localStorage.getItem("county") || ""
    )
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "clearmyrecord-official-form-data.json";
  a.click();

  URL.revokeObjectURL(url);
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
