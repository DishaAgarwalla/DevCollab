import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

export default function SearchBar({ value, onChange, onFilterClick, placeholder }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <div className={`flex items-center transition-all duration-200 ${isExpanded ? 'w-64' : 'w-40'}`}>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !value && setIsExpanded(false)}
            placeholder={placeholder || "Search tasks..."}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        <button
          onClick={onFilterClick}
          className="ml-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-gray-600"
          title="Advanced Filters"
        >
          <FiFilter size={18} />
        </button>
      </div>
    </div>
  );
}