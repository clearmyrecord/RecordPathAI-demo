import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { OVERLAY_REGISTRY, OVERLAY_FIELDS } from "./overlay-registry.js";
import { getValueByPath } from "./object-path.js";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findOverlayDefinition(caseFile) {
  const match = OVERLAY_REGISTRY.find((item) => {
    return (
      normalize(item.state) === normalize(caseFile.state) &&
      normalize(item.filingType) === normalize(caseFile.filingType) &&
      (!item.county || normalize(item.county) === normalize(caseFile.county)) &&
      (!item.court || normalize(item.court) === normalize(caseFile.court))
    );
  });

  if (!match) {
    throw new Error(
      `No overlay definition found for state=${caseFile.state}, county=${caseFile.county}, filingType=${caseFile.filingType}.`
    );
  }

  return match;
}

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;

  const num = parseInt(full, 16);

  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
}

function drawAlignedText(page, text, item, font) {
  const fontSize = Number(item.fontSize || 11);
  const width = Number(item.width || 160);
  const x = Number(item.x || 0);
  const y = Number(item.y || 0);
  const align = item.align || "left";

  const actualText = String(text ?? "");
  const textWidth = font.widthOfTextAtSize(actualText, fontSize);

  let drawX = x;

  if (align === "center") {
    drawX = x + Math.max((width - textWidth) / 2, 0);
  } else if (align === "right") {
    drawX = x + Math.max(width - textWidth, 0);
  }

  const color = hexToRgb(item.color || "#000000");

  page.drawText(actualText, {
    x: drawX,
    y,
    size: fontSize,
    font,
    color: rgb(color.r, color.g, color.b),
    maxWidth: width
  });
}

export async function buildOverlayPacket(caseFile, pdfBytes) {
  const overlay = findOverlayDefinition(caseFile);
  const fields = OVERLAY_FIELDS[overlay.id];

  if (!fields || !fields.length) {
    throw new Error(`No overlay fields found for overlay id: ${overlay.id}`);
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  fields.forEach((item) => {
    const pageIndex = Number(item.page || 1) - 1;
    const page = pages[pageIndex];

    if (!page) return;

    const value = getValueByPath(caseFile, item.sourcePath);
    drawAlignedText(page, value, item, font);
  });

  const outputBytes = await pdfDoc.save();

  return {
    overlay,
    bytes: outputBytes
  };
}
