// src/components/Courses/CourseCard.jsx
import React from 'react';
import { Zap, BookOpen, Clock, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, userTokens, tokenLoading, onEnroll }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow border hover:shadow-lg transition duration-300 overflow-hidden group">
      {/* Thumbnail */}
      <div className="h-44 bg-gray-200 relative">
        {course.thumbnailCid ? (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${course.thumbnailCid}`}
            alt={course.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <BookOpen className="text-white opacity-70 w-10 h-10" />
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-3 left-3">
          <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full capitalize">
            {course.difficulty || 'General'}
          </span>
        </div>
        {course.isEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            {course.enrollmentCount || 0}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-gray-700 font-medium">
            <Zap className="text-indigo-600 w-4 h-4" />
            <span>{course.price} Tokens</span>
          </div>
          {course.isEnrolled ? (
            <button
              onClick={() => navigate(`/courses/${course.courseId}`)}
              className="text-sm px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              Watch
            </button>
          ) : (
            <button
              onClick={() => onEnroll(course.courseId, course.price)}
              disabled={userTokens < course.price || tokenLoading}
              className={`text-sm px-4 py-2 rounded ${
                userTokens >= course.price && !tokenLoading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {tokenLoading ? 'Processing...' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
