import { useEffect } from 'react';

interface MainButtonOptions {
  text: string;
  visible: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Binds the Telegram MainButton to an action while the component
 * is mounted; hides and unbinds on unmount.
 */
export function useMainButton({
  text,
  visible,
  disabled,
  onClick,
}: MainButtonOptions) {
  useEffect(() => {
    const mb = window.Telegram?.WebApp?.MainButton;
    if (!mb) return;

    mb.setText(text);
    if (visible) mb.show();
    else mb.hide();
    if (disabled) mb.disable();
    else mb.enable();
    mb.onClick(onClick);

    return () => {
      mb.offClick(onClick);
      mb.hide();
    };
  }, [text, visible, disabled, onClick]);
}
