import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContract } from "../ethers"; // Sử dụng ethers.js

// Hàm xác định trạng thái kỳ bầu cử
function getElectionStatus(election) {
  const now = Date.now() / 1000;
  if (election.isEnded) return { label: "⛔ Đã kết thúc", className: "text-red-600 font-semibold" };
  if (!election.isActive && now < election.endTime) return { label: "⏸️ Tạm dừng", className: "text-yellow-600 font-semibold" };
  if (now < election.startTime) return { label: "🕒 Sắp bắt đầu", className: "text-blue-600 font-semibold" };
  if (now > election.endTime) return { label: "⛔ Đã kết thúc", className: "text-red-600 font-semibold" };
  if (election.isActive) return { label: "🟢 Đang hoạt động", className: "text-green-600 font-semibold" };
  return { label: "⏸️ Tạm dừng", className: "text-yellow-600 font-semibold" };
}

export default function ElectionList() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadElections = async () => {
    try {
      const contract = getContract();
      const data = await contract.getAllElectionDetails();

      const results = [];
      for (let i = 0; i < data[0].length; i++) {
        results.push({
          id: i,
          title: data[0][i],
          startTime: Number(data[1][i]),
          endTime: Number(data[2][i]),
          isActive: data[3][i],
          candidateCount: Number(data[4][i]),
          isEnded: data[5][i],
        });
      }

      setElections(results);
    } catch (err) {
      console.error("Lỗi khi tải danh sách kỳ bầu cử:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">📋 Danh sách các kỳ bầu cử</h1>

      {loading ? (
        <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
      ) : elections.length === 0 ? (
        <p className="text-center text-gray-600">Chưa có kỳ bầu cử nào được tạo.</p>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {elections.map((e) => {
            const status = getElectionStatus(e);
            return (
              <div
                key={e.id}
                className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:bg-indigo-50 transition"
                onClick={() => navigate(`/elections/${e.id}`)}
                title="Xem danh sách ứng viên"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-2">{e.title}</h2>
                <p className="text-sm text-gray-600 mb-1">
                  📅 Bắt đầu: {new Date(e.startTime * 1000).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  ⏳ Kết thúc: {new Date(e.endTime * 1000).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  👥 Ứng viên: {e.candidateCount}
                </p>
                <p className="text-sm text-gray-600">
                  Trạng thái: <span className={status.className}>{status.label}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
