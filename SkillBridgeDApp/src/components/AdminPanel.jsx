// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Coins, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const {
    account,
    isContractOwner,
    getContractTokenBalance,
    fundContract,
    tokenBalance,
    transferTokens, // 🆕 you must add this in Web3Context (code below)
  } = useWeb3();

  const [isOwner, setIsOwner] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Transfer token state
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transfering, setTransfering] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      const ownerStatus = await isContractOwner();
      setIsOwner(ownerStatus);
    };
    checkOwnership();
  }, [account]);

  useEffect(() => {
    const fetchContractBalance = async () => {
      const balance = await getContractTokenBalance();
      setContractBalance(balance);
    };
    fetchContractBalance();
  }, [getContractTokenBalance]);

  const handleFundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error("Enter a valid fund amount");
      return;
    }
    setLoading(true);
    try {
      await fundContract(fundAmount);
      setFundAmount('');
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch (err) {
      toast.error("Funding failed");
    }
    setLoading(false);
  };

  const handleQuickFund = async (amount) => {
    setLoading(true);
    try {
      await fundContract(amount);
      const newBalance = await getContractTokenBalance();
      setContractBalance(newBalance);
    } catch (err) {
      toast.error("Quick fund failed");
    }
    setLoading(false);
  };

  const handleTokenTransfer = async () => {
    if (!recipient || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error("Invalid recipient or amount");
      return;
    }

    setTransfering(true);
    try {
      await transferTokens(recipient, transferAmount);
      toast.success(`Transferred ${transferAmount} SBT`);
      setRecipient('');
      setTransferAmount('');
    } catch (err) {
      toast.error("Transfer failed");
    }
    setTransfering(false);
  };

  if (!isOwner) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span>👑</span> Admin Panel
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 💰 Token Info & Fund Section */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Token Balances</h3>
            <div className="flex justify-between text-sm text-gray-300">
              <span>Your Balance</span>
              <span className="font-bold text-green-400">{tokenBalance} SBT</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300 mt-2">
              <span>Contract Balance</span>
              <span className="font-bold text-cyan-400">{contractBalance} SBT</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Fund Contract</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {[1000, 5000, 10000].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleQuickFund(amount)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                  disabled={loading}
                >
                  {amount} SBT
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
                placeholder="Custom amount"
              />
              <button
                onClick={handleFundContract}
                disabled={loading || !fundAmount}
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
              >
                {loading ? 'Funding...' : 'Fund'}
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Transfer Token Form */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Transfer Tokens</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            />
            <input
              type="number"
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            />
            <button
              onClick={handleTokenTransfer}
              disabled={transfering}
              className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              <Send size={18} className="mr-2" />
              {transfering ? "Transferring..." : "Send Tokens"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
