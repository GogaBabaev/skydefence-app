import { Link } from 'react-router-dom';
import { Building2, FileText, Send, Phone, CheckCircle } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'Выбираете товар', text: 'Находите нужный товар в каталоге и оставляете заявку или звоните менеджеру.' },
  { n: '02', title: 'Согласование', text: 'Менеджер уточняет детали, наличие, комплектацию и сроки. Вы получаете итоговую сумму.' },
  { n: '03', title: 'Выставляем счёт', text: 'Выставляем счёт с полными реквизитами организации. По запросу — договор поставки и закрывающие документы.' },
  { n: '04', title: 'Оплата', text: 'Переводите удобным способом. После подтверждения оплаты — отправляем заказ.' },
];

const FAQ = [
  {
    q: 'Почему нет оплаты картой онлайн?',
    a: 'Мы работаем в сегменте специализированного оборудования. Прямой перевод позволяет нам держать цены без наценки за эквайринг (1.5–3%) и предоставлять индивидуальные условия каждому клиенту.',
  },
  {
    q: 'Когда отправят заказ после оплаты?',
    a: 'Отправка производится после поступления денег на счёт — как правило, в тот же или на следующий рабочий день.',
  },
  {
    q: 'Можно ли получить закрывающие документы?',
    a: 'Да. Для юридических лиц выставляем счёт, УПД или ТОРГ-12, счёт-фактуру. Работаем по договору поставки.',
  },
  {
    q: 'Есть ли гарантия после оплаты?',
    a: 'Да, на всё оборудование распространяется официальная гарантия производителя от 12 месяцев. Подробнее на странице Гарантия.',
  },
];

export const Oplata = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link> / <span className="text-olive-400">Оплата</span>
    </div>

    <h1 className="section-title mb-4">Оплата</h1>
    <p className="text-olive-500 mb-10 max-w-2xl leading-relaxed">
      Мы работаем без онлайн-эквайринга — это позволяет нам не включать комиссию платёжных
      систем в цену товара. Оплата производится после согласования заказа с менеджером.
    </p>

    {/* Methods */}
    <div className="grid sm:grid-cols-2 gap-4 mb-12">
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="w-11 h-11 rounded-xl bg-olive-500/10 flex items-center justify-center mb-4">
          <Building2 size={20} className="text-olive-500" />
        </div>
        <h2 className="font-bold text-white mb-2">Расчётный счёт</h2>
        <p className="text-sm text-olive-600 leading-relaxed">
          Безналичный расчёт для ИП и юридических лиц. Выставляем счёт с полными
          реквизитами организации.
        </p>
        <ul className="mt-3 space-y-1">
          {['Счёт на оплату', 'УПД / ТОРГ-12', 'Счёт-фактура', 'Договор поставки'].map(d => (
            <li key={d} className="flex items-center gap-1.5 text-xs text-olive-500">
              <CheckCircle size={11} className="text-olive-500 shrink-0" />{d}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="w-11 h-11 rounded-xl bg-olive-500/10 flex items-center justify-center mb-4">
          <FileText size={20} className="text-olive-500" />
        </div>
        <h2 className="font-bold text-white mb-2">Договор</h2>
        <p className="text-sm text-olive-600 leading-relaxed">
          Для регулярных закупок — рамочный договор поставки. Удобно для компаний,
          работающих по 44-ФЗ и 223-ФЗ.
        </p>
        <ul className="mt-3 space-y-1">
          {['Рамочный договор', 'Отсрочка платежа', 'Кредитный лимит', 'Персональный менеджер'].map(d => (
            <li key={d} className="flex items-center gap-1.5 text-xs text-olive-500">
              <CheckCircle size={11} className="text-olive-500 shrink-0" />{d}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Process */}
    <div className="mb-12">
      <h2 className="section-title mb-8">Как проходит оплата</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map(s => (
          <div key={s.n} className="bg-dark-card border border-dark-border rounded-xl p-5">
            <div className="text-3xl font-black text-olive-500/30 mb-3">{s.n}</div>
            <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
            <p className="text-xs text-olive-600 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>

    {/* FAQ */}
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-10">
      <h2 className="font-bold text-white mb-5">Частые вопросы об оплате</h2>
      <div className="space-y-4">
        {FAQ.map((item, i) => (
          <details key={i} className="group border-b border-dark-border last:border-0 pb-4 last:pb-0">
            <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-white list-none py-1">
              {item.q}
              <span className="text-olive-600 group-open:rotate-45 transition-transform shrink-0 ml-2 text-lg leading-none">+</span>
            </summary>
            <p className="mt-2 text-sm text-olive-500 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="always-dark relative bg-gradient-to-br from-[#0d2a1a] to-[#0f1509] border border-olive-500/30 rounded-2xl p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg,#47612e 0,#47612e 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <h2 className="font-black text-white text-xl mb-1">Готовы оформить заказ?</h2>
          <p className="text-sm text-olive-400">Свяжитесь с менеджером — ответим в течение 30 минут</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <a href="tel:+74951365777" className="btn-primary">
            <Phone size={14} />+7 (495) 136-5777
          </a>
          <a href="https://t.me/starmobile77" target="_blank" rel="noopener noreferrer" className="btn-outline">
            <Send size={14} />Telegram
          </a>
        </div>
      </div>
    </div>
  </div>
);
