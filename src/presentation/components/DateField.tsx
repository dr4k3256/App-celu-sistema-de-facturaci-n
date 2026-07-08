import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  type?: 'date' | 'month';
  className?: string;
};

const DateField: React.FC<Props> = ({ value, onChange, type = 'date', className = '' }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const el = inputRef.current as any;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try { el.showPicker(); return; } catch (e) { /* ignore */ }
    }
    try { el.click(); } catch (e) { el.focus(); }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-accent/30 border border-border rounded px-2 py-1 text-sm outline-none flex-1 no-native"
      />
      <button type="button" onClick={openPicker} className="p-2 ml-2 rounded hover:bg-accent/10 text-foreground">
        <Calendar size={16} />
      </button>
    </div>
  );
};

export default DateField;
