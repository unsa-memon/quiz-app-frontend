import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createQuiz } from '../utils/api'
import { toast, ToastContainer } from 'react-toastify'

function QuizForm() {
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState({
    title: '',
    subject: '',
    duration: '',
    questions: [{ type: 'MCQ', questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]
  })
  const navigate = useNavigate()

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions]
    newQuestions[index][field] = value
    setQuiz({ ...quiz, questions: newQuestions })
  }

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...quiz.questions]
    newQuestions[qIndex].options[oIndex] = value
    setQuiz({ ...quiz, questions: newQuestions })
  }

  const addQuestion = (type = 'MCQ') => {
    const newQuestion = {
      type,
      questionText: '',
      marks: 1,
      correctAnswer: '',
      ...(type === 'MCQ' && { options: ['', '', '', ''] })
    }
    
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    })
  }

  const validateQuiz = () => {
    let isValid = true;
    
    quiz.questions.forEach((question, index) => {
      // Validate MCQs
      if (question.type === 'MCQ') {
        const hasEmptyOptions = question.options.some(opt => !opt.trim());
        const noAnswerSelected = question.correctAnswer === '';
        
        if (hasEmptyOptions) {
          toast.error(`Question ${index + 1}: All MCQ options must be filled`);
          isValid = false;
        }
        
        if (noAnswerSelected) {
          toast.error(`Question ${index + 1}: Please select the correct answer for the MCQ`);
          isValid = false;
        }
      }
      
      // Validate Fill-in-the-Blank
      if (question.type === 'Fill' && !question.correctAnswer.trim()) {
        toast.error(`Question ${index + 1}: Please provide a correct answer for the fill-in-the-blank question`);
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.group('=== Quiz Creation Started ===')
    console.log('Quiz Data:', JSON.stringify(quiz, null, 2))
    
    // Validate the quiz before submission
    if (!validateQuiz()) {
      console.log('Quiz validation failed')
      console.groupEnd()
      return;
    }
    
    setLoading(true)
    
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      const errorMsg = 'No authentication token found. Please login first.'
      console.error('Authentication Error:', errorMsg)
      toast.error('Please login first')
      navigate('/login')
      setLoading(false)
      console.groupEnd()
      return
    }
    
    try {
      console.log('Sending quiz creation request to server...')
      const response = await createQuiz(quiz)
      console.log('Quiz Creation Response:', response)
      
      // Show success message and redirect
      toast.success('Quiz created successfully!')
      navigate('/')
    } catch (error) {
      console.error('Detailed error creating quiz:', {
        error,
        errorResponse: error.response,
        errorRequest: error.request,
        errorMessage: error.message,
        errorConfig: error.config
      })
      
      if (error.response) {
        console.error(`Server error: ${error.response.data?.message || error.response.statusText}`)
      } else if (error.request) {
        console.error('No response from server. Please check if the server is running.')
      } else {
        console.error(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 border border-black rounded-md p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-black pb-4 mb-6">
            <h2 className="text-3xl font-bold mb-2">Create New Quiz</h2>
            <p className="text-gray-600">Fill in the details below to create your quiz. You can add multiple questions of different types.</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={quiz.subject}
              onChange={(e) => setQuiz({ ...quiz, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={quiz.duration}
              onChange={(e) => setQuiz({ ...quiz, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-4">Questions</h3>
            {quiz.questions.map((question, index) => (
              <div key={index} className="border-2 border-black rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-black">
                  <h4 className="text-xl font-semibold">Question {index + 1}</h4>
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newQuestions = [...quiz.questions]
                        newQuestions.splice(index, 1)
                        setQuiz({ ...quiz, questions: newQuestions })
                      }}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Question Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      required
                    >
                      <option value="MCQ">Multiple Choice</option>
                      <option value="Fill">Fill-in-the-Blank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Question Text</label>
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {question.type === 'MCQ' && (
                    <div>
                      <label className="block text-gray-700 mb-2">Options</label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-4 items-center">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                            className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => handleQuestionChange(index, 'correctAnswer', optIndex)}
                            className="w-5 h-5"
                          />
                        </div>
                      ))}
                    </div>
                  )}



                  {question.type === 'Fill' && (
                    <div>
                      <label className="block text-gray-700 mb-2">Correct Answer <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter the correct answer"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-2">Marks</label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4">
              <button
                onClick={addQuestion}
                type="button"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-2 border-black"
              >
                Add Question
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuizForm