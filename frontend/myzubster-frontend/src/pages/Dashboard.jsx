import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';

const tabs = [
  { id: 'overview', label: '📊 Overview', icon: '📊' },
  { id: 'users', label: '👥 Utenti', icon: '👥' },
  { id: 'comuni', label: '🏛️ Comuni', icon: '🏛️' },
  { id: 'enti', label: '🏢 Enti', icon: '🏢' },
  { id: 'orti', label: '🌱 Orti', icon: '🌱' },
  { id: 'hera', label: '🏭 Hera', icon: '🏭' },
  { id: 'token', label: '💎 Token', icon: '💎' },
];

// ── Mock data stores ──────────────────────────────────────────
const initialUsers = [
  { id: 1, name: 'Marco Rossi', email: 'marco@example.com', role: 'Admin', status: 'Attivo' },
  { id: 2, name: 'Anna Bianchi', email: 'anna@example.com', role: 'Utente', status: 'Attivo' },
  { id: 3, name: 'Luca Verdi', email: 'luca@example.com', role: 'Utente', status: 'Inattivo' },
  { id: 4, name: 'Sofia Neri', email: 'sofia@example.com', role: 'Editor', status: 'Attivo' },
  { id: 5, name: 'Paolo Gialli', email: 'paolo@example.com', role: 'Utente', status: 'Attivo' },
];

const initialComuni = [
  { id: 1, name: 'Milano', provincia: 'MI', regione: 'Lombardia', abitanti: 1400000, status: 'Attivo' },
  { id: 2, name: 'Roma', provincia: 'RM', regione: 'Lazio', abitanti: 2800000, status: 'Attivo' },
  { id: 3, name: 'Napoli', provincia: 'NA', regione: 'Campania', abitanti: 900000, status: 'Attivo' },
  { id: 4, name: 'Bologna', provincia: 'BO', regione: 'Emilia-Romagna', abitanti: 390000, status: 'Inattivo' },
];

const initialEnti = [
  { id: 1, name: 'Comune di Milano', tipo: 'Pubblica Amministrazione', regione: 'Lombardia', status: 'Attivo' },
  { id: 2, name: 'Regione Lazio', tipo: 'Ente Regionale', regione: 'Lazio', status: 'Attivo' },
  { id: 3, name: 'ARPA Emilia', tipo: 'Agenzia Ambientale', regione: 'Emilia-Romagna', status: 'Attivo' },
  { id: 4, name: 'ASL Roma 1', tipo: 'Sanità', regione: 'Lazio', status: 'Inattivo' },
];

const initialOrti = [
  { id: 1, name: 'Orto Urbano Centrale', superficie: 1200, comune: 'Milano', stato: 'Attivo', colture: 'Pomodori, Zucchine, Basilico' },
  { id: 2, name: 'Giardino Condiviso Nord', superficie: 800, comune: 'Milano', stato: 'Attivo', colture: 'Lattuga, Carote, Fragole' },
  { id: 3, name: 'Orto Didattico Scuole', superficie: 500, comune: 'Roma', stato: 'Manutenzione', colture: 'Erbe Aromatiche, Fagioli' },
  { id: 4, name: 'Parco Agricolo Sud', superficie: 2500, comune: 'Napoli', stato: 'Attivo', colture: 'Melanzane, Peperoni, Insalata' },
];

const initialPiante = [
  { id: 1, nome: 'Quercia', stato: 'Attivo', posizione: 'Parco Nord', altezza: 12, dataPiantumazione: '2020-03-15' },
  { id: 2, nome: 'Pino', stato: 'Attivo', posizione: 'Giardino Centrale', altezza: 8, dataPiantumazione: '2019-11-20' },
  { id: 3, nome: 'Olmo', stato: 'Monitoraggio', posizione: 'Viale Roma', altezza: 15, dataPiantumazione: '2018-05-10' },
  { id: 4, nome: 'Tiglio', stato: 'Critico', posizione: 'Piazza Dante', altezza: 6, dataPiantumazione: '2021-07-01' },
  { id: 5, nome: 'Acero', stato: 'Attivo', posizione: 'Parco Sud', altezza: 10, dataPiantumazione: '2020-09-12' },
  { id: 6, nome: 'Betulla', stato: 'Attivo', posizione: 'Giardino Botanico', altezza: 7, dataPiantumazione: '2022-04-05' },
];

const initialTokens = [
  { id: 1, nome: 'MyZubster Token', simbolo: 'MYZ', prezzo: 1.25, supply: 1000000, variazione: '+5.2%' },
  { id: 2, nome: 'Green Credit', simbolo: 'GRC', prezzo: 0.85, supply: 500000, variazione: '+2.1%' },
  { id: 3, nome: 'Community Coin', simbolo: 'CMC', prezzo: 0.45, supply: 2000000, variazione: '-1.3%' },
  { id: 4, nome: 'Hera Energy', simbolo: 'HEC', prezzo: 2.10, supply: 750000, variazione: '+8.7%' },
];

// ── Reusable components ───────────────────────────────────────

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Annulla</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Conferma</button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = 'text', required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// ── CRUD Table Component ──────────────────────────────────────

const CrudTable = ({ columns, data, onEdit, onDelete, emptyMessage = 'Nessun dato disponibile.' }) => {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-2 font-semibold text-gray-600 whitespace-nowrap">{col.label}</th>
            ))}
            <th className="text-right py-3 px-2 font-semibold text-gray-600">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="py-3 px-2 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
              <td className="py-3 px-2 text-right whitespace-nowrap">
                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 text-sm font-medium">Modifica</button>
                <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800 text-sm font-medium">Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Subsection Components ─────────────────────────────────────

const Overview = () => {
  const { user } = useAuth();
  const stats = [
    { label: 'Utenti Totali', value: '1,247', change: '+12%', color: 'blue' },
    { label: 'Comuni', value: '48', change: '+3', color: 'emerald' },
    { label: 'Enti', value: '156', change: '+8', color: 'violet' },
    { label: 'Orti Urbani', value: '89', change: '+15%', color: 'amber' },
    { label: 'Piante Monitorate', value: '2,341', change: '+22%', color: 'green' },
    { label: 'Token Attivi', value: '4', change: '—', color: 'indigo' },
  ];

  const notifications = [
    { id: 1, text: 'Nuovo utente registrato: Giulia Ferrari', time: '5 min fa', type: 'info' },
    { id: 2, text: 'Orto Urbano Centrale richiede manutenzione', time: '30 min fa', type: 'warning' },
    { id: 3, text: 'Pianta #4 (Tiglio) in stato critico', time: '1 ora fa', type: 'error' },
    { id: 4, text: 'Token MYZ ha raggiunto +5.2%', time: '2 ore fa', type: 'success' },
    { id: 5, text: 'Nuovo comune aggiunto: Firenze', time: '3 ore fa', type: 'info' },
  ];

  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const notifStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Benvenuto, {user?.name || user?.email || 'Utente'}!</h2>
        <p className="text-gray-500">Ecco una panoramica del sistema MyZubster Ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-xl p-5 text-white shadow-md`}>
            <p className="text-sm opacity-80">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            <p className="text-sm mt-1 opacity-80">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifiche Recenti</h3>
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-center justify-between p-3 rounded-lg border ${notifStyles[n.type]}`}>
              <span className="text-sm">{n.text}</span>
              <span className="text-xs opacity-60 ml-4 whitespace-nowrap">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Generic CRUD Subsection Hook ──────────────────────────────

const useCrud = (initialData) => {
  const [items, setItems] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openCreate = () => { setEditing({ id: null }); setShowForm(true); };
  const openEdit = (item) => { setEditing({ ...item }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const save = (item) => {
    if (item.id) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      const newId = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { ...item, id: newId }]);
    }
    closeForm();
  };

  const confirmDelete = () => {
    if (deleting) {
      setItems(prev => prev.filter(i => i.id !== deleting.id));
      setDeleting(null);
    }
  };

  return { items, showForm, editing, deleting, setDeleting, openCreate, openEdit, closeForm, save, confirmDelete };
};

// ── Generic CRUD Section ──────────────────────────────────────

const CrudSection = ({ title, columns, formFields, data, showForm, editing, deleting, onClose, onSave, onDelete, onEdit, onCreate, setDeleting, emptyMessage }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button onClick={onCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          + Nuovo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <CrudTable columns={columns} data={data} onEdit={onEdit} onDelete={setDeleting} emptyMessage={emptyMessage} />
      </div>

      <Modal isOpen={showForm} onClose={onClose} title={editing?.id ? `Modifica ${title}` : `Nuovo ${title}`}>
        {editing && (
          <CrudForm fields={formFields} data={editing} onSave={onSave} onCancel={onClose} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={onDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler eliminare questo elemento?`}
      />
    </div>
  );
};

const CrudForm = ({ fields, data, onSave, onCancel }) => {
  const [form, setForm] = useState(data);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => (
        field.type === 'select' ? (
          <SelectField key={field.name} label={field.label} name={field.name} value={form[field.name] || ''} onChange={handleChange} options={field.options} />
        ) : (
          <InputField key={field.name} label={field.label} name={field.name} value={form[field.name] || ''} onChange={handleChange} type={field.type || 'text'} required={field.required} />
        )
      ))}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm">Annulla</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Salva</button>
      </div>
    </form>
  );
};

// ── Users Section ─────────────────────────────────────────────

const UsersSection = () => {
  const crud = useCrud(initialUsers);
  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Ruolo' },
    { key: 'status', label: 'Stato', render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Attivo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
    )},
  ];
  const formFields = [
    { name: 'name', label: 'Nome', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Ruolo', type: 'select', options: [{ value: 'Admin', label: 'Admin' }, { value: 'Editor', label: 'Editor' }, { value: 'Utente', label: 'Utente' }] },
    { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'Attivo', label: 'Attivo' }, { value: 'Inattivo', label: 'Inattivo' }] },
  ];
  return <CrudSection title="👥 Gestione Utenti" columns={columns} formFields={formFields} emptyMessage="Nessun utente trovato." {...crud} />;
};

// ── Comuni Section ────────────────────────────────────────────

const ComuniSection = () => {
  const crud = useCrud(initialComuni);
  const columns = [
    { key: 'name', label: 'Comune' },
    { key: 'provincia', label: 'Provincia' },
    { key: 'regione', label: 'Regione' },
    { key: 'abitanti', label: 'Abitanti', render: (item) => item.abitanti?.toLocaleString() },
    { key: 'status', label: 'Stato', render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Attivo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
    )},
  ];
  const formFields = [
    { name: 'name', label: 'Nome Comune', required: true },
    { name: 'provincia', label: 'Provincia', required: true },
    { name: 'regione', label: 'Regione', required: true },
    { name: 'abitanti', label: 'Abitanti', type: 'number' },
    { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'Attivo', label: 'Attivo' }, { value: 'Inattivo', label: 'Inattivo' }] },
  ];
  return <CrudSection title="🏛️ Gestione Comuni" columns={columns} formFields={formFields} emptyMessage="Nessun comune trovato." {...crud} />;
};

// ── Enti Section ──────────────────────────────────────────────

const EntiSection = () => {
  const crud = useCrud(initialEnti);
  const columns = [
    { key: 'name', label: 'Ente' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'regione', label: 'Regione' },
    { key: 'status', label: 'Stato', render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Attivo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>
    )},
  ];
  const formFields = [
    { name: 'name', label: 'Nome Ente', required: true },
    { name: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'Pubblica Amministrazione', label: 'Pubblica Amministrazione' },
      { value: 'Ente Regionale', label: 'Ente Regionale' },
      { value: 'Agenzia Ambientale', label: 'Agenzia Ambientale' },
      { value: 'Sanità', label: 'Sanità' },
    ]},
    { name: 'regione', label: 'Regione', required: true },
    { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'Attivo', label: 'Attivo' }, { value: 'Inattivo', label: 'Inattivo' }] },
  ];
  return <CrudSection title="🏢 Gestione Enti" columns={columns} formFields={formFields} emptyMessage="Nessun ente trovato." {...crud} />;
};

// ── Orti Section ──────────────────────────────────────────────

const OrtiSection = () => {
  const crud = useCrud(initialOrti);
  const columns = [
    { key: 'name', label: 'Orto' },
    { key: 'superficie', label: 'Superficie (m²)', render: (item) => item.superficie?.toLocaleString() },
    { key: 'comune', label: 'Comune' },
    { key: 'stato', label: 'Stato', render: (item) => {
      const colors = { Attivo: 'bg-green-100 text-green-700', Manutenzione: 'bg-yellow-100 text-yellow-700', Inattivo: 'bg-gray-100 text-gray-500' };
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[item.stato] || 'bg-gray-100 text-gray-500'}`}>{item.stato}</span>;
    }},
    { key: 'colture', label: 'Colture' },
  ];
  const formFields = [
    { name: 'name', label: 'Nome Orto', required: true },
    { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
    { name: 'comune', label: 'Comune', required: true },
    { name: 'stato', label: 'Stato', type: 'select', options: [
      { value: 'Attivo', label: 'Attivo' },
      { value: 'Manutenzione', label: 'Manutenzione' },
      { value: 'Inattivo', label: 'Inattivo' },
    ]},
    { name: 'colture', label: 'Colture' },
  ];
  return <CrudSection title="🌱 Gestione Orti Urbani" columns={columns} formFields={formFields} emptyMessage="Nessun orto trovato." {...crud} />;
};

// ── Hera Section ──────────────────────────────────────────────

const HeraSection = () => {
  const [piante, setPiante] = useState(initialPiante);
  const [selectedPianta, setSelectedPianta] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const statoColors = { Attivo: 'bg-green-500', Monitoraggio: 'bg-yellow-500', Critico: 'bg-red-500' };

  const getMarkerColor = (stato) => {
    const colors = { Attivo: '#22c55e', Monitoraggio: '#eab308', Critico: '#ef4444' };
    return colors[stato] || '#6b7280';
  };

  const stats = {
    totale: piante.length,
    attive: piante.filter(p => p.stato === 'Attivo').length,
    monitoraggio: piante.filter(p => p.stato === 'Monitoraggio').length,
    critiche: piante.filter(p => p.stato === 'Critico').length,
  };

  const openDetail = (pianta) => {
    setSelectedPianta(pianta);
    setShowDetail(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏭 Monitoraggio Hera</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-sm opacity-80">Totale Piante</p>
          <p className="text-2xl font-bold mt-1">{stats.totale}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-4 text-white shadow-md">
          <p className="text-sm opacity-80">Attive</p>
          <p className="text-2xl font-bold mt-1">{stats.attive}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white shadow-md">
          <p className="text-sm opacity-80">In Monitoraggio</p>
          <p className="text-2xl font-bold mt-1">{stats.monitoraggio}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-sm opacity-80">Critiche</p>
          <p className="text-2xl font-bold mt-1">{stats.critiche}</p>
        </div>
      </div>

      {/* Interactive Map (simulated) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🗺️ Mappa Interattiva Piante</h3>
        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-xs text-gray-600">Attivo</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><span className="text-xs text-gray-600">Monitoraggio</span></div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-xs text-gray-600">Critico</span></div>
            </div>
            <div className="relative w-full max-w-md h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
              {piante.map((p, i) => (
                <div
                  key={p.id}
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    backgroundColor: getMarkerColor(p.stato),
                    top: `${15 + (i * 18) % 70}%`,
                    left: `${10 + (i * 25) % 80}%`,
                  }}
                  title={`${p.nome} - ${p.stato}`}
                  onClick={() => openDetail(p)}
                />
              ))}
              <p className="text-xs text-gray-400">Mappa interattiva — clicca sui marker</p>
            </div>
          </div>
        </div>
      </div>

      {/* Piante List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Elenco Piante</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Nome</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Stato</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Posizione</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Altezza (m)</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Data</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {piante.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-gray-800">{p.nome}</td>
                  <td className="py-3 px-2">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${statoColors[p.stato] || 'bg-gray-400'}`}></span>
                      <span className="text-xs">{p.stato}</span>
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-700">{p.posizione}</td>
                  <td className="py-3 px-2 text-gray-700">{p.altezza}</td>
                  <td className="py-3 px-2 text-gray-700">{p.dataPiantumazione}</td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => openDetail(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Dettaglio</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`🌳 ${selectedPianta?.nome || ''}`}>
        {selectedPianta && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Stato</p><p className="font-medium">{selectedPianta.stato}</p></div>
              <div><p className="text-sm text-gray-500">Posizione</p><p className="font-medium">{selectedPianta.posizione}</p></div>
              <div><p className="text-sm text-gray-500">Altezza</p><p className="font-medium">{selectedPianta.altezza} m</p></div>
              <div><p className="text-sm text-gray-500">Data Piantumazione</p><p className="font-medium">{selectedPianta.dataPiantumazione}</p></div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Report</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p>📊 Ultima ispezione: 2026-08-08</p>
                <p>🌡️ Temperatura suolo: 22°C</p>
                <p>💧 Umidità: 65%</p>
                <p>🍃 Salute fogliare: Buona</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Token Section ─────────────────────────────────────────────

const TokenSection = () => {
  const [tokens] = useState(initialTokens);
  const [wallet, setWallet] = useState({ MYZ: 1250, GRC: 500, CMC: 2000, HEC: 100 });
  const [showBuy, setShowBuy] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');

  const buyToken = (token) => {
    const amt = parseFloat(buyAmount);
    if (!amt || amt <= 0) return;
    const key = token.simbolo;
    setWallet(prev => ({ ...prev, [key]: (prev[key] || 0) + amt }));
    setShowBuy(null);
    setBuyAmount('');
  };

  const totalValue = Object.entries(wallet).reduce((sum, [key, qty]) => {
    const token = tokens.find(t => t.simbolo === key);
    return sum + (token ? qty * token.prezzo : 0);
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💎 Token & Wallet</h2>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-md mb-6">
        <p className="text-sm opacity-80">Valore Totale Wallet</p>
        <p className="text-3xl font-bold mt-1">${totalValue.toFixed(2)}</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(wallet).map(([key, qty]) => {
            const token = tokens.find(t => t.simbolo === key);
            return (
              <div key={key} className="bg-white/10 rounded-lg p-3">
                <p className="text-xs opacity-80">{key}</p>
                <p className="text-lg font-bold">{qty.toFixed(2)}</p>
                <p className="text-xs opacity-80">${token ? (qty * token.prezzo).toFixed(2) : '0.00'}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista Token</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Nome</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Simbolo</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Prezzo</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Supply</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Variazione</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-gray-800">{t.nome}</td>
                  <td className="py-3 px-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{t.simbolo}</span>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700">${t.prezzo.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gray-700">{t.supply.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={t.variazione.startsWith('+') ? 'text-green-600' : 'text-red-600'}>{t.variazione}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={() => setShowBuy(t)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition-colors">
                      Acquista
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!showBuy} onClose={() => { setShowBuy(null); setBuyAmount(''); }} title={`Acquista ${showBuy?.nome || ''}`}>
        {showBuy && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Prezzo corrente: <strong>${showBuy.prezzo.toFixed(2)}</strong> per {showBuy.simbolo}
            </p>
            <InputField label="Quantità" name="amount" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} type="number" />
            {buyAmount && parseFloat(buyAmount) > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Totale: <strong>${(parseFloat(buyAmount) * showBuy.prezzo).toFixed(2)}</strong>
              </p>
            )}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => { setShowBuy(null); setBuyAmount(''); }} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm">Annulla</button>
              <button onClick={() => buyToken(showBuy)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">Conferma Acquisto</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ── Main Dashboard Page ───────────────────────────────────────

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderSection = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'users': return <UsersSection />;
      case 'comuni': return <ComuniSection />;
      case 'enti': return <EntiSection />;
      case 'orti': return <OrtiSection />;
      case 'hera': return <HeraSection />;
      case 'token': return <TokenSection />;
      default: return <Overview />;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="min-h-[400px]">
          {renderSection()}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;