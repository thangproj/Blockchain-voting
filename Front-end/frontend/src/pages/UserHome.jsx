import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaVoteYea, FaCheckCircle, FaChartBar } from "react-icons/fa";

export default function UserHome() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");

  useEffect(() => {
    async function getAccount() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          navigate("/");
        } else {
          setAccount(accounts[0]);
        }
      } else {
        navigate("/");
      }
    }
    getAccount();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 to-blue-100 px-2">
      <div className="w-full max-w-lg mx-auto bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col gap-6 border border-indigo-100">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-indigo-800 mb-1 drop-shadow">🎉 Chào mừng đến hệ thống Bầu Cử!</h1>
          <div className="text-sm text-gray-500">Ví của bạn: 
            <span className="font-mono bg-gray-100 rounded px-2 py-1 ml-2 text-xs">{account}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 mt-2">
          <button
            className="flex items-center gap-3 justify-center w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-700 shadow-lg transition text-white text-lg font-semibold tracking-wide group"
            onClick={() => navigate("/user/elections")}
          >
            <FaVoteYea className="text-2xl group-hover:scale-110 transition" />
            <span>Xem các cuộc bầu cử đang diễn ra</span>
          </button>
          <button
            className="flex items-center gap-3 justify-center w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-700 shadow-lg transition text-white text-lg font-semibold tracking-wide group"
            onClick={() => navigate("/user/my-votes")}
          >
            <FaCheckCircle className="text-2xl group-hover:scale-110 transition" />
            <span>Kiểm tra trạng thái bỏ phiếu của bạn</span>
          </button>
          <button
            className="flex items-center gap-3 justify-center w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-700 shadow-lg transition text-white text-lg font-semibold tracking-wide group"
            onClick={() => navigate("/user/results")}
          >
            <FaChartBar className="text-2xl group-hover:scale-110 transition" />
            <span>Xem kết quả bầu cử sau khi kết thúc</span>
          </button>
          <button
            className="flex items-center gap-3 justify-center w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-700 shadow-lg transition text-white text-lg font-semibold tracking-wide group"
            onClick={() => navigate("/user/vote-log")}
          >
            <FaChartBar className="text-2xl group-hover:scale-110 transition" />
            <span>Xem lịch sử bỏ phiếu</span>
          </button>
        </div>
        <div className="text-xs text-gray-400 text-center mt-4">
          © {new Date().getFullYear()} Voting DApp | Bảo mật và minh bạch trên Blockchain
        </div>
      </div>
    </div>
  );
}
