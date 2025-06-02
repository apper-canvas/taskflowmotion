import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, isToday, isPast, parseISO } from 'date-fns';
import Navbar from '../components/Navbar';
import ApperIcon from '../components/ApperIcon';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent tasks and projects in parallel
      const [tasksData, projectsData] = await Promise.all([
        TaskService.fetchTasks({ 
          orderBy: [{ fieldName: "ModifiedOn", SortType: "DESC" }],
          pagingInfo: { limit: 10 }
        }),
        ProjectService.fetchProjects({
          orderBy: [{ fieldName: "ModifiedOn", SortType: "DESC" }]
        })
      ]);

      setTasks(tasksData);
      setProjects(projectsData);

      // Calculate statistics
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter(task => task.status === 'completed').length;
      const pendingTasks = tasksData.filter(task => task.status === 'pending').length;
      const overdueTasks = tasksData.filter(task => 
        task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed'
      ).length;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      'in-progress': 'Loader',
      completed: 'CheckCircle'
    };
    return icons[status] || 'Clock';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: 'ChevronDown',
      medium: 'Minus',
      high: 'ChevronUp',
      urgent: 'AlertTriangle'
    };
    return icons[priority] || 'Minus';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-surface-600 dark:text-surface-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                  Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                  Here's what's happening with your tasks today
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to="/projects"
                  className="inline-flex items-center px-4 py-2 bg-white/20 dark:bg-surface-800/20 backdrop-blur-sm border border-white/30 dark:border-surface-700/30 rounded-lg hover:bg-white/30 dark:hover:bg-surface-700/30 transition-all duration-200"
                >
                  <ApperIcon name="Folder" className="w-4 h-4 mr-2" />
                  <span>Projects</span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl shadow-soft hover:shadow-card transition-all duration-200"
                >
                  <ApperIcon name="Plus" className="w-5 h-5" />
                  <span>Add Task</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Tasks',
                value: stats.totalTasks,
                icon: 'CheckSquare',
                color: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30'
              },
              {
                title: 'Completed',
                value: stats.completedTasks,
                icon: 'CheckCircle',
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-100 dark:bg-green-900/30'
              },
              {
                title: 'Pending',
                value: stats.pendingTasks,
                icon: 'Clock',
                color: 'from-yellow-500 to-yellow-600',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
              },
              {
                title: 'Overdue',
                value: stats.overdueTasks,
                icon: 'AlertTriangle',
                color: 'from-red-500 to-red-600',
                bgColor: 'bg-red-100 dark:bg-red-900/30'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <ApperIcon name={stat.icon} className="w-6 h-6 text-surface-700 dark:text-surface-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Recent Tasks
                </h3>
                <Link
                  to="/"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {tasks.length > 0 ? (
                  tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.Id}
                      className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' : 
                          task.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">
                            {task.title || task.Name}
                          </p>
                          {task.due_date && (
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              Due: {format(parseISO(task.due_date), 'MMM dd')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium priority-${task.priority}`}>
                          <ApperIcon name={getPriorityIcon(task.priority)} className="w-3 h-3 mr-1" />
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ApperIcon name="CheckSquare" className="w-12 h-12 mx-auto mb-3 text-surface-400" />
                    <p className="text-surface-500 dark:text-surface-400">No tasks yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Projects Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Projects
                </h3>
                <Link
                  to="/projects"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((project) => (
                    <div
                      key={project.Id}
                      className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        />
                        <div>
                          <p className="font-medium text-surface-900 dark:text-surface-100">
                            {project.Name}
                          </p>
                          {project.Tags && (
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              {project.Tags.split(',').slice(0, 2).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <ApperIcon name="ChevronRight" className="w-4 h-4 text-surface-400" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ApperIcon name="Folder" className="w-12 h-12 mx-auto mb-3 text-surface-400" />
                    <p className="text-surface-500 dark:text-surface-400">No projects yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;