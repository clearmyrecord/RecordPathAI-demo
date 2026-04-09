import { buildOverlayPacket } from "../core/overlay-engine.js";

async function generateOverlayPacket(caseFile) {
  const response = await fetch("/assets/oh/wood/sealing.pdf");
  const pdfBytes = await response.arrayBuffer();

  const result = await buildOverlayPacket(caseFile, pdfBytes);

  const blob = new Blob([result.bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "completed-packet.pdf";
  link.click();

  URL.revokeObjectURL(url);
}
