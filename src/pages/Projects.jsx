import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ApperIcon from '../components/ApperIcon';
import ProjectService from '../services/ProjectService';
import TaskService from '../services/TaskService';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [projectForm, setProjectForm] = useState({
    Name: '',
    Tags: '',
    color: '#6366f1'
  });

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await ProjectService.fetchProjects({
        orderBy: [{ fieldName: "ModifiedOn", SortType: "DESC" }]
      });
      
      // Get task counts for each project
      const projectsWithTaskCounts = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasks = await TaskService.getTasksByProject(project.Id);
            return {
              ...project,
              taskCount: tasks.length,
              completedTasks: tasks.filter(task => task.status === 'completed').length
            };
          } catch (error) {
            console.error(`Error loading tasks for project ${project.Id}:`, error);
            return {
              ...project,
              taskCount: 0,
              completedTasks: 0
            };
          }
        })
      );
      
      setProjects(projectsWithTaskCounts);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    
    if (!projectForm.Name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      setLoading(true);
      
      if (editingProject) {
        await ProjectService.updateProject(editingProject.Id, projectForm);
        toast.success('Project updated successfully!');
        setEditingProject(null);
      } else {
        await ProjectService.createProject(projectForm);
        toast.success('Project created successfully!');
      }

      setProjectForm({
        Name: '',
        Tags: '',
        color: '#6366f1'
      });
      setShowProjectForm(false);
      await loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(editingProject ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      Name: project.Name || '',
      Tags: project.Tags || '',
      color: project.color || '#6366f1'
    });
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await ProjectService.deleteProject(projectId);
      toast.success('Project deleted successfully!');
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.Tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                  Projects
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  Organize your tasks with projects
                </p>
              </div>
              
              <motion.button
                onClick={() => {
                  setShowProjectForm(true);
                  setEditingProject(null);
                  setProjectForm({
                    Name: '',
                    Tags: '',
                    color: '#6366f1'
                  });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl shadow-soft hover:shadow-card transition-all duration-200"
              >
                <ApperIcon name="Plus" className="w-5 h-5" />
                <span>Add Project</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 mb-6"
          >
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-surface-600 dark:text-surface-400">Loading projects...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProjects.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full glass-card rounded-xl p-8 text-center"
                  >
                    <ApperIcon name="Folder" className="w-16 h-16 mx-auto mb-4 text-surface-400" />
                    <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
                      No projects found
                    </h3>
                    <p className="text-surface-500 dark:text-surface-400">
                      Create your first project to get started!
                    </p>
                  </motion.div>
                ) : (
                  filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card rounded-xl p-6 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: project.color || '#6366f1' }}
                          />
                          <h3 className="font-semibold text-surface-900 dark:text-surface-100">
                            {project.Name}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleEditProject(project)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleDeleteProject(project.Id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {project.Tags && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {project.Tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-block px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs rounded-full"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {project.Tags.split(',').length > 3 && (
                              <span className="inline-block px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs rounded-full">
                                +{project.Tags.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Tasks</span>
                          <span className="font-medium text-surface-900 dark:text-surface-100">
                            {project.taskCount || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Completed</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {project.completedTasks || 0}
                          </span>
                        </div>
                        
                        {project.taskCount > 0 && (
                          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${((project.completedTasks || 0) / project.taskCount) * 100}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Project Form Modal */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-soft max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h3>
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectForm.Name}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, Name: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter project name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={projectForm.Tags}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, Tags: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={projectForm.color}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-12 rounded-lg border border-surface-200 dark:border-surface-600"
                      />
                      <input
                        type="text"
                        value={projectForm.color}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProjectForm(false)}
                      className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-medium rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:shadow-card transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;