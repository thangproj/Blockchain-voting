import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContract } from "../ethers";

export default function UserElectionList() {
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      setMessage("");
      try {
        const contract = getContract();
        const data = await contract.getAllElectionDetails();
        const now = Date.now() / 1000;

        const actives = [];
        const upcomings = [];
        for (let i = 0; i < data[0].length; i++) {
          const start = Number(data[1][i]);
          const end = Number(data[2][i]);
          const isActive = data[3][i];
          if (isActive && now >= start && now <= end) {
            actives.push({
              id: i,
              title: data[0][i],
              startTime: new Date(start * 1000),
              endTime: new Date(end * 1000),
              candidateCount: Number(data[4][i])
            });
          }
          if (isActive && now < start) {
            upcomings.push({
              id: i,
              title: data[0][i],
              startTime: new Date(start * 1000),
              endTime: new Date(end * 1000),
              candidateCount: Number(data[4][i])
            });
          }
        }
        setActiveElections(actives);
        setUpcomingElections(upcomings);
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
          🗳️ Các cuộc bầu cử
        </h1>
        {loading ? (
          <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
        ) : message ? (
          <p className="text-center text-red-500">{message}</p>
        ) : (
          <>
            {/* Đang diễn ra */}
            <h2 className="text-lg font-semibold text-green-700 mb-2 mt-2">Đang diễn ra</h2>
            {activeElections.length === 0 ? (
              <p className="text-center text-gray-600 mb-4">Hiện không có cuộc bầu cử nào đang diễn ra.</p>
            ) : (
              <div className="space-y-6 mb-6">
                {activeElections.map(e => (
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

            {/* Sắp diễn ra */}
            <h2 className="text-lg font-semibold text-orange-700 mb-2 mt-2">Sắp diễn ra</h2>
            {upcomingElections.length === 0 ? (
              <p className="text-center text-gray-600">Không có cuộc bầu cử nào sắp diễn ra.</p>
            ) : (
              <div className="space-y-6">
                {upcomingElections.map(e => (
                  <div
                    key={e.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-yellow-100 transition cursor-pointer"
                    // Chỉ cho xem danh sách, không cho bầu
                    onClick={() => navigate(`/user/vote/${e.id}`)}
                    title="Xem danh sách ứng viên"
                  >
                    <div>
                      <div className="text-xl font-bold text-yellow-700">{e.title}</div>
                      <div className="text-gray-600 text-sm">
                        ⏱ {e.startTime.toLocaleString()} – {e.endTime.toLocaleString()}
                      </div>
                      <div className="text-gray-700 text-sm">👥 Ứng viên: {e.candidateCount}</div>
                    </div>
                    <span className="px-5 py-2 rounded font-semibold shadow bg-yellow-400/80 text-white">
                      Sắp diễn ra
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
