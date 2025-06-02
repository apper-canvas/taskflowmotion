import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AuthContext } from '../App'
import Navbar from '../components/Navbar'
import MainFeature from '../components/MainFeature'

const Tasks = () => {
  const { isInitialized } = useContext(AuthContext)
  const { isAuthenticated } = useSelector((state) => state.user)

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <MainFeature />
      </main>
    </div>
  )
}

export default Tasks