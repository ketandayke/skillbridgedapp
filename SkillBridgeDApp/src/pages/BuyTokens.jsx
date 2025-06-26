import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const BuyTokens = () => {
  const { 
    contracts, 
    account, 
    isConnected, 
    loading: web3Loading, 
    buyTokens 
  } = useWeb3();
  
  const [tokenAmount, setTokenAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const TOKEN_PRICE_ETH = 0.0001; // 1 SBT = 0.0001 ETH
  const isReady = contracts.skillBridge && account && isConnected && !web3Loading;

  const handleBuyTokens = async () => {
    if (!isConnected || !account) {
      return toast.error('Please connect your wallet');
    }

    if (!contracts.skillBridge) {
      return toast.error('Contracts not initialized');
    }

    const amount = parseInt(tokenAmount);
    if (!amount || amount <= 0) {
      return toast.error('Enter a valid token amount');
    }

    try {
      setLoading(true);
      await buyTokens(amount); // Pass number of tokens
      setTokenAmount('');
    } catch (error) {
      console.error('Token purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEthCost = () => {
    if (!tokenAmount || parseInt(tokenAmount) <= 0) return '0';
    return (parseInt(tokenAmount) * TOKEN_PRICE_ETH).toFixed(4);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md text-white">
        <h2 className="text-2xl font-semibold mb-6 text-center">Buy SBT Tokens</h2>

        {!isReady ? (
          <div className="text-center">
            <p className="text-yellow-400">Please connect wallet and wait...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-300">Number of Tokens</label>
              <input
                type="number"
                min="1"
                step="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter number of tokens (e.g. 100)"
              />
              {tokenAmount && (
                <p className="text-sm text-gray-400 mt-2">
                  ≈ {calculateEthCost()} ETH
                </p>
              )}
            </div>

            <div className="mb-6 p-3 bg-gray-700 rounded">
              <p className="text-sm text-gray-400">Exchange Rate:</p>
              <p className="text-sm">1 ETH = 10,000 SBT</p>
              <p className="text-xs text-gray-400 mt-1">(1 SBT = 0.0001 ETH)</p>
            </div>

            <button
              onClick={handleBuyTokens}
              disabled={loading || !tokenAmount || parseInt(tokenAmount) <= 0}
              className={`w-full py-3 rounded font-medium transition duration-300 ${
                loading || !tokenAmount
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading 
                ? 'Processing...' 
                : `Buy ${tokenAmount || 0} Tokens`}
            </button>

            <div className="mt-4 text-xs text-gray-400">
              <p>• You will pay {calculateEthCost()} ETH</p>
              <p>• Gas fees apply on top</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyTokens;
