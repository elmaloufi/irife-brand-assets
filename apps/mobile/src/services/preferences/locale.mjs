const supportedLanguages = ['en', 'fr', 'ar'];

export const translations = {
  en: {
    settings: 'Settings', account: 'Account', appLanguage: 'App language', chooseLanguage: 'Choose your preferred language',
    currency: 'Preferred currency', currencyDescription: 'For displaying experience prices', distance: 'Distance units',
    distanceDescription: 'Used for directions and nearby places', appearance: 'Appearance', theme: 'Theme',
    themeDescription: 'Choose how IRIFE should look', system: 'System', light: 'Light', dark: 'Dark',
    travelPreferences: 'Travel preferences', saved: 'Preferences saved on this device', loading: 'Loading your preferences…',
    english: 'English', french: 'Français', arabic: 'العربية', kilometres: 'Kilometres', miles: 'Miles',
    privacy: 'Privacy & permissions', security: 'Account security', region: 'Country or region', regionDescription: 'Used for regional formats and travel defaults', home: 'Home', discover: 'Discover', map: 'Map', guide: 'Guide', profile: 'Account',
  },
  fr: {
    settings: 'Paramètres', account: 'Compte', appLanguage: 'Langue de l’application', chooseLanguage: 'Choisissez votre langue préférée',
    currency: 'Devise préférée', currencyDescription: 'Pour afficher les prix des expériences', distance: 'Unités de distance',
    distanceDescription: 'Pour les itinéraires et les lieux à proximité', appearance: 'Apparence', theme: 'Thème',
    themeDescription: 'Choisissez l’apparence d’IRIFE', system: 'Système', light: 'Clair', dark: 'Sombre',
    travelPreferences: 'Préférences de voyage', saved: 'Préférences enregistrées sur cet appareil', loading: 'Chargement des préférences…',
    english: 'English', french: 'Français', arabic: 'العربية', kilometres: 'Kilomètres', miles: 'Miles',
    privacy: 'Confidentialité et autorisations', security: 'Sécurité du compte', region: 'Pays ou région', regionDescription: 'Pour les formats régionaux et les préférences de voyage', home: 'Accueil', discover: 'Découvrir', map: 'Carte', guide: 'Guide', profile: 'Compte',
  },
  ar: {
    settings: 'الإعدادات', account: 'الحساب', appLanguage: 'لغة التطبيق', chooseLanguage: 'اختر لغتك المفضلة',
    currency: 'العملة المفضلة', currencyDescription: 'لعرض أسعار التجارب', distance: 'وحدات المسافة',
    distanceDescription: 'للاتجاهات والأماكن القريبة', appearance: 'المظهر', theme: 'السمة',
    themeDescription: 'اختر مظهر تطبيق إيريف', system: 'حسب النظام', light: 'فاتح', dark: 'داكن',
    travelPreferences: 'تفضيلات السفر', saved: 'تم حفظ التفضيلات على هذا الجهاز', loading: 'جارٍ تحميل التفضيلات…',
    english: 'الإنجليزية', french: 'الفرنسية', arabic: 'العربية', kilometres: 'كيلومتر', miles: 'ميل',
    privacy: 'الخصوصية والأذونات', security: 'أمان الحساب', region: 'الدولة أو المنطقة', regionDescription: 'لتنسيقات المنطقة وتفضيلات السفر', home: 'الرئيسية', discover: 'اكتشف', map: 'الخريطة', guide: 'المرشد', profile: 'الحساب',
  },
};

export function normalizeLanguage(language) {
  const base = String(language || 'en').toLowerCase().split(/[-_]/)[0];
  return supportedLanguages.includes(base) ? base : 'en';
}

export function resolveLocale(language, region = 'MA') {
  const lang = normalizeLanguage(language);
  const country = /^[A-Z]{2}$/.test(String(region).toUpperCase()) ? String(region).toUpperCase() : 'MA';
  return lang === 'en' ? 'en-' + country : lang + '-' + country;
}

export function isRightToLeft(language) {
  return normalizeLanguage(language) === 'ar';
}

export function translate(language, key) {
  const lang = normalizeLanguage(language);
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export function formatCurrency(amount, currency, locale) {
  const code = /^[A-Z]{3}$/.test(String(currency)) ? currency : 'MAD';
  return new Intl.NumberFormat(locale || 'en-MA', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(amount);
}

export function formatDistance(distanceKm, unit, locale) {
  const value = unit === 'mi' ? distanceKm * 0.621371 : distanceKm;
  const rounded = new Intl.NumberFormat(locale || 'en-MA', { maximumFractionDigits: 1 }).format(value);
  return unit === 'mi' ? rounded + ' mi' : rounded + ' km';
}
