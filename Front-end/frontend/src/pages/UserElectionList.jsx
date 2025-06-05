import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function UserElectionList() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      setMessage("");
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const data = await contract.getAllElectionDetails();
        const now = Date.now() / 1000;

        const actives = [];
        for (let i = 0; i < data[0].length; i++) {
          const start = Number(data[1][i]);
          const end = Number(data[2][i]);
          const isActive = data[3][i];
          // Nếu contract có cột ended thì thêm điều kiện !data[5][i]
          if (isActive && now >= start && now <= end) {
            actives.push({
              id: i,
              title: data[0][i],
              startTime: new Date(start * 1000),
              endTime: new Date(end * 1000),
              candidateCount: Number(data[4][i])
            });
          }
        }
        setElections(actives);
      } catch (err) {
        setMessage("Không thể tải danh sách kỳ bầu cử.");
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🗳️ Các cuộc bầu cử đang diễn ra
        </h1>
        {loading ? (
          <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
        ) : message ? (
          <p className="text-center text-red-500">{message}</p>
        ) : elections.length === 0 ? (
          <p className="text-center text-gray-600">Hiện không có cuộc bầu cử nào đang diễn ra.</p>
        ) : (
          <div className="space-y-6">
            {elections.map(e => (
              <div
                key={e.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-blue-100 transition cursor-pointer"
                onClick={() => navigate(`/user/vote/${e.id}`)}
                title="Xem danh sách ứng viên & bỏ phiếu"
              >
                <div>
                  <div className="text-xl font-bold text-blue-800">{e.title}</div>
                  <div className="text-gray-600 text-sm">
                    ⏱ {e.startTime.toLocaleString()} – {e.endTime.toLocaleString()}
                  </div>
                  <div className="text-gray-700 text-sm">👥 Ứng viên: {e.candidateCount}</div>
                </div>
                <button
                  onClick={evt => {
                    evt.stopPropagation();
                    navigate(`/user/vote/${e.id}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold shadow"
                  title="Tham gia bầu cử"
                >
                  Tham gia bầu cử
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
