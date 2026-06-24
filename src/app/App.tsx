import { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Preloader } from '../widgets/preloader/Preloader';
import { Navbar } from '../widgets/navbar/Navbar';
import { Footer } from '../widgets/footer/Footer';
import { Home } from '../pages/Home';
import { Catalog } from '../pages/Catalog';
import { ProductPage } from '../pages/ProductPage';
import { About } from '../pages/About';
import { Contacts } from '../pages/Contacts';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/checkout/Checkout';
import { OrderStatus } from '../pages/order/OrderStatus';
import { Dostavka } from '../pages/Dostavka';
import { Aktsii } from '../pages/Aktsii';
import { Garantiya } from '../pages/Garantiya';
import { Rekvizity } from '../pages/Rekvizity';
import { Blog } from '../pages/Blog';
import { Account } from '../pages/Account';
import { Politika } from '../pages/Politika';
import { Oferta } from '../pages/Oferta';
import { Oplata } from '../pages/Oplata';
import { B2B } from '../pages/B2B';
import '../index.css';

/* ─── Theme context ────────────────────────────────────────────── */
type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggle: () => void; }
export const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

/* ─── Stub page ────────────────────────────────────────────────── */
const StubPage = ({ title }: { title: string }) => (
  <div className="max-w-screen-xl mx-auto px-4 py-12 text-olive-500 text-center">
    <div className="text-xs text-olive-700 mb-4">Главная / {title}</div>
    <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
    <p className="text-sm mb-5">Страница находится в разработке</p>
    <a href="#/" className="btn-primary inline-flex">На главную</a>
  </div>
);

const Fade = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"            element={<Fade><Home /></Fade>} />
        <Route path="/catalog"     element={<Fade><Catalog /></Fade>} />
        <Route path="/product/:slug" element={<Fade><ProductPage /></Fade>} />
        <Route path="/about"       element={<Fade><About /></Fade>} />
        <Route path="/contacts"    element={<Fade><Contacts /></Fade>} />
        <Route path="/cart"        element={<Fade><Cart /></Fade>} />
        <Route path="/checkout"    element={<Fade><Checkout /></Fade>} />
        <Route path="/order/:id"   element={<Fade><OrderStatus /></Fade>} />
        <Route path="/dostavka"    element={<Fade><Dostavka /></Fade>} />
        <Route path="/aktsii"      element={<Fade><Aktsii /></Fade>} />
        <Route path="/garantiya"   element={<Fade><Garantiya /></Fade>} />
        <Route path="/rekvizity"   element={<Fade><Rekvizity /></Fade>} />
        <Route path="/blog"        element={<Fade><Blog /></Fade>} />
        <Route path="/account"     element={<Fade><Account /></Fade>} />
        <Route path="/oplata"      element={<Fade><Oplata /></Fade>} />
        <Route path="/b2b"         element={<Fade><B2B /></Fade>} />
        <Route path="/politika"    element={<Fade><Politika /></Fade>} />
        <Route path="/oferta"      element={<Fade><Oferta /></Fade>} />
        <Route path="*"            element={<Fade><StubPage title="Страница не найдена" /></Fade>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <HashRouter>
      <ThemeProvider>
        <Preloader visible={loading} />
        <div className="min-h-screen bg-dark text-e8ead4">
          <ScrollToTop />
          <Navbar />
          <main><AnimatedRoutes /></main>
          <Footer />
        </div>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
