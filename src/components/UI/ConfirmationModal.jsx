import React from 'react';
import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // 'confirm', 'danger', 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const icons = {
    confirm: <HelpCircle className="w-12 h-12 text-[#3f7abe]" />,
    danger: <AlertCircle className="w-12 h-12 text-red-500" />,
    success: <CheckCircle2 className="w-12 h-12 text-emerald-500" />
  };

  const buttonColors = {
    confirm: 'bg-[#3f7abe] hover:bg-[#33629c] shadow-[#3f7abe]/20',
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    success: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            {icons[type]}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            {title}
          </h3>
          
          <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10 px-4">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 rounded-2xl bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 border border-slate-100"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-4 px-6 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${buttonColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
