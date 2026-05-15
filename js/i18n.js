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
