import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    message: {
      hello: 'Hello',
    },
  },
  ja: {
    message: {
      hello: 'こんにちは',
    },
  },
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
