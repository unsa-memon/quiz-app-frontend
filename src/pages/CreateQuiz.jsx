import React from 'react'
import { useNavigate } from 'react-router-dom'
import QuizForm from '../components/QuizForm'
import { ToastContainer } from 'react-toastify'

function CreateQuiz() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 border border-black">
      <div className="container mx-auto px-4 py-8 border-x border-black min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors border border-black px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <div className="bg-white rounded-lg shadow-md p-6 border border-black">
            <QuizForm />
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}

export default CreateQuiz
