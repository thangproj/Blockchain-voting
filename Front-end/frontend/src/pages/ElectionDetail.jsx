// src/pages/ElectionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

// Hàm xác định trạng thái và màu
function getElectionStatus(e) {
  const now = Date.now() / 1000;
  if (e.isEnded) return { label: "⛔ Đã kết thúc", className: "text-red-600" };
  if (!e.isActive && now < e.endTime.getTime() / 1000) return { label: "⏸️ Tạm dừng", className: "text-yellow-600" };
  if (now < e.startTime.getTime() / 1000) return { label: "🕒 Sắp bắt đầu", className: "text-blue-600" };
  if (now > e.endTime.getTime() / 1000) return { label: "⛔ Đã kết thúc", className: "text-red-600" };
  if (e.isActive) return { label: "🟢 Đang hoạt động", className: "text-green-600" };
  return { label: "⏸️ Tạm dừng", className: "text-yellow-600" };
}

export default function ElectionDetail() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadElection = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);

      const detail = await contract.getElectionDetails(Number(electionId));
      // Chú ý: detail[5] là isEnded (bool) trả về từ contract mới!
      const electionData = {
        id: Number(electionId),
        title: detail[0],
        startTime: new Date(Number(detail[1]) * 1000),
        endTime: new Date(Number(detail[2]) * 1000),
        isActive: detail[3],
        candidateCount: Number(detail[4]),
        isEnded: detail[5], // <- lấy thêm trường này
      };

      // Load all candidates for this election
      const candidateList = [];
      for (let i = 0; i < electionData.candidateCount; i++) {
        const res = await contract.getCandidate(Number(electionId), i);
        candidateList.push({
          id: res[0].toNumber ? res[0].toNumber() : Number(res[0]),
          name: res[1],
          bio: res[2],
          achievements: res[3],
          image: res[4],
          voteCount: res[5].toNumber ? res[5].toNumber() : Number(res[5]),
          // Nếu muốn ẩn ứng viên, thêm trường isActive (tuỳ contract)
          isActive: res[6] !== undefined ? res[6] : true,
        });
      }
      setElection(electionData);
      setCandidates(candidateList);
    } catch (err) {
      setElection(null);
      setCandidates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadElection();
    // eslint-disable-next-line
  }, [electionId]);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Đang tải thông tin kỳ bầu cử...</div>
    );

  if (!election)
    return (
      <div className="text-center mt-10 text-red-600">Không tìm thấy kỳ bầu cử.</div>
    );

  const status = getElectionStatus(election);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-indigo-600 hover:underline"
        >
          ← Quay lại
        </button>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{election.title}</h2>
          <div className="text-gray-600 text-sm mb-2">
            <span>📅 Từ: {election.startTime.toLocaleString()}</span> |{" "}
            <span>⏳ Đến: {election.endTime.toLocaleString()}</span>
          </div>
          <div className="mb-2">
            <span className={`font-semibold ${status.className}`}>{status.label}</span>
          </div>
          <div className="text-gray-600 text-sm">👥 Số ứng viên: {election.candidateCount}</div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Danh sách ứng viên</h3>
        {candidates.length === 0 ? (
          <div className="text-gray-600">Chưa có ứng viên nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((c) => {
              // Tách policies
              const [achievementsText, policiesText] = c.achievements.split("--- Chính sách tranh cử ---");
              return (
                <div key={c.id} className="bg-gray-100 rounded-lg p-4 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={c.image} alt={c.name} className="w-16 h-16 rounded-full border" />
                    <div>
                      <div className="text-lg font-bold">{c.name}</div>
                      <div className="text-xs text-gray-500">🗳️ {c.voteCount} phiếu</div>
                    </div>
                  </div>
                  <div className="mb-1 text-sm text-gray-700 whitespace-pre-line">
                    <b>Tiểu sử:</b> {c.bio}
                  </div>
                  <div className="mb-1 text-sm text-gray-700 whitespace-pre-line">
                    <b>Thành tích:</b> {achievementsText}
                  </div>
                  {policiesText && (
                    <div className="mb-1 text-sm text-gray-700 whitespace-pre-line">
                      <b>Chính sách tranh cử:</b>
                      <ul className="list-disc list-inside">
                        {policiesText.split("\n").map((p, idx) =>
                          <li key={idx}>{p}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
