import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, Package, Handshake, Send, Phone, CheckCircle } from 'lucide-react';
import { useTelegram } from '../shared/lib/useTelegram';
import { api } from '../shared/api/http';

const B2B_FEATURES = [
  { icon: Handshake, title: 'Договор поставки',      text: 'Работаем по договору с ООО, ИП, государственными структурами и воинскими частями.' },
  { icon: FileText,  title: 'Закрывающие документы', text: 'УПД, счёт-фактура, акт приёмки — всё для бухгалтерии и отчётности.' },
  { icon: Package,   title: 'Индивидуальные цены',   text: 'Оптовые скидки от 5 единиц. Цена зависит от объёма и категории товара.' },
  { icon: Building2, title: 'Тендеры и госзакупки',  text: 'Участвуем в тендерных процедурах. Есть опыт поставок по 44-ФЗ и 223-ФЗ.' },
];

export const B2B = () => {
  const { hapticNotification } = useTelegram();
  const [form, setForm] = useState({ company: '', contact: '', phone: '', email: '', quantity: '', comment: '' });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setState('loading');
    const message =
      [form.quantity && `Объём: ${form.quantity}`, form.comment && `Интересует: ${form.comment}`]
        .filter(Boolean)
        .join('. ') || 'B2B-заявка (мини-апп)';
    try {
      await api('/b2b-requests', {
        method: 'POST',
        body: {
          company: form.company,
          contactName: form.contact,
          phone: form.phone,
          ...(form.email ? { email: form.email } : {}),
          message,
          consent: true,
        },
      });
      hapticNotification('success');
      setState('done');
    } catch {
      hapticNotification('error');
      setState('error');
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="text-xs text-olive-600 mb-6">
        <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link> / <span className="text-olive-400">B2B</span>
      </div>

      <div className="max-w-4xl">
        <div className="inline-block text-[10px] uppercase tracking-wider font-bold text-olive-400 bg-olive-500/10 border border-olive-500/20 rounded-full px-3 py-1 mb-4">
          Для бизнеса
        </div>
        <h1 className="text-3xl font-black text-white mb-4">B2B и оптовые поставки</h1>
        <p className="text-base text-olive-500 mb-10 leading-relaxed max-w-2xl">
          Работаем с организациями всех форм собственности. Гибкие условия, договор поставки,
          официальные документы и конкурентные оптовые цены.
        </p>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {B2B_FEATURES.map(f => (
            <div key={f.title} className="bg-dark-card border border-dark-border rounded-xl p-5 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-olive-500/10 flex items-center justify-center shrink-0">
                <f.icon size={20} className="text-olive-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-olive-600 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact options */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-8 flex flex-wrap gap-4 items-center">
          <p className="text-sm text-olive-500 flex-1">
            Для быстрого ответа свяжитесь с менеджером напрямую:
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+74951365777" className="btn-outline text-sm">
              <Phone size={14} />+7 (495) 136-5777
            </a>
            <a href="https://t.me/starmobile77" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              <Send size={14} />Telegram-менеджер
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Отправить B2B-заявку</h2>
          <p className="text-sm text-olive-600 mb-6">Менеджер ответит в течение 30 минут в рабочее время.</p>

          {state === 'done' ? (
            <div className="text-center py-10">
              <CheckCircle size={48} className="text-olive-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Заявка отправлена!</h3>
              <p className="text-olive-500 text-sm">Менеджер свяжется с вами в течение 30 минут.</p>
              <button onClick={() => setState('idle')} className="mt-4 text-xs text-olive-600 hover:text-olive-400">
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              {([
                ['company', 'Название организации *', 'ООО «Компания»', true, 'text'],
                ['contact', 'Контактное лицо *', 'Иван Иванов', true, 'text'],
                ['phone', 'Телефон *', '+7 (999) 000-00-00', true, 'tel'],
                ['email', 'E-mail', 'company@example.com', false, 'email'],
                ['quantity', 'Примерный объём заказа', '10 шт., 1 млн руб. и т.д.', false, 'text'],
                ['comment', 'Что интересует', 'Детекторы БПЛА, квадрокоптеры...', false, 'text'],
              ] as const).map(([key, label, placeholder, required, type]) => (
                <div key={key}>
                  <label className="block text-xs text-olive-600 mb-1.5">{label}</label>
                  <input
                    type={type} required={required} placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                {state === 'error' && (
                  <p className="text-xs text-red-400 mb-2">Ошибка. Позвоните: +7 (495) 136-5777</p>
                )}
                <label className="flex items-start gap-2 cursor-pointer select-none mb-3">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-olive-500" />
                  <span className="text-[10px] text-olive-600 leading-snug">
                    Я согласен(на) на обработку персональных данных в соответствии с{' '}
                    <Link to="/politika" className="underline hover:text-olive-400">политикой конфиденциальности</Link>
                  </span>
                </label>
                <button type="submit" disabled={state === 'loading' || !consent}
                  className="btn-primary py-3 px-8 disabled:opacity-60">
                  {state === 'loading' ? 'Отправляем...' : 'Отправить заявку'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
