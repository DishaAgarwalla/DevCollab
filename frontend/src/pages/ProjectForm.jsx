import { useState } from "react";
import { createProject } from "../api/projects";
import toast from 'react-hot-toast';

function ProjectForm({ project, refreshProjects }) {
  const [form, setForm] = useState(
    project || { 
      title: "", 
      description: "", 
      techStack: "",
      rolesNeeded: "",
      githubRepo: ""
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const projectData = {
        ...form,
        techStack: form.techStack.split(',').map(t => t.trim())
      };

      if (project) {
        // Update existing project
        // await API.put(`/projects/${project._id}`, projectData);
        toast.success("Project updated!");
      } else {
        await createProject(projectData);
        toast.success("Project created!");
      }
      
      refreshProjects?.();
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error(err.response?.data?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="title"
        placeholder="Project Title"
        value={form.title}
        onChange={handleChange}
        className="input-field"
        required
      />
      <textarea
        name="description"
        placeholder="Project Description"
        value={form.description}
        onChange={handleChange}
        className="input-field"
        rows="4"
        required
      />
      <input
        name="techStack"
        placeholder="Tech Stack (comma separated)"
        value={form.techStack}
        onChange={handleChange}
        className="input-field"
        required
      />
      <input
        name="rolesNeeded"
        placeholder="Roles Needed (comma separated)"
        value={form.rolesNeeded}
        onChange={handleChange}
        className="input-field"
      />
      <input
        name="githubRepo"
        placeholder="GitHub Repository URL"
        value={form.githubRepo}
        onChange={handleChange}
        className="input-field"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Saving...' : (project ? 'Update' : 'Create') + ' Project'}
      </button>
    </form>
  );
}

export default ProjectForm;