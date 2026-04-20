import { Link } from "react-router-dom";
import { FiUsers, FiCode, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectCard({ project }) {
  const techStack = Array.isArray(project.techStack) 
    ? project.techStack 
    : project.techStack?.split(',').map(t => t.trim()) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition">
            {project.title}
          </h3>
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs px-2 py-1 rounded-full">
            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiCode className="text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tech Stack:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <span 
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {project.rolesNeeded && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Looking for:</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{project.rolesNeeded}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              By {project.createdBy?.name || 'Unknown'}
            </span>
          </div>
          
          <Link 
            to={`/team/${project._id}`}
            className="inline-flex items-center gap-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            View Details
            <FiExternalLink />
          </Link>
        </div>
      </div>
    </div>
  );
}