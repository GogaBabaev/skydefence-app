import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, RefreshCw, Phone, ArrowRight, Clock, Package } from 'lucide-react';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07 },
});

const warrantyTerms = [
  { category: 'Детекторы БПЛА',             period: '12 месяцев' },
  { category: 'Подавители БПЛА',            period: '12 месяцев' },
  { category: 'Квадрокоптеры DJI',          period: '12 месяцев' },
  { category: 'Тактическое снаряжение',     period: '6 месяцев'  },
  { category: 'Портативные электростанции', period: '24 месяца'  },
  { category: 'Спутниковый интернет',       period: '12 месяцев' },
];

const covered = [
  'Заводской брак и производственные дефекты',
  'Неисправности, возникшие при правильной эксплуатации',
  'Неработающие кнопки, разъёмы, дисплеи при заводском дефекте',
  'Выход из строя аккумулятора (при снижении ёмкости менее 80% за гарантийный срок)',
  'Дефекты пайки и электронных компонентов',
];

const notCovered = [
  'Механические повреждения (удары, падения, вмятины)',
  'Попадание влаги, если устройство не имеет защиты IP',
  'Самостоятельный ремонт или модификация',
  'Нарушение правил эксплуатации из инструкции',
  'Естественный износ расходных материалов',
  'Повреждения при транспортировке по вине перевозчика',
];

const returnSteps = [
  { icon: Phone,      title: 'Свяжитесь с нами',      desc: 'Позвоните или напишите — опишите проблему. Менеджер поможет определить гарантийный случай.' },
  { icon: Package,    title: 'Отправьте товар',        desc: 'Упакуйте товар в оригинальную упаковку и отправьте СДЭК на наш склад в Москве.' },
  { icon: Clock,      title: 'Диагностика 5–10 дней',  desc: 'Сервисный центр проведёт диагностику. Вы получите заключение о гарантийном случае.' },
  { icon: RefreshCw,  title: 'Ремонт или замена',      desc: 'Гарантийный случай — бесплатный ремонт или замена. Доставка обратно за наш счёт.' },
];

export const Garantiya = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
      {' '}/{' '}
      <span className="text-olive-400">Гарантия и возврат</span>
    </div>

    <h1 className="text-2xl font-black text-white mb-1">Гарантия и возврат</h1>
    <p className="text-sm text-olive-500 mb-8">Официальная гарантия на весь ассортимент магазина</p>

    {/* Banner */}
    <motion.div {...fade(0)} className="always-dark bg-gradient-to-r from-olive-900/30 to-dark-card border border-olive-500/20 rounded-xl p-5 flex gap-4 items-center mb-8">
      <div className="w-12 h-12 rounded-xl bg-olive-500/20 flex items-center justify-center shrink-0">
        <Shield size={22} className="text-olive-400" />
      </div>
      <div>
        <div className="text-base font-bold text-white mb-0.5">Официальная гарантия производителя</div>
        <div className="text-xs text-olive-500">Все товары имеют гарантию. Сервисное обслуживание — через авторизованные сервисные центры.</div>
      </div>
    </motion.div>

    {/* Warranty terms table */}
    <h2 className="section-title mb-4">Сроки гарантии по категориям</h2>
    <motion.div {...fade(0)} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden mb-8">
      {warrantyTerms.map((w, i) => (
        <div key={w.category} className={`flex items-center justify-between px-4 py-3 ${i < warrantyTerms.length - 1 ? 'border-b border-dark-border' : ''}`}>
          <span className="text-sm text-olive-200">{w.category}</span>
          <span className="text-sm font-bold text-olive-400">{w.period}</span>
        </div>
      ))}
    </motion.div>

    {/* Covered / Not covered */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <motion.div {...fade(0)} className="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <CheckCircle size={15} className="text-green-500" /> Гарантийные случаи
        </h3>
        <div className="space-y-2">
          {covered.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" />
              <span className="text-xs text-olive-500 leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div {...fade(1)} className="bg-dark-card border border-dark-border rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <XCircle size={15} className="text-red-500/70" /> Не является гарантийным
        </h3>
        <div className="space-y-2">
          {notCovered.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <XCircle size={12} className="text-red-500/60 shrink-0 mt-0.5" />
              <span className="text-xs text-olive-500 leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Return process */}
    <h2 className="section-title mb-4">Порядок гарантийного обращения</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {returnSteps.map((s, i) => (
        <motion.div key={s.title} {...fade(i)} className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-olive-500/20 flex items-center justify-center text-xs font-black text-olive-400 shrink-0">
              {i + 1}
            </div>
            <s.icon size={14} className="text-olive-500" />
          </div>
          <div className="text-sm font-bold text-white mb-1">{s.title}</div>
          <div className="text-xs text-olive-600 leading-relaxed">{s.desc}</div>
        </motion.div>
      ))}
    </div>

    {/* Return policy */}
    <motion.div {...fade(0)} className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6">
      <h2 className="text-sm font-bold text-white mb-3">Возврат товара надлежащего качества</h2>
      <p className="text-xs text-olive-500 leading-relaxed mb-2">
        При дистанционной продаже (ст. 26.1 Закона «О защите прав потребителей») вы можете вернуть товар надлежащего качества в течение <strong className="text-olive-300">7 дней</strong> с момента получения, если он не подошёл по форме, габаритам, фасону, расцветке или комплектации.
      </p>
      <p className="text-xs text-olive-500 leading-relaxed">
        Условия: товар не был в употреблении, сохранены заводская упаковка, пломбы, ярлыки и все комплектующие. Возврат средств — в течение 10 дней после получения товара на склад.
      </p>
    </motion.div>

    {/* CTA */}
    <motion.div {...fade(0)} className="always-dark bg-gradient-to-r from-olive-900/30 to-dark-card border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 text-center sm:text-left">
        <div className="text-base font-bold text-white mb-1">Нужна помощь с гарантийным случаем?</div>
        <div className="text-xs text-olive-500">Позвоните или напишите — разберёмся быстро</div>
      </div>
      <div className="flex gap-2 shrink-0">
        <a href="tel:+74951365777" className="btn-primary text-sm"><Phone size={13} /> Позвонить</a>
        <Link to="/contacts" className="btn-outline text-sm">Написать <ArrowRight size={13} /></Link>
      </div>
    </motion.div>
  </div>
);
