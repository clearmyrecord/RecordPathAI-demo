(function () {
  function getValueByPath(obj, path) {
    if (!obj || !path) return "";

    return path.split(".").reduce((acc, part) => {
      if (acc == null) return "";
      return acc[part];
    }, obj) ?? "";
  }

  function joinNonEmpty(parts, separator = " ") {
    return parts.filter(Boolean).join(separator).trim();
  }

  function buildMailingAddressBlock(data) {
    const mailing = getValueByPath(data, "user.mailingAddress") || {};

    const nameLine =
      mailing.fullName ||
      joinNonEmpty([
        getValueByPath(data, "user.firstName"),
        getValueByPath(data, "user.middleName"),
        getValueByPath(data, "user.lastName")
      ]);

    const streetLine = joinNonEmpty(
      [mailing.street1, mailing.street2],
      " "
    );

    const cityStateZip = joinNonEmpty(
      [
        mailing.city,
        mailing.state && mailing.city ? `${mailing.state}` : mailing.state,
        mailing.zip
      ],
      " "
    );

    const formattedCityStateZip =
      mailing.city || mailing.state || mailing.zip
        ? `${mailing.city || ""}${mailing.city && mailing.state ? ", " : ""}${mailing.state || ""}${mailing.zip ? ` ${mailing.zip}` : ""}`.trim()
        : "";

    return [nameLine, streetLine, formattedCityStateZip]
      .filter(Boolean)
      .join("\n");
  }

  function computeValue(token, data) {
    switch (token) {
      case "full_name":
        return joinNonEmpty([
          getValueByPath(data, "user.firstName"),
          getValueByPath(data, "user.middleName"),
          getValueByPath(data, "user.lastName")
        ]);

      case "first_name":
        return getValueByPath(data, "user.firstName");

      case "last_name":
        return getValueByPath(data, "user.lastName");

      case "email":
        return getValueByPath(data, "user.email");

      case "phone":
        return getValueByPath(data, "user.phone");

      case "court_name":
        return getValueByPath(data, "court.name");

      case "court_county":
        return getValueByPath(data, "court.county");

      case "case_number":
        return getValueByPath(data, "case.caseNumber");

      case "eligibility_status":
        return getValueByPath(data, "case.resultLabel");

      case "charge_list":
        return (data.charges || [])
          .map((charge, index) => {
            return `${index + 1}. ${charge.name} (${charge.level}) - ${charge.disposition}`;
          })
          .join("\n");

      case "mailing_full_name":
        return (
          getValueByPath(data, "user.mailingAddress.fullName") ||
          joinNonEmpty([
            getValueByPath(data, "user.firstName"),
            getValueByPath(data, "user.middleName"),
            getValueByPath(data, "user.lastName")
          ])
        );

      case "mailing_street1":
        return getValueByPath(data, "user.mailingAddress.street1");

      case "mailing_street2":
        return getValueByPath(data, "user.mailingAddress.street2");

      case "mailing_city":
        return getValueByPath(data, "user.mailingAddress.city");

      case "mailing_state":
        return getValueByPath(data, "user.mailingAddress.state");

      case "mailing_zip":
        return getValueByPath(data, "user.mailingAddress.zip");

      case "mailing_county":
        return getValueByPath(data, "user.mailingAddress.county");

      case "mailing_address_block":
        return buildMailingAddressBlock(data);

      default:
        return "";
    }
  }

  function resolveFieldValue(field, data) {
    if (!field) return "";

    if (field.mappingType === "path") {
      return getValueByPath(data, field.mappingValue);
    }

    if (field.mappingType === "computed") {
      return computeValue(field.mappingValue, data);
    }

    if (field.mappingType === "literal") {
      return field.mappingValue || "";
    }

    return "";
  }

  function resolveTemplate(template, data) {
    const result = {};

    (template.fields || []).forEach((field) => {
      result[field.fieldKey] = resolveFieldValue(field, data);
    });

    return result;
  }

  window.TemplateEngine = {
    getValueByPath,
    computeValue,
    resolveFieldValue,
    resolveTemplate,
    buildMailingAddressBlock
  };
})();
