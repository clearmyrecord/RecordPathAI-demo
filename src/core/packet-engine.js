import { getStateModule } from "./state-registry.js";
import { assertCaseIntegrity } from "./integrity.js";

export function buildPacketDefinition(caseFile) {
  const stateModule = getStateModule(caseFile.state);

  const validation = stateModule.validateCase(caseFile);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const template = stateModule.resolveTemplate(caseFile);

  const integrity = assertCaseIntegrity(caseFile, template);
  if (!integrity.valid) {
    throw new Error(integrity.errors.join(" "));
  }

  const fields = stateModule.mapCaseToTemplateFields(caseFile);

  return {
    template,
    fields
  };
}
