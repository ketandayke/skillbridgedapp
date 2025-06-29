import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

import ProfileForm from '../components/Profile/ProfileForm';
import Achievements from '../components/Profile/Achievements';
import LearningJourney from '../components/Profile/LearningJourney';
import NFTCollection from '../components/Profile/NFTcollection';
const Profile = () => {
  const navigate = useNavigate();
  const {
    account,
    getTokenBalance,
    getUserData,
    getUserProfileCID,
    getUserCertificates
  } = useWeb3();

  const [userData, setUserData] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [profileMetadata, setProfileMetadata] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎯 Example mock NFTs
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        console.log("📦 Calling getUserCertificates for:", account);
        const result = await getUserCertificates(account);
        console.log("this is result", result);
        setCertificates(result);
      } catch (e) {
        console.error("❌ Failed to load user certificates:", e);
      }
    };
  
    if (account) loadNFTs();
  }, [account]);
  

  // 🎯 Example Achievements
  const getAchievements = () => [
    {
      id: '1',
      title: 'Quick Learner',
      description: 'Completed 3 courses in a week',
      icon: 'star',
      unlocked: (userData?.coursesCompleted || 0) >= 3,
    },
    {
      id: '2',
      title: 'Test Champion',
      description: 'Scored 10/10 on entry test',
      icon: 'target',
      unlocked: userData?.testScore === 10,
    },
    {
      id: '3',
      title: 'Token Collector',
      description: 'Earned 1000+ SKL tokens',
      icon: 'coins',
      unlocked: tokenBalance >= 1000,
    },
  ];

  // 🧠 Load Profile Data
  useEffect(() => {
    const fetchData = async () => {
      if (!account) return;
      setLoading(true);
      try {
        const [user, balance, cid] = await Promise.all([
          getUserData(),
          getTokenBalance(),
          getUserProfileCID(account),
        ]);

        setUserData(user);
        setTokenBalance(balance);
        console.log("this is cid",cid);
        if (cid) {
          const ipfsURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
          const res = await axios.get(ipfsURL);
          console.log("this is profile data",res);
          setProfileMetadata(res.data);
        } else {
          toast('No profile metadata found on IPFS');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Error loading profile');
      }
      setLoading(false);
    };

    fetchData();
  }, [account]);

  if (!account) {
    return (
      <div className="p-6 text-center text-red-400">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-cyan-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-8">
        <div className='text-black'>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your SkillBridge account</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* ✅ Profile Info Form */}
      <ProfileForm profile={profileMetadata} setProfile={setProfileMetadata} />

      {/* 🔢 Stats (Light Theme) */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* SBT Tokens */}
      <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-gray-500 mb-1">SBT Tokens</p>
        <p className="text-2xl font-bold text-yellow-500">{tokenBalance}</p>
      </div>

      {/* Courses Completed */}
      <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-gray-500 mb-1">Courses Completed</p>
        <p className="text-2xl font-bold text-green-500">{userData?.coursesCompleted || 0}</p>
      </div>

      {/* NFTs Earned */}
      <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition">
        <p className="text-sm text-gray-500 mb-1">NFTs Earned</p>
        <p className="text-2xl font-bold text-purple-600">{certificates.length}</p>
      </div>

  {/* Test Score */}
  <div className="bg-white p-6 rounded-xl border border-cyan-200 shadow-sm hover:shadow-md transition">
    <p className="text-sm text-gray-500 mb-1">Test Score</p>
    <p className="text-2xl font-bold text-cyan-600">{userData?.testScore || 0}/10</p>
  </div>
</div>


      {/* 🏆 NFT & Achievements */}
      <NFTCollection nfts={certificates} />
      <Achievements achievements={getAchievements()} />

      {/* 🚀 Learning Progress */}
      <LearningJourney user={userData} />
    </div>
  );
};

export default Profile;
