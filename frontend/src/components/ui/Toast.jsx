import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const toastStyles = {
  success: {
    icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800'
  },
  error: {
    icon: <FiXCircle className="w-5 h-5 text-red-500" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800'
  },
  warning: {
    icon: <FiAlertCircle className="w-5 h-5 text-yellow-500" />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800'
  },
  info: {
    icon: <FiInfo className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800'
  }
};

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = toastStyles[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 animate-slideInRight`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${style.bg} ${style.border} min-w-[300px] max-w-md`}>
        {style.icon}
        <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
        <button onClick={onClose} className={`p-1 rounded-lg hover:bg-white/50 transition ${style.text}`}>
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}