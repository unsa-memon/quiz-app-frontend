import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizAttempt from '../components/QuizAttempt';
import { getQuiz } from '../utils/api';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiClock, FiArrowLeft, FiAward, FiBookOpen, FiUsers, FiPlay, FiInfo, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showQuizStart, setShowQuizStart] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        console.log(`Fetching quiz with ID: ${id}`)
        const response = await getQuiz(id)
        
        if (!response) {
          throw new Error('No response received from server')
        }
        
        console.log('Quiz response:', response)
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load quiz')
        }

        const quizData = response.data
        console.log('Quiz data:', quizData)
        
        if (!quizData) {
          throw new Error('No quiz data received')
        }
        
        if (!quizData._id || !quizData.title) {
          throw new Error('Quiz data is missing required fields')
        }

        // Validate questions structure
        if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          console.warn('Quiz has no questions:', quizData)
          throw new Error('This quiz has no questions')
        }

        // Convert duration from minutes to seconds
        const durationInMinutes = Math.max(1, Number(quizData.duration) || 1); // Default to 1 minute if not specified
        const durationInSeconds = durationInMinutes;
        
        // Prepare quiz data for display while preserving all original question data
        const preparedQuiz = {
          ...quizData,
          duration: durationInSeconds, // Store duration in seconds
          questions: quizData.questions.map((q, index) => ({
            // Preserve all original question properties
            ...q,
            // Ensure required fields exist
            _id: q._id || `temp-${index}`, // Preserve original ID or create a temporary one
            questionText: q.questionText || '',
            type: q.type || 'MCQ',
            marks: q.marks || 1,
            // Ensure correctAnswer is properly formatted
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : '',
            // Ensure options array exists for MCQ
            options: q.type === 'MCQ' ? (q.options || ['', '', '', '']) : []
          }))
        }

        console.log('Final Prepared Quiz:', {
          id: preparedQuiz._id,
          title: preparedQuiz.title,
          duration: preparedQuiz.duration,
          questionsCount: preparedQuiz.questions?.length,
          firstQuestion: {
            id: preparedQuiz.questions?.[0]?._id,
            text: preparedQuiz.questions?.[0]?.questionText,
            type: preparedQuiz.questions?.[0]?.type
          }
        })
        
        setQuiz(preparedQuiz)
        setError(null)
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setError(error.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [id])

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'MCQ':
        return '🔘';
      case 'TrueFalse':
        return '✓✗';
      case 'Fill':
        return '✏️';
      default:
        return '❓';
    }
  }

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'MCQ':
        return 'Multiple Choice';
      case 'TrueFalse':
        return 'True/False';
      case 'Fill':
        return 'Fill in the Blank';
      default:
        return 'Question';
    }
  }

  // Enhanced Quiz Attempt Component
  const EnhancedQuizAttempt = ({ quiz }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(quiz.duration * 60) // Convert to seconds
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    useEffect(() => {
      if (timeLeft > 0 && !isSubmitted) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
        return () => clearTimeout(timer)
      } else if (timeLeft === 0) {
        handleSubmit() // Auto-submit when time runs out
      }
    }, [timeLeft, isSubmitted])

    const formatTime = (seconds) => {
      const totalMins = Math.floor(seconds / 60)
      const hours = Math.floor(totalMins / 60)
      const mins = totalMins % 60
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleAnswerChange = (questionIndex, answer) => {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: answer
      }))
    }

    const handleSubmit = async () => {
      if (isSubmitting) return; // Prevent multiple submissions
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        console.group('=== Quiz Submission Started ===');
        
        // Log the raw quiz data for debugging
        console.log('=== QUIZ DATA ===');
        console.log('Quiz ID:', quiz._id);
        console.log('Quiz Title:', quiz.title);
        console.log('Number of questions:', quiz.questions?.length);
        console.log('Questions with IDs:');
        quiz.questions?.forEach((q, i) => {
          console.log(`  Q${i + 1}:`, {
            _id: q._id,
            text: q.questionText?.substring(0, 50) + (q.questionText?.length > 50 ? '...' : ''),
            type: q.type,
            hasAnswer: answers[i] !== undefined
          });
        });
        
        // Log the raw answers
        console.log('=== USER ANSWERS ===');
        console.log(JSON.stringify(answers, null, 2));
        
        // Prepare submission data in the exact format expected by the backend
        const submissionData = {
          responses: quiz.questions.map((q, index) => ({
            questionId: q._id, // Use the actual question _id from the quiz data
            selectedAnswer: answers[index] !== undefined ? answers[index] : ''
          })),
          timeTaken: Math.floor((quiz.duration * 60) - timeLeft) // Time taken in seconds (integer)
        };
        
        console.log('=== FINAL SUBMISSION DATA ===');
        console.log(JSON.stringify(submissionData, null, 2));
        
        // Prepare request options
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(submissionData)
        };
        
        console.log('Request options:', {
          method: requestOptions.method,
          url: `http://localhost:5000/api/quizzes/${quiz._id}/attempt`,
          headers: requestOptions.headers,
          body: requestOptions.body
        });
        
        // Send to API
        const response = await fetch(`http://localhost:5000/api/quizzes/${quiz._id}/attempt`, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Quiz submission successful:', result);
        
        if (result.data?.attemptId) {
          setAttemptId(result.data.attemptId);
        } else if (result.data?._id) {
          setAttemptId(result.data._id);
        }
        
        setIsSubmitted(true);
        toast.success('Quiz submitted successfully!');
        
      } catch (error) {
        console.error('Error submitting quiz:', error);
        setSubmitError(error.message || 'Failed to submit quiz. Please try again.');
        
        // Handle rate limiting (429)
        if (error.message.includes('429')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else {
          toast.error(error.message || 'Failed to submit quiz. Please try again.');
        }
        
        // Reset submission state to allow retry
        setIsSubmitted(false);
      } finally {
        setIsSubmitting(false);
        console.groupEnd();
      }
    }

    const nextQuestion = () => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      }
    }

    const prevQuestion = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1)
      }
    }

    const goToQuestion = (index) => {
      setCurrentQuestion(index)
    }

    const currentQ = quiz.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

    if (isSubmitting) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Submitting your quiz...</p>
        </div>
      );
    }
    
    if (isSubmitted) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FiCheck className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Submitted!</h3>
          <p className="text-gray-600 mb-6">Your answers have been recorded successfully.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
            <div className="w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full"
              >
                Back to Dashboard
              </button>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => {
                  if (attemptId) {
                    navigate(`/quiz/attempt/${attemptId}/results`);
                  } else {
                    toast.error('Unable to view results. Please try again.');
                  }
                }}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 w-full"
              >
                View Results
              </button>
            </div>
          </div>
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-700">{submitError}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Timer and Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <FiClock className="h-4 w-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} answered
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                {currentQuestion + 1}
              </span>
              <div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {getQuestionTypeIcon(currentQ.type)} {getQuestionTypeLabel(currentQ.type)}
                </span>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              +{currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
            </span>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
            {currentQ.questionText}
          </h3>

          {/* MCQ Options */}
          {currentQ.type === 'MCQ' && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerChange(currentQuestion, index)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-700 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* True/False Options */}
          {currentQ.type === 'TrueFalse' && (
            <div className="space-y-3">
              {[true, false].map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    answers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswerChange(currentQuestion, option)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion] === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === option && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-gray-900 font-medium">
                    {option ? 'True' : 'False'}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Fill in the Blank */}
          {currentQ.type === 'Fill' && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
              currentQuestion === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FiChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>

          <div className="flex space-x-1">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-8 h-8 text-xs font-medium rounded-full ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Next
              <FiChevronRight className="ml-1 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-blue-100 rounded col-span-2"></div>
                      <div className="h-4 bg-blue-100 rounded col-span-1"></div>
                    </div>
                    <div className="h-4 bg-blue-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <div className="inline-flex items-center space-x-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">Preparing your quiz...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <FiAlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <FiArrowLeft className="mr-1" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
              <FiAlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Quiz Not Found</h3>
            <p className="mt-2 text-sm text-gray-500">The requested quiz could not be found or is no longer available.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center justify-between px-4 py-2">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm font-medium text-white hover:text-blue-100"
              >
                <FiArrowLeft className="mr-1" />
                Back to Dashboard
              </button>
              <div className="flex items-center space-x-2">
                <FiClock className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">
                  {quiz.duration} min • {quiz.questions?.length || 0} questions
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="mt-2 text-gray-600">{quiz.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {quiz.subject && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {quiz.subject}
                  </span>
                )}
                {quiz.difficulty && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {quiz.difficulty}
                  </span>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <EnhancedQuizAttempt quiz={quiz} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPage