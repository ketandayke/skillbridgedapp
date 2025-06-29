import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from '../context/Web3Context';
import IngestVectorButton from "../components/IngestVectorButton";
import CourseAIChat from "../components/CourseAiChat";
import axios from "axios";
import { fetchTextFromCid } from '../utils/ipfsFetcher';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
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

  const { getCourseDetails, hasAccessToCourse, account, enrollInCourse, getCertifiatesNFTID } = useWeb3();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Memoized functions to prevent unnecessary re-renders
  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
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

  // Optimized course loading with error handling and loading states
  const loadCourse = useCallback(async () => {
    if (!id || !account) return;
    
    try {
      setLoading(true);
      setError(null);

      // Parallel API calls for better performance
      const [details, enrolled, nftId] = await Promise.all([
        getCourseDetails(id),
        hasAccessToCourse(account, id),
        getCertifiatesNFTID({ account, courseId: id })
      ]);

      setCourseData(details);
      setIsEnrolled(enrolled);

      // Handle completion status
      if (nftId !== null) {
        const idBigInt = BigInt(nftId);
        setHasCompletedCourse(idBigInt >= 0n);
      } else {
        setHasCompletedCourse(false);
      }

      // Parallel text fetching for better performance
      const textPromises = [];
      if (details.descriptionCid) {
        textPromises.push(fetchTextFromCid(details.descriptionCid).then(text => ['description', text]));
      }
      if (details.prerequisitesCid) {
        textPromises.push(fetchTextFromCid(details.prerequisitesCid).then(text => ['prerequisites', text]));
      }
      if (details.learningOutcomesCid) {
        textPromises.push(fetchTextFromCid(details.learningOutcomesCid).then(text => ['outcomes', text]));
      }

      // Wait for all text fetches and update state once
      const textResults = await Promise.allSettled(textPromises);
      textResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const [field, text] = result.value;
          switch (field) {
            case 'description':
              setDescription(text);
              break;
            case 'prerequisites':
              setPrerequisites(text);
              break;
            case 'outcomes':
              setOutcomes(text);
              break;
          }
        }
      });

    } catch (err) {
      console.error("Error loading course", err);
      setError("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, account, getCourseDetails, hasAccessToCourse, getCertifiatesNFTID]);

  // Load vector info with debouncing
  const loadVectorInfo = useCallback(async (metadataCid) => {
    if (!metadataCid) return;
    
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/vector/courses/info/${metadataCid}`);
      setVectorInfo(data);
    } catch (err) {
      console.error("Vector DB info fetch failed", err);
      // Don't show error to user for vector info, it's not critical
    }
  }, [BACKEND_URL]);

  // Optimized enrollment handler
  const handleEnrollment = useCallback(async () => {
    if (!courseData) return;
    if (userTokens < courseData.price) {
      alert(`You need ${courseData.price - userTokens} more tokens to enroll.`);
      return;
    }

    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      setUserTokens(prev => prev - courseData.price);
    } catch (err) {
      console.error("Enrollment failed", err);
      alert("Enrollment failed. Please try again.");
    }
  }, [courseData, userTokens, enrollInCourse, id]);

  // Effects with proper dependencies
  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (courseData?.metadataCid) {
      loadVectorInfo(courseData.metadataCid);
    }
  }, [courseData?.metadataCid, loadVectorInfo]);

  // Memoized components for better performance
  const enrollmentSection = useMemo(() => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
      <h3 className="text-2xl font-bold text-yellow-400 mb-3">{courseData?.price} Tokens</h3>
      {isEnrolled ? (
        <div className="flex items-center justify-center bg-green-700/20 text-green-300 py-2 rounded-md">
          <CheckCircle className="w-5 h-5 mr-2" />
          Enrolled
        </div>
      ) : (
        <button
          onClick={handleEnrollment}
          disabled={userTokens < (courseData?.price || 0)}
          className={`w-full py-3 mt-2 rounded-lg font-semibold transition-all ${
            userTokens >= (courseData?.price || 0)
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Enroll Now
        </button>
      )}
    </div>
  ), [courseData?.price, isEnrolled, userTokens, handleEnrollment]);

  const completionSection = useMemo(() => {
    if (!isEnrolled) return null;

    return hasCompletedCourse ? (
      <div className="text-center bg-green-800/30 p-6 rounded-xl border border-green-500 mt-4 space-y-3">
        <h2 className="text-xl font-bold text-green-300">🎉 Congratulations!</h2>
        <p className="text-green-200">
          You have successfully completed this course.
          <br />
          Your NFT Certificate is available in your <strong>Profile</strong> section.
        </p>
        <button
          onClick={handleGoToProfile}
          className="mt-3 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Go to Profile
        </button>
      </div>
    ) : (
      <div className="text-center">
        <button
          onClick={handleMarkCompleted}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-semibold"
        >
          Mark Completed & Attempt Quiz
        </button>
      </div>
    );
  }, [isEnrolled, hasCompletedCourse, handleMarkCompleted, handleGoToProfile]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="ml-4">Loading course...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadCourse}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <button 
          onClick={handleBackToCourses} 
          className="text-gray-400 hover:text-cyan-400 flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Courses
        </button>

        {/* Video + AI Chat Side-by-Side */}
        {isEnrolled && (
          <div className="h-[600px] flex flex-col lg:flex-row gap-6">
            {/* Video Section (60%) */}
            <div className="lg:w-3/5 w-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
              {showVideoPlayer ? (
                <video
                  controls
                  className="w-full h-[600px] object-cover"
                  src={`https://gateway.pinata.cloud/ipfs/${courseData.videoCid}`}
                  preload="metadata"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-cyan-600 to-purple-700">
                  <button 
                    onClick={() => setShowVideoPlayer(true)} 
                    className="bg-white/10 p-5 rounded-full border border-white/30 hover:bg-white/20 transition-all"
                  >
                    <Play className="w-10 h-10 text-white" />
                  </button>
                </div>
              )}
              <div className="space-y-6 sticky top-10">
                {enrollmentSection}
              </div>
            </div>

            {/* AI Chat Section (40%) */}
            <div className="lg:w-2/5 w-full h-[600px] bg-gray-800 p-4 rounded-xl border border-gray-700 overflow-y-auto">
              {vectorInfo.documentCount === 0 ? (
                <>
                  <IngestVectorButton courseId={id} courseData={courseData} />
                  <p className="text-sm text-yellow-300 mt-2">Feed course data to enable AI Chat.</p>
                </>
              ) : (
                <CourseAIChat courseMetadataCid={courseData.metadataCid} />
              )}
            </div>
          </div>
        )}

        {/* Course Information */}
        <div className="space-y-6 mt-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex gap-3 mb-3">
              <span className={`text-sm px-3 py-1 rounded-full border ${getDifficultyColor(courseData.difficulty)}`}>
                {courseData.difficulty}
              </span>
              <span className="text-sm px-3 py-1 rounded-full border text-indigo-400 border-indigo-400">
                {courseData.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
            {description && (
              <p className="text-gray-300 whitespace-pre-wrap mb-4">{description}</p>
            )}

            {prerequisites && (
              <>
                <h2 className="text-xl font-semibold text-cyan-400 mt-4">Prerequisites</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{prerequisites}</p>
              </>
            )}

            {outcomes && (
              <>
                <h2 className="text-xl font-semibold text-cyan-400 mt-4">Learning Outcomes</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{outcomes}</p>
              </>
            )}
          </div>

          {/* Completion Section */}
          {completionSection}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;