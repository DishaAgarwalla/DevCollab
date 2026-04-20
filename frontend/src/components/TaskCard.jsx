import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertCircle, FiUser, FiCalendar, FiFlag, FiTag, FiMessageSquare, FiPaperclip, FiCopy } from 'react-icons/fi';
import CommentSection from './CommentSection';
import AttachmentList from './AttachmentList';
import FileUploader from './FileUploader';

// Label configurations
const labelConfig = {
  bug: { name: 'Bug', color: 'bg-red-100 text-red-800' },
  feature: { name: 'Feature', color: 'bg-green-100 text-green-800' },
  enhancement: { name: 'Enhancement', color: 'bg-blue-100 text-blue-800' },
  documentation: { name: 'Documentation', color: 'bg-purple-100 text-purple-800' },
  question: { name: 'Question', color: 'bg-yellow-100 text-yellow-800' },
  'good-first-issue': { name: 'Good First Issue', color: 'bg-emerald-100 text-emerald-800' },
  'help-wanted': { name: 'Help Wanted', color: 'bg-pink-100 text-pink-800' },
  duplicate: { name: 'Duplicate', color: 'bg-gray-100 text-gray-800' },
  invalid: { name: 'Invalid', color: 'bg-gray-100 text-gray-800' },
  wontfix: { name: "Won't Fix", color: 'bg-gray-200 text-gray-800' }
};

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', nextStatus: 'in_progress', nextLabel: 'Start' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', nextStatus: 'completed', nextLabel: 'Complete' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', nextStatus: null, nextLabel: null },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800', nextStatus: 'in_progress', nextLabel: 'Unblock' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: <FiFlag className="text-gray-500" size={14} /> },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: <FiFlag className="text-blue-500" size={14} /> },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: <FiFlag className="text-orange-500" size={14} /> },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800', icon: <FiFlag className="text-red-500" size={14} /> }
};

export default function TaskCard({ task, onUpdate, onDelete, canEdit, projectMembers = [], currentUser, onSaveAsTemplate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    assignedTo: task.assignedTo?._id || task.assignedTo || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    labels: task.labels || []
  });

  const handleStatusChange = async () => {
    const config = statusConfig[task.status];
    if (config.nextStatus) {
      await onUpdate(task._id, { ...task, status: config.nextStatus });
    }
  };

  const handleSave = async () => {
    await onUpdate(task._id, editedTask);
    setIsEditing(false);
  };

  const handleLabelToggle = (labelValue) => {
    setEditedTask(prev => ({
      ...prev,
      labels: prev.labels.includes(labelValue)
        ? prev.labels.filter(l => l !== labelValue)
        : [...prev.labels, labelValue]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const allLabels = Object.keys(labelConfig);

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows="2"
          placeholder="Description (optional)"
        />
        
        {/* Label Selector */}
        <div className="mb-3">
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
                  editedTask.labels.includes(label)
                    ? labelConfig[label]?.color
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {labelConfig[label]?.name || label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <select
            value={editedTask.priority}
            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            value={editedTask.assignedTo}
            onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="">Unassigned</option>
            {projectMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={editedTask.dueDate}
            onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
            className="px-3 py-1 border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{task.title}</h4>
          {task.description && (
            <p className="text-gray-500 text-sm mt-1">{task.description}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-1 ml-2">
            <button 
              onClick={() => onSaveAsTemplate && onSaveAsTemplate()} 
              className="p-1 text-gray-400 hover:text-purple-500 transition"
              title="Save as template"
            >
              <FiCopy size={16} />
            </button>
            <button 
              onClick={() => setIsEditing(true)} 
              className="p-1 text-gray-400 hover:text-blue-500 transition"
              title="Edit task"
            >
              <FiEdit2 size={16} />
            </button>
            <button 
              onClick={() => onDelete(task._id)} 
              className="p-1 text-gray-400 hover:text-red-500 transition"
              title="Delete task"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Labels Display */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map(label => (
            <span
              key={label}
              className={`text-xs px-2 py-0.5 rounded-full ${labelConfig[label]?.color || 'bg-gray-100 text-gray-700'}`}
            >
              {labelConfig[label]?.name || label}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[task.status]?.color || 'bg-gray-100'}`}>
          {statusConfig[task.status]?.label || task.status}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${priorityConfig[task.priority]?.color || 'bg-gray-100'}`}>
          {priorityConfig[task.priority]?.icon}
          {priorityConfig[task.priority]?.label || task.priority}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        {task.assignedTo && (
          <span className="flex items-center gap-1">
            <FiUser size={12} />
            {task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <FiCalendar size={12} />
            Due: {formatDate(task.dueDate)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <FiClock size={12} />
          Created: {formatDate(task.createdAt)}
        </span>
      </div>
      
      {task.status !== 'completed' && statusConfig[task.status]?.nextStatus && (
        <button
          onClick={handleStatusChange}
          className="w-full mt-2 text-sm bg-primary-50 text-primary-600 px-3 py-2 rounded-lg hover:bg-primary-100 transition flex items-center justify-center gap-2"
        >
          <FiCheckCircle size={14} />
          {statusConfig[task.status]?.nextLabel}
        </button>
      )}
      
      {task.status === 'completed' && task.completedAt && (
        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
          <FiCheckCircle size={12} />
          Completed on {formatDate(task.completedAt)}
        </div>
      )}

      {/* Attachments Button */}
      <button
        onClick={() => setShowAttachments(!showAttachments)}
        className="mt-3 w-full text-sm text-gray-500 hover:text-primary-600 transition flex items-center justify-center gap-2 pt-3 border-t"
      >
        <FiPaperclip size={14} />
        {showAttachments ? 'Hide Attachments' : 'Show Attachments'}
      </button>

      {/* Attachments Section */}
      {showAttachments && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <FileUploader 
            taskId={task._id} 
            onUploadComplete={() => {
              // Refresh attachments list
              setShowAttachments(true);
            }}
          />
          <AttachmentList 
            taskId={task._id} 
            currentUser={currentUser}
            projectMembers={projectMembers}
          />
        </div>
      )}

      {/* Comments Button */}
      <button
        onClick={() => setShowComments(!showComments)}
        className="mt-3 w-full text-sm text-gray-500 hover:text-primary-600 transition flex items-center justify-center gap-2 pt-3 border-t"
      >
        <FiMessageSquare size={14} />
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>

      {/* Comment Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t">
          <CommentSection 
            taskId={task._id} 
            projectId={task.projectId}
            currentUser={currentUser}
          />
        </div>
      )}
    </div>
  );
}