(function () {
  const STORAGE_KEY = 'recordpathai_language';
  const DEFAULT_LANG = 'en';
  const dictionary = {
    en: {
      'lang.label': 'Language Access',
      'lang.english': 'English',
      'lang.spanish': 'Español',
      'translation.disclaimer': 'Translation is provided for convenience and may not replace official court translation services.',
      'nav.home': 'Home',
      'nav.how': 'How It Works',
      'nav.eligibility': 'Eligibility',
      'nav.recordDetails': 'Record Details',
      'nav.packet': 'Packet',
      'nav.checkEligibility': 'Check Eligibility',

      'index.hero.title': 'Court record relief, automated.',
      'index.hero.seeHow': 'See How It Works',
      'how.title': 'How It Works',
      'eligibility.title': 'Eligibility Intake',
      'record.title': 'Record Details',
      'packet.title': 'Your Filing Packet',

      'index.eyebrow': 'Court document automation',
      'index.hero.copy': 'Millions of Americans may qualify to seal or expunge a record. RecordPathAI guides users through eligibility intake, case details, and court-ready packet generation.',
      'index.trust': 'Currently generating printable court packets. E-filing integrations coming later.',
      'index.workflow': 'RecordPathAI Workflow',
      'index.packetBuilder': 'Court Packet Builder',
      'index.status.ready': 'Ready',
      'index.progress.pdf': 'PDF Packet',
      'index.caseState': 'Case State',
      'index.county': 'County',
      'index.selectedCourtForm': 'Selected Court Form',
      'index.pdfGenerated': 'PDF Generated',
      'index.mappedFields': '33 mapped fields filled',
      'index.problem.title': 'The Problem',
      'index.problem.copy': 'Record relief is confusing, fragmented, and court-specific.',
      'index.solution.title': 'The Solution',
      'index.solution.copy': 'RecordPathAI converts user intake into structured data and generates court-specific filing packets.',
      'index.how.1.title': '1. Formulario de elegibilidad',
      'index.how.1.copy': 'Collect residence, identity, and basic screening data.',
      'index.how.2.title': '2. Detalles del registro',
      'index.how.2.copy': 'Capture charges, statutes, outcomes, courts, dates, and case state.',
      'index.how.3.title': '3. Generación de paquete',
      'index.how.3.copy': 'Generate court-ready PDF packets based on state and county forms.',
      'index.built.title': 'Built for consumer access. Designed for court-tech integration.',
      'index.consumer.title': 'Consumer Front Door',
      'index.consumer.copy': 'Helps users start before they reach court systems.',
      'index.structured.title': 'Structured Legal Data',
      'index.structured.copy': 'Turns messy record information into standardized packet data.',
      'index.future.title': 'Future B2B Potential',
      'index.future.copy': 'Can integrate upstream with courts, legal aid, and case management platforms.',
      'index.capability.title': 'Current Capability',
      'index.now.title': 'What RecordPathAI does now',
      'index.now.1': 'Collects user intake',
      'index.now.2': 'Captures case and offense details',
      'index.now.3': 'Determines packet direction by case state',
      'index.now.4': 'Generates printable mapped PDF packets',
      'index.next.title': 'What comes next',
      'index.next.1': 'Multi-state form expansion',
      'index.next.2': 'Payment workflow',
      'index.next.3': 'E-filing partnerships',
      'index.next.4': 'Court software integrations',
      'index.cta.title': 'Start with your eligibility intake.',
      'footer.copy': 'Guided record relief workflow and court packet preparation.',
      'footer.legal': 'RecordPathAI is not a law firm and does not provide legal advice. Documents are generated based on user input and publicly available forms.',
      'footer.terms': 'Terms',
      'footer.privacy': 'Privacy',
      'footer.disclaimer': 'Disclaimer',
      'eligibility.eyebrow': 'Step 1 of the workflow',
      'eligibility.pageTitle': 'Start Your Eligibility Intake',
      'eligibility.contact.title': 'Your Contact Information',
      'eligibility.firstName': 'First Name',
      'eligibility.lastName': 'Last Name',
      'eligibility.fullName': 'Full Legal Name',
      'eligibility.email': 'Email',
      'eligibility.phone': 'Phone',
      'eligibility.address1': 'Street Address',
      'eligibility.address2': 'Apartment / Unit',
      'eligibility.city': 'City',
      'eligibility.residenceState': 'Residence State',
      'eligibility.zip': 'ZIP',
      'eligibility.notes': 'Optional Notes',
      'eligibility.save': 'Save Intake',
      'eligibility.continue': 'Save and Continue',
      'eligibility.next.title': 'What happens next',

      'how.eyebrow': 'Step 1 · Intake to Filing Path',
      'record.eyebrow': 'Step 2 of the workflow',
      'packet.eyebrow': 'Step 3 of the workflow',
      'packet.eligibilityStatus': 'Eligibility Status',
      'packet.reliefType': 'Relief Type',
      'packet.dischargeDate': 'Discharge Date',
      'packet.waitingPeriod': 'Required Waiting Period',
      'packet.estimatedEligibleDate': 'Estimated Eligible Date',
    },
    es: {
      'lang.label': 'Acceso de idioma',
      'lang.english': 'English',
      'lang.spanish': 'Español',
      'translation.disclaimer': 'La traducción se proporciona para conveniencia y puede no reemplazar los servicios oficiales de traducción del tribunal.',
      'nav.home': 'Inicio',
      'nav.how': 'Cómo funciona',
      'nav.eligibility': 'Elegibilidad',
      'nav.recordDetails': 'Detalles del registro',
      'nav.packet': 'Paquete',
      'nav.checkEligibility': 'Verificar elegibilidad',

      'index.hero.title': 'Alivio de antecedentes judiciales, automatizado.',
      'index.hero.seeHow': 'Ver cómo funciona',
      'how.title': 'Cómo funciona',
      'eligibility.title': 'Formulario de elegibilidad',
      'record.title': 'Detalles del registro',
      'packet.title': 'Su paquete de presentación',

      'index.eyebrow': 'Automatización de documentos judiciales',
      'index.hero.copy': 'Millones de personas en Estados Unidos pueden calificar para sellar o eliminar un antecedente. RecordPathAI guía a los usuarios por la elegibilidad, los detalles del caso y la generación de paquetes listos para la corte.',
      'index.trust': 'Actualmente generando paquetes judiciales imprimibles. Las integraciones de presentación electrónica llegarán después.',
      'index.workflow': 'Flujo de RecordPathAI',
      'index.packetBuilder': 'Constructor de Paquete Judicial',
      'index.status.ready': 'Listo',
      'index.progress.pdf': 'Paquete PDF',
      'index.caseState': 'Estado del caso',
      'index.county': 'Condado',
      'index.selectedCourtForm': 'Formulario judicial seleccionado',
      'index.pdfGenerated': 'PDF generado',
      'index.mappedFields': '33 campos mapeados completados',
      'index.problem.title': 'El problema',
      'index.problem.copy': 'Record relief is confusing, fragmented, and court-specific.',
      'index.solution.title': 'La solución',
      'index.solution.copy': 'RecordPathAI converts user intake into structured data and generates court-specific filing packets.',
      'index.how.1.title': '1. Eligibility Intake',
      'index.how.1.copy': 'Collect residence, identity, and basic screening data.',
      'index.how.2.title': '2. Record Details',
      'index.how.2.copy': 'Capture charges, statutes, outcomes, courts, dates, and case state.',
      'index.how.3.title': '3. Packet Generation',
      'index.how.3.copy': 'Generate court-ready PDF packets based on state and county forms.',
      'index.built.title': 'Built for consumer access. Designed for court-tech integration.',
      'index.consumer.title': 'Consumer Front Door',
      'index.consumer.copy': 'Helps users start before they reach court systems.',
      'index.structured.title': 'Structured Legal Data',
      'index.structured.copy': 'Turns messy record information into standardized packet data.',
      'index.future.title': 'Future B2B Potential',
      'index.future.copy': 'Can integrate upstream with courts, legal aid, and case management platforms.',
      'index.capability.title': 'Current Capability',
      'index.now.title': 'What RecordPathAI does now',
      'index.now.1': 'Collects user intake',
      'index.now.2': 'Captures case and offense details',
      'index.now.3': 'Determines packet direction by case state',
      'index.now.4': 'Generates printable mapped PDF packets',
      'index.next.title': 'What comes next',
      'index.next.1': 'Multi-state form expansion',
      'index.next.2': 'Payment workflow',
      'index.next.3': 'E-filing partnerships',
      'index.next.4': 'Court software integrations',
      'index.cta.title': 'Start with your eligibility intake.',
      'footer.copy': 'Guided record relief workflow and court packet preparation.',
      'footer.legal': 'RecordPathAI is not a law firm and does not provide legal advice. Documents are generated based on user input and publicly available forms.',
      'footer.terms': 'Términos',
      'footer.privacy': 'Privacidad',
      'footer.disclaimer': 'Descargo de responsabilidad',
      'eligibility.eyebrow': 'Step 1 of the workflow',
      'eligibility.pageTitle': 'Start Your Eligibility Intake',
      'eligibility.contact.title': 'Your Contact Information',
      'eligibility.firstName': 'First Name',
      'eligibility.lastName': 'Last Name',
      'eligibility.fullName': 'Full Legal Name',
      'eligibility.email': 'Email',
      'eligibility.phone': 'Phone',
      'eligibility.address1': 'Street Address',
      'eligibility.address2': 'Apartment / Unit',
      'eligibility.city': 'City',
      'eligibility.residenceState': 'Residence State',
      'eligibility.zip': 'ZIP',
      'eligibility.notes': 'Optional Notes',
      'eligibility.save': 'Save Intake',
      'eligibility.continue': 'Save and Continue',
      'eligibility.next.title': 'Qué sucede después',

      'how.eyebrow': 'Paso 1 · De formulario a ruta de presentación',
      'record.eyebrow': 'Paso 2 del flujo de trabajo',
      'packet.eyebrow': 'Paso 3 del flujo de trabajo',
      'packet.eligibilityStatus': 'Estado de elegibilidad',
      'packet.reliefType': 'Tipo de alivio',
      'packet.dischargeDate': 'Fecha de finalización de sentencia',
      'packet.waitingPeriod': 'Período de espera requerido',
      'packet.estimatedEligibleDate': 'Fecha estimada de elegibilidad',
    }
  };

  function getLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return dictionary[stored] ? stored : DEFAULT_LANG;
  }

  function setLanguage(lang) {
    const next = dictionary[lang] ? lang : DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, next);
    applyLanguage(next);
  }

  function translateNode(node, lang) {
    const key = node.getAttribute('data-i18n');
    const attr = node.getAttribute('data-i18n-attr');
    const value = dictionary[lang] && dictionary[lang][key];
    if (!value) return;
    if (attr) node.setAttribute(attr, value);
    else node.textContent = value;
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((node) => translateNode(node, lang));
    const selector = document.querySelector('[data-language-selector]');
    if (selector) selector.value = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const selector = document.querySelector('[data-language-selector]');
    if (selector) {
      selector.addEventListener('change', function (event) {
        setLanguage(event.target.value);
      });
    }
    applyLanguage(getLanguage());
  });
})();
