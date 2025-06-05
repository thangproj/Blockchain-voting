// src/pages/AllCandidatesByElection.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function AllCandidatesByElection() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setMessage("");
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const data = await contract.getAllElectionDetails();
        const results = [];

        for (let i = 0; i < data[0].length; i++) {
          // Lấy thông tin kỳ
          const election = {
            id: i,
            title: data[0][i],
            startTime: new Date(Number(data[1][i]) * 1000),
            endTime: new Date(Number(data[2][i]) * 1000),
            isActive: data[3][i],
            candidateCount: Number(data[4][i]),
            candidates: []
          };

          // Lấy danh sách ứng viên từng kỳ
          for (let j = 0; j < election.candidateCount; j++) {
            const c = await contract.getCandidate(i, j);
            election.candidates.push({
              id: c[0].toNumber ? c[0].toNumber() : Number(c[0]),
              name: c[1],
              bio: c[2],
              achievements: c[3],
              image: c[4],
              voteCount: c[5].toNumber ? c[5].toNumber() : Number(c[5]),
              isActive: c[6] !== undefined ? c[6] : true
            });
          }
          results.push(election);
        }
        setElections(results);
      } catch (err) {
        setMessage("Không thể tải dữ liệu.");
        setElections([]);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">👥 Toàn bộ ứng viên các kỳ bầu cử</h1>
      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : message ? (
        <p className="text-center text-red-600">{message}</p>
      ) : elections.length === 0 ? (
        <p className="text-center text-gray-600">Chưa có kỳ bầu cử nào.</p>
      ) : (
        <div className="space-y-10 max-w-6xl mx-auto">
          {elections.map(e => (
            <div key={e.id} className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-indigo-700 mb-2">{e.title}</h2>
              <div className="text-sm text-gray-600 mb-4">
                📅 {e.startTime.toLocaleString()} → {e.endTime.toLocaleString()}
              </div>
              {e.candidates.length === 0 ? (
                <p className="text-gray-500">Chưa có ứng viên.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {e.candidates.map(c => (
                    <div key={c.id} className="bg-gray-50 p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
                      <img src={c.image} alt={c.name} className="w-16 h-16 rounded-full border object-cover" />
                      <div className="flex-1">
                        <div className="text-lg font-semibold">{c.name}</div>
                        <div className="text-xs text-gray-500">🗳️ {c.voteCount} phiếu</div>
                        <div className="text-sm text-gray-700">Tiểu sử: {c.bio}</div>
                        <div className="text-xs">
                          <span className={c.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {c.isActive ? "Đang hiện" : "Đã ẩn"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
