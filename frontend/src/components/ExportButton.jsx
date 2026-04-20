import { useState, useRef, useEffect } from 'react';
import { FiDownload, FiFileText, FiCode, FiChevronDown } from 'react-icons/fi';
import { exportTasksCSV, exportTasksJSON } from '../api/tasks';
import toast from 'react-hot-toast';

export default function ExportButton({ projectId, projectTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      let url;
      if (format === 'csv') {
        url = await exportTasksCSV(projectId);
      } else {
        url = await exportTasksJSON(projectId);
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-${projectTitle?.replace(/[^a-z0-9]/gi, '_') || 'export'}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Tasks exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to export tasks');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        ) : (
          <FiDownload size={16} />
        )}
        <span className="text-sm font-medium">Export</span>
        <FiChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10 overflow-hidden">
          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
          >
            <FiFileText size={16} className="text-green-600" />
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-sm border-t"
          >
            <FiCode size={16} className="text-blue-600" />
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}