import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCopy, FiX } from 'react-icons/fi';
import { getTemplates, deleteTemplate, createTaskFromTemplate } from '../api/templates';
import toast from 'react-hot-toast';

export default function TemplateList({ projectId, onUseTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [projectId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates(projectId);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await deleteTemplate(templateId);
      setTemplates(templates.filter(t => t._id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const task = await createTaskFromTemplate(template._id, projectId);
      toast.success('Task created from template!');
      if (onUseTemplate) onUseTemplate(task);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to create task from template');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Templates</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <FiPlus size={12} />
          Save Current as Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm border rounded-lg bg-gray-50">
          No templates yet. Save a task as a template to reuse it later.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template._id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800">{template.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {template.title}
                  </p>
                  {template.labels && template.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.labels.slice(0, 2).map(label => (
                        <span key={label} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {label}
                        </span>
                      ))}
                      {template.labels.length > 2 && (
                        <span className="text-xs text-gray-400">+{template.labels.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Use template"
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(template._id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Delete template"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Used {template.usageCount || 0} times
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Save as Template</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Save the current task as a template for future use.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  // This will trigger the parent to open save template modal
                  if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('openSaveTemplate'));
                  }
                }}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Continue
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}