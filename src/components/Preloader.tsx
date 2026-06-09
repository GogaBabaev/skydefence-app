import { motion, AnimatePresence } from 'framer-motion';

export const Preloader = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark"
      >
        {/* Crosshair animation */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-16 h-16 mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-olive-500/30 border-t-olive-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-olive-500 rounded-full" />
          </div>
          {/* Cross lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-olive-500/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-olive-500/30" />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="text-2xl font-black tracking-widest text-white uppercase">
            Sky<span className="text-olive-500">Defence</span>
          </div>
          <div className="text-[9px] text-olive-600 tracking-[0.35em] uppercase mt-1">
            Военторг · Экспертное снаряжение
          </div>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 w-40 h-0.5 bg-olive-900 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeInOut' }}
            className="h-full w-full bg-gradient-to-r from-transparent via-olive-500 to-transparent"
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
