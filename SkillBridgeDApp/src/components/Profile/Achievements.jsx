// src/components/Profile/Achievements.jsx
import React from 'react';
import { Trophy, Star, Coins, Target, CheckCircle } from 'lucide-react';

const iconMap = {
  trophy: Trophy,
  star: Star,
  coins: Coins,
  target: Target
};

export default function Achievements({ achievements }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
        <Trophy /> Achievements
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((a) => {
          const Icon = iconMap[a.icon] || Trophy;
          return (
            <div key={a.id} className={`p-4 rounded-lg border ${a.unlocked ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
              <div className="flex gap-3 items-center">
                <Icon className={a.unlocked ? 'text-yellow-400' : 'text-gray-500'} />
                <div>
                  <h3 className={a.unlocked ? 'text-white' : 'text-gray-500'}>{a.title}</h3>
                  <p className="text-sm text-gray-400">{a.description}</p>
                </div>
                {a.unlocked && <CheckCircle className="text-green-400 ml-auto" size={18} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
