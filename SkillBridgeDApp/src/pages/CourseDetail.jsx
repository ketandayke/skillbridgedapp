import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, CheckCircle, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from '../context/Web3Context';
import IngestVectorButton from "../components/IngestVectorButton";
import CourseAIChat from "../components/CourseAiChat";
import axios from "axios";
import { fetchTextFromCid } from '../utils/ipfsFetcher';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getCourseDetails,
    hasAccessToCourse,
    account,
    enrollInCourse,
    getCertifiatesNFTID,
    contractsLoaded,
  } = useWeb3();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userTokens, setUserTokens] = useState(250);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [vectorInfo, setVectorInfo] = useState({ collection: null, documentCount: 0 });
  const [description, setDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [hasCompletedCourse, setHasCompletedCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 border-green-500';
      case 'Intermediate': return 'text-yellow-600 border-yellow-500';
      case 'Advanced': return 'text-red-600 border-red-500';
      default: return 'text-gray-500 border-gray-400';
    }
  }, []);

  const handleMarkCompleted = useCallback(() => {
    navigate(`/test?type=course&courseId=${id}`);
  }, [navigate, id]);

  const handleBackToCourses = useCallback(() => {
    navigate("/courses");
  }, [navigate]);

  const handleGoToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);
  console.log("this is contrract loaded",contractsLoaded);
  // Updated loadCourse function in CourseDetail.jsx

const loadCourse = useCallback(async () => {
  // ✅ Add timeout/fallback logic
  if (!id) {
    setError("Course ID is missing");
    setLoading(false);
    return;
  }

  if (!account) {
    setError("Please connect your wallet first");
    setLoading(false);
    return;
  }

  if (!contractsLoaded) {
    console.log("⏳ Waiting for contracts to load...");
    return; // Don't set error yet, just wait
  }

  try {
    setLoading(true);
    setError(null);

    const [details, enrolled, nftId] = await Promise.all([
      getCourseDetails(id),
      hasAccessToCourse(account, id),
      getCertifiatesNFTID({ account, courseId: id })
    ]);

    setCourseData(details);
    setIsEnrolled(enrolled);
    setHasCompletedCourse(nftId && BigInt(nftId) >= 0n);

    const textPromises = [];
    if (details.descriptionCid) textPromises.push(fetchTextFromCid(details.descriptionCid).then(t => ['description', t]));
    if (details.prerequisitesCid) textPromises.push(fetchTextFromCid(details.prerequisitesCid).then(t => ['prerequisites', t]));
    if (details.learningOutcomesCid) textPromises.push(fetchTextFromCid(details.learningOutcomesCid).then(t => ['outcomes', t]));

    const textResults = await Promise.allSettled(textPromises);
    textResults.forEach(({ status, value }) => {
      if (status === 'fulfilled') {
        const [field, text] = value;
        if (field === 'description') setDescription(text);
        if (field === 'prerequisites') setPrerequisites(text);
        if (field === 'outcomes') setOutcomes(text);
      }
    });
  } catch (err) {
    console.error("Error loading course", err);
    setError("Failed to load course. Please try again.");
  } finally {
    setLoading(false);
  }
}, [id, account, contractsLoaded, getCourseDetails, hasAccessToCourse, getCertifiatesNFTID]);

// ✅ Add timeout effect to prevent infinite loading
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (!contractsLoaded && !error) {
      setError("Contracts are taking too long to load. Please refresh the page.");
      setLoading(false);
    }
  }, 10000); // 10 second timeout

  return () => clearTimeout(timeoutId);
}, [contractsLoaded, error]);

  const loadVectorInfo = useCallback(async (metadataCid) => {
    if (!metadataCid) return;
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/vector/courses/info/${metadataCid}`);
      setVectorInfo(data);
    } catch (err) {
      console.warn("Vector info fetch failed", err);
    }
  }, [BACKEND_URL]);

  const handleEnrollment = useCallback(async () => {
    if (!courseData || userTokens < courseData.price) {
      alert(`You need ${courseData.price - userTokens} more tokens.`);
      return;
    }
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      setUserTokens(prev => prev - courseData.price);
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Enrollment failed.");
    }
  }, [courseData, userTokens, enrollInCourse, id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (courseData?.metadataCid) loadVectorInfo(courseData.metadataCid);
  }, [courseData?.metadataCid, loadVectorInfo]);

  const enrollmentSection = useMemo(() => {
    if (!courseData) return null;
    return (
      <div className="bg-white shadow-lg p-4 rounded-xl border border-gray-200 text-center transition hover:scale-105">
        <h3 className="text-2xl font-bold text-cyan-600 mb-3">{courseData?.price} Tokens</h3>
        {isEnrolled ? (
          <div className="flex items-center justify-center bg-green-100 text-green-600 py-2 rounded-md">
            <CheckCircle className="w-5 h-5 mr-2" />
            Enrolled
          </div>
        ) : (
          <button
            onClick={handleEnrollment}
            disabled={userTokens < (courseData?.price || 0)}
            className={`w-full py-3 mt-2 rounded-lg font-semibold transition-all ${
              userTokens >= (courseData?.price || 0)
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Enroll Now
          </button>
        )}
      </div>
    );
  }, [courseData, isEnrolled, userTokens, handleEnrollment]);

  const completionSection = useMemo(() => {
    if (!isEnrolled) return null;
    return hasCompletedCourse ? (
      <div className="text-center bg-green-50 p-6 rounded-xl border border-green-300 shadow">
        <h2 className="text-xl font-bold text-green-600">🎉 Congratulations!</h2>
        <p className="text-green-500 mt-2">You’ve completed the course! Your NFT is in your <strong>Profile</strong>.</p>
        <button onClick={handleGoToProfile} className="mt-3 px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition">
          Go to Profile
        </button>
      </div>
    ) : (
      <div className="text-center">
        <button
          onClick={handleMarkCompleted}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 text-white font-semibold shadow transition-all"
        >
          Mark Completed & Attempt Quiz
        </button>
      </div>
    );
  }, [isEnrolled, hasCompletedCourse, handleGoToProfile, handleMarkCompleted]);

  // Rendering
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
          <p className="text-lg font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadCourse} className="px-4 py-2 bg-cyan-600 text-white rounded shadow hover:bg-cyan-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p>Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-800 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={handleBackToCourses} className="text-black bg-blue-500 hover:text-cyan-600 flex items-center transition">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Courses
        </button>

        {isEnrolled && (
          <div className="h-[600px] flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/5 w-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              {showVideoPlayer ? (
                <video
                  controls
                  className="w-full h-[600px] object-cover"
                  src={`https://gateway.pinata.cloud/ipfs/${courseData.videoCid}`}
                  preload="metadata"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500">
                  <button 
                    onClick={() => setShowVideoPlayer(true)} 
                    className="bg-white/20 p-5 rounded-full backdrop-blur-md hover:scale-110 transition-all"
                  >
                    <Play className="w-10 h-10 text-white" />
                  </button>
                </div>
              )}
              <div className="p-4">{enrollmentSection}</div>
            </div>

            <div className="lg:w-2/5 w-full h-[600px] bg-white p-4 rounded-xl shadow border border-gray-200 overflow-y-auto">
              {vectorInfo.documentCount === 0 ? (
                <>
                  <IngestVectorButton courseId={id} courseData={courseData} />
                  <p className="text-sm text-yellow-500 mt-2">Feed course data to enable AI Chat.</p>
                </>
              ) : (
                <CourseAIChat courseMetadataCid={courseData.metadataCid} />
              )}
            </div>
          </div>
        )}

        <div className="space-y-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex gap-3 mb-3">
              <span className={`text-sm px-3 py-1 rounded-full border ${getDifficultyColor(courseData.difficulty)}`}>
                {courseData.difficulty}
              </span>
              <span className="text-sm px-3 py-1 rounded-full border text-indigo-500 border-indigo-400">
                {courseData.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
            {description && <p className="text-gray-700 whitespace-pre-wrap mb-4">{description}</p>}
            {prerequisites && (
              <>
                <h2 className="text-xl font-semibold text-cyan-600 mt-4">Prerequisites</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{prerequisites}</p>
              </>
            )}
            {outcomes && (
              <>
                <h2 className="text-xl font-semibold text-cyan-600 mt-4">Learning Outcomes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{outcomes}</p>
              </>
            )}
          </div>

          {completionSection}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
