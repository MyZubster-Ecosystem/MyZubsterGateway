import React from 'react';
import './Bounty.css';
import { useTranslation } from '../contexts/LanguageContext.jsx';

const Bounty = () => {
  const { t } = useTranslation();
  const items = t('bounty.items');

  return (
    <div className="bounty-page" data-i18n="bounty">
      <header className="bounty-header">
        <h1>{t('bounty.title')}</h1>
        <p>{t('bounty.subtitle')}</p>
      </header>

      <div className="bounty-grid">
        {(Array.isArray(items) ? items : []).map((b, i) => (
          <div key={i} className={`bounty-card ${['business', 'developer', 'marketing', 'international', 'security'][i]}`}>
            <h3>{b.title}</h3>
            <div className="reward">{b.reward}</div>
            <p>{b.desc}</p>
            <a href="https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues" target="_blank" rel="noopener noreferrer">
              {t('bounty.participate')}
            </a>
          </div>
        ))}
      </div>

      <div className="bounty-footer">
        <h2>{t('bounty.howItWorks')}</h2>
        <ol>
          <li>{t('bounty.step1')}</li>
          <li>{t('bounty.step2')}</li>
          <li>{t('bounty.step3')}</li>
          <li>{t('bounty.step4')}</li>
        </ol>
        <p>{t('bounty.paymentNote')}</p>
        <p>🔗 <a href="https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues">{t('bounty.seeAll')}</a></p>
      </div>
    </div>
  );
};

export default Bounty;