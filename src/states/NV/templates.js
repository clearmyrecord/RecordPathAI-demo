import { resolveTemplateFromRegistry } from "../../core/template-registry.js";

export function resolveTemplate(caseFile) {
  if (caseFile.state !== "NV") {
    throw new Error("Wrong state sent to Nevada template resolver.");
  }

  return resolveTemplateFromRegistry(caseFile);
}
