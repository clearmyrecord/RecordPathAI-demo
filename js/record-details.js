const SUGGESTION_DATA = {
  chargeName: {
    placeholder: "Start typing a charge",
    suggestions: (() => {
      if (!window.chargeLibrary || !Array.isArray(window.chargeLibrary)) return [];
      return window.chargeLibrary.map((item) => {
        if (typeof item === "string") {
          return { title: item, subtitle: "Charge" };
        }
        return {
          title: item.name || item.charge || item.title || "",
          subtitle: item.category || item.group || "Charge"
        };
      }).filter(x => x.title);
    })()
  },

  disposition: {
    placeholder: "Select disposition",
    suggestions: [
      { title: "Dismissed", subtitle: "Case outcome" },
      { title: "Convicted", subtitle: "Case outcome" },
      { title: "Acquitted", subtitle: "Case outcome" },
      { title: "Deferred Adjudication", subtitle: "Case outcome" },
      { title: "Diversion Completed", subtitle: "Case outcome" },
      { title: "Charges Dropped", subtitle: "Case outcome" },
      { title: "No Contest", subtitle: "Case outcome" },
      { title: "Vacated", subtitle: "Case outcome" }
    ]
  },

  chargeLevel: {
    placeholder: "Select charge level",
    suggestions: [
      { title: "Infraction", subtitle: "Level" },
      { title: "Violation", subtitle: "Level" },
      { title: "Misdemeanor", subtitle: "Level" },
      { title: "Gross Misdemeanor", subtitle: "Level" },
      { title: "Felony", subtitle: "Level" },
      { title: "Unclassified Felony", subtitle: "Level" }
    ]
  },

  caseStatus: {
    placeholder: "Select case status",
    suggestions: [
      { title: "Open", subtitle: "Status" },
      { title: "Closed", subtitle: "Status" },
      { title: "Pending", subtitle: "Status" },
      { title: "Dismissed", subtitle: "Status" },
      { title: "Sealed", subtitle: "Status" },
      { title: "Expunged", subtitle: "Status" }
    ]
  },

  plea: {
    placeholder: "Select plea",
    suggestions: [
      { title: "Guilty", subtitle: "Plea" },
      { title: "Not Guilty", subtitle: "Plea" },
      { title: "No Contest", subtitle: "Plea" },
      { title: "Alford Plea", subtitle: "Plea" }
    ]
  },

  sentenceType: {
    placeholder: "Select sentence type",
    suggestions: [
      { title: "Jail", subtitle: "Sentence" },
      { title: "Prison", subtitle: "Sentence" },
      { title: "Probation", subtitle: "Sentence" },
      { title: "Fine", subtitle: "Sentence" },
      { title: "Community Service", subtitle: "Sentence" },
      { title: "Treatment Program", subtitle: "Sentence" },
      { title: "Time Served", subtitle: "Sentence" },
      { title: "No Sentence", subtitle: "Sentence" }
    ]
  },

  courtType: {
    placeholder: "Select court type",
    suggestions: [
      { title: "Municipal Court", subtitle: "Court" },
      { title: "Justice Court", subtitle: "Court" },
      { title: "District Court", subtitle: "Court" },
      { title: "Superior Court", subtitle: "Court" },
      { title: "Circuit Court", subtitle: "Court" },
      { title: "County Court", subtitle: "Court" }
    ]
  },

  state: {
    placeholder: "Select state",
    suggestions: [
      "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
      "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
      "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
      "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
      "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
      "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
      "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
      "Wisconsin","Wyoming"
    ].map(x => ({ title: x, subtitle: "State" }))
  },

  county: {
    placeholder: "Select county",
    suggestions: [
      { title: "Clark County", subtitle: "County" },
      { title: "Washoe County", subtitle: "County" },
      { title: "Cuyahoga County", subtitle: "County" },
      { title: "Franklin County", subtitle: "County" },
      { title: "Maricopa County", subtitle: "County" },
      { title: "Los Angeles County", subtitle: "County" }
    ]
  },

  arrestingAgency: {
    placeholder: "Select agency",
    suggestions: [
      { title: "Las Vegas Metropolitan Police Department", subtitle: "Agency" },
      { title: "Henderson Police Department", subtitle: "Agency" },
      { title: "North Las Vegas Police Department", subtitle: "Agency" },
      { title: "Sheriff's Office", subtitle: "Agency" },
      { title: "Highway Patrol", subtitle: "Agency" },
      { title: "State Police", subtitle: "Agency" }
    ]
  }
};

const CASE_FIELDS = [
  { key: "chargeName", label: "Charge Name" },
  { key: "disposition", label: "Disposition" },
  { key: "chargeLevel", label: "Charge Level" },
  { key: "caseStatus", label: "Case Status" },
  { key: "plea", label: "Plea" },
  { key: "sentenceType", label: "Sentence Type" },
  { key: "courtType", label: "Court Type" },
  { key: "state", label: "State" },
  { key: "county", label: "County" },
  { key: "arrestingAgency", label: "Arresting Agency" }
];

let caseCount = 0;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function buildCaseCard(index) {
  const wrapper = document.createElement("section");
  wrapper.className = "case-card";
  wrapper.dataset.caseIndex = index;

  const removeButton = index === 0
    ? ""
    : `<button type="button" class="remove-case-btn" data-remove-case="${index}">Remove</button>`;

  wrapper.innerHTML = `
    <div class="case-topbar">
      ${removeButton}
    </div>

    <div class="case-fields">
      ${CASE_FIELDS.map((field) => {
        const cfg = SUGGESTION_DATA[field.key];
        return `
          <div class="autosuggest-field" data-field-key="${field.key}">
            <label for="${field.key}_${index}">${field.label}</label>
            <div class="autosuggest-wrap">
              <input
                type="text"
                id="${field.key}_${index}"
                name="${field.key}_${index}"
                class="autosuggest-input"
                autocomplete="off"
                placeholder="${escapeHtml(cfg.placeholder)}"
              />
              <div class="autosuggest-menu hidden"></div>
            </div>
          </div>
        `;
      }).join("")}

      <div class="standard-field">
        <label for="filingDate_${index}">Filing Date</label>
        <input type="date" id="filingDate_${index}" name="filingDate_${index}" class="standard-input" />
      </div>

      <div class="standard-field">
        <label for="dispositionDate_${index}">Disposition Date</label>
        <input type="date" id="dispositionDate_${index}" name="dispositionDate_${index}" class="standard-input" />
      </div>

      <div class="standard-field">
        <label for="sentenceCompletionDate_${index}">Sentence Completion Date</label>
        <input type="date" id="sentenceCompletionDate_${index}" name="sentenceCompletionDate_${index}" class="standard-input" />
      </div>

      <div class="standard-field full-width">
        <label for="notes_${index}">Notes</label>
        <textarea id="notes_${index}" name="notes_${index}" class="standard-input notes-input" rows="4" placeholder="Add anything helpful"></textarea>
      </div>
    </div>
  `;

  return wrapper;
}

function renderSuggestionMenu(menu, matches) {
  if (!matches.length) {
    menu.innerHTML = "";
    menu.classList.add("hidden");
    return;
  }

  menu.innerHTML = matches.map((item, idx) => `
    <button type="button" class="autosuggest-item" data-value="${escapeHtml(item.title)}" data-index="${idx}">
      <span class="autosuggest-title">${escapeHtml(item.title)}</span>
      <span class="autosuggest-subtitle">${escapeHtml(item.subtitle || "")}</span>
    </button>
  `).join("");

  menu.classList.remove("hidden");
}

function getMatches(fieldKey, value) {
  const source = SUGGESTION_DATA[fieldKey]?.suggestions || [];
  const q = normalize(value);

  if (!q) return source.slice(0, 6);

  return source
    .filter(item =>
      normalize(item.title).includes(q) ||
      normalize(item.subtitle).includes(q)
    )
    .slice(0, 8);
}

function closeAllMenus(exceptMenu = null) {
  document.querySelectorAll(".autosuggest-menu").forEach((menu) => {
    if (menu !== exceptMenu) {
      menu.classList.add("hidden");
    }
  });
}

function initAutosuggestForCard(card) {
  const fields = card.querySelectorAll(".autosuggest-field");

  fields.forEach((field) => {
    const fieldKey = field.dataset.fieldKey;
    const input = field.querySelector(".autosuggest-input");
    const menu = field.querySelector(".autosuggest-menu");

    input.addEventListener("focus", () => {
      const matches = getMatches(fieldKey, input.value);
      renderSuggestionMenu(menu, matches);
      closeAllMenus(menu);
    });

    input.addEventListener("input", () => {
      const matches = getMatches(fieldKey, input.value);
      renderSuggestionMenu(menu, matches);
      closeAllMenus(menu);
    });

    menu.addEventListener("click", (event) => {
      const item = event.target.closest(".autosuggest-item");
      if (!item) return;
      input.value = item.dataset.value || "";
      menu.classList.add("hidden");
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

function addCaseCard() {
  const wrap = document.getElementById("casesWrap");
  const card = buildCaseCard(caseCount);
  wrap.appendChild(card);
  initAutosuggestForCard(card);
  caseCount += 1;
}

function removeCase(index) {
  const card = document.querySelector(`.case-card[data-case-index="${index}"]`);
  if (card) card.remove();
}

function collectFormData() {
  const cards = [...document.querySelectorAll(".case-card")];

  return cards.map((card) => {
    const idx = card.dataset.caseIndex;
    return {
      chargeName: document.getElementById(`chargeName_${idx}`)?.value || "",
      disposition: document.getElementById(`disposition_${idx}`)?.value || "",
      chargeLevel: document.getElementById(`chargeLevel_${idx}`)?.value || "",
      caseStatus: document.getElementById(`caseStatus_${idx}`)?.value || "",
      plea: document.getElementById(`plea_${idx}`)?.value || "",
      sentenceType: document.getElementById(`sentenceType_${idx}`)?.value || "",
      courtType: document.getElementById(`courtType_${idx}`)?.value || "",
      state: document.getElementById(`state_${idx}`)?.value || "",
      county: document.getElementById(`county_${idx}`)?.value || "",
      arrestingAgency: document.getElementById(`arrestingAgency_${idx}`)?.value || "",
      filingDate: document.getElementById(`filingDate_${idx}`)?.value || "",
      dispositionDate: document.getElementById(`dispositionDate_${idx}`)?.value || "",
      sentenceCompletionDate: document.getElementById(`sentenceCompletionDate_${idx}`)?.value || "",
      notes: document.getElementById(`notes_${idx}`)?.value || ""
    };
  });
}

document.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-remove-case]");
  if (removeBtn) {
    removeCase(removeBtn.dataset.removeCase);
    return;
  }

  if (!event.target.closest(".autosuggest-wrap")) {
    closeAllMenus();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  addCaseCard();

  document.getElementById("addCaseBtn").addEventListener("click", () => {
    addCaseCard();
  });

  document.getElementById("recordDetailsForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = collectFormData();
    localStorage.setItem("cmr_record_details", JSON.stringify(payload));
    window.location.href = "packet.html";
  });
});
