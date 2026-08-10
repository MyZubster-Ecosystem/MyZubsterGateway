import React, { useState, useMemo } from 'react';
import faqData from '../data/faq';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutte');
  const [openItems, setOpenItems] = useState(new Set());

  const categories = useMemo(() => {
    const cats = ['Tutte', ...new Set(faqData.map(item => item.category))];
    return cats;
  }, []);

  const filteredFaq = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = activeCategory === 'Tutte' || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const toggleItem = (id) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Domande Frequenti
        </h1>
        <p className="text-lg text-gray-600">
          Trova risposte alle domande più comuni su MyZubster
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cerca nelle FAQ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          aria-label="Cerca nelle FAQ"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Cancella ricerca"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Categorie FAQ">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={activeCategory === category}
          >
            {category}
            {category !== 'Tutte' && (
              <span className="ml-1 text-xs opacity-75">
                ({faqData.filter(f => f.category === category).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {searchTerm && (
        <p className="text-sm text-gray-500 mb-4">
          {filteredFaq.length === 0
            ? 'Nessun risultato trovato. Prova con altri termini di ricerca.'
            : `${filteredFaq.length} risultato${filteredFaq.length !== 1 ? 'i' : ''} trovato${filteredFaq.length !== 1 ? 'i' : ''}`
          }
        </p>
      )}

      {/* FAQ Accordion */}
      {filteredFaq.length > 0 ? (
        <div className="space-y-3">
          {filteredFaq.map(item => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                aria-expanded={openItems.has(item.id)}
                aria-controls={`faq-answer-${item.id}`}
              >
                <div className="flex-1 pr-4">
                  <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-medium text-gray-900">
                    {item.question}
                  </h3>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openItems.has(item.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                className={`transition-all duration-300 ease-in-out ${
                  openItems.has(item.id)
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Nessuna domanda trovata</p>
          <p className="text-gray-400 mt-2">Prova a modificare i termini di ricerca o la categoria selezionata.</p>
        </div>
      )}

      {/* Contact Section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Non hai trovato quello che cercavi?
        </h3>
        <p className="text-blue-700 mb-4">
          Contatta il nostro team di supporto per assistenza personalizzata.
        </p>
        <a
          href="mailto:support@myzubster.com"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contatta Supporto
        </a>
      </div>
    </div>
  );
};

export default FAQ;