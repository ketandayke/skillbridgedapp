// src/components/Dashboard/QuickActions.jsx
import { Target, ShoppingCart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ hasCompletedTest }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          icon={<Target size={20} className="text-cyan-400" />}
          title={hasCompletedTest ? "Retake Test" : "Take Test"}
          subtitle={hasCompletedTest ? "Improve your score" : "Earn tokens"}
          onClick={() => navigate("/test")}
        />
        <ActionCard
          icon={<ShoppingCart size={20} className="text-green-400" />}
          title="Buy Tokens"
          subtitle="Purchase with ETH"
          onClick={() => navigate("/buy-tokens")}
        />
        <ActionCard
          icon={<Award size={20} className="text-purple-400" />}
          title="Create Course"
          subtitle="Share your knowledge"
          onClick={() => navigate("/create-course")}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
    >
      {icon}
      <div className="text-left">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </button>
  );
}
