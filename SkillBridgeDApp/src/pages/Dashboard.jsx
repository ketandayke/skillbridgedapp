// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Coins, 
  TrendingUp, 
  Play, 
  Star, 
  Clock, 
  Users,
  ShoppingCart,
  Trophy,
  Target,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminPanel from '../components/AdminPanel'; // Adjust path as needed
import StatsCards from "../components/Dashboard/StatsCards";
import CourseList from "../components/Dashboard/CourseList";
import QuickActions from "../components/Dashboard/QuickActions";

const Dashboard = () => {
  const { 
    account, 
    getUserData, 
    enrollInCourse, 
    getTokenBalance, 
    getAllCourses,
    hasAccessToCourse,
    tokenBalance,
    refreshTokenBalance
  } = useWeb3();
  
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      if (account) {
        setLoading(true);
        try {
          const [userDataFromChain, balance, coursesFromChain] = await Promise.all([
            getUserData(),
            getTokenBalance(),
            getAllCourses()
          ]);

          setUserData(userDataFromChain);
          setCurrentTokenBalance(parseFloat(balance) || 0);

          const enrollmentPromises = coursesFromChain.map(async (course) => {
            const hasAccess = await hasAccessToCourse(account, course.courseId);
            return { ...course, isEnrolled: hasAccess };
          });

          const coursesWithEnrollment = await Promise.all(enrollmentPromises);
          setAllCourses(coursesWithEnrollment);

          const enrolled = coursesWithEnrollment.filter(course => course.isEnrolled);
          const available = coursesWithEnrollment.filter(course => !course.isEnrolled);

          setEnrolledCourses(enrolled);
          setCompletedCourses([]);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Error loading dashboard data');
        }
        setLoading(false);
      }
    };

    fetchAllData();
  }, [account, getUserData, getTokenBalance, getAllCourses, hasAccessToCourse]);

  useEffect(() => {
    if (tokenBalance) {
      setCurrentTokenBalance(parseFloat(tokenBalance) || 0);
    }
  }, [tokenBalance]);

  const handleEnrollInCourse = async (courseId, price) => {
    if (currentTokenBalance < price) {
      toast.error(`Insufficient tokens. You need ${price} SKL tokens.`);
      return;
    }

    setPurchaseLoading({ ...purchaseLoading, [courseId]: true });
    try {
      await enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      await refreshTokenBalance();
      const updatedUserData = await getUserData();
      setUserData(updatedUserData);

      const updatedCourses = allCourses.map(course => {
        if (course.courseId === courseId) {
          return { ...course, isEnrolled: true };
        }
        return course;
      });

      setAllCourses(updatedCourses);
      setEnrolledCourses(prev => [...prev, updatedCourses.find(c => c.courseId === courseId)]);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
    setPurchaseLoading({ ...purchaseLoading, [courseId]: false });
  };

  if (!account) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 text-center text-red-500">
        <div className="max-w-xl mx-auto mt-20 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <Trophy size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Access Denied</h2>
          <p className="text-slate-600">Please connect your wallet to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 text-center">
        <div className="max-w-xl mx-auto mt-20 bg-white/80 backdrop-blur-md rounded-xl p-8 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <AdminPanel />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-slate-800">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <Coins size={20} className="text-yellow-500" />
            <span className="font-semibold text-slate-800">{currentTokenBalance.toFixed(2)} SBT</span>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <StatsCards userData={userData} enrolledCount={enrolledCourses.length} />
      </div>

      {/* Enrolled Courses */}
      <div className="mb-8">
        <CourseList 
          courses={enrolledCourses} 
          type="enrolled" 
          onEnroll={handleEnrollInCourse} 
        />
      </div>

      {/* Available Courses */}
      <div className="mb-8">
        <CourseList 
          courses={allCourses.filter(course => !course.isEnrolled).slice(0, 4)}
          type="available"
          onEnroll={handleEnrollInCourse}
          currentTokenBalance={currentTokenBalance}
          purchaseLoading={purchaseLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <QuickActions hasCompletedTest={userData?.hasCompletedTest} />
      </div>
    </div>
  );
};

export default Dashboard;
