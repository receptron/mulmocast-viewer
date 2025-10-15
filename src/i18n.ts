import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    message: {
      hello: 'Hello',
    },
    ui: {
      common: {
        noLang: 'No language available',
        noMedia: 'No media available',
      },
      actions: {
        translate: 'Translate',
        generateAudio: 'Generate Audio',
      },
    },
    mulmoViewer: {
      text: 'Text',
      audio: 'Audio',
    },
    project: {
      productTabs: {
        slide: {
          autoPlay: 'Auto Play',
          details: '{current} / {pages}',
        },
      },
    },
    languages: {
      en: 'English',
      ja: 'Japanese',
      zh: 'Chinese',
      ko: 'Korean',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
    },
  },
  ja: {
    message: {
      hello: 'こんにちは',
    },
    ui: {
      common: {
        noLang: '言語がありません',
        noMedia: 'メディアがありません',
      },
      actions: {
        translate: '翻訳',
        generateAudio: '音声を生成',
      },
    },
    mulmoViewer: {
      text: 'テキスト',
      audio: '音声',
    },
    project: {
      productTabs: {
        slide: {
          autoPlay: '自動再生',
          details: '{current} / {pages}',
        },
      },
    },
    languages: {
      en: '英語',
      ja: '日本語',
      zh: '中国語',
      ko: '韓国語',
      es: 'スペイン語',
      fr: 'フランス語',
      de: 'ドイツ語',
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
