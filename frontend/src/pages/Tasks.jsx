import { useState, useEffect } from 'react';
import { FiPlus, FiCheckCircle, FiClock, FiAlertCircle, FiList, FiFilter, FiTag } from 'react-icons/fi';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import ExportButton from '../components/ExportButton';
import SearchBar from '../components/SearchBar';
import AdvancedFilters from '../components/AdvancedFilters';
import TemplateList from '../components/TemplateList';
import SaveAsTemplate from '../components/SaveAsTemplate';
import SkeletonLoader from '../components/SkeletonLoader';
import { getTasks, createTask, updateTask, deleteTask, getTaskStats } from '../api/tasks';
import { getTemplates, createTaskFromTemplate } from '../api/templates';
import toast from 'react-hot-toast';

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

export default function Tasks({ projectId, projectMembers, user, projectTitle }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [selectedTaskForTemplate, setSelectedTaskForTemplate] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    dueDate: '',
    sortBy: 'createdAt-desc',
    labels: []
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
      fetchStats();
    }
  }, [projectId, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') queryParams.append('priority', filters.priority);
      if (filters.assignedTo && filters.assignedTo !== 'all') queryParams.append('assignedTo', filters.assignedTo);
      if (filters.dueDate) queryParams.append('dueDate', filters.dueDate);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.labels && filters.labels.length > 0) {
        filters.labels.forEach(label => queryParams.append('labels', label));
      }
      
      const query = queryParams.toString();
      const data = await getTasks(projectId, query);
      setTasks(data);
      
      let count = 0;
      if (filters.search) count++;
      if (filters.status !== 'all') count++;
      if (filters.priority !== 'all') count++;
      if (filters.assignedTo !== 'all') count++;
      if (filters.dueDate) count++;
      if (filters.labels.length > 0) count++;
      setActiveFilterCount(count);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getTaskStats(projectId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching task stats:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks([newTask, ...tasks]);
      fetchStats();
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const updatedTask = await updateTask(taskId, updatedData);
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
      fetchStats();
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      fetchStats();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      assignedTo: 'all',
      dueDate: '',
      sortBy: 'createdAt-desc',
      labels: []
    });
  };

  const handleSaveAsTemplate = (task) => {
    setSelectedTaskForTemplate(task);
    setShowSaveTemplate(true);
  };

  const handleUseTemplate = async (template) => {
    try {
      const task = await createTaskFromTemplate(template._id, projectId);
      setTasks([task, ...tasks]);
      toast.success('Task created from template!');
      setShowTemplateList(false);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to create task from template');
    }
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="text-yellow-500" /> },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: <FiAlertCircle className="text-blue-500" /> },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="text-green-500" /> },
    blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800', icon: <FiAlertCircle className="text-red-500" /> }
  };

  if (loading) {
    return <SkeletonLoader type="task" count={5} />;
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Tasks</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200 hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-blue-600">{stats.in_progress || 0}</div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200 hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-red-600">{stats.blocked || 0}</div>
            <div className="text-xs text-red-600">Blocked</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <SearchBar
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            onFilterClick={() => setShowAdvancedFilters(true)}
            placeholder="Search tasks..."
          />
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 transition-colors"
            >
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplateList(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
          >
            <FiTag size={16} />
            Templates
          </button>
          <ExportButton projectId={projectId} projectTitle={projectTitle} />
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <FiPlus />
            Add Task
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs animate-fadeIn">
              Status: {statusConfig[filters.status]?.label}
              <button onClick={() => setFilters({ ...filters, status: 'all' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
            </span>
          )}
          {filters.priority !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs animate-fadeIn">
              Priority: {filters.priority}
              <button onClick={() => setFilters({ ...filters, priority: 'all' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
            </span>
          )}
          {filters.assignedTo !== 'all' && filters.assignedTo !== 'unassigned' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs animate-fadeIn">
              Assignee: Specific User
              <button onClick={() => setFilters({ ...filters, assignedTo: 'all' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
            </span>
          )}
          {filters.dueDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs animate-fadeIn">
              Due: {filters.dueDate}
              <button onClick={() => setFilters({ ...filters, dueDate: '' })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
            </span>
          )}
          {filters.labels.map(label => (
            <span key={label} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs animate-fadeIn">
              Label: {labelConfig[label]?.name || label}
              <button onClick={() => setFilters({ ...filters, labels: filters.labels.filter(l => l !== label) })} className="ml-1 text-gray-500 hover:text-gray-700">×</button>
            </span>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border animate-fadeIn">
          <FiList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {activeFilterCount > 0 ? 'Try changing your filters' : 'Create your first task to start tracking progress'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              canEdit={user && (user._id === task.createdBy?._id || true)}
              projectMembers={projectMembers}
              currentUser={user}
              onSaveAsTemplate={() => handleSaveAsTemplate(task)}
            />
          ))}
        </div>
      )}

      {showTaskForm && (
        <TaskForm
          projectId={projectId}
          projectMembers={projectMembers}
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {showAdvancedFilters && (
        <AdvancedFilters
          projectId={projectId}
          filters={filters}
          onApply={handleApplyFilters}
          onClose={() => setShowAdvancedFilters(false)}
        />
      )}

      {showTemplateList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-96 max-w-full p-6 max-h-[80vh] overflow-y-auto animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Task Templates</h3>
              <button onClick={() => setShowTemplateList(false)} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
            </div>
            <TemplateList
              projectId={projectId}
              onUseTemplate={handleUseTemplate}
            />
          </div>
        </div>
      )}

      {showSaveTemplate && selectedTaskForTemplate && (
        <SaveAsTemplate
          task={selectedTaskForTemplate}
          projectId={projectId}
          onClose={() => {
            setShowSaveTemplate(false);
            setSelectedTaskForTemplate(null);
          }}
          onSaved={() => {
            toast.success('Template saved!');
            setShowSaveTemplate(false);
          }}
        />
      )}
    </div>
  );
}