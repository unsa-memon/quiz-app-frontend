import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getQuizResults } from '../utils/api';
import { FiClock, FiCheck, FiX, FiChevronRight } from 'react-icons/fi';

function QuizResults() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!results && attemptId) {
        try {
          console.log('Fetching results for attempt ID:', attemptId);
          setLoading(true);
          setError(null);
          const response = await getQuizResults(attemptId);
          console.log('API Response:', response);
          
          if (response && response.success) {
            console.log('Setting results data:', response.data);
            console.log('Questions data:', response.data.questions);
            setResults(response.data);
          } else {
            const errorMsg = response?.message || 'Failed to load results';
            console.error('API Error:', errorMsg);
            setError(errorMsg);
          }
        } catch (err) {
          console.error('Error in fetchResults:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            stack: err.stack
          });
          setError(err.response?.data?.message || 'Failed to load quiz results. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResults();
  }, [attemptId, results]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <FiX className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Results</h2>
            <p className="mb-4 text-gray-700">
              {error.message || error || 'We couldn\'t load your quiz results.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                <p className="font-medium">Debug Information:</p>
                <p>Attempt ID: {attemptId}</p>
                <p>Error: {error.message || JSON.stringify(error)}</p>
              </div>
            )}
            
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto text-center"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Results Found</h2>
            <p className="text-gray-600">We couldn't find the results for this quiz attempt.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug the results structure
  console.log('Full results data:', JSON.stringify(results, null, 2));
  
  // Safely destructure with defaults from the API response
  const resultData = results?.data || results;
  const {
    score = 0,
    totalPossibleScore = 0,
    percentage = 0,
    timeTaken = 0,
    responses = [],
    quizTitle = 'Quiz',
    subject = ''
  } = resultData || {};
  
  // Calculate correct answers count
  const correctCount = Array.isArray(responses) 
    ? responses.filter(response => response.isCorrect).length 
    : 0;
    
  const totalQuestionsCount = Array.isArray(responses) ? responses.length : 0;
  
  // Extract questions and answers from the responses array
  let questions = [];
  let userAnswers = [];
  
  if (Array.isArray(responses)) {
    console.log('Found responses array with length:', responses.length);
    
    // Map responses to questions format
    questions = responses.map((response, index) => {
      const question = {
        _id: response.questionId || `q-${index}`,
        text: response.questionText || `Question ${index + 1}`,
        options: [],
        correctOption: response.correctAnswer,
        marks: response.marks || 1,
        questionType: response.questionType || 'MCQ',
        responseData: response
      };

      // For MCQ questions, create options with their correct/incorrect status
      if (response.questionType === 'MCQ' && Array.isArray(response.options)) {
        question.options = response.options.map((option, i) => ({
          id: i,
          text: option,
          isCorrect: Array.isArray(response.correctAnswer) 
            ? response.correctAnswer.includes(i) 
            : response.correctAnswer === i,
          isSelected: response.selectedAnswer === i
        }));
      } 
      // For fill-in-the-blank questions
      else if (response.questionType === 'Fill') {
        question.options = [{
          id: 0,
          text: response.selectedAnswer || 'No answer provided',
          isCorrect: response.isCorrect,
          isSelected: true
        }];
      }

      return question;
    });
    
    // Map responses to user answers format
    userAnswers = responses.map((response, index) => ({
      questionId: response.questionId || `q-${index}`,
      selectedOption: response.selectedAnswer,
      isCorrect: response.isCorrect,
      questionIndex: index,
      questionType: response.questionType || 'MCQ',
      selectedOptionText: response.questionType === 'MCQ' && Array.isArray(response.options)
        ? response.options[response.selectedAnswer]
        : response.selectedAnswer
    }));

    console.log('Mapped user answers:', userAnswers);
    console.log('Processed questions:', questions);
  } else {
    console.error('No responses array found in results:', results);
    setError('No quiz results found. Please try again.');
  }
  
  console.log('Final userAnswers:', userAnswers);
  const timeInMinutes = ((timeTaken || 0) / 60).toFixed(1);
  const timePerQuestion = totalQuestionsCount > 0 
    ? (timeTaken / totalQuestionsCount).toFixed(1) 
    : 0;
  
  // Calculate accuracy percentage
  const accuracy = totalQuestionsCount > 0 
    ? Math.round((correctCount / totalQuestionsCount) * 100) 
    : 0;

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Questions Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any questions for this quiz attempt.</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left mb-6 overflow-auto max-h-64">
            <pre className="text-xs text-gray-700">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getAnswerStatus = (questionIndex) => {
    const question = questions[questionIndex];
    const userAnswer = userAnswers && userAnswers.find(a => a.questionIndex === questionIndex);
    
    if (!question) return 'unanswered';
    
    // Handle case where user didn't answer
    if (!userAnswer || userAnswer.selectedOption === undefined || userAnswer.selectedOption === null) {
      return 'unanswered';
    }
    
    // Check if the answer is correct based on the isCorrect flag from the response
    if (userAnswer.isCorrect !== undefined) {
      return userAnswer.isCorrect ? 'correct' : 'incorrect';
    }
    
    // Fallback comparison if isCorrect is not available
    if (Array.isArray(question.correctOption)) {
      const userSelections = Array.isArray(userAnswer.selectedOption) ? 
        userAnswer.selectedOption : [userAnswer.selectedOption];
      const isCorrect = question.correctOption.length === userSelections.length &&
                       question.correctOption.every(opt => 
                         userSelections.includes(opt)
                       );
      return isCorrect ? 'correct' : 'incorrect';
    } 
    // Handle single correct answer
    else {
      return userAnswer.selectedOption === question.correctOption ? 'correct' : 'incorrect';
    }
  };

  const renderAnswer = (question, answerIndex, questionIndex) => {
    if (!question || !question.options || !Array.isArray(question.options)) {
      return null;
    }
    
    const userAnswer = userAnswers && userAnswers.find(a => a.questionIndex === questionIndex);
    const option = question.options[answerIndex];
    
    if (!option) return null;
    
    console.log('Rendering answer:', { question, userAnswer, option });
    
    // For fill-in-the-blank questions, show the user's answer
    if (question.questionType === 'Fill') {
      const isCorrect = userAnswer?.isCorrect;
      const userAnswerText = userAnswer?.selectedOption || 'No answer provided';
      
      return (
        <div key={answerIndex} className="p-3 border rounded-lg mb-2 bg-gray-50">
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-2 mt-0.5 ${
              isCorrect ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
            }`}>
              {isCorrect ? (
                <FiCheck className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <FiX className="h-3.5 w-3.5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-gray-800">
                <span className="font-medium">Your answer:</span> {userAnswerText}
              </p>
              {!isCorrect && question.correctOption && (
                <p className="text-gray-800 mt-1">
                  <span className="font-medium">Correct answer:</span> {question.correctOption}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // For MCQ questions
    const isSelected = option.isSelected;
    const isCorrect = option.isCorrect;
    
    let className = 'p-3 border rounded-lg mb-2';
    
    if (isCorrect) {
      className += ' bg-green-50 border-green-200';
    } else if (isSelected) {
      className += ' bg-red-50 border-red-200';
    } else {
      className += ' bg-gray-50 border-gray-200';
    }
    
    return (
      <div key={option.id} className={className}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-2 mt-0.5 ${
            isCorrect ? 'bg-green-100 border-green-400' : 
            isSelected ? 'bg-red-100 border-red-400' : 'bg-gray-100 border-gray-300'
          }`}>
            {isCorrect ? (
              <FiCheck className="h-3.5 w-3.5 text-green-600" />
            ) : isSelected ? (
              <FiX className="h-3.5 w-3.5 text-red-600" />
            ) : null}
          </div>
          <div>
            <span className="text-gray-800">{option.text}</span>
            {isCorrect && (
              <span className="ml-2 text-xs text-green-600 font-medium">
                (Correct Answer)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 border-2 border-black p-6 bg-white rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Score</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </div>
        
        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center border-2 border-black">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Score</h3>
            <div className="text-5xl font-bold text-blue-600 mb-2 border-b-2 border-black pb-2">{score}/{totalPossibleScore}</div>
            <div className="text-sm text-blue-600 font-medium mt-2">{percentage}%</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center border-2 border-black">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Correct Answers</h3>
            <div className="text-5xl font-bold text-green-600 mb-2 border-b-2 border-black pb-2">{correctCount}/{totalQuestionsCount}</div>
            <div className="text-sm text-green-600 font-medium mt-2">{accuracy}% Accuracy</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center border-2 border-black">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Time Taken</h3>
            <div className="text-5xl font-bold text-purple-600 mb-2 border-b-2 border-black pb-2">{timeInMinutes}m</div>
            <div className="text-sm text-purple-600 font-medium mt-2">{timePerQuestion}s per question</div>
          </div>
        </div>
        
        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-black">
          <div className="p-6 border-b-2 border-black bg-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Question Review</h2>
          </div>
          
          <div className="p-6 space-y-6 bg-white">
            {questions.map((question, index) => {
              const answer = userAnswers.find(a => a.questionId === question._id) || {};
              const isCorrect = answer.isCorrect;
              
              return (
                <div key={question._id} className="p-6 mb-6 border-2 border-black rounded-lg last:mb-0 shadow-sm hover:shadow transition-shadow duration-200">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-1 border-2 ${
                      isCorrect ? 'bg-green-100 text-green-600 border-green-500' : 'bg-red-100 text-red-600 border-red-500'
                    }`}>
                      {isCorrect ? (
                        <FiCheck className="h-4 w-4" />
                      ) : (
                        <FiX className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
                      
                      <div className="mt-2 mb-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${
                          isCorrect ? 'bg-green-100 text-green-800 border-green-500' : 'bg-red-100 text-red-800 border-red-500'
                        }`}>
                          {isCorrect ? (
                            <>
                              <FiCheck className="mr-1.5 h-4 w-4" />
                              Correct Answer
                            </>
                          ) : (
                            <>
                              <FiX className="mr-1.5 h-4 w-4" />
                              Incorrect Answer
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 space-y-3">
                        {question.options?.map((option, i) => {
                          const isSelected = answer.selectedOption === option.id || 
                                         (Array.isArray(answer.selectedOption) && answer.selectedOption.includes(option.id));
                          const isCorrectOption = option.isCorrect;
                          
                          // Determine if this is a correct answer that should be shown in green
                          const showAsCorrect = isCorrectOption || 
                                            (question.questionType === 'MCQ' && isCorrectOption);
                          
                          return (
                            <div 
                              key={i} 
                              className={`p-3 rounded-md border-2 ${
                                showAsCorrect ? 'bg-green-50 border-green-500' :
                                isSelected ? 'bg-red-50 border-red-500' :
                                'border-black bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                                  showAsCorrect ? 'bg-green-100 border-green-300' :
                                  isSelected ? 'bg-red-100 border-red-300' :
                                  'border-gray-200'
                                }`}>
                                  {showAsCorrect && <FiCheck className="h-3 w-3 text-green-600" />}
                                  {isSelected && !showAsCorrect && <FiX className="h-3 w-3 text-red-600" />}
                                </div>
                                <div>
                                  <span className={`${
                                    showAsCorrect ? 'text-green-800 font-medium' : 'text-gray-800'
                                  }`}>
                                    {option.text}
                                  </span>
                                  {isSelected && (
                                    <span className={`ml-2 text-xs font-medium ${
                                      showAsCorrect ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {showAsCorrect ? 'Correct Answer' : 'Your Answer'}
                                    </span>
                                  )}
                                  {!isSelected && showAsCorrect && (
                                    <span className="ml-2 text-xs font-medium text-green-600">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 border-2 border-black rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
