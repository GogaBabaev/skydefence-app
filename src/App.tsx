import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductPage } from './pages/ProductPage';
import { About } from './pages/About';
import { Contacts } from './pages/Contacts';
import './index.css';

// Generic stub page for routes we haven't built yet
const StubPage = ({ title }: { title: string }) => (
  <div className="max-w-screen-xl mx-auto px-4 py-12 text-olive-500 text-center">
    <div className="text-xs text-olive-700 mb-4">Главная / {title}</div>
    <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
    <p className="text-sm">Страница находится в разработке</p>
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

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<Fade><Home /></Fade>} />
        <Route path="/catalog"   element={<Fade><Catalog /></Fade>} />
        <Route path="/product/:slug" element={<Fade><ProductPage /></Fade>} />
        <Route path="/about"     element={<Fade><About /></Fade>} />
        <Route path="/contacts"  element={<Fade><Contacts /></Fade>} />
        {/* Stubs */}
        <Route path="/aktsii"    element={<Fade><StubPage title="Акции" /></Fade>} />
        <Route path="/oplata"    element={<Fade><StubPage title="Оплата" /></Fade>} />
        <Route path="/dostavka"  element={<Fade><StubPage title="Доставка" /></Fade>} />
        <Route path="/garantiya" element={<Fade><StubPage title="Гарантия и возврат" /></Fade>} />
        <Route path="/blog"      element={<Fade><StubPage title="Блог" /></Fade>} />
        <Route path="/otzyvy"    element={<Fade><StubPage title="Отзывы" /></Fade>} />
        <Route path="/sertifikaty" element={<Fade><StubPage title="Сертификаты" /></Fade>} />
        <Route path="/rekvizity" element={<Fade><StubPage title="Реквизиты" /></Fade>} />
        <Route path="/politika"  element={<Fade><StubPage title="Политика конфиденциальности" /></Fade>} />
        <Route path="/oferta"    element={<Fade><StubPage title="Публичная оферта" /></Fade>} />
        <Route path="*"          element={<Fade><StubPage title="Страница не найдена" /></Fade>} />
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
      <Preloader visible={loading} />
      <div className="min-h-screen bg-dark text-e8ead4">
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
