import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
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
    
    // Basic client-side validation
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    
    // Validate email format before submission
    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    try {
      // 1. First, create the user account
      const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      })

      // 2. If signup is successful, log the user in
      if (signupResponse.data?.success) {
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          email: form.email.trim(),
          password: form.password
        })

        // 3. Store the token, user data and redirect to dashboard
        if (loginResponse.data?.token && loginResponse.data?.user) {
          localStorage.setItem('token', loginResponse.data.token)
          // Store user data in localStorage including name, email, and creation date
          const userData = {
            name: loginResponse.data.user.name,
            email: loginResponse.data.user.email,
            createdAt: loginResponse.data.user.createdAt || new Date().toISOString(),
            _id: loginResponse.data.user._id
          }
          localStorage.setItem('user', JSON.stringify(userData))
          navigate('/')
        } else {
          // If login after signup fails, redirect to login page
          navigate('/login')
        }
      } else {
        setError(signupResponse.data?.message || 'Error creating account')
      }
    } catch (err) {
      console.error('Signup error:', err)
      // Handle different types of errors
      if (err.response) {
        setError(err.response.data?.message || 'Error creating account. Please try again.')
      } else if (err.request) {
        setError('No response from server. Please check if the server is running.')
      } else {
        setError('Error creating account. Please try again.')
      }
    }
  }


  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a password"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default Signup