import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get currently selected option's label
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4.5 bg-slate-50 border-2 ${
          isOpen ? 'border-[#3f7abe] bg-white' : 'border-transparent'
        } rounded-[1.5rem] outline-none font-bold text-slate-900 transition-all flex items-center justify-between cursor-pointer`}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400 font-bold'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#3f7abe]' : ''}`} />
      </div>

      {/* Hidden input to support native form validation (required) */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        className="absolute bottom-0 left-1/2 w-0 h-0 opacity-0 pointer-events-none"
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-50 relative flex items-center">
            <Search className="absolute left-6 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3f7abe] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-6 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-6 py-3.5 text-sm font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#3f7abe]/10 text-[#3f7abe]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#3f7abe]'
                    }`}
                  >
                    {opt.label}
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-4 text-xs font-bold text-slate-400 text-center uppercase tracking-widest">
                No matching results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
