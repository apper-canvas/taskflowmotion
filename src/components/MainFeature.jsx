import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isToday, isPast, parseISO } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([
    { id: 'personal', name: 'Personal', color: '#6366f1', taskCount: 0 },
    { id: 'work', name: 'Work', color: '#06b6d4', taskCount: 0 },
    { id: 'urgent', name: 'Urgent', color: '#ef4444', taskCount: 0 }
  ])
  const [selectedProject, setSelectedProject] = useState('personal')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow-tasks')
    const savedProjects = localStorage.getItem('taskflow-projects')
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save to localStorage whenever tasks or projects change
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
    updateProjectTaskCounts()
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('taskflow-projects', JSON.stringify(projects))
  }, [projects])

  const updateProjectTaskCounts = () => {
    const updatedProjects = projects.map(project => ({
      ...project,
      taskCount: tasks.filter(task => task.projectId === project.id).length
    }))
    setProjects(updatedProjects)
  }

  const handleSubmitTask = (e) => {
    e.preventDefault()
    
    if (!taskForm.title.trim()) {
      toast.error('Task title is required')
      return
    }

    const taskData = {
      ...taskForm,
      id: editingTask ? editingTask.id : Date.now().toString(),
      projectId: selectedProject,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingTask) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? taskData : task))
      toast.success('Task updated successfully!')
      setEditingTask(null)
    } else {
      setTasks(prev => [...prev, taskData])
      toast.success('Task created successfully!')
    }

    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending'
    })
    setShowTaskForm(false)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status
    })
    setSelectedProject(task.projectId)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    toast.success('Task deleted successfully!')
  }

  const handleToggleStatus = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed', updatedAt: new Date().toISOString() }
        : task
    ))
  }

  const getPriorityIcon = (priority) => {
    const icons = {
      low: 'ChevronDown',
      medium: 'Minus',
      high: 'ChevronUp',
      urgent: 'AlertTriangle'
    }
    return icons[priority] || 'Minus'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'Clock',
      'in-progress': 'Loader',
      completed: 'CheckCircle'
    }
    return icons[status] || 'Clock'
  }

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'project') return task.projectId === selectedProject
      if (filter === 'today') return task.dueDate && isToday(parseISO(task.dueDate))
      if (filter === 'overdue') return task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'completed'
      if (filter === 'completed') return task.status === 'completed'
      return true
    })
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (a.status !== 'completed' && b.status === 'completed') return -1
      
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
              Task Dashboard
            </h2>
            <p className="text-surface-600 dark:text-surface-400">
              Manage your tasks efficiently with TaskFlow
            </p>
          </div>
          
          <motion.button
            onClick={() => {
              setShowTaskForm(true)
              setEditingTask(null)
              setTaskForm({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                status: 'pending'
              })
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl shadow-soft hover:shadow-card transition-all duration-200"
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Add Task</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Projects and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Projects */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center">
              <ApperIcon name="Folder" className="w-5 h-5 mr-2" />
              Projects
            </h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project.id)
                    setFilter('project')
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    selectedProject === project.id && filter === 'project'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <span className="text-sm opacity-60">{project.taskCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center">
              <ApperIcon name="Filter" className="w-5 h-5 mr-2" />
              Filters
            </h3>
            <div className="space-y-2">
              {[
                { key: 'all', label: 'All Tasks', icon: 'List' },
                { key: 'today', label: 'Due Today', icon: 'Calendar' },
                { key: 'overdue', label: 'Overdue', icon: 'AlertCircle' },
                { key: 'completed', label: 'Completed', icon: 'CheckCircle' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    filter === filterOption.key
                      ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <ApperIcon name={filterOption.icon} className="w-4 h-4 mr-3" />
                  <span className="font-medium">{filterOption.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Tasks List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-xl p-8 text-center"
                >
                  <ApperIcon name="CheckSquare" className="w-16 h-16 mx-auto mb-4 text-surface-400" />
                  <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-surface-500 dark:text-surface-400">
                    Create your first task to get started!
                  </p>
                </motion.div>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`task-card ${task.status === 'completed' ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <motion.button
                          onClick={() => handleToggleStatus(task.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            task.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-surface-300 dark:border-surface-600 hover:border-green-500'
                          }`}
                        >
                          {task.status === 'completed' && <ApperIcon name="Check" className="w-4 h-4" />}
                        </motion.button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-surface-900 dark:text-surface-100 ${
                            task.status === 'completed' ? 'line-through' : ''
                          }`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {/* Priority Badge */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border priority-${task.priority}`}>
                              <ApperIcon name={getPriorityIcon(task.priority)} className="w-3 h-3 mr-1" />
                              {task.priority}
                            </span>
                            
                            {/* Status Badge */}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                              <ApperIcon name={getStatusIcon(task.status)} className="w-3 h-3 mr-1" />
                              {task.status}
                            </span>
                            
                            {/* Due Date */}
                            {task.dueDate && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isPast(parseISO(task.dueDate)) && task.status !== 'completed'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                                <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
                                {format(parseISO(task.dueDate), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <motion.button
                          onClick={() => handleEditTask(task)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleDeleteTask(task.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTaskForm(false)}
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
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Add description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Project
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="flex-1 px-4 py-3 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-medium rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:shadow-card transition-all duration-200"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature