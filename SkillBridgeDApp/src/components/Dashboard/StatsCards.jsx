// src/components/Dashboard/StatsCards.jsx
import { BookOpen, Award, CheckCircle, Target } from "lucide-react";

export default function StatsCards({ userData, enrolledCount }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <Card label="Courses Enrolled" value={enrolledCount} icon={<BookOpen />} color="text-cyan-400" />
      <Card label="Completed" value={userData?.coursesCompleted || 0} icon={<CheckCircle />} color="text-green-400" />
      <Card label="Tokens Earned" value={parseFloat(userData?.tokensEarned || 0).toFixed(2)} icon={<Award />} color="text-purple-400" />
      <Card label="Test Score" value={userData?.testScore || 0} icon={<Target />} color="text-yellow-400" />
    </div>
  );
}

function Card({ label, value, icon, color }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`text-2xl ${color}`}>{icon}</div>
    </div>
  );
}
