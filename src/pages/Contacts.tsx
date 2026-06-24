import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, CheckCircle, Send, ExternalLink } from 'lucide-react';
import { useTelegram } from '../shared/lib/useTelegram';
import { api } from '../shared/api/http';

export const Contacts = () => {
  const { hapticNotification } = useTelegram();
  const [form, setForm]     = useState({ name: '', phone: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setLoading(true);
    setError(null);
    try {
      await api('/b2b-requests', {
        method: 'POST',
        body: {
          company: 'Физическое лицо',
          contactName: form.name,
          phone: form.phone,
          message: form.message || 'Запрос из формы контактов',
        },
      });
      hapticNotification('success');
      setSent(true);
    } catch {
      hapticNotification('error');
      setError('Не удалось отправить. Позвоните нам: +7 (495) 136-5777');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="text-xs text-olive-600 mb-6">
        <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
        {' '}/{' '}
        <span className="text-olive-400">Контакты</span>
      </div>
      <h1 className="section-title mb-6">Контакты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info column */}
        <div className="space-y-3">
          {/* Contact cards */}
          {[
            { icon: Phone,  label: 'Телефон',      val: '+7 (495) 136-5777',  href: 'tel:+74951365777' },
            { icon: Mail,   label: 'E-mail',        val: 'info@skydefence.ru', href: 'mailto:info@skydefence.ru' },
            { icon: Clock,  label: 'Режим работы',  val: 'Пн–Сб 08:00–18:00', href: undefined },
            { icon: MapPin, label: 'Адрес',         val: 'г. Москва (склад — адрес при оформлении заказа)', href: undefined },
          ].map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-olive-500" />
              </div>
              <div>
                <div className="text-[10px] text-olive-700 mb-0.5">{item.label}</div>
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium text-white hover:text-olive-300 transition-colors">{item.val}</a>
                ) : (
                  <div className="text-sm font-medium text-white">{item.val}</div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Telegram channels */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-dark-card border border-dark-border rounded-xl p-4"
          >
            <div className="text-[10px] text-olive-700 uppercase tracking-wider mb-3">Мы в Telegram</div>
            <div className="space-y-2">
              <a
                href="https://t.me/starmobile77"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-olive-500/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#229ED9]/20 flex items-center justify-center shrink-0">
                  <Send size={14} className="text-[#229ED9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-olive-300 transition-colors">@starmobile77</div>
                  <div className="text-[10px] text-olive-600">Менеджер в Телеграм</div>
                </div>
                <ExternalLink size={12} className="text-olive-700 group-hover:text-olive-400 transition-colors shrink-0" />
              </a>

              <a
                href="https://t.me/c/3420984865/342"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-olive-500/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#229ED9]/20 flex items-center justify-center shrink-0">
                  <Send size={14} className="text-[#229ED9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-olive-300 transition-colors">Канал SkyDefence</div>
                  <div className="text-[10px] text-olive-600">Новости, обзоры, акции</div>
                </div>
                <ExternalLink size={12} className="text-olive-700 group-hover:text-olive-400 transition-colors shrink-0" />
              </a>
            </div>
          </motion.div>

          {/* Map placeholder */}
          <div className="bg-dark-card border border-dark-border rounded-xl h-32 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-military-pattern opacity-30" />
            <div className="relative text-center">
              <MapPin size={20} className="text-olive-500 mx-auto mb-1" />
              <p className="text-xs text-olive-600">Москва · Склад</p>
              <p className="text-[10px] text-olive-700 mt-0.5">Адрес сообщается при оформлении заказа</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border rounded-xl p-5"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-5">Заказать звонок</h2>

          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle size={40} className="text-olive-500 mb-3" />
              <h3 className="font-bold text-white mb-1">Спасибо!</h3>
              <p className="text-sm text-olive-500">Мы свяжемся с вами в ближайшее время!</p>
              <button onClick={() => setSent(false)} className="mt-4 text-xs text-olive-600 hover:text-olive-400">
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-olive-600 mb-1.5">Ваше имя *</label>
                <input type="text" required placeholder="Иван Иванов" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-olive-600 mb-1.5">Номер телефона *</label>
                <input type="tel" required placeholder="+7 (999) 000-00-00" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-olive-600 mb-1.5">Сообщение</label>
                <textarea placeholder="Опишите ваш запрос..." value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  rows={3}
                  className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors resize-none" />
              </div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-olive-500" />
                <span className="text-[10px] text-olive-600 leading-snug">
                  Я согласен(на) на обработку персональных данных в соответствии с{' '}
                  <Link to="/politika" className="hover:text-olive-400 underline">политикой конфиденциальности</Link>
                </span>
              </label>
              <button type="submit" disabled={loading || !consent} className="w-full btn-primary py-3 justify-center disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" />
                    Отправляем...
                  </span>
                ) : 'Оставить заявку'}
              </button>
              {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
