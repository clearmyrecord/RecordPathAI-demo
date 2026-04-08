import { assertCaseIntegrity } from "./integrity.js";
import { resolveTemplateFromRegistry, getTemplateFieldMap } from "./template-registry.js";
import { buildFieldsFromMap } from "./field-map-engine.js";

export function buildPacketDefinition(caseFile) {
  const template = resolveTemplateFromRegistry(caseFile);

  const integrity = assertCaseIntegrity(caseFile, template);
  if (!integrity.valid) {
    throw new Error(integrity.errors.join(" "));
  }

  const fieldMap = getTemplateFieldMap(template.fieldMapId);
  const fields = buildFieldsFromMap(caseFile, fieldMap);

  return {
    template,
    fields
  };
}
