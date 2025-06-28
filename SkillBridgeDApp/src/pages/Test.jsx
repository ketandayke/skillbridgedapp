// src/pages/Test.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Award, CheckCircle, XCircle, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import TestQuizQuestions from '../utils/TestQuizQuestions';
import Loader from '../components/Loader';
import { uploadCourseResult } from '../services/IpfsUploadService';
import axios from "axios";

const Test = () => {
  const { account, completeTest, getUserData,getUserProfileCID, getCourseQuiz, markCourseAsCompleted } = useWeb3();
  const [searchParams] = useSearchParams();
  const testType = searchParams.get('type') || 'entry';
  const courseId = searchParams.get('courseId');

  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(180);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([]);
  const [testPassed, setTestPassed] = useState(false);
  const [finalPercentage, setFinalPercentage] = useState(0);
  
  const[courseTitle,setCourseTitle]=useState("");
  useEffect(() => {
    const fetchUserData = async () => {
      if (account) {
        const data = await getUserData();
        setUserData(data);
        const enrolled = data?.coursesEnrolled?.includes(courseId);
        if (enrolled) setIsEnrolled(true);
      }
    };
    fetchUserData();
  }, [account, courseId, getUserData]);

  useEffect(() => {
    let timer;
    if (hasStarted && timeLeft > 0 && !isSubmitted) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, hasStarted, isSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [questionIndex]: selectedOption });
  };

  const handleQuizStart = async () => {
    setLoading(true);
    let quizMeta = {};
    try {
      if (testType === 'entry') {
        const data = await TestQuizQuestions();
        quizMeta = { questions: data, passingScore: 70, timeLimit: 3 };
      } else if (testType === 'course' && courseId) {
        if (!isEnrolled) {
          toast.error("You must be enrolled to take this quiz.");
          setLoading(false);
          return;
        }
        quizMeta = await getCourseQuiz(courseId);
      }

      setQuestions(quizMeta.questions);
      setPassingScore(quizMeta.passingScore);
      setTimeLeft(quizMeta.timeLimit * 60);
      setCourseTitle(quizMeta.courseTitle);
      setHasStarted(true);
    } catch (err) {
      toast.error("Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

 


// Inside your component:
const [certificateCid, setCertificateCid] = useState(null);
const [showMintButton, setShowMintButton] = useState(false);

const handleSubmit = async () => {
  setIsSubmitted(true);
  const total = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
  setScore(total);
  const percent = (total / questions.length) * 100;
  setFinalPercentage(percent);
  setLoading(true);

  try {
    if (testType === 'entry') {
      await completeTest(total);
      toast.success(`Test submitted! You earned ${total} SBT tokens.`);
      setTestPassed(true);
    } else if (testType === 'course') {
      if (percent >= passingScore) {
        setTestPassed(true);
        setShowMintButton(true);
        toast.success("\ud83c\udf89 You passed! Mint your certificate.");
      } else {
        setTestPassed(false);
        toast.error(`You scored ${percent.toFixed(1)}%. Minimum ${passingScore}% required.`);
      }
    }
  } catch (err) {
    toast.error("Error submitting test.");
  } finally {
    setLoading(false);
  }
};

const handleMintCertificate = async () => {
  try {
    setLoading(true);

    const cid = await getUserProfileCID(account);
    console.log("this is profile cide",cid);
    let profile;
    if(cid){
      const ipfsURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
      const profileResponse = await axios.get(ipfsURL);
      profile = profileResponse.data;

    }
   
    console.log("this is profile",profile);
    // const profile=await fetchTextFromCid(profileCid);
    const quizResult = {
      courseId,
      courseTitle,
      userAddress: account,
      userName: profile?.userName || "Anonymous",
      userEmail: profile?.email || "NA",
      answers,
      score,
      total: questions.length,
      percentage: finalPercentage,
      completedAt: new Date().toISOString(),
    };
    console.log('this is quiz result to send to backend',quizResult);
    const resultCID = await uploadCourseResult({ quizResult });
     console.log("this is resultcide and courseId and isenrolled",resultCID,courseId,isEnrolled);
    await markCourseAsCompleted(courseId, resultCID);
    setCertificateCid(resultCID);
    setShowMintButton(false);
    toast.success("\ud83d\udcdc Certificate minted successfully!");
  } catch (err) {
    toast.error("Failed to mint certificate.");
  } finally {
    setLoading(false);
  }
};
    const restartTest = () => {
      setCurrentQuestion(0);
      setAnswers({});
      setScore(0);
      setIsSubmitted(false);
      setTimeLeft(300);
      setHasStarted(false);
      setTestPassed(false);
      setShowMintButton(false);
      setFinalPercentage(0);
    };

  if (!account) {
    return <div className="p-6 text-center text-red-400">Please connect your wallet to start the test.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {testType === 'entry' ? 'SkillBridge Entry Test' : 'Course Completion Quiz'}
        </h1>
        {hasStarted && !isSubmitted && (
          <div className="flex items-center gap-2 text-cyan-300">
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {!hasStarted ? (
        <div className="text-center mt-10 space-y-8">
          {testType === 'entry' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-mytofy-text-secondary">
              <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl p-4 border border-cyan-600">
                <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">1 Free Attempt</h3>
                <p className="text-sm">Your first test is free. Retakes cost 2 SBT.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl p-4 border border-cyan-600">
                <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">Time Limit: 3 Minutes</h3>
                <p className="text-sm">Answer as many questions as possible.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-cyan-600">
                <h3 className="text-lg font-semibold text-mytofy-accent-coral mb-1">Earn Tokens</h3>
                <p className="text-sm">Each correct answer = 1 SBT.</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-xl border border-cyan-700 text-left">
              <h2 className="text-xl text-cyan-300 font-semibold">Course Quiz Rules</h2>
              <ul className="list-disc ml-6 text-sm text-mytofy-text-secondary space-y-1">
                <li>Score at least {passingScore}% to pass.</li>
                <li>You have {Math.floor(timeLeft / 60)} minutes to finish.</li>
                <li>Certificate NFT is unlocked after passing.</li>
              </ul>
            </div>
          )}

          <div className="mt-6">
            {loading ? <Loader /> : (
              <button
                onClick={handleQuizStart}
                className="transition-all px-6 py-3 rounded-xl font-semibold text-lg bg-cyan-500 hover:bg-cyan-700"
              >
                {testType === 'entry'
                  ? userData?.hasCompletedTest ? "Retake Test (2 SBT)" : "Start Test"
                  : "Start Course Quiz"}
              </button>
            )}
          </div>
        </div>
      ) : !isSubmitted ? (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="w-full max-w-xs bg-gray-700 rounded-full h-2 ml-4">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">{questions[currentQuestion]?.question}</h2>
          <div className="grid gap-3">
            {Object.entries(questions[currentQuestion]?.options || {}).map(([key, option]) => (
              <button
                key={key}
                className={`border px-4 py-3 rounded-lg text-left transition-all ${
                  answers[currentQuestion] === key 
                    ? 'bg-cyan-600 border-cyan-400 text-white' 
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-cyan-500'
                }`}
                onClick={() => handleAnswer(currentQuestion, key)}
              >
                <span className="font-semibold">{key.toUpperCase()}.</span> {option}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentQuestion === 0 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-cyan-400 hover:bg-cyan-600 hover:text-white'
              }`}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
            >
              ← Previous
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button 
                className="px-4 py-2 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg transition-all" 
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-all disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      ) : (
        // Results Section
        <div className="text-center mt-10">
          {testType === 'entry' ? (
            // Entry Test Results
            <div className="space-y-6">
              <Award size={48} className="mx-auto text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">Entry Test Completed!</h2>
                <div className="bg-gray-800 rounded-xl p-6 border border-cyan-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-gray-300">Score:</p>
                      <p className="text-2xl font-bold text-cyan-300">{score} / {questions.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Percentage:</p>
                      <p className="text-2xl font-bold text-cyan-300">{finalPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-lg text-yellow-400 font-semibold">
                      🎉 You've earned {score} SBT tokens!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all font-semibold"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
                  onClick={restartTest}
                >
                  Retake Test
                </button>
              </div>
            </div>
          ) : (
            // Course Test Results
            <div className="space-y-6">
              {testPassed ? (
                // Passed Course Test
                <div>
                  <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                  <h2 className="text-2xl font-bold text-green-400 mb-2">Congratulations! 🎉</h2>
                  <p className="text-lg text-gray-300 mb-4">You passed the course quiz!</p>
                  
                  <div className="bg-green-900/30 rounded-xl p-6 border border-green-600 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-300">Your Score:</p>
                        <p className="text-2xl font-bold text-green-300">{score} / {questions.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Percentage:</p>
                        <p className="text-2xl font-bold text-green-300">{finalPercentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Required:</p>
                        <p className="text-2xl font-bold text-cyan-300">{passingScore}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500 mb-6">
                    <Trophy size={32} className="mx-auto text-yellow-400 mb-2" />
                    <h3 className="text-xl font-semibold text-purple-300 mb-2">Certificate Unlocked!</h3>
                   {
                    showMintButton?(
                     <>
                        <p className="text-gray-300 mb-4">You can now mint your course completion certificate as an NFT.</p>
                      <button
                        onClick={handleMintCertificate}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-white"
                      >
                        Mint Certificate NFT
                      </button>
                     </>
                    ):(<p>Certificate minted successfully</p>)
                   }
                  </div>
                </div>
              ) : (
                // Failed Course Test
                <div>
                  <XCircle size={48} className="mx-auto text-red-400 mb-4" />
                  <h2 className="text-2xl font-bold text-red-400 mb-2">Quiz Not Passed</h2>
                  <p className="text-lg text-gray-300 mb-4">You need to score higher to pass this course.</p>
                  
                  <div className="bg-red-900/30 rounded-xl p-6 border border-red-600 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-300">Your Score:</p>
                        <p className="text-2xl font-bold text-red-300">{score} / {questions.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Percentage:</p>
                        <p className="text-2xl font-bold text-red-300">{finalPercentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Required:</p>
                        <p className="text-2xl font-bold text-cyan-300">{passingScore}%</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-red-700">
                      <p className="text-red-300">
                        You need {(passingScore - finalPercentage).toFixed(1)}% more to pass.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="px-6 py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-all font-semibold"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
                  onClick={restartTest}
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Test;