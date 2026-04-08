import { TEMPLATE_REGISTRY } from "../templates/registry.js";
import { TEMPLATE_FIELD_MAPS } from "../templates/field-maps.js";
import { findBestTemplate } from "./template-matcher.js";

export function resolveTemplateFromRegistry(caseFile) {
  const template = findBestTemplate(caseFile, TEMPLATE_REGISTRY);

  if (!template) {
    throw new Error(
      `No active template found for state=${caseFile.state}, county=${caseFile.county}, filingType=${caseFile.filingType}.`
    );
  }

  return template;
}

export function getTemplateFieldMap(fieldMapId) {
  const fieldMap = TEMPLATE_FIELD_MAPS[fieldMapId];

  if (!fieldMap) {
    throw new Error(`Missing field map: ${fieldMapId}`);
  }

  return fieldMap;
}

export function listTemplatesByState(state) {
  return TEMPLATE_REGISTRY.filter(
    (template) => String(template.state).toUpperCase() === String(state).toUpperCase()
  );
}
