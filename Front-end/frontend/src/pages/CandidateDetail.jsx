import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function CandidateDetail() {
  const { electionId, candidateId } = useParams(); // Nhớ map đúng param
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);

        // Lấy candidate details
        const res = await contract.getCandidate(Number(electionId), Number(candidateId));
        // Solidity: (uint, string, string, string, string, uint, bool)
        setCandidate({
          id: res[0].toNumber ? res[0].toNumber() : Number(res[0]),
          name: res[1],
          bio: res[2],
          achievements: res[3],
          image: res[4],
          voteCount: res[5].toNumber ? res[5].toNumber() : Number(res[5]),
          isActive: res[6]
        });
      } catch (err) {
        setCandidate(null);
      }
      setLoading(false);
    }
    fetchCandidate();
  }, [electionId, candidateId]);

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Đang tải thông tin ứng viên...</div>;

  if (!candidate)
    return <div className="text-center mt-10 text-red-600">Không tìm thấy ứng viên.</div>;

  // Tách chính sách
  let achievementsText = candidate.achievements;
  let policiesText = "";
  if (candidate.achievements.includes("--- Chính sách tranh cử ---")) {
    [achievementsText, policiesText] = candidate.achievements.split("--- Chính sách tranh cử ---");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-purple-50 px-4 py-10">
      <div className="w-full max-w-2xl bg-white/95 rounded-3xl shadow-2xl p-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 hover:underline"
        >
          ← Quay lại
        </button>
        <div className="flex flex-col items-center text-center">
          <img
            src={candidate.image}
            alt={candidate.name}
            className="w-40 h-40 rounded-full border-4 border-indigo-300 shadow-lg mb-3 object-cover"
          />
          <h1 className="text-3xl font-extrabold text-indigo-800 mb-1 drop-shadow">{candidate.name}</h1>
          <div className="flex flex-col items-center gap-1 mt-1">
            <span className="text-gray-500 italic text-sm">
              {candidate.isActive ? (
                <span className="text-green-600 font-semibold">Đang hiển thị</span>
              ) : (
                <span className="text-red-600 font-semibold">Ứng viên đã bị ẩn</span>
              )}
            </span>
            <span className="text-indigo-600 font-bold text-lg mt-1">
              🗳️ {candidate.voteCount} phiếu đã nhận
            </span>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">📌 Tiểu sử</h2>
            <p className="text-gray-700 whitespace-pre-line">{candidate.bio}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">🏅 Thành tích & Kinh nghiệm</h2>
            <p className="text-gray-700 whitespace-pre-line">{achievementsText}</p>
          </div>
          {policiesText && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">📋 Chính sách tranh cử</h2>
              <ul className="list-disc list-inside text-gray-700 whitespace-pre-line">
                {policiesText.split("\n").map((policy, idx) =>
                  <li key={idx}>{policy.trim()}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
