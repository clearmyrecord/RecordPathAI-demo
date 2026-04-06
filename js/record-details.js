(function () {
  const offenseList = document.getElementById("offenseList");
  const emptyState = document.getElementById("emptyState");
  const addOffenseBtn = document.getElementById("addOffenseBtn");
  const backBtn = document.getElementById("backBtn");
  const continueBtn = document.getElementById("continueBtn");
  const recordStatus = document.getElementById("recordStatus");

  const fallbackCharges = [
    "DUI",
    "OVI",
    "Assault",
    "Domestic Violence",
    "Drug Possession",
    "Disorderly Conduct",
    "Petty Theft",
    "Theft",
    "Burglary",
    "Criminal Trespass",
    "Receiving Stolen Property",
    "Resisting Arrest",
    "Menacing",
    "Driving Under Suspension"
  ];

  const dispositionOptions = [
    "Dismissed",
    "Not Guilty",
    "Guilty",
    "No Contest",
    "Deferred",
    "Reduced",
    "Vacated",
    "Expunged",
    "Sealed"
  ];

  const levelOptions = [
    "Misdemeanor",
    "Felony",
    "Infraction",
    "Citation",
    "Traffic",
    "Minor Misdemeanor"
  ];

  const caseTypeOptions = [
    "Criminal",
    "Traffic",
    "Misdemeanor",
    "Felony",
    "Municipal",
    "County",
    "Common Pleas"
  ];

  const courtOptions = [
    "Municipal Court",
    "County Court",
    "Common Pleas Court",
    "District Court",
    "Justice Court"
  ];

  const countyOptions = [
    "Clark County",
    "Cuyahoga County",
    "Franklin County",
    "Hamilton County",
    "Lucas County",
    "Montgomery County",
    "Summit County"
  ];

  let offenseCounter = 0;
  let activeSuggestionBox = null;

  function normalizeChargeLibrary() {
    try {
      if (!Array.isArray(window.CHARGES)) {
        return fallbackCharges.slice();
      }

      const normalized = window.CHARGES
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item.name === "string") return item.name.trim();
          if (item && typeof item.charge === "string") return item.charge.trim();
          if (item && typeof item.title === "string") return item.title.trim();
          return "";
        })
        .filter(Boolean);

      return normalized.length ? uniqueStrings(normalized) : fallbackCharges.slice();
    } catch (error) {
      console.error("Charge library failed to load.", error);
      return fallbackCharges.slice();
    }
  }

  function uniqueStrings(list) {
    return Array.from(new Set(list.map((item) => String(item).trim()).filter(Boolean)));
  }

  const chargeLibrary = normalizeChargeLibrary();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function closeActiveSuggestions() {
    if (activeSuggestionBox) {
      activeSuggestionBox.classList.remove("is-open");
      activeSuggestionBox.innerHTML = "";
      activeSuggestionBox = null;
    }
  }

  function updateEmptyState() {
    const count = offenseList.querySelectorAll(".rd-offense").length;
    emptyState.hidden = count > 0;

    if (count === 0) {
      recordStatus.textContent = "No offenses added";
    } else if (count === 1) {
      recordStatus.textContent = "1 offense added";
    } else {
      recordStatus.textContent = `${count} offenses added`;
    }
  }

  function createField({
    label,
    name,
    type = "text",
    placeholder = "",
    full = false,
    suggestions = null,
    helper = ""
  }) {
    const field = document.createElement("div");
    field.className = `rd-field${full ? " rd-field-full" : ""}`;

    const inputId = `${name}-${Math.random().toString(36).slice(2, 10)}`;

    let inputMarkup = "";

    if (type === "textarea") {
      inputMarkup = `
        <textarea
          class="rd-textarea"
          id="${inputId}"
          name="${escapeHtml(name)}"
          placeholder="${escapeHtml(placeholder)}"
          rows="4"
        ></textarea>
      `;
    } else {
      inputMarkup = `
        <input
          class="rd-input"
          id="${inputId}"
          name="${escapeHtml(name)}"
          type="${escapeHtml(type)}"
          placeholder="${escapeHtml(placeholder)}"
          autocomplete="off"
        />
      `;
    }

    field.innerHTML = `
      <label class="rd-label" for="${inputId}">${escapeHtml(label)}</label>
      ${inputMarkup}
      ${suggestions ? '<div class="rd-suggestions"></div>' : ""}
      ${helper ? `<div class="rd-helper">${escapeHtml(helper)}</div>` : ""}
    `;

    if (suggestions) {
      const input = field.querySelector(type === "textarea" ? "textarea" : "input");
      const box = field.querySelector(".rd-suggestions");
      bindSuggestions(input, box, suggestions);
    }

    return field;
  }

  function bindSuggestions(input, box, sourceList) {
    let activeIndex = -1;
    let currentMatches = [];

    function render(matches) {
      currentMatches = matches;
      activeIndex = -1;

      if (!matches.length) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        if (activeSuggestionBox === box) activeSuggestionBox = null;
        return;
      }

      box.innerHTML = matches
        .map((item) => `<div class="rd-suggestion">${escapeHtml(item)}</div>`)
        .join("");

      box.classList.add("is-open");
      activeSuggestionBox = box;

      Array.from(box.querySelectorAll(".rd-suggestion")).forEach((node, index) => {
        node.addEventListener("mousedown", function (event) {
          event.preventDefault();
          choose(index);
        });
      });
    }

    function choose(index) {
      if (index < 0 || index >= currentMatches.length) return;
      input.value = currentMatches[index];
      box.classList.remove("is-open");
      box.innerHTML = "";
      if (activeSuggestionBox === box) activeSuggestionBox = null;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function filterList(value) {
      const query = value.trim().toLowerCase();
      if (!query) {
        render([]);
        return;
      }

      const startsWith = [];
      const includes = [];

      sourceList.forEach((item) => {
        const text = String(item);
        const lower = text.toLowerCase();

        if (lower.startsWith(query)) {
          startsWith.push(text);
        } else if (lower.includes(query)) {
          includes.push(text);
        }
      });

      render([...startsWith, ...includes].slice(0, 8));
    }

    input.addEventListener("input", function () {
      filterList(input.value);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) {
        filterList(input.value);
      }
    });

    input.addEventListener("keydown", function (event) {
      const items = Array.from(box.querySelectorAll(".rd-suggestion"));
      if (!items.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
      } else if (event.key === "Enter") {
        if (activeIndex >= 0) {
          event.preventDefault();
          choose(activeIndex);
        }
        return;
      } else if (event.key === "Escape") {
        box.classList.remove("is-open");
        box.innerHTML = "";
        if (activeSuggestionBox === box) activeSuggestionBox = null;
        return;
      } else {
        return;
      }

      items.forEach((item, index) => {
        item.classList.toggle("is-active", index === activeIndex);
      });
    });

    input.addEventListener("blur", function () {
      setTimeout(function () {
        box.classList.remove("is-open");
        box.innerHTML = "";
        if (activeSuggestionBox === box) activeSuggestionBox = null;
      }, 140);
    });
  }

  function buildOffenseCard(index) {
    const card = document.createElement("section");
    card.className = "rd-offense";
    card.dataset.offenseIndex = String(index);

    const top = document.createElement("div");
    top.className = "rd-offense-top";

    const title = document.createElement("h2");
    title.className = "rd-offense-title";
    title.textContent = `Offense ${index + 1}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "rd-btn rd-btn-small rd-remove-btn";
    removeBtn.textContent = "Remove";

    top.appendChild(title);
    top.appendChild(removeBtn);

    const grid = document.createElement("div");
    grid.className = "rd-grid";

    grid.appendChild(createField({
      label: "Charge Name",
      name: `charge_name_${index}`,
      placeholder: "Start typing a charge",
      suggestions: chargeLibrary,
      helper: "Suggestions come from your charge library."
    }));

    grid.appendChild(createField({
      label: "Disposition / Outcome",
      name: `disposition_${index}`,
      placeholder: "Start typing a disposition",
      suggestions: dispositionOptions
    }));

    grid.appendChild(createField({
      label: "Charge Level",
      name: `charge_level_${index}`,
      placeholder: "Start typing a level",
      suggestions: levelOptions
    }));

    grid.appendChild(createField({
      label: "Case Type",
      name: `case_type_${index}`,
      placeholder: "Start typing a case type",
      suggestions: caseTypeOptions
    }));

    grid.appendChild(createField({
      label: "Court",
      name: `court_${index}`,
      placeholder: "Start typing a court",
      suggestions: courtOptions
    }));

    grid.appendChild(createField({
      label: "County",
      name: `county_${index}`,
      placeholder: "Start typing a county",
      suggestions: countyOptions
    }));

    grid.appendChild(createField({
      label: "Arrest Date",
      name: `arrest_date_${index}`,
      type: "date"
    }));

    grid.appendChild(createField({
      label: "Case Number",
      name: `case_number_${index}`,
      placeholder: "Optional"
    }));

    grid.appendChild(createField({
      label: "Notes",
      name: `notes_${index}`,
      type: "textarea",
      placeholder: "Anything else about this offense...",
      full: true
    }));

    card.appendChild(top);
    card.appendChild(grid);

    removeBtn.addEventListener("click", function () {
      card.remove();
      renumberOffenses();
      updateEmptyState();
    });

    return card;
  }

  function renumberOffenses() {
    const cards = Array.from(offenseList.querySelectorAll(".rd-offense"));
    cards.forEach((card, index) => {
      const title = card.querySelector(".rd-offense-title");
      if (title) title.textContent = `Offense ${index + 1}`;
    });
  }

  function addOffense() {
    const card = buildOffenseCard(offenseCounter);
    offenseCounter += 1;
    offenseList.appendChild(card);
    updateEmptyState();

    const firstInput = card.querySelector(".rd-input, .rd-textarea");
    if (firstInput) firstInput.focus();
  }

  function collectData() {
    const cards = Array.from(offenseList.querySelectorAll(".rd-offense"));
    return cards.map((card) => {
      const data = {};
      Array.from(card.querySelectorAll("input, textarea")).forEach((field) => {
        data[field.name] = field.value;
      });
      return data;
    });
  }

  addOffenseBtn.addEventListener("click", addOffense);

  backBtn.addEventListener("click", function () {
    if (document.referrer) {
      window.history.back();
    } else {
      window.location.href = "eligibility.html";
    }
  });

  continueBtn.addEventListener("click", function () {
    const data = collectData();
    try {
      sessionStorage.setItem("clearMyRecord_recordDetails", JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save record details to sessionStorage.", error);
    }

    console.log("Record details saved:", data);

    if (window.location.href.includes("record-details.html")) {
      window.location.href = "packet.html";
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".rd-field")) {
      closeActiveSuggestions();
    }
  });

  addOffense();
  updateEmptyState();
})();
