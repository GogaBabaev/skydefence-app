import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ label = 'Назад' }: { label?: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1.5 text-xs text-olive-500 hover:text-white transition-colors mb-4"
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
};
