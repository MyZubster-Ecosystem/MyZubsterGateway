import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useTranslation } from '../contexts/LanguageContext.jsx';

const Home = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <div className="text-center py-12" data-i18n="home">
        <h1 className="text-4xl font-bold mb-4">{t('home.title')}</h1>
        <p className="text-xl text-gray-600 mb-8">
          {t('home.subtitle')}
        </p>
        <div className="space-x-4">
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            {t('home.cta')}
          </Link>
          <Link to="/skills" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
            {t('home.explore')}
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;