import { useEffect } from 'react';

interface MainButtonOptions {
  text: string;
  visible: boolean;
  disabled?: boolean;
  loading?: boolean;
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
  loading,
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
    if (loading) mb.showProgress(false);
    else mb.hideProgress();
    mb.onClick(onClick);

    return () => {
      mb.offClick(onClick);
      mb.hideProgress();
      mb.hide();
    };
  }, [text, visible, disabled, loading, onClick]);
}
