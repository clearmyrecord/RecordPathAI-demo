export function resolveTemplate(caseFile) {
  if (caseFile.state !== "NV") {
    throw new Error("Wrong state sent to Nevada template resolver.");
  }

  const county = String(caseFile.county || "").trim().toLowerCase();

  if (county === "clark") {
    return {
      id: "nv-clark-record-seal",
      path: "/assets/nv/clark/record-seal.pdf",
      version: "1.0"
    };
  }

  return {
    id: "nv-generic-record-seal",
    path: "/assets/nv/generic/record-seal.pdf",
    version: "1.0"
  };
}
