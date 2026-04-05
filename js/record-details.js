// Utility
function fillList(listId, items) {
  const list = document.getElementById(listId);
  if (!list) return;

  list.innerHTML = items.map(i => `<option value="${i}">`).join("");
}

// Static suggestion data
const data = {
  levels: ["Infraction","Misdemeanor","Gross Misdemeanor","Felony"],
  status: ["Open","Closed","Dismissed","Pending","Sealed","Expunged"],
  disposition: ["Dismissed","Convicted","Acquitted","Deferred","Dropped"],
  plea: ["Guilty","Not Guilty","No Contest"],
  sentence: ["Jail","Prison","Probation","Fine","Community Service","None"],
  court: ["Municipal","Justice","District","Superior","Circuit"],
  states: [
    "Nevada","California","Arizona","Texas","Florida","New York",
    "Illinois","Ohio","Georgia","Washington"
  ],
  counties: [
    "Clark County","Washoe County","Maricopa County",
    "Los Angeles County","San Diego County"
  ],
  agencies: [
    "Las Vegas Metro Police",
    "Henderson Police",
    "North Las Vegas Police",
    "Nevada Highway Patrol",
    "Sheriff's Office"
  ]
};

// Load everything
document.addEventListener("DOMContentLoaded", () => {

  // Charges (from your library)
  if (window.chargeLibrary) {
    const charges = window.chargeLibrary.map(c => c.name || c.charge || c);
    fillList("chargeList", charges);
  }

  fillList("levelList", data.levels);
  fillList("statusList", data.status);
  fillList("dispositionList", data.disposition);
  fillList("pleaList", data.plea);
  fillList("sentenceList", data.sentence);
  fillList("courtList", data.court);
  fillList("stateList", data.states);
  fillList("countyList", data.counties);
  fillList("agencyList", data.agencies);

  // FORM SUBMIT FIX (this was your bug)
  document.getElementById("recordForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      charge: document.getElementById("chargeName").value,
      level: document.getElementById("chargeLevel").value,
      status: document.getElementById("caseStatus").value,
      disposition: document.getElementById("disposition").value,
      plea: document.getElementById("plea").value,
      sentence: document.getElementById("sentenceType").value,
      court: document.getElementById("courtType").value,
      state: document.getElementById("state").value,
      county: document.getElementById("county").value,
      agency: document.getElementById("agency").value
    };

    console.log("Saved:", data);

    // 👉 move to next page
    window.location.href = "packet.html";
  });

  // Add another case (simple reset for now)
  document.getElementById("addCase").addEventListener("click", () => {
    document.getElementById("recordForm").reset();
  });

});
