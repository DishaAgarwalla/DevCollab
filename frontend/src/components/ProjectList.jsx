import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiUsers, FiCode, FiExternalLink, FiUserPlus } from 'react-icons/fi';
import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

// Project Card Component
const ProjectCard = ({ project, showJoinButton, onJoin, user }) => {
  const techStack = useMemo(() => {
    if (!project.techStack) return [];
    return Array.isArray(project.techStack) 
      ? project.techStack 
      : project.techStack.split(',').map(t => t.trim());
  }, [project.techStack]);

  const isOwner = user && project.createdBy?._id === user._id;
  const isMember = user && project.members?.some(m => m._id === user._id);
  const hasPendingRequest = user && project.joinRequests?.some(req => req.userId?._id === user._id);

  const showRequestButton = showJoinButton && !isOwner && !isMember && !hasPendingRequest;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 hover:text-primary-600 transition">
            {project.title}
          </h3>
          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>

        {techStack.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FiCode className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Tech Stack:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.rolesNeeded && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-primary-600" />
              <span className="text-sm font-medium text-gray-700">Looking for:</span>
            </div>
            <p className="text-sm text-gray-600">{project.rolesNeeded}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              By {project.createdBy?.name || 'Unknown'}
            </span>
          </div>
          
          <div className="flex gap-2">
            {showRequestButton && (
              <button
                onClick={() => onJoin(project._id)}
                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                <FiUserPlus />
                Request to Join
              </button>
            )}
            
            {hasPendingRequest && (
              <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm">
                Request Pending
              </span>
            )}
            
            {isMember && !showJoinButton && (
              <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm">
                Member
              </span>
            )}

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
    </div>
  );
};

export default function ProjectList({ projects, user, showJoinButton = false, onJoin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [techFilter, setTechFilter] = useState('');

  // Get unique tech stacks for filter
  const allTechStacks = useMemo(() => {
    const techSet = new Set();
    projects.forEach(project => {
      if (project.techStack) {
        const techs = Array.isArray(project.techStack) 
          ? project.techStack 
          : project.techStack.split(',').map(t => t.trim());
        techs.forEach(tech => techSet.add(tech));
      }
    });
    return Array.from(techSet);
  }, [projects]);

  // Filter projects based on search and tech filter
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' || 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (techFilter === '') return true;

      const projectTechs = Array.isArray(project.techStack) 
        ? project.techStack 
        : project.techStack?.split(',').map(t => t.trim()) || [];
      
      return projectTechs.includes(techFilter);
    });
  }, [projects, searchTerm, techFilter]);

  if (projects.length === 0 && !showJoinButton) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl text-gray-600 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't joined any projects yet.
          </p>
          <Link 
            to="/projects"
            onClick={() => window.location.href = '/projects'}
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="md:w-64 relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Technologies</option>
              {allTechStacks.map((tech, index) => (
                <option key={index} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredProjects.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
          {techFilter && ` in ${techFilter}`}
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl text-gray-600 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || techFilter 
              ? "Try adjusting your search or filter" 
              : showJoinButton ? "No projects available to join yet" : "You haven't joined any projects yet"}
          </p>
          {!showJoinButton && !searchTerm && !techFilter && (
            <Link 
              to="/projects"
              onClick={() => {
                // This will reload the page and switch to browse tab
                window.location.href = '/projects';
              }}
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Browse Projects to Join
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              showJoinButton={showJoinButton}
              onJoin={onJoin}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}