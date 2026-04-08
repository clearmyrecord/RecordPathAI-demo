(function () {
  const COURT_MAPPINGS = {
    "ohio|wood county|wood county court of common pleas": {
      id: "wood-county-common-pleas",
      state: "Ohio",
      county: "Wood County",
      court: "Wood County Court of Common Pleas",
      type: "pdf",
      flow: "download",
      template: "./assets/wood-county-application-for-sealing-295332-conviction.pdf",
      label: "Wood County Sealing Packet",
      filingSupported: false
    },

    "ohio|lucas county|toledo municipal court": {
      id: "toledo-municipal-court",
      state: "Ohio",
      county: "Lucas County",
      court: "Toledo Municipal Court",
      type: "unmapped",
      flow: "manual",
      template: "",
      label: "Toledo Municipal Court Packet",
      filingSupported: false
    },

    "california|los angeles county|los angeles superior court": {
      id: "la-superior-court",
      state: "California",
      county: "Los Angeles County",
      court: "Los Angeles Superior Court",
      type: "unmapped",
      flow: "manual",
      template: "",
      label: "Los Angeles Superior Court Packet",
      filingSupported: false
    }
  };

  function clean(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function titleCase(value) {
    return String(value || "")
      .split(" ")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  function readStoredData() {
    try {
      return {
        user: JSON.parse(localStorage.getItem("cmr_user") || "{}"),
        recordDetails: JSON.parse(sessionStorage.getItem("recordPath_recordDetails") || "[]")
      };
    } catch (error) {
      return {
        user: {},
        recordDetails: []
      };
    }
  }

  function getFirstOffense() {
    const { recordDetails } = readStoredData();
    if (!Array.isArray(recordDetails) || !recordDetails.length) return {};

    const row = recordDetails[0] || {};
    const byPrefix = (prefix) => {
      const key = Object.keys(row).find((k) => k.startsWith(prefix));
      return key ? row[key] : "";
    };

    return {
      state: byPrefix("state_"),
      county: byPrefix("county_"),
      court: byPrefix("court_"),
      chargeName: byPrefix("charge_name_"),
      chargeLevel: byPrefix("charge_level_"),
      caseNumber: byPrefix("case_number_"),
      disposition: byPrefix("disposition_"),
      arrestDate: byPrefix("arrest_date_")
    };
  }

  function buildExactKey(state, county, court) {
    return `${clean(state)}|${clean(county)}|${clean(court)}`;
  }

  function findCourtMapping(input) {
    const state = clean(input.state);
    const county = clean(input.county);
    const court = clean(input.court);

    const exactKey = buildExactKey(state, county, court);
    if (COURT_MAPPINGS[exactKey]) {
      return {
        found: true,
        confidence: "exact",
        mapping: COURT_MAPPINGS[exactKey]
      };
    }

    const entries = Object.entries(COURT_MAPPINGS);

    for (const [key, mapping] of entries) {
      const [mappedState, mappedCounty, mappedCourt] = key.split("|");

      const stateMatch = mappedState === state;
      const countyMatch = mappedCounty === county;
      const courtLooseMatch =
        court && mappedCourt && (
          court.includes(mappedCourt) ||
          mappedCourt.includes(court)
        );

      if (stateMatch && countyMatch && courtLooseMatch) {
        return {
          found: true,
          confidence: "high",
          mapping
        };
      }
    }

    for (const [key, mapping] of entries) {
      const [mappedState, mappedCounty] = key.split("|");
      const stateMatch = mappedState === state;
      const countyMatch = mappedCounty === county;

      if (stateMatch && countyMatch) {
        return {
          found: true,
          confidence: "county",
          mapping
        };
      }
    }

    return {
      found: false,
      confidence: "none",
      mapping: {
        id: "unmapped",
        state: titleCase(state),
        county: titleCase(county),
        court: input.court || "",
        type: "unmapped",
        flow: "manual",
        template: "",
        label: "Court Packet",
        filingSupported: false
      }
    };
  }

  function getRoutingDecision() {
    const offense = getFirstOffense();
    return findCourtMapping(offense);
  }

  function getPacketRoute() {
    const result = getRoutingDecision();
    const offense = getFirstOffense();

    return {
      found: result.found,
      confidence: result.confidence,
      mapping: result.mapping,
      offense
    };
  }

  function getPacketTemplateUrl() {
    const route = getPacketRoute();
    return route.mapping && route.mapping.template ? route.mapping.template : "";
  }

  function canGenerateLocalPdf() {
    const route = getPacketRoute();
    return Boolean(route.mapping && route.mapping.type === "pdf" && route.mapping.template);
  }

  function canSubmitDigitally() {
    const route = getPacketRoute();
    return Boolean(route.mapping && route.mapping.filingSupported);
  }

  window.RecordPathRouter = {
    COURT_MAPPINGS,
    readStoredData,
    getFirstOffense,
    findCourtMapping,
    getRoutingDecision,
    getPacketRoute,
    getPacketTemplateUrl,
    canGenerateLocalPdf,
    canSubmitDigitally
  };
})();
