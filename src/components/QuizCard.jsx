import { Link, useNavigate } from 'react-router-dom'

function QuizCard({ quiz }) {
  const navigate = useNavigate()
  
  const handleTakeQuiz = () => {
    if (!quiz || !quiz._id) {
      console.error('Invalid quiz data:', quiz)
      return
    }
    navigate(`/quiz/${quiz._id}`)
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-gray-700 hover:border-blue-600 transform hover:-translate-y-1">
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{quiz.title}</h3>
      <div className="space-y-2 mb-6">
        <p className="text-gray-700 flex items-center">
          <span className="font-medium text-gray-900 w-20">Subject:</span> 
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {quiz.subject}
          </span>
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Duration:</span> {quiz.duration} mins
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Questions:</span> {quiz.questions.length}
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Total Marks:</span> {quiz.questions.reduce((sum, q) => sum + q.marks, 0)}
        </p>
      </div>
      <button 
        onClick={handleTakeQuiz}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        Take Quiz
      </button>
    </div>
  )
}

export default QuizCard