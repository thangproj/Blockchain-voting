import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

// Hàm export CSV
function exportCSV(data, filename = "results.csv") {
  const csv = [
    "Tên,Tổng phiếu,Trạng thái,Tiểu sử",
    ...data.map(c => 
      `"${c.name}","${c.voteCount}","${c.isActive ? "Đang hiện" : "Đã ẩn"}","${c.bio.replace(/"/g, "'")}"`
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

export default function VoteResults() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // Lấy danh sách kỳ bầu cử
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const data = await contract.getAllElectionDetails();
        const list = [];
        for (let i = 0; i < data[0].length; i++) {
          list.push({ id: i, title: data[0][i] });
        }
        setElections(list);
      } catch (err) {
        setMessage("Không thể tải danh sách kỳ bầu cử.");
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  // Lấy danh sách ứng viên khi chọn kỳ
  useEffect(() => {
    if (selectedElection === "") {
      setCandidates([]);
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
          // Solidity: returns (uint, string, string, string, string, uint, bool)
          const c = await contract.getCandidate(Number(selectedElection), i);
          arr.push({
            id: i,
            name: c[1],
            bio: c[2],
            achievements: c[3],
            image: c[4],
            voteCount: Number(c[5]),
            isActive: c[6], // bool
          });
        }
        setCandidates(arr);
      } catch (err) {
        setCandidates([]);
        setMessage("Không thể tải danh sách ứng viên.");
      }
      setLoading(false);
    }
    fetchCandidates();
  }, [selectedElection]);

  // Lọc ứng viên theo search và trạng thái (ẩn/hiện)
  const filtered = candidates.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase())
      // Hiển thị cả ứng viên đã ẩn (bạn có thể thay đổi logic nếu chỉ muốn show isActive)
  );

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">📊 Kết quả số phiếu ứng viên</h1>

        <div className="mb-6 flex gap-2 flex-col sm:flex-row items-center">
          <select
            className="w-full sm:w-1/2 px-4 py-2 border rounded-md"
            value={selectedElection}
            onChange={e => setSelectedElection(e.target.value)}
          >
            <option value="">-- Chọn kỳ bầu cử --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <input
            className="w-full sm:w-1/2 px-4 py-2 border rounded-md"
            placeholder="Tìm kiếm ứng viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={candidates.length === 0}
          />
        </div>

        {message && <div className="mb-4 text-red-500">{message}</div>}
        {loading ? (
          <p className="text-center">⏳ Đang tải...</p>
        ) : selectedElection === "" ? (
          <p className="text-center text-gray-600">Hãy chọn kỳ bầu cử để xem kết quả.</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-600">Không có ứng viên nào cho kỳ này.</p>
        ) : (
          <>
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
                {filtered.map((c, idx) => (
                  <tr key={c.id}>
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border font-semibold">{c.name}</td>
                    <td className="p-2 border text-center">
                      {c.image ? <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-full inline-block" /> : "-"}
                    </td>
                    <td className="p-2 border">{c.bio}</td>
                    <td className="p-2 border text-center font-bold">{c.voteCount}</td>
                    <td className="p-2 border text-center">
                      {c.isActive ? <span className="text-green-600 font-semibold">Đang hiện</span> : <span className="text-red-600 font-semibold">Đã ẩn</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold">
                Tổng số phiếu: <span className="text-indigo-700">{totalVotes}</span>
              </span>
              <button
                className="bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700"
                onClick={() => exportCSV(filtered)}
                disabled={filtered.length === 0}
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
