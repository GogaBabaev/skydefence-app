import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, ExternalLink, Bell, Radio, Zap } from 'lucide-react';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08 },
});

const highlights = [
  { icon: Zap,   text: 'Новинки оборудования и детекторов БПЛА' },
  { icon: Radio, text: 'Обзоры подавителей и комплексов РЭБ' },
  { icon: Bell,  text: 'Акции, спецпредложения и закрытые цены' },
  { icon: Send,  text: 'Экспертные материалы о применении дронов' },
];

export const Blog = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
      {' '}/{' '}
      <span className="text-olive-400">Блог</span>
    </div>

    <h1 className="text-2xl font-black text-white mb-1">Блог SkyDefence</h1>
    <p className="text-sm text-olive-500 mb-10">Новости, обзоры и полезные материалы</p>

    {/* Main CTA card */}
    <motion.div {...fade(0)}
      className="always-dark relative bg-gradient-to-br from-[#0d2a1a] to-[#0f1509] border border-olive-500/30 rounded-2xl p-8 mb-8 overflow-hidden text-center"
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #47612e 0, #47612e 1px, transparent 0, transparent 50%)', backgroundSize: '14px 14px' }}
      />
      <div className="relative">
        {/* Telegram icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#229ED9]/20 border border-[#229ED9]/30 flex items-center justify-center mx-auto mb-4">
          <Send size={28} className="text-[#229ED9]" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Наш Telegram-канал</h2>
        <p className="text-sm text-olive-400 mb-6 max-w-sm mx-auto leading-relaxed">
          Подпишитесь на канал SkyDefence — актуальные новости рынка БПЛА, обзоры оборудования и эксклюзивные предложения для подписчиков.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://t.me/starmobile77"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <Send size={14} /> Открыть канал @starmobile77
          </a>
          <a
            href="https://t.me/c/3420984865/342"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm"
          >
            <ExternalLink size={14} /> Последняя публикация
          </a>
        </div>
      </div>
    </motion.div>

    {/* What's in the channel */}
    <h2 className="section-title mb-4">Что публикуем</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {highlights.map((h, i) => (
        <motion.div key={i} {...fade(i)}
          className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0">
            <h.icon size={16} className="text-olive-500" />
          </div>
          <span className="text-sm text-olive-300">{h.text}</span>
        </motion.div>
      ))}
    </div>

    <motion.div {...fade(0)} className="text-center">
      <a
        href="https://t.me/starmobile77"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
      >
        <Send size={15} /> Подписаться на канал
      </a>
    </motion.div>
  </div>
);
