import { useEffect, useCallback } from 'react';
import type { TelegramWebApp } from '../types/telegram';

const tg: TelegramWebApp | null = window.Telegram?.WebApp ?? null;

export const useTelegram = () => {
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const showBackButton = useCallback((callback: () => void) => {
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(callback);
    }
  }, []);

  const hideBackButton = useCallback((callback?: () => void) => {
    if (tg?.BackButton) {
      if (callback) tg.BackButton.offClick(callback);
      tg.BackButton.hide();
    }
  }, []);

  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    tg?.HapticFeedback?.impactOccurred(type);
  }, []);

  const hapticNotification = useCallback((type: 'success' | 'error' | 'warning' = 'success') => {
    tg?.HapticFeedback?.notificationOccurred(type);
  }, []);

  const isDark = tg?.colorScheme === 'dark';
  const user = tg?.initDataUnsafe?.user;
  const isInTelegram = !!tg;

  return {
    tg,
    user,
    isDark,
    isInTelegram,
    showBackButton,
    hideBackButton,
    haptic,
    hapticNotification,
  };
};
