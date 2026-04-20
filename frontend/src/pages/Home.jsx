import { Link } from "react-router-dom";
import { FiGithub, FiUsers, FiCode, FiZap, FiAward, FiGlobe } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Home() {
  const [stats, setStats] = useState({
    projects: 0,
    developers: 0,
    technologies: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("Fetching stats...");
      
      const projectsRes = await API.get('/projects');
      const projects = projectsRes.data;
      
      console.log("Projects fetched:", projects.length);
      
      // Calculate unique technologies
      const allTechs = new Set();
      const developers = new Set();
      
      projects.forEach(project => {
        // Add creator to developers set
        if (project.createdBy?._id) {
          developers.add(project.createdBy._id);
        }
        
        // Process tech stack
        if (project.techStack) {
          const techs = Array.isArray(project.techStack) 
            ? project.techStack 
            : project.techStack.split(',').map(t => t.trim());
          
          techs.forEach(tech => {
            if (tech) allTechs.add(tech);
          });
        }
      });

      setStats({
        projects: projects.length,
        developers: developers.size,
        technologies: allTechs.size
      });
      
      console.log("Stats updated:", {
        projects: projects.length,
        developers: developers.size,
        technologies: allTechs.size
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Find Teammates",
      description: "Connect with developers worldwide who share your interests and skills."
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: "Build Together",
      description: "Collaborate on real-world projects and build your portfolio."
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Learn Faster",
      description: "Accelerate your learning by working with experienced developers."
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Get Recognized",
      description: "Showcase your contributions and build your reputation."
    },
    {
      icon: <FiGithub className="w-8 h-8" />,
      title: "Open Source",
      description: "Contribute to exciting open source projects and give back."
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Global Community",
      description: "Join a diverse community of developers from around the world."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Build Amazing Projects
              <span className="block text-primary-200">Together</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10">
              Join a community of developers collaborating on real-world projects. 
              Find teammates, learn new technologies, and build your portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/projects" 
                className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition duration-200"
              >
                Explore Projects
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-500 text-white hover:bg-primary-400 px-8 py-3 rounded-lg font-semibold text-lg transition duration-200"
              >
                Join Now
              </Link>
            </div>
          </div>

          {/* Stats with Loading States */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  <>{stats.projects}+</>
                )}
              </div>
              <div className="text-primary-200">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  <>{stats.developers}+</>
                )}
              </div>
              <div className="text-primary-200">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  <>{stats.technologies}+</>
                )}
              </div>
              <div className="text-primary-200">Technologies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose DevCollab?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to collaborate effectively on software projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8"
              >
                <div className="text-primary-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join thousands of developers already collaborating on DevCollab
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">DevCollab</h3>
            <p className="text-gray-400 mb-6">
              Connect. Collaborate. Create amazing projects together.
            </p>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} DevCollab. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}