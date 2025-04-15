import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  welcome: 'Welcome',
  login: 'Login',
  // Add more translations
};

// Spanish translations
const es = {
  welcome: 'Bienvenido',
  login: 'Iniciar sesión',
  // Add more translations
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
