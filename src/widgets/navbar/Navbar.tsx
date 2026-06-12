import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ShoppingCart, ChevronDown, Search, Sun, Moon, User } from 'lucide-react';
import { categories } from '../../entities/product/data/catalog.static';
import { useCart } from '../../features/cart/model/cart.store';
import { useTheme } from '../../app/App';

const navLinks = [
  { label: 'Акции',      path: '/aktsii' },
  { label: 'О компании', path: '/about'  },
  { label: 'Оплата',     path: '/oplata' },
  { label: 'Доставка',   path: '/dostavka' },
  { label: 'Контакты',   path: '/contacts' },
];

export const Navbar = () => {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { pathname } = useLocation();
  const { totalCount } = useCart();
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* ── Top info bar ── */}
      <div className="bg-olive-900 text-olive-200 text-[11px] hidden md:block">
        <div className="max-w-screen-xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:+74951365777" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={11} /> +7 (495) 136-5777
            </a>
            <span className="text-olive-600">|</span>
            <span>info@skydefence.ru</span>
            <span className="text-olive-600">|</span>
            <span>Пн–Сб 08:00 – 18:00</span>
          </div>
          <div className="flex items-center gap-3 text-olive-400">
            <span>Бесплатная доставка от 50 000 ₽</span>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="sticky top-0 z-50 bg-dark-card border-b border-dark-border">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="text-lg font-black tracking-widest text-white uppercase">
              Sky<span className="text-olive-500">Defence</span>
            </span>
            <span className="text-[8px] text-olive-500 tracking-[0.2em] uppercase font-semibold -mt-0.5">
              Военторг · Экспертное снаряжение
            </span>
          </Link>

          {/* Catalog button (desktop) */}
          <div className="hidden md:block relative ml-2">
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              onBlur={() => setTimeout(() => setCatalogOpen(false), 150)}
              className="flex items-center gap-1.5 px-4 py-2 bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Menu size={15} />
              Каталог
              <ChevronDown size={13} className={`transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {catalogOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-64 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/catalog?cat=${cat.slug}`}
                      onClick={() => setCatalogOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-olive-200 hover:bg-olive-500/10 hover:text-white transition-colors"
                    >
                      <span>{cat.label}</span>
                      <span className="text-xs text-olive-600">{cat.count}</span>
                    </Link>
                  ))}
                  <div className="border-t border-dark-border">
                    <Link
                      to="/catalog"
                      onClick={() => setCatalogOpen(false)}
                      className="block px-4 py-2.5 text-sm text-olive-400 hover:text-white transition-colors font-medium"
                    >
                      Весь каталог →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search bar */}
          <div className="flex-1 hidden md:block max-w-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="w-full bg-dark border border-dark-border rounded-lg pl-9 pr-3 py-2 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-600" />
            </div>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-4 ml-auto text-sm">
            {navLinks.slice(0, 3).map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`transition-colors ${pathname === l.path ? 'text-olive-400' : 'text-olive-300 hover:text-white'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Theme toggle */}
          <button onClick={toggle} className="ml-2 hidden md:flex w-9 h-9 items-center justify-center rounded-lg border border-dark-border hover:border-olive-500/50 transition-colors text-olive-400" title="Сменить тему">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Account */}
          <Link to="/account" className="ml-2 hidden md:flex w-9 h-9 items-center justify-center rounded-lg border border-dark-border hover:border-olive-500/50 transition-colors text-olive-300" title="Личный кабинет">
            <User size={16} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative ml-2 hidden md:flex w-9 h-9 items-center justify-center rounded-lg border border-dark-border hover:border-olive-500/50 transition-colors text-olive-300">
            <ShoppingCart size={16} />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-olive-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </Link>

          {/* Mobile: cart + burger */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            <button onClick={toggle} className="w-9 h-9 flex items-center justify-center rounded-lg border border-dark-border text-olive-400">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-dark-border text-olive-300">
              <ShoppingCart size={16} />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-olive-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {totalCount > 9 ? '9+' : totalCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-dark-border text-olive-300"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[56px] left-0 right-0 z-40 bg-dark-card border-b border-dark-border overflow-hidden"
          >
            <div className="px-4 py-3">
              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  className="w-full bg-dark border border-dark-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none"
                />
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-olive-600" />
              </div>

              {/* Categories */}
              <div className="mb-3">
                <div className="text-[10px] text-olive-600 uppercase tracking-wider mb-2 px-1">Каталог</div>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/catalog?cat=${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-olive-200 hover:bg-olive-500/10 transition-colors"
                  >
                    {cat.label}
                    <span className="text-xs text-olive-600">{cat.count}</span>
                  </Link>
                ))}
              </div>

              {/* Links */}
              <div className="border-t border-dark-border pt-3 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-olive-300 hover:bg-olive-500/10 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-olive-300 hover:bg-olive-500/10 hover:text-white transition-colors"
                >
                  <User size={13} /> Личный кабинет
                </Link>
              </div>

              <a
                href="tel:+74951365777"
                className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-olive-500/10 text-olive-400 text-sm font-medium"
              >
                <Phone size={14} /> +7 (495) 136-5777
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
