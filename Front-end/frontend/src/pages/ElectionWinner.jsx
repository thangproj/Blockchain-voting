// src/pages/ElectionWinner.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

// Hàm export CSV
function exportCSV(data, filename = "winner.csv") {
  const csv = [
    "Tên,Tiểu sử,Số phiếu,Trạng thái",
    ...data.map(c => 
      `"${c.name}","${c.bio.replace(/"/g, "'")}",${c.voteCount},${c.isActive ? "Đang hiện" : "Đã ẩn"}`
    )
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function ElectionWinner() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Lấy danh sách kỳ bầu cử đã kết thúc
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const data = await contract.getAllElectionDetails();
        const now = Date.now() / 1000;
        const list = [];
        for (let i = 0; i < data[0].length; i++) {
          // Lấy theo isEnded (cột cuối cùng), hoặc có thể lấy now > endTime
          const isEnded = data[5]?.[i];
          if (isEnded || Number(data[2][i]) < now) {
            list.push({ id: i, title: data[0][i] });
          }
        }
        setElections(list);
      } catch (err) {
        setMessage("Không thể tải danh sách kỳ bầu cử.");
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  // Lấy danh sách ứng viên cho kỳ đã chọn
  useEffect(() => {
    if (selectedElection === "") {
      setCandidates([]);
      setWinner([]);
      return;
    }
    async function fetchCandidates() {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const details = await contract.getElectionDetails(Number(selectedElection));
        const count = Number(details[4]);
        const arr = [];
        for (let i = 0; i < count; i++) {
          const c = await contract.getCandidate(Number(selectedElection), i);
          arr.push({
            id: i,
            name: c[1],
            bio: c[2],
            achievements: c[3],
            image: c[4],
            voteCount: Number(c[5]),
            isActive: c[6]
          });
        }
        // Chỉ lấy ứng viên đang hiện
        const visibleCandidates = arr.filter(c => c.isActive);
        setCandidates(visibleCandidates);

        // Tìm ứng viên có số phiếu lớn nhất
        let maxVotes = -1;
        visibleCandidates.forEach(c => {
          if (c.voteCount > maxVotes) maxVotes = c.voteCount;
        });
        // Lấy tất cả ứng viên có số phiếu max (trường hợp hòa)
        const winnerList = visibleCandidates.filter(c => c.voteCount === maxVotes && maxVotes > 0);
        setWinner(winnerList);
      } catch (err) {
        setCandidates([]);
        setWinner([]);
        setMessage("Không thể tải danh sách ứng viên.");
      }
      setLoading(false);
    }
    fetchCandidates();
  }, [selectedElection]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🏆 Ứng viên chiến thắng</h1>

        <div className="mb-6">
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedElection}
            onChange={e => setSelectedElection(e.target.value)}
          >
            <option value="">-- Chọn kỳ bầu cử đã kết thúc --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {message && <div className="mb-4 text-red-500">{message}</div>}
        {loading ? (
          <p className="text-center">⏳ Đang tải...</p>
        ) : selectedElection === "" ? (
          <p className="text-center text-gray-600">Hãy chọn kỳ bầu cử.</p>
        ) : candidates.length === 0 ? (
          <p className="text-center text-gray-600">Không có ứng viên nào đang hiện ở kỳ này.</p>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Danh sách ứng viên</h3>
            <table className="w-full table-auto border text-sm mb-3">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Tên</th>
                  <th className="p-2 border">Ảnh</th>
                  <th className="p-2 border">Tiểu sử</th>
                  <th className="p-2 border">Số phiếu</th>
                  <th className="p-2 border">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={winner.find(w => w.id === c.id) ? "bg-yellow-100 font-semibold" : ""}
                  >
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border">{c.name}</td>
                    <td className="p-2 border text-center">
                      {c.image ? <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-full inline-block" /> : "-"}
                    </td>
                    <td className="p-2 border">{c.bio}</td>
                    <td className="p-2 border text-center">{c.voteCount}</td>
                    <td className="p-2 border text-center">
                      {c.isActive ? <span className="text-green-600 font-semibold">Đang hiện</span> : <span className="text-red-600 font-semibold">Đã ẩn</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {winner.length > 0 ? (
              <div className="mt-4 mb-4 text-center">
                <div className="text-lg font-bold text-yellow-700 flex items-center justify-center gap-2">
                  <span role="img" aria-label="winner">🏆</span>
                  {winner.length === 1
                    ? <>Ứng viên chiến thắng: <span className="text-xl">{winner[0].name}</span> với <b>{winner[0].voteCount}</b> phiếu</>
                    : <>Nhiều ứng viên đồng phiếu cao nhất: <b>{winner.map(w => w.name).join(", ")}</b> (<b>{winner[0].voteCount}</b> phiếu)</>
                  }
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center text-gray-500">Chưa có ai đạt phiếu bầu trong kỳ này.</div>
            )}

            <div className="flex justify-end mt-2">
              <button
                className="bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700"
                onClick={() => exportCSV(candidates)}
                disabled={candidates.length === 0}
              >
                Export CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
