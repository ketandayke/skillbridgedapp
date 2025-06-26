// src/components/Profile/NFTCollection.jsx
import React from 'react';
import { Award, ExternalLink } from 'lucide-react';

export default function NFTCollection({ nfts = [] }) {
  if (!nfts.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-400">
        <Award /> NFT Certificates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="bg-gray-800 border border-purple-600 rounded-lg p-4">
            <h3 className="text-lg font-bold">{nft.name}</h3>
            <p className="text-gray-400">{nft.course}</p>
            <p className="text-sm text-gray-500">Earned: {nft.date}</p>
            <button className="mt-3 px-4 py-2 bg-purple-700 rounded hover:bg-purple-800 flex items-center gap-2 text-sm">
              <ExternalLink size={14} /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
