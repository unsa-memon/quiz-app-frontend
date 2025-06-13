import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import QuizCard from '../components/QuizCard'
import QuizForm from '../components/QuizForm'
import { getQuizzes } from '../utils/api'

function Dashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [filter, setFilter] = useState({ subject: '', sort: 'a-z' })
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const [errorShown, setErrorShown] = useState(false)

  // Extract unique subjects from quizzes
  useEffect(() => {
    if (quizzes.length > 0) {
      const uniqueSubjects = [...new Set(quizzes.map(quiz => quiz.subject).filter(Boolean))];
      setSubjects(prevSubjects => {
        // Only update if subjects have changed to prevent infinite re-renders
        if (JSON.stringify(prevSubjects) !== JSON.stringify(uniqueSubjects)) {
          return uniqueSubjects;
        }
        return prevSubjects;
      });
    }
  }, [quizzes]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchQuizzes = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        const params = {
          subject: filter.subject,
          sort: filter.sort,
          search: search
        };
        
        const response = await getQuizzes(params);
        console.log('Quiz response:', response);
        
        if (response.success && response.data) {
          const quizzesData = Array.isArray(response.data) ? response.data : [];
          if (isMounted) {
            setQuizzes(quizzesData);
            console.log('Quizzes set:', quizzesData);
          }
        } else {
          console.error('Failed to fetch quizzes:', response.message || 'Unknown error');
          if (!errorShown && isMounted) {
            toast.error(`Failed to fetch quizzes: ${response.message || 'Please try again'}`);
            setErrorShown(true);
          }
          if (isMounted) setQuizzes([]);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        if (!errorShown && isMounted) {
          toast.error(`Failed to fetch quizzes: ${error.message}`);
          setErrorShown(true);
        }
        if (isMounted) setQuizzes([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQuizzes();

    return () => {
      isMounted = false;
    };
  }, [filter, search, errorShown, location])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Quiz Dashboard</h1>
        <button
          onClick={() => navigate('/create-quiz')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Quiz
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex space-x-4">
          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            className="p-2 border rounded min-w-[150px]"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select
            value={filter.sort}
            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="duration-asc">Shortest Duration</option>
            <option value="duration-desc">Longest Duration</option>
          </select>
        </div>
      </div>

      {showCreateForm ? (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl shadow-xl">
            <QuizForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading quizzes...</p>
            </div>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white rounded-xl border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                    <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {quiz.subject}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Duration</p>
                      <p className="font-semibold text-gray-800">{quiz.duration} mins</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Questions</p>
                      <p className="font-semibold text-gray-800">{quiz.questions?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Marks</p>
                      <p className="font-semibold text-gray-800">{quiz.totalMarks || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Start Quiz Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600 text-lg">No quizzes found. Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilter({ subject: '', sort: 'a-z' });
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard