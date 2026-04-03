function goToDetails() {
  const state = document.getElementById("state").value;
  const offense = document.getElementById("offense").value;

  localStorage.setItem("state", state);
  localStorage.setItem("offense", offense);

  window.location.href = "record-details.html";
}

function checkEligibility() {
  const felony = document.getElementById("felony").value;
  const years = Number(document.getElementById("years").value);
  const fines = document.getElementById("fines").value;
  const violent = document.getElementById("violent").value;
  const state = localStorage.getItem("state");

  localStorage.setItem("felony", felony);
  localStorage.setItem("years", String(years));
  localStorage.setItem("fines", fines);
  localStorage.setItem("violent", violent);

  const result = evaluateEligibility({ state, felony, years, fines, violent });
  localStorage.setItem("eligibilityResult", JSON.stringify(result));

  window.location.href = "results.html";
}

function evaluateEligibility(data) {
  const stateRules = sealingRules[data.state];
  if (!stateRules) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "We do not yet support this state in the MVP."
    };
  }

  const felonyKey = `felony${data.felony}`;
  const rule = stateRules[felonyKey];

  if (!rule) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "We do not yet support this offense level in the MVP."
    };
  }

  if (rule.violentDisallowed && data.violent === "yes") {
    return {
      status: "not-eligible",
      title: "Not Eligible Yet",
      message: "Violent offenses may not qualify under this simplified MVP rule set."
    };
  }

  if (rule.requiresPaidFines && data.fines !== "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Outstanding fines may prevent record sealing until resolved."
    };
  }

  if (data.years >= rule.waitingPeriodYears) {
    return {
      status: "eligible",
      title: "You May Be Eligible",
      message: rule.messageEligible
    };
  }

  const yearsRemaining = rule.waitingPeriodYears - data.years;

  return {
    status: "not-eligible",
    title: "Not Eligible Yet",
    message: `${rule.messageWait} Estimated time remaining: ${yearsRemaining} year(s).`
  };
}

window.onload = function () {
  const box = document.getElementById("result-box");
  if (!box) return;

  const raw = localStorage.getItem("eligibilityResult");
  if (!raw) {
    box.innerHTML = `
      <div class="result warning">
        <h3>No result found</h3>
        <p>Please complete the eligibility check first.</p>
      </div>
    `;
    return;
  }

  const result = JSON.parse(raw);

  box.innerHTML = `
    <div class="result ${result.status}">
      <h3>${result.title}</h3>
      <p>${result.message}</p>
      <button class="primary-btn">Continue</button>
    </div>
  `;
};
