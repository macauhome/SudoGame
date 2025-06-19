class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'zh-TW'];
        this.init();
    }

    async init() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('sudoku-language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }

        // Load all translations
        await this.loadTranslations();
        
        // Apply translations to the page
        this.applyTranslations();
        
        // Update language selector
        this.updateLanguageSelector();
    }

    async loadTranslations() {
        for (const lang of this.supportedLanguages) {
            try {
                const response = await fetch(`locales/${lang}.json`);
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Failed to load translations for ${lang}:`, error);
            }
        }
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }
        
        // Fallback to English if translation not found
        if (value === undefined && this.currentLanguage !== 'en') {
            value = this.translations['en'];
            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = value[k];
                } else {
                    value = key; // Fallback to key if no translation found
                    break;
                }
            }
        }
        
        if (typeof value === 'string') {
            // Replace parameters in the string
            return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                return params[param] || match;
            });
        }
        
        return value || key;
    }

    async setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.error(`Unsupported language: ${language}`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('sudoku-language', language);
        
        // Update document language attribute
        document.documentElement.lang = language === 'zh-TW' ? 'zh-TW' : 'en';
        
        this.applyTranslations();
        this.updateLanguageSelector();
        
        // Notify game instance if it exists
        if (window.sudokuGame) {
            window.sudokuGame.onLanguageChange();
        }
    }

    applyTranslations() {
        // Update page title
        document.title = this.t('title');
        
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });
    }

    updateLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Global instance
window.i18n = new I18n();