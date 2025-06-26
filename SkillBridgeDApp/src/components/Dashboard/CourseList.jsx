// src/components/Dashboard/CourseList.jsx
import { BookOpen, Play, Clock, ShoppingCart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseList({ courses, type, onEnroll, currentTokenBalance, purchaseLoading }) {
  const navigate = useNavigate();
  const isEnrolledSection = type === "enrolled";

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {isEnrolledSection ? <Play className="text-cyan-400" /> : <BookOpen className="text-cyan-400" />}
        {isEnrolledSection ? "Continue Learning" : "Available Courses"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {courses.map(course => (
          <div key={course.courseId} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition">
            <div className="h-40 bg-gray-700 flex items-center justify-center">
              {course.thumbnailCid ? (
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${course.thumbnailCid}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={32} className="text-cyan-400" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2 text-sm">{course.title}</h3>
              <p className="text-gray-400 text-xs mb-2">by {course.instructor?.slice(0, 10)}...</p>
              {course.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock size={10} />
                  <span>{course.duration}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                {isEnrolledSection ? (
                  <button onClick={() => navigate(`/courses/${course.courseId}`)} className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 text-sm">
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => onEnroll(course.courseId, course.price)}
                    disabled={purchaseLoading[course.courseId] || currentTokenBalance < course.price}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                      currentTokenBalance < course.price ? "bg-gray-600 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                  >
                    {purchaseLoading[course.courseId] ? (
                      "Enrolling..."
                    ) : (
                      <>
                        <ShoppingCart size={12} />
                        Enroll
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
