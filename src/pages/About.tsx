import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const directions = [
  { title: 'Беспилотные системы',        desc: 'Промышленные квадрокоптеры с тепловизорами и системой длительного слежения' },
  { title: 'Радиоэлектронные системы',   desc: 'Детекторы, подавители и усилители сигналов, сканеры частот' },
  { title: 'Спецсредства связи',         desc: 'Защищённые радиостанции и системы шифрования' },
  { title: 'Оптико-электронные системы', desc: 'Тепловизионные и ночные прицелы, приборы ночного видения' },
  { title: 'Специализированное снаряжение', desc: 'Оборудование для спецподразделений и охранных структур' },
];

const certs = ['ГОСТ Р', 'ISO 9001:2015', 'ТР ТС 020/2011', 'ФЗ-149 "Об информации"', 'Реестр МПТ'];

export const About = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    {/* Breadcrumb */}
    <div className="text-xs text-olive-700 mb-5">Главная / О компании</div>

    <h1 className="section-title mb-2">О компании</h1>
    <p className="text-sm text-olive-500 mb-8">SkyDefence — военторг и экспертное снаряжение</p>

    {/* Main text */}
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6 text-sm text-olive-400 leading-relaxed"
    >
      «СпецСнаряжение» — специализированный поставщик профессионального оборудования и технических средств специального назначения. Мы предлагаем высокотехнологичные решения для силовых структур, служб безопасности и специализированных организаций. Работаем как с юридическими лицами, так и с частными покупателями.
    </motion.div>

    {/* Directions */}
    <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Основные направления</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {directions.map((d, i) => (
        <motion.div
          key={d.title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-3"
        >
          <CheckCircle size={16} className="text-olive-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white mb-0.5">{d.title}</div>
            <div className="text-xs text-olive-600">{d.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[['500+','клиентов'],['15 лет','на рынке'],['24/7','поддержка']].map(([n,l]) => (
        <div key={l} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
          <div className="text-xl font-black text-olive-500 mb-0.5">{n}</div>
          <div className="text-xs text-olive-600">{l}</div>
        </div>
      ))}
    </div>

    {/* Certs */}
    <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Сертификаты</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {certs.map(c => (
        <div key={c} className="bg-dark-card border border-dark-border rounded-lg px-3 py-2.5 flex items-center gap-2">
          <CheckCircle size={13} className="text-olive-500 shrink-0" />
          <span className="text-xs text-olive-300">{c}</span>
        </div>
      ))}
    </div>
  </div>
);
