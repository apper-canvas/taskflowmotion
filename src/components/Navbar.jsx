import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';
import ApperIcon from './ApperIcon';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'Home' },
    { path: '/', label: 'Tasks', icon: 'CheckSquare' },
    { path: '/projects', label: 'Projects', icon: 'Folder' }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card backdrop-blur-md border-b border-white/20 dark:border-surface-700/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-soft">
              <ApperIcon name="CheckSquare" className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </motion.div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-surface-100'
                }`}
              >
                <ApperIcon name={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/20 dark:bg-surface-800/20 backdrop-blur-sm border border-white/30 dark:border-surface-700/30 hover:bg-white/30 dark:hover:bg-surface-700/30 transition-all duration-200"
            >
              <ApperIcon 
                name={darkMode ? "Sun" : "Moon"} 
                className="w-5 h-5 text-surface-700 dark:text-surface-300" 
              />
            </motion.button>

            {/* User Menu */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 p-2 rounded-xl bg-white/20 dark:bg-surface-800/20 backdrop-blur-sm border border-white/30 dark:border-surface-700/30 hover:bg-white/30 dark:hover:bg-surface-700/30 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {user?.firstName || 'User'}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {user?.emailAddress || 'user@example.com'}
                  </p>
                </div>
                <ApperIcon name="ChevronDown" className="w-4 h-4 text-surface-500 dark:text-surface-400" />
              </motion.button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-soft border border-surface-200 dark:border-surface-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="LogOut" className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20 dark:border-surface-700/20 pt-2 pb-2">
          <nav className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-600 dark:text-surface-400'
                }`}
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;