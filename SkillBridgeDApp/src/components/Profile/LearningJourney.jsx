// src/components/Profile/LearningJourney.jsx
import React from 'react';
import { CheckCircle, Clock, Medal, Target } from 'lucide-react';

export default function LearningJourney({ user }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Learning Journey</h2>
      <div className="space-y-4">
        <div className="flex justify-between p-4 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            <div>
              <p className="font-semibold">Joined SkillBridge</p>
              <p className="text-sm text-gray-400">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="text-sm text-green-400">Completed</div>
        </div>

        <div className="flex justify-between p-4 bg-gray-700 rounded">
          <div className="flex items-center gap-3">
            <Target className="text-yellow-400" />
            <div>
              <p className="font-semibold">Entry Test Score</p>
              <p className="text-sm text-gray-400">{user?.testScore || 0}/10</p>
            </div>
          </div>
          <div className="text-sm text-yellow-400">Completed</div>
        </div>

        <div className="flex justify-between p-4 bg-gray-700 rounded opacity-60">
          <div className="flex items-center gap-3">
            <Medal className="text-gray-500" />
            <div>
              <p className="font-semibold text-gray-400">Earn NFT Certificate</p>
              <p className="text-sm text-gray-500">Pass course quiz to earn</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
      </div>
    </div>
  );
}
