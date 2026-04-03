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
    offense: formatOffense(localStorage.getItem("offense") || ""),
    county: localStorage.getItem("county") || "",
    felony: localStorage.getItem("felony") || "",
    violent: localStorage.getItem("violent") || "",
    years: localStorage.getItem("years") || "",
    fines: localStorage.getItem("fines") || "",
    openCases: localStorage.getItem("openCases") || "",
    convictions: localStorage.getItem("convictions") || ""
  };

  packet.innerHTML = `
    <div class="packet-section">
      <h2>Draft packet summary</h2>
      <p class="packet-note">
        This is a draft preparation packet generated from user inputs. It should be reviewed before filing.
      </p>
    </div>

    <div class="packet-section">
      <h3>Applicant information</h3>
      <table class="packet-table">
        <tr><th>Full name</th><td>${escapeHtml(data.fullName)}</td></tr>
        <tr><th>Email</th><td>${escapeHtml(data.email)}</td></tr>
        <tr><th>State</th><td>${escapeHtml(data.state)}</td></tr>
        <tr><th>County</th><td>${escapeHtml(data.county || "Not provided")}</td></tr>
      </table>
    </div>

    <div class="packet-section">
      <h3>Record details</h3>
      <table class="packet-table">
        <tr><th>Offense type</th><td>${escapeHtml(data.offense)}</td></tr>
        <tr><th>Offense level</th><td>${escapeHtml(formatFelony(data.felony))}</td></tr>
        <tr><th>Violent offense</th><td>${escapeHtml(formatYesNo(data.violent))}</td></tr>
        <tr><th>Years since final discharge / disposition</th><td>${escapeHtml(data.years)}</td></tr>
        <tr><th>Fines paid</th><td>${escapeHtml(formatYesNo(data.fines))}</td></tr>
        <tr><th>Open cases</th><td>${escapeHtml(formatYesNo(data.openCases))}</td></tr>
        <tr><th>Convictions involved</th><td>${escapeHtml(data.convictions)}</td></tr>
      </table>
    </div>

    <div class="packet-section">
      <h3>Eligibility estimate</h3>
      <div class="packet-status ${escapeHtml(result.status)}">${escapeHtml(result.title)}</div>
      <p>${escapeHtml(result.message)}</p>
      <p><strong>Next step:</strong> ${escapeHtml(result.nextStep)}</p>
      ${result.courtHint ? `<p><strong>Filing note:</strong> ${escapeHtml(result.courtHint)}</p>` : ""}
    </div>

    <div class="packet-section">
      <h3>Filing checklist</h3>
      <ul class="packet-list">
        <li>Confirm the exact court where the case was handled.</li>
        <li>Gather the case number and disposition details.</li>
        <li>Confirm all fines, fees, and sanctions are resolved.</li>
        <li>Review the record for any open or disqualifying matters.</li>
        <li>Print this packet and prepare the application form for the court.</li>
      </ul>
    </div>

    <div class="packet-section page-break">
      <h3>Draft attachment letter</h3>
      <div class="letter-block">
        <p>To the Honorable Court,</p>

        <p>
          I respectfully submit this letter in support of my request to seal the record at issue.
          Based on my understanding, the matter occurred in ${escapeHtml(data.county || "[County]")}, ${escapeHtml(data.state || "[State]")}.
        </p>

        <p>
          I take responsibility for my past actions and respectfully ask the Court to consider the time that has passed,
          the progress made since that time, and my interest in moving forward productively.
        </p>

        <p>
          I respectfully request that the Court review my application and grant relief if appropriate.
        </p>

        <p>Thank you for your time and consideration.</p>

        <p>
          Respectfully submitted,<br><br>
          ${escapeHtml(data.fullName || "[Your Name]")}
        </p>
      </div>
    </div>

    <div class="packet-section">
      <h3>Internal data snapshot</h3>
      <pre class="packet-json">${escapeHtml(JSON.stringify({ data, result }, null, 2))}</pre>
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
    result: JSON.parse(raw)
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "clearmyrecord-packet-data.json";
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
  if (!value) return "Not provided";
  return `${value}rd/nd/th Degree Felony`.replace("3rd", "3rd").replace("4rd", "4th").replace("5rd", "5th");
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
