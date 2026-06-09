import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

export const Contacts = () => {
  const { hapticNotification } = useTelegram();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    hapticNotification('success');
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="text-xs text-olive-700 mb-5">Главная / Контакты</div>
      <h1 className="section-title mb-6">Контакты</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info */}
        <div className="space-y-3">
          {[
            { icon: Phone,   label: 'Телефон',       val: '+7 (495) 136-5777',   href: 'tel:+74951365777' },
            { icon: Mail,    label: 'E-mail',         val: 'info@skydefence.ru',  href: 'mailto:info@skydefence.ru' },
            { icon: Clock,   label: 'Режим работы',  val: 'Пн–Сб 08:00–18:00',  href: undefined },
            { icon: MapPin,  label: 'Адрес',          val: 'г. Москва',           href: undefined },
          ].map(item => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
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

          {/* Map placeholder */}
          <div className="bg-dark-card border border-dark-border rounded-xl h-36 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-military-pattern opacity-30" />
            <div className="relative text-center">
              <MapPin size={20} className="text-olive-500 mx-auto mb-1" />
              <p className="text-xs text-olive-600">г. Москва</p>
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
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 justify-center disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full block" />
                    Отправляем...
                  </span>
                ) : 'Оставить заявку'}
              </button>
              <p className="text-[10px] text-olive-700 text-center">Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных</p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
