import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, deleteQuiz } from '../utils/adminApi';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching users...');
      const response = await getAllUsers();
      
      // Debug the entire response
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      
      if (!response) {
        console.error('No response received from API');
        setError('Failed to fetch users: No response from server');
        setUsers([]);
        return;
      }
      
      // Check if response has users array
      if (!response.users || !Array.isArray(response.users)) {
        console.error('Invalid response format - users array not found:', response);
        setError('Invalid data format received from server');
        setUsers([]);
        return;
      }
      
      console.log(`Found ${response.users.length} users in response`);
      
      // Filter out admin users
      const regularUsers = response.users.filter(user => {
        const isRegularUser = user.role !== 'admin';
        console.log(`User ${user.email} (${user.role}): ${isRegularUser ? 'Regular' : 'Admin'}`);
        return isRegularUser;
      });
      
      console.log(`Found ${regularUsers.length} regular users after filtering`);
      
      // Log details of each user
      regularUsers.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          name: user.name,
          email: user.email,
          quizCount: user.quizCount,
          totalAttempts: user.totalAttempts,
          averageScore: user.averageScore,
          quizzes: user.quizzes?.length || 0,
          quizAttempts: user.quizAttempts?.length || 0
        });
      });
      
      // Update state with the filtered users
      setUsers(regularUsers);
      
      if (regularUsers.length === 0) {
        console.log('No regular users found after filtering');
        setError('No regular users found in the database');
      } else {
        console.log(`Successfully loaded ${regularUsers.length} regular users`);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please make sure the backend server is running and accessible.');
      // Set empty users to clear any previous data
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their quizzes?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleDeleteQuiz = async (userId, quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        setUsers(users.map(user => {
          if (user._id === userId) {
            return {
              ...user,
              quizzes: user.quizzes.filter(quiz => quiz._id !== quizId)
            };
          }
          return user;
        }));
      } catch (err) {
        console.error('Error deleting quiz:', err);
        setError('Failed to delete quiz');
      }
    }
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    // Navigate to admin login and force a full page reload
    window.location.href = 'http://localhost:3000/admin/login';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <li className="px-6 py-4">No users found</li>
              ) : (
                users.map((user) => (
                  <li key={user._id} className="px-6 py-4">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Member since: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserExpansion(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {expandedUser === user._id ? 'Hide Quizzes' : 'View Quizzes'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>

                    {expandedUser === user._id && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-2">User's Quizzes</h4>
                        {user.quizzes?.length === 0 ? (
                          <p className="text-sm text-gray-500">No quizzes found</p>
                        ) : (
                          <ul className="space-y-3">
                            {user.quizzes?.map((quiz) => (
                              <li key={quiz._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">{quiz.title}</h5>
                                  <p className="text-xs text-gray-500">
                                    {quiz.questions?.length || 0} questions • Created on: {new Date(quiz.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteQuiz(user._id, quiz._id)}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
