import { useState, useEffect } from 'react';
import { getUserHistory } from '../utils/api';
import { FiAward, FiClock, FiBarChart2, FiCalendar, FiUser, FiMail, FiBookOpen, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Profile() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchHistory = async () => {
      try {
        const response = await getUserHistory();
        if (response.data && response.data.length > 0) {
          console.log('Quiz history data loaded:', response.data.length, 'attempts found');
        }
        setHistory(response.data || []);
      } catch (error) {
        console.error('Error fetching history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
    
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
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center w-full border-2 border-black">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiAward size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Quizzes Taken</p>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center w-full border-2 border-black">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiBarChart2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
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
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border-b border-black">
                <p>You haven't taken any quizzes yet.</p>
                <p className="mt-2">Start a quiz to see your history here!</p>
              </div>
            ) : (
              history.map((attempt) => {
                const percentage = Math.round((attempt.score / attempt.totalMarks) * 100);
                const isExcellent = percentage >= 80;
                const isGood = percentage >= 50 && percentage < 80;
                
                return (
                  <div key={attempt._id} className="p-6 hover:bg-gray-50 transition-colors duration-200 border-b border-black last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">{attempt.quizId?.title || 'Untitled Quiz'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {attempt.timestamp ? formatDate(attempt.timestamp) : 'Date not available'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="relative w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-4">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded-full ${
                              isExcellent ? 'bg-green-500' : isGood ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          isExcellent ? 'text-green-600' : isGood ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 text-right">
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                          {attempt.score} / {attempt.totalMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;