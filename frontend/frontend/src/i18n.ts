import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      latest_news: "Latest News",
      breaking_news: "Tell Breaking",
      home: "Home",
      category: "Category",
      read_more: "Read More",
      art: "Art"
    }
  },
  ar: {
    translation: {
      latest_news: "آخر الأخبار",
      breaking_news: "عاجل",
      home: "الرئيسية",
      category: "الفئة",
      read_more: "اقرأ المزيد",
      art: "فنّ"
    }
  },
  fr: {
    translation: {
      latest_news: "Dernières Nouvelles",
      breaking_news: "Flash Info",
      home: "Accueil",
      category: "Catégorie",
      read_more: "Lire la suite",
      art: "Art"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;