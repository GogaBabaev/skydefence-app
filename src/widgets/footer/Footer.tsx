import { Link } from 'react-router-dom';
import { Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-dark-card border-t border-dark-border mt-12">
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3">
            <div className="text-lg font-black tracking-widest text-white">
              Sky<span className="text-olive-500">Defence</span>
            </div>
            <div className="text-[9px] text-olive-600 tracking-[0.2em] uppercase">Военторг · Экспертное снаряжение</div>
          </div>
          <p className="text-xs text-olive-600 leading-relaxed">
            Специализированный поставщик профессионального оборудования и технических средств специального назначения.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-3">Магазин</h4>
          <ul className="space-y-2">
            {[['Каталог','/catalog'],['Акции','/aktsii'],['Оплата','/oplata'],['Доставка','/dostavka'],['Гарантия','/garantiya']].map(([l,p])=>(
              <li key={p}><Link to={p} className="text-xs text-olive-600 hover:text-olive-300 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-3">Компания</h4>
          <ul className="space-y-2">
            {[['О компании','/about'],['B2B / Опт','/b2b'],['Блог','/blog'],['Реквизиты','/rekvizity'],['Контакты','/contacts']].map(([l,p])=>(
              <li key={p}><Link to={p} className="text-xs text-olive-600 hover:text-olive-300 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-3">Контакты</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-xs text-olive-500">
              <Phone size={12} className="text-olive-500 shrink-0" />
              <a href="tel:+74951365777" className="hover:text-olive-300 transition-colors">+7 (495) 136-5777</a>
            </li>
            <li className="flex items-center gap-2 text-xs text-olive-500">
              <Mail size={12} className="text-olive-500 shrink-0" />
              <a href="mailto:info@skydefence.ru" className="hover:text-olive-300 transition-colors">info@skydefence.ru</a>
            </li>
            <li className="flex items-center gap-2 text-xs text-olive-500">
              <Clock size={12} className="text-olive-500 shrink-0" />
              <span>Пн–Сб 08:00–18:00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dark-border pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-[11px] text-olive-700">© 2026 SkyDefence — Экспертное снаряжение</p>
        <div className="flex gap-4 text-[11px] text-olive-700">
          <Link to="/politika" className="hover:text-olive-400 transition-colors">Политика конфиденциальности</Link>
          <Link to="/oferta"   className="hover:text-olive-400 transition-colors">Публичная оферта</Link>
        </div>
      </div>
    </div>
  </footer>
);
