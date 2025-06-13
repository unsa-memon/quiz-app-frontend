import { useState, useEffect } from 'react'
import { submitQuiz } from '../utils/api'

function QuizAttempt({ quiz }) {
  // Validate quiz data
  if (!quiz || !quiz._id || !quiz.title || !quiz.questions) {
    throw new Error('Invalid quiz data received');
  }

  const [answers, setAnswers] = useState({})
  // Convert minutes to seconds for the timer
  const [timeLeft, setTimeLeft] = useState(0)
  const [attemptId, setAttemptId] = useState(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!quiz) {
      setError('Quiz data not found');
      setLoading(false);
    } else {
      // Convert duration from minutes to seconds
      const durationInMinutes = Math.max(1, Number(quiz.duration) || 1);
      const initialTime = durationInMinutes * 60; // Convert minutes to seconds
      console.log(`Setting quiz duration: ${durationInMinutes} minutes (${initialTime} seconds)`);
      setTimeLeft(initialTime);
      setLoading(false);
    }
  }, [quiz])

  useEffect(() => {
    let timer = null
    
    if (!loading && quiz && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          if (newTime <= 0) {
            clearInterval(timer)
            handleSubmit()
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [loading, quiz, timeLeft])

  const handleAnswerChange = (questionId, value, questionType, optionIndex = null) => {
    let processedValue = value;
    
    // Convert values based on question type
    if (questionType === 'TrueFalse') {
      processedValue = value === 'true';
    } else if (questionType === 'MCQ' && optionIndex !== null) {
      processedValue = optionIndex; // Store the index for MCQs
    }
    // For Fill type, keep the string value as is
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: processedValue
    }));
  }

  const handleSubmit = async () => {
    console.group('=== Quiz Submission Started ===');
    console.log('Quiz ID:', quiz._id);
    console.log('Quiz Title:', quiz.title);
    console.log('Time Left (seconds):', timeLeft);
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if all questions have answers
      const unansweredQuestions = quiz.questions.filter(q => !answers[q._id]);
      if (unansweredQuestions.length > 0) {
        const errorMsg = `Found ${unansweredQuestions.length} unanswered questions`;
        console.warn('Submission blocked:', errorMsg);
        console.log('Unanswered Questions:', unansweredQuestions.map(q => q._id));
        setError('Please answer all questions before submitting');
        setLoading(false);
        console.groupEnd();
        return;
      }

      // Calculate time taken (in seconds)
      const quizDuration = quiz.duration * 60; // Convert minutes to seconds
      const timeTaken = Math.max(0, quizDuration - timeLeft);
      console.log('Time Taken (seconds):', timeTaken);

      // Format answers as expected by backend
      const formattedAnswers = quiz.questions.map(q => ({
        questionId: q._id,
        selectedAnswer: answers[q._id]
      }));
      
      console.log('Submitting answers:', formattedAnswers);
      console.log('Sending request to server...');
      
      const response = await submitQuiz(quiz._id, formattedAnswers, timeTaken);
      
      console.log('Server Response:', response);
      
      // Validate response
      if (!response || !response.success || !response.data) {
        const errorMsg = response?.message || 'Invalid submission response';
        console.error('Submission failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Check if we have the attempt ID in the response
      if (response.data?.attemptId) {
        // Navigate to the results page with the attempt ID in the URL
        navigate(`/quiz/attempt/${response.data.attemptId}/results`, {
          state: { results: response.data }
        });
      } else if (response.data?._id) {
        // Fallback: If the ID is in _id field
        navigate(`/quiz/attempt/${response.data._id}/results`, {
          state: { results: response.data }
        });
      } else {
        // If no ID is found, show an error
        throw new Error('No attempt ID received from server');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="text-center">Loading quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  // Show loading state during submission
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Submitting your quiz...</p>
        </div>
      </div>
    );
  }

  // Format time as minutes.seconds (e.g., 25.30 for 25 minutes and 30 seconds)
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}.${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate time percentage for progress bar
  const timePercentage = quiz ? (timeLeft / Math.max(1, quiz.duration)) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{quiz?.title}</h2>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-medium">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>
      {quiz?.questions?.map((q, index) => (
        <div key={q._id} className="mb-6">
          <p className="font-semibold">{index + 1}. {q.questionText}</p>
          {q.type === 'MCQ' ? (
            q.options.map((opt, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name={q._id}
                  value={opt}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value, q.type, i)}
                  className="mr-2"
                />
                {opt}
              </div>
            ))
          ) : q.type === 'TrueFalse' ? (
            <>
              <input
                type="radio"
                name={q._id}
                value="true"
                onChange={(e) => handleAnswerChange(q._id, e.target.value, q.type)}
                className="mr-2"
              />
              True
              <input
                type="radio"
                name={q._id}
                value="false"
                onChange={(e) => handleAnswerChange(q._id, e.target.value, q.type)}
                className="ml-4 mr-2"
              />
              False
            </>
          ) : (
            <input
              type="text"
              onChange={(e) => handleAnswerChange(q._id, e.target.value, q.type)}
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      ))}
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Submit Quiz
      </button>
    </div>
  )
}

export default QuizAttempt