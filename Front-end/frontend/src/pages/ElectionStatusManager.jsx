// src/pages/ElectionStatusManager.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function ElectionStatusManager() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load elections từ contract
  const fetchElections = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!window.ethereum) return alert("Vui lòng cài MetaMask!");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);

      const data = await contract.getAllElectionDetails();
      const results = [];
      for (let i = 0; i < data[0].length; i++) {
        results.push({
          id: i,
          title: data[0][i],
          start: new Date(Number(data[1][i]) * 1000),
          end: new Date(Number(data[2][i]) * 1000),
          isActive: data[3][i],
          candidateCount: Number(data[4][i]),
          isEnded: data[5][i], // <-- lấy biến này!
        });
      }
      setElections(results);
    } catch (err) {
      console.error(err);
      setMessage("❌ Không thể tải danh sách kỳ bầu cử.");
    }
    setLoading(false);
  };

  // Toggle trạng thái (kích hoạt / vô hiệu hóa)
  const toggleActive = async (id) => {
    setLoading(true);
    setMessage("");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, signer);

      const tx = await contract.toggleElectionActive(id);
      await tx.wait();

      setMessage(`✅ Đã thay đổi trạng thái kỳ bầu cử #${id}.`);
      fetchElections();
    } catch (err) {
      console.error(err);
      setMessage("❌ Không thể thay đổi trạng thái. Có thể bạn không phải admin.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          <span role="img" aria-label="settings">⚙️</span> Quản lý trạng thái kỳ bầu cử
        </h1>
        {message && (
          <div className="mb-4 text-center text-base font-medium text-blue-700">{message}</div>
        )}
        {loading && <div className="mb-4 text-center text-gray-600">⏳ Đang xử lý...</div>}

        <div className="overflow-x-auto">
          <table className="w-full table-auto border text-sm bg-white shadow rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Tên kỳ</th>
                <th className="p-2 border">Thời gian</th>
                <th className="p-2 border">Trạng thái</th>
                <th className="p-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {elections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Không có kỳ bầu cử nào.
                  </td>
                </tr>
              ) : (
                elections.map((e) => {
                  const now = new Date();
                  const ended = e.isEnded;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="p-2 border text-center">{e.id}</td>
                      <td className="p-2 border">{e.title}</td>
                      <td className="p-2 border">
                        <div>
                          <span className="block">
                            {e.start.toLocaleString()}{" "}
                            <span className="text-gray-400">→</span>
                          </span>
                          <span>{e.end.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-2 border text-center">
                        {ended ? (
                          <span className="text-gray-400 font-semibold flex items-center justify-center gap-1">
                            <span>⛔</span> Đã kết thúc
                          </span>
                        ) : e.isActive ? (
                          <span className="text-green-700 font-semibold flex items-center justify-center gap-1">
                            <span>🟢</span> Đang hoạt động
                          </span>
                        ) : (
                          <span className="text-red-700 font-semibold flex items-center justify-center gap-1">
                            <span>🔴</span> Đã vô hiệu hóa
                          </span>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        {!ended && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Bạn chắc chắn muốn ${e.isActive ? "vô hiệu hóa" : "kích hoạt"} kỳ bầu cử "${e.title}"?`
                                )
                              ) {
                                toggleActive(e.id);
                              }
                            }}
                            className={`px-3 py-1 rounded font-semibold ${
                              e.isActive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white`}
                          >
                            {e.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
