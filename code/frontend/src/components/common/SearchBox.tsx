import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
}

export function SearchBox({ placeholder = 'Tìm kiếm...', value, onChange }: SearchBoxProps) {
  return (
    <div className="relative flex w-full max-w-sm items-center">
      <Search className="absolute left-3 text-slate-400" size={18} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
