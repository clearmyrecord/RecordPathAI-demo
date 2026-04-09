const els = {
  overlayId: document.getElementById("overlayId"),
  state: document.getElementById("state"),
  county: document.getElementById("county"),
  court: document.getElementById("court"),
  filingType: document.getElementById("filingType"),
  pdfPath: document.getElementById("pdfPath"),
  version: document.getElementById("version"),
  defaultFontSize: document.getElementById("defaultFontSize"),

  autoGenerateBtn: document.getElementById("autoGenerateBtn"),
  buildOverlayMetaBtn: document.getElementById("buildOverlayMetaBtn"),

  sampleCaseJson: document.getElementById("sampleCaseJson"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  loadDemoBtn: document.getElementById("loadDemoBtn"),
  casePathList: document.getElementById("casePathList"),

  pdfUpload: document.getElementById("pdfUpload"),
  pdfFileName: document.getElementById("pdfFileName"),
  renderPdfBtn: document.getElementById("renderPdfBtn"),
  clearPdfBtn: document.getElementById("clearPdfBtn"),
  pdfStatus: document.getElementById("pdfStatus"),

  prevPageBtn: document.getElementById("prevPageBtn"),
  nextPageBtn: document.getElementById("nextPageBtn"),
  pageIndicator: document.getElementById("pageIndicator"),
  pageCanvasContainer: document.getElementById("pageCanvasContainer"),

  addManualOverlayBtn: document.getElementById("addManualOverlayBtn"),
  deleteSelectedOverlayBtn: document.getElementById("deleteSelectedOverlayBtn"),
  buildOverlayConfigBtn: document.getElementById("buildOverlayConfigBtn"),
  overlayTableBody: document.getElementById("overlayTableBody"),

  overlayMetaOutput: document.getElementById("overlayMetaOutput"),
  overlayFieldsOutput: document.getElementById("overlayFieldsOutput"),
  copyMetaBtn: document.getElementById("copyMetaBtn"),
  copyFieldsBtn: document.getElementById("copyFieldsBtn")
};

let currentSampleCase = null;
let currentPaths = [];
let pdfBytes = null;
let pdfDoc = null;
let currentPageNumber = 1;
let currentViewport = null;
let currentCanvas = null;
let currentScale = 1.5;
let overlayItems = [];
let selectedOverlayId = null;

function getDemoCase() {
  return {
    id: "demo-case-1",
    state: "OH",
    county: "Wood",
    court: "Wood County Court of Common Pleas",
    caseNumber: "2006CR0387",
    filingType: "sealing",
    person: {
      firstName: "Matt",
      lastName: "Tunstall",
      fullName: "Matt Tunstall",
      email: "unitedpaintersww@gmail.com",
      phone: "8668219810",
      address1: "231 W Horizon Ridge Parkway",
      address2: "",
      city: "Henderson",
      state: "NV",
      zip: "89012",
      dob: ""
    },
    charges: [
      {
        id: "charge-1",
        chargeName: "Possession of Drugs",
        statute: "2925.11(A)",
        level: "Felony 3",
        disposition: "Guilty",
        arrestDate: "2006-01-01",
        convictionDate: "2007-05-04",
        sentencingDate: "2007-05-04",
        probationCompletedDate: "2010-05-07",
        jailCompletedDate: "",
        finePaid: true,
        restitutionPaid: true,
        victimInvolved: false,
        dismissed: false,
        sealedBefore: false
      }
    ]
  };
}

function makeId(prefix = "overlay") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function setPdfStatus(message, type = "muted") {
  els.pdfStatus.className = `status-box ${type}`;
  els.pdfStatus.textContent = message;
}

function copyText(value, label) {
  if (!value) {
    alert(`Nothing to copy for ${label}.`);
    return;
  }

  navigator.clipboard.writeText(value)
    .then(() => alert(`${label} copied.`))
    .catch(() => alert(`Could not copy ${label}.`));
}

function getValueByPath(obj, path) {
  if (!obj || !path) return "";

  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalizedPath.split(".");
  let current = obj;

  for (const part of parts) {
    if (current == null) return "";
    current = current[part];
  }

  return current ?? "";
}

function formatPreview(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function flattenObject(obj, prefix = "", output = []) {
  if (obj === null || obj === undefined) {
    if (prefix) output.push({ path: prefix, value: "" });
    return output;
  }

  if (Array.isArray(obj)) {
    if (!obj.length && prefix) {
      output.push({ path: prefix, value: [] });
      return output;
    }

    obj.forEach((item, index) => {
      const next = prefix ? `${prefix}[${index}]` : `[${index}]`;
      flattenObject(item, next, output);
    });

    return output;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (!keys.length && prefix) {
      output.push({ path: prefix, value: {} });
      return output;
    }

    keys.forEach((key) => {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenObject(obj[key], next, output);
    });

    return output;
  }

  output.push({ path: prefix, value: obj });
  return output;
}

function renderPathList(paths) {
  if (!paths.length) {
    els.casePathList.className = "path-list empty-state";
    els.casePathList.textContent = "No paths discovered.";
    return;
  }

  els.casePathList.className = "path-list";
  els.casePathList.innerHTML = "";

  paths.forEach((item) => {
    const row = document.createElement("div");
    row.className = "path-item";

    const left = document.createElement("div");
    left.className = "path-name";
    left.textContent = item.path;

    const right = document.createElement("div");
    right.className = "path-value";
    right.textContent = formatPreview(item.value);

    row.appendChild(left);
    row.appendChild(right);
    els.casePathList.appendChild(row);
  });
}

function getPathOptionsHtml(selected = "") {
  const options = [`<option value="">Select path</option>`];

  currentPaths.forEach((item) => {
    const picked = item.path === selected ? "selected" : "";
    options.push(`<option value="${escapeHtml(item.path)}" ${picked}>${escapeHtml(item.path)}</option>`);
  });

  return options.join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadSampleCase() {
  const parsed = safeJsonParse(els.sampleCaseJson.value);

  if (!parsed || typeof parsed !== "object") {
    alert("Invalid JSON. Please paste a valid sample case object.");
    return;
  }

  currentSampleCase = parsed;
  currentPaths = flattenObject(parsed);
  renderPathList(currentPaths);
  renderOverlayTable();
  renderOverlayMarkers();

  if (!els.state.value && parsed.state) els.state.value = parsed.state;
  if (!els.county.value && parsed.county) els.county.value = parsed.county;
  if (!els.court.value && parsed.court) els.court.value = parsed.court;
  if (!els.filingType.value && parsed.filingType) els.filingType.value = parsed.filingType;
}

function autoGenerateIds() {
  const state = els.state.value.trim().toLowerCase();
  const county = slugify(els.county.value);
  const filingType = slugify(els.filingType.value);

  if (!state) {
    alert("Select a state first.");
    return;
  }

  const parts = [state];
  if (county) parts.push(county);
  if (filingType) parts.push(filingType);
  parts.push("overlay");

  els.overlayId.value = parts.join("-");

  if (!els.pdfPath.value && state && county && filingType) {
    els.pdfPath.value = `/assets/${state}/${county}/${filingType}.pdf`;
  }
}

function buildOverlayMeta() {
  const meta = {
    id: els.overlayId.value.trim(),
    state: els.state.value.trim(),
    county: els.county.value.trim(),
    court: els.court.value.trim(),
    filingType: els.filingType.value.trim(),
    path: els.pdfPath.value.trim(),
    version: els.version.value.trim(),
    pageCount: pdfDoc ? pdfDoc.numPages : 0,
    defaultFontSize: Number(els.defaultFontSize.value || 11)
  };

  const errors = [];
  if (!meta.id) errors.push("Overlay ID is required.");
  if (!meta.state) errors.push("State is required.");
  if (!meta.filingType) errors.push("Filing type is required.");
  if (!meta.path) errors.push("PDF path is required.");

  if (errors.length) {
    alert(errors.join("\n"));
    return null;
  }

  els.overlayMetaOutput.value = JSON.stringify(meta, null, 2);
  return meta;
}

function addOverlayAtPdfCoords(pageNumber, pdfX, pdfY) {
  const defaultSize = Number(els.defaultFontSize.value || 11);

  const item = {
    id: makeId(),
    name: `field_${overlayItems.length + 1}`,
    page: pageNumber,
    x: round2(pdfX),
    y: round2(pdfY),
    width: 160,
    fontSize: defaultSize,
    align: "left",
    sourcePath: "",
    color: "#000000"
  };

  overlayItems.push(item);
  selectedOverlayId = item.id;
  renderOverlayTable();
  renderOverlayMarkers();
}

function addManualOverlay() {
  addOverlayAtPdfCoords(currentPageNumber || 1, 100, 700);
}

function deleteSelectedOverlay() {
  if (!selectedOverlayId) {
    alert("Select an overlay first.");
    return;
  }

  overlayItems = overlayItems.filter((item) => item.id !== selectedOverlayId);
  selectedOverlayId = null;
  renderOverlayTable();
  renderOverlayMarkers();
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function getCurrentPageOverlays() {
  return overlayItems.filter((item) => item.page === currentPageNumber);
}

function renderOverlayMarkers() {
  if (!currentViewport || !els.pageCanvasContainer || !currentCanvas) return;

  [...els.pageCanvasContainer.querySelectorAll(".overlay-marker")].forEach((node) => node.remove());

  const pageHeight = currentViewport.height;

  getCurrentPageOverlays().forEach((item) => {
    const marker = document.createElement("div");
    marker.className = `overlay-marker${item.id === selectedOverlayId ? " selected" : ""}`;
    marker.dataset.overlayId = item.id;

    const left = item.x * currentScale;
    const top = pageHeight - (item.y * currentScale) - (item.fontSize * currentScale) - 2;
    const width = Math.max(item.width * currentScale, 36);
    const height = Math.max(item.fontSize * currentScale + 8, 18);

    marker.style.left = `${left}px`;
    marker.style.top = `${Math.max(top, 0)}px`;
    marker.style.width = `${width}px`;
    marker.style.height = `${height}px`;
    marker.textContent = item.name || item.sourcePath || "field";

    marker.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedOverlayId = item.id;
      renderOverlayTable();
      renderOverlayMarkers();
    });

    els.pageCanvasContainer.appendChild(marker);
  });
}

function renderOverlayTable() {
  els.overlayTableBody.innerHTML = "";

  overlayItems.forEach((item) => {
    const row = document.createElement("tr");
    if (item.id === selectedOverlayId) {
      row.className = "table-row-selected";
    }

    const preview = formatPreview(getValueByPath(currentSampleCase, item.sourcePath));

    row.innerHTML = `
      <td><input type="text" class="ov-name" value="${escapeHtml(item.name)}" /></td>
      <td><input type="number" class="ov-page" min="1" value="${escapeHtml(item.page)}" /></td>
      <td><input type="number" class="ov-x" step="0.01" value="${escapeHtml(item.x)}" /></td>
      <td><input type="number" class="ov-y" step="0.01" value="${escapeHtml(item.y)}" /></td>
      <td><input type="number" class="ov-width" step="0.01" value="${escapeHtml(item.width)}" /></td>
      <td><input type="number" class="ov-font" step="0.1" value="${escapeHtml(item.fontSize)}" /></td>
      <td>
        <select class="ov-align">
          <option value="left" ${item.align === "left" ? "selected" : ""}>left</option>
          <option value="center" ${item.align === "center" ? "selected" : ""}>center</option>
          <option value="right" ${item.align === "right" ? "selected" : ""}>right</option>
        </select>
      </td>
      <td>
        <select class="ov-source">
          ${getPathOptionsHtml(item.sourcePath)}
        </select>
      </td>
      <td class="preview-cell">${escapeHtml(preview)}</td>
    `;

    row.addEventListener("click", () => {
      selectedOverlayId = item.id;
      renderOverlayTable();
      renderOverlayMarkers();
    });

    const bind = (selector, key, parser = (v) => v) => {
      const input = row.querySelector(selector);
      input.addEventListener("input", () => {
        item[key] = parser(input.value);
        renderOverlayMarkers();
        if (selector === ".ov-source") {
          row.querySelector(".preview-cell").textContent = formatPreview(
            getValueByPath(currentSampleCase, item.sourcePath)
          );
        }
      });
      input.addEventListener("change", () => {
        item[key] = parser(input.value);
        renderOverlayMarkers();
        if (selector === ".ov-page") {
          updatePageIndicator();
        }
        if (selector === ".ov-source") {
          row.querySelector(".preview-cell").textContent = formatPreview(
            getValueByPath(currentSampleCase, item.sourcePath)
          );
        }
      });
    };

    bind(".ov-name", "name", (v) => v);
    bind(".ov-page", "page", (v) => Math.max(1, Number(v || 1)));
    bind(".ov-x", "x", (v) => round2(v));
    bind(".ov-y", "y", (v) => round2(v));
    bind(".ov-width", "width", (v) => round2(v));
    bind(".ov-font", "fontSize", (v) => round2(v));
    bind(".ov-align", "align", (v) => v);
    bind(".ov-source", "sourcePath", (v) => v);

    els.overlayTableBody.appendChild(row);
  });
}

function buildOverlayConfig() {
  const overlayId = els.overlayId.value.trim();

  if (!overlayId) {
    alert("Overlay ID is required before building overlay config.");
    return null;
  }

  const config = {
    [overlayId]: overlayItems.map((item) => ({
      name: item.name,
      page: Number(item.page),
      x: Number(item.x),
      y: Number(item.y),
      width: Number(item.width),
      fontSize: Number(item.fontSize),
      align: item.align,
      sourcePath: item.sourcePath,
      color: item.color || "#000000"
    }))
  };

  els.overlayFieldsOutput.value = JSON.stringify(config, null, 2);
  return config;
}

async function handlePdfUploadChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    pdfBytes = null;
    els.pdfFileName.value = "";
    return;
  }

  els.pdfFileName.value = file.name;
  pdfBytes = await file.arrayBuffer();
  setPdfStatus("PDF loaded. Click Render PDF Pages.", "muted");
}

async function renderPdf() {
  if (!pdfBytes) {
    alert("Upload a PDF first.");
    return;
  }

  if (!window.pdfjsLib) {
    setPdfStatus("pdf.js failed to load.", "error");
    return;
  }

  try {
    pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    currentPageNumber = 1;
    await renderCurrentPage();
    setPdfStatus(`Rendered PDF with ${pdfDoc.numPages} page(s). Click on the page to place overlays.`, "success");
  } catch (error) {
    setPdfStatus(`Could not render PDF. ${error?.message || "Unknown error."}`, "error");
  }
}

async function renderCurrentPage() {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(currentPageNumber);
  currentViewport = page.getViewport({ scale: currentScale });

  els.pageCanvasContainer.className = "page-canvas-container";
  els.pageCanvasContainer.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.className = "pdf-canvas";
  canvas.width = Math.ceil(currentViewport.width);
  canvas.height = Math.ceil(currentViewport.height);

  const context = canvas.getContext("2d");
  currentCanvas = canvas;

  els.pageCanvasContainer.appendChild(canvas);

  await page.render({
    canvasContext: context,
    viewport: currentViewport
  }).promise;

  canvas.addEventListener("click", handleCanvasClick);
  updatePageIndicator();
  renderOverlayMarkers();
}

function handleCanvasClick(event) {
  if (!currentViewport || !currentCanvas) return;

  const rect = currentCanvas.getBoundingClientRect();
  const canvasX = event.clientX - rect.left;
  const canvasY = event.clientY - rect.top;

  const pdfX = canvasX / currentScale;
  const pdfY = (currentViewport.height - canvasY) / currentScale;

  addOverlayAtPdfCoords(currentPageNumber, pdfX, pdfY);
}

function clearPdf() {
  pdfBytes = null;
  pdfDoc = null;
  currentPageNumber = 1;
  currentViewport = null;
  currentCanvas = null;
  els.pdfUpload.value = "";
  els.pdfFileName.value = "";
  els.pageCanvasContainer.className = "page-canvas-container empty-canvas";
  els.pageCanvasContainer.textContent = "Render a PDF to start placing overlays.";
  updatePageIndicator();
  setPdfStatus("PDF cleared.", "muted");
}

function updatePageIndicator() {
  const total = pdfDoc ? pdfDoc.numPages : 0;
  els.pageIndicator.textContent = `Page ${total ? currentPageNumber : 0} / ${total}`;
}

async function goPrevPage() {
  if (!pdfDoc || currentPageNumber <= 1) return;
  currentPageNumber -= 1;
  await renderCurrentPage();
}

async function goNextPage() {
  if (!pdfDoc || currentPageNumber >= pdfDoc.numPages) return;
  currentPageNumber += 1;
  await renderCurrentPage();
}

els.autoGenerateBtn.addEventListener("click", autoGenerateIds);
els.buildOverlayMetaBtn.addEventListener("click", buildOverlayMeta);

els.loadSampleBtn.addEventListener("click", loadSampleCase);
els.loadDemoBtn.addEventListener("click", () => {
  els.sampleCaseJson.value = JSON.stringify(getDemoCase(), null, 2);
  loadSampleCase();
});

els.pdfUpload.addEventListener("change", handlePdfUploadChange);
els.renderPdfBtn.addEventListener("click", renderPdf);
els.clearPdfBtn.addEventListener("click", clearPdf);

els.prevPageBtn.addEventListener("click", goPrevPage);
els.nextPageBtn.addEventListener("click", goNextPage);

els.addManualOverlayBtn.addEventListener("click", addManualOverlay);
els.deleteSelectedOverlayBtn.addEventListener("click", deleteSelectedOverlay);
els.buildOverlayConfigBtn.addEventListener("click", buildOverlayConfig);

els.copyMetaBtn.addEventListener("click", () => copyText(els.overlayMetaOutput.value, "Overlay metadata"));
els.copyFieldsBtn.addEventListener("click", () => copyText(els.overlayFieldsOutput.value, "Overlay fields"));

els.sampleCaseJson.value = JSON.stringify(getDemoCase(), null, 2);
loadSampleCase();
buildOverlayMeta();
buildOverlayConfig();
updatePageIndicator();
