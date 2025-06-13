    import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  const handleEmailChange = (e) => {
    const { value } = e.target
    setForm({ ...form, email: value })
    
    if (value === '') {
      setEmailError('')
    } else if (!validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email format before submission
    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: form.email.trim(),
        password: form.password
      })
      
      localStorage.setItem('token', response.data.token)
      // Store user data in localStorage including name, email, and creation date
      if (response.data.user) {
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          _id: response.data.user._id
        }
        localStorage.setItem('user', JSON.stringify(userData))
      }
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={handleEmailChange}
            onBlur={(e) => e.target.value && !validateEmail(e.target.value) && setEmailError('Please enter a valid email address')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              emailError ? 'border-red-500' : ''
            }`}
            placeholder="Enter your email"
            required
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            placeholder="Enter your password"
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default Login