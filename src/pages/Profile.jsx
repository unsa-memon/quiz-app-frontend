import { useState, useEffect } from 'react';
import { getUserHistory, getUserAverageScore } from '../utils/api';
import { FiAward, FiClock, FiBarChart2, FiCalendar, FiUser, FiMail, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Profile() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [stats, setStats] = useState({
    averageScore: 0,
    averagePercentage: 0,
    totalAttempts: 0,
    totalScore: 0,
    totalPossibleMarks: 0
  });
  const [userData, setUserData] = useState(() => {
    // Get user data from localStorage if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        name: user.name || 'User',
        email: user.email || '',
        memberSince: user.createdAt || new Date().toISOString(),
      };
    }
    return {
      name: 'User',
      email: '',
      memberSince: new Date().toISOString(),
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching user history...');
        const historyResponse = await getUserHistory();
        console.log('History response:', historyResponse);
        
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          console.log('Quiz history data loaded:', historyResponse.data.length, 'attempts found');
          setHistory(historyResponse.data);
        } else if (historyResponse.data) {
          console.log('Unexpected data format, attempting to process:', historyResponse.data);
          setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
        } else {
          console.warn('No data in history response');
          setHistory([]);
        }

        console.log('Fetching average score...');
        const statsResponse = await getUserAverageScore();
        console.log('Average score response:', statsResponse);
        setStats({
          averageScore: statsResponse.averageScore || 0,
          averagePercentage: statsResponse.averagePercentage || 0,
          totalAttempts: statsResponse.totalAttempts || 0,
          totalScore: statsResponse.totalScore || 0,
          totalPossibleMarks: statsResponse.totalPossibleMarks || 1
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load profile data');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Listen for storage events to update user data if it changes in another tab
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData({
          name: user.name || 'User',
          email: user.email || '',
          memberSince: user.createdAt || new Date().toISOString(),
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Format date function with better debugging
  const formatDate = (dateValue) => {
    console.log('Formatting date value:', dateValue);
    
    // If no date value, return placeholder
    if (!dateValue) return 'Date not available';
    
    try {
      // Try to parse the date - handle both string timestamps and Date objects
      const date = new Date(dateValue);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'Invalid date';
      }
      
      // Format the date
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Value:', dateValue);
      return 'Date error';
    }
  };

  // Calculate user stats
  const totalQuizzes = history.length;
  const totalScore = history.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  const totalPossible = history.reduce((sum, attempt) => sum + (attempt.totalMarks || 0), 0);
  const averageScore = totalQuizzes > 0 && totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  
  // Calculate total time spent across all attempts in minutes
  const totalTimeSpent = history.reduce((total, attempt) => {
    // Assuming the API returns timeSpent in seconds
    const timeInSeconds = attempt.timeSpent || 0;
    return total + Math.round(timeInSeconds / 60); // Convert to minutes
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border border-black">
      <div className="max-w-7xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-8 border-2 border-black">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-6">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-6xl font-bold shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <span className="drop-shadow-md">{userData.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                    <div className="h-8 w-8 rounded-full bg-green-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                <p className="mt-2 text-indigo-100 flex items-center justify-center sm:justify-start">
                  <FiMail className="mr-2" />
                  {userData.email}
                </p>
                <p className="mt-1 text-indigo-100 flex items-center justify-center sm:justify-start">
                  <FiCalendar className="mr-2" />
                  Member since {new Date(userData.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Full width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
                <FiAward className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quizzes Taken</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <FiBarChart2 className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p 
                  className={`text-3xl font-bold ${
                    stats.averagePercentage >= 50 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stats.averagePercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-black">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiBookOpen className="mr-2 text-indigo-600" />
              Quiz History
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your quiz history...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600 border-b border-black">
                <p>Error loading quiz history: {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-b border-black">
                <p>You haven't taken any quizzes yet.</p>
                <p className="mt-2">Start a quiz to see your history here!</p>
                <Link 
                  to="/quizzes" 
                  className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Browse Quizzes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end mb-4 pr-2">
                  <div className="inline-flex rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50" role="group">
                    <button
                      onClick={() => setSortOrder('newest')}
                      className={`px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                        sortOrder === 'newest' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-inner' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-indigo-700'
                      }`}
                    >
                      Newest First
                    </button>
                    <div className="h-6 w-px bg-gray-200 my-1"></div>
                    <button
                      onClick={() => setSortOrder('oldest')}
                      className={`px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                        sortOrder === 'oldest' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-inner' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-indigo-700'
                      }`}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...history]
                    .sort((a, b) => 
                      sortOrder === 'newest' 
                        ? new Date(b.completedAt) - new Date(a.completedAt)
                        : new Date(a.completedAt) - new Date(b.completedAt)
                    )
                    .map((attempt, index) => (
                    <div 
                      key={attempt._id} 
                      className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="text-gray-500 w-8 text-sm font-medium">
                        {sortOrder === 'newest' ? index + 1 : history.length - index}.
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">
                          {attempt.quizId?.title || 'Untitled Quiz'}
                        </p>
                      </div>
                      <div className="ml-2 text-sm text-gray-500 whitespace-nowrap">
                        {attempt.completedAt 
                          ? new Date(attempt.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No date'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
