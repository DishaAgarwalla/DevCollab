import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTag, FiCopy } from 'react-icons/fi';
import { getTemplates, createTaskFromTemplate } from '../api/templates';
import toast from 'react-hot-toast';

const labelConfig = {
  bug: { name: 'Bug', color: 'bg-red-100 text-red-800' },
  feature: { name: 'Feature', color: 'bg-green-100 text-green-800' },
  enhancement: { name: 'Enhancement', color: 'bg-blue-100 text-blue-800' },
  documentation: { name: 'Documentation', color: 'bg-purple-100 text-purple-800' },
  question: { name: 'Question', color: 'bg-yellow-100 text-yellow-800' },
  'good-first-issue': { name: 'Good First Issue', color: 'bg-emerald-100 text-emerald-800' },
  'help-wanted': { name: 'Help Wanted', color: 'bg-pink-100 text-pink-800' }
};

export default function TaskForm({ projectId, projectMembers, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    projectId,
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    labels: []
  });
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [projectId]);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates(projectId);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleLabelToggle = (labelValue) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelValue)
        ? prev.labels.filter(l => l !== labelValue)
        : [...prev.labels, labelValue]
    }));
  };

  const handleUseTemplate = async (template) => {
    try {
      const task = await createTaskFromTemplate(template._id, projectId);
      setFormData({
        projectId,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        labels: task.labels || []
      });
      setShowTemplates(false);
      toast.success('Template applied!');
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null
      };
      await onSubmit(submitData);
      setFormData({
        projectId,
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        labels: []
      });
    } finally {
      setLoading(false);
    }
  };

  const allLabels = Object.keys(labelConfig);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Template Button */}
        {templates.length > 0 && (
          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <FiCopy size={14} />
              Use a template
            </button>
            
            {showTemplates && (
              <div className="mt-2 border rounded-lg p-2 max-h-48 overflow-y-auto">
                {templates.map(template => (
                  <button
                    key={template._id}
                    onClick={() => handleUseTemplate(template)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="font-medium">{template.name}</span>
                    <span className="text-gray-500 text-xs ml-2">({template.title})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Design the login page"
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              placeholder="Add details about this task..."
            />
          </div>
          
          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <FiTag size={14} />
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {allLabels.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleLabelToggle(label)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                    formData.labels.includes(label)
                      ? labelConfig[label]?.color
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {labelConfig[label]?.name || label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low - Can wait</option>
              <option value="medium">Medium - Normal priority</option>
              <option value="high">High - Important</option>
              <option value="critical">Critical - Urgent</option>
            </select>
          </div>
          
          {/* Assign to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To (Optional)
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Unassigned</option>
              {projectMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiPlus size={16} />
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}