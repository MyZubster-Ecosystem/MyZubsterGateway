import React from 'react';
import { useTranslation, LANGUAGES } from '../../contexts/LanguageContext.jsx';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();

  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="language-switcher" ref={ref}>
      <button
        className="lang-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Switch language"
        title={current.label}
      >
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <span className="lang-chevron" data-open={open}>▾</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`lang-option ${lang === l.code ? 'active' : ''}`}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-label">{l.label}</span>
              {lang === l.code && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;