import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Copy, Building2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.06 },
});

const rekvizity = [
  { label: 'Полное наименование',      value: 'Общество с ограниченной ответственностью «Мобильные технологии»' },
  { label: 'Сокращённое наименование', value: 'ООО «Мобильные технологии»' },
  { label: 'ИНН',                     value: '7743412649' },
  { label: 'КПП',                     value: '771401001' },
  { label: 'ОГРН',                    value: '1237700190420' },
  { label: 'Юридический адрес',       value: '125167, г. Москва, Новый Зыковский проезд, д. 3, пом. 19Ц' },
  { label: 'Телефон',                 value: '+7 (495) 136-5777' },
  { label: 'Email',                   value: 'info@skydefence.ru' },
];

const banking = [
  { label: 'Банк',            value: 'АО «Альфа-Банк»' },
  { label: 'БИК',             value: '044525593' },
  { label: 'Расчётный счёт',  value: '40702810902540005273' },
  { label: 'Корр. счёт',      value: '30101810200000000593' },
  { label: 'Адрес банка',     value: '115432, г. Москва, пр-кт Андропова, д. 18, корп. 6' },
];

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-dark-border last:border-0">
      <div className="min-w-0">
        <div className="text-[10px] text-olive-700 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm text-olive-200 break-all">{value}</div>
      </div>
      <button onClick={copy} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-olive-500/10 transition-colors text-olive-600 hover:text-olive-400">
        {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

export const Rekvizity = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8 max-w-2xl">
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
      {' '}/{' '}
      <span className="text-olive-400">Реквизиты</span>
    </div>

    <h1 className="text-2xl font-black text-white mb-1">Реквизиты организации</h1>
    <p className="text-sm text-olive-500 mb-8">Для оформления счетов и документов</p>

    {/* Org details */}
    <motion.div {...fade(0)} className="bg-dark-card border border-dark-border rounded-xl p-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={16} className="text-olive-500" />
        <span className="text-sm font-bold text-white">Общие сведения</span>
      </div>
      {rekvizity.map((r) => (
        <CopyField key={r.label} label={r.label} value={r.value} />
      ))}
    </motion.div>

    {/* Banking */}
    <motion.div {...fade(1)} className="bg-dark-card border border-dark-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={16} className="text-olive-500" />
        <span className="text-sm font-bold text-white">Банковские реквизиты</span>
      </div>
      {banking.map((r) => (
        <CopyField key={r.label} label={r.label} value={r.value} />
      ))}
    </motion.div>

    <motion.div {...fade(2)} className="bg-olive-500/5 border border-olive-500/20 rounded-xl p-4 text-xs text-olive-500 leading-relaxed">
      Для получения закрывающих документов (счёт-фактура, акт, УПД) — укажите при оформлении заказа реквизиты вашей организации. Документы предоставляются в электронном виде через ЭДО или в бумажном виде по запросу.
    </motion.div>
  </div>
);
