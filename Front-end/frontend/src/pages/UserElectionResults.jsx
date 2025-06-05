import React, { useEffect, useState } from "react";
import { getContract } from "../ethers";

export default function UserResults() {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Chỉ lấy kỳ đã kết thúc
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      setErr("");
      try {
        const contract = getContract();
        const data = await contract.getAllElectionDetails();
        const now = Date.now() / 1000;
        const list = [];
        for (let i = 0; i < data[0].length; i++) {
          if (data[5][i] || Number(data[2][i]) < now) {
            list.push({ id: i, title: data[0][i] });
          }
        }
        setElections(list);
      } catch {
        setErr("Không thể tải danh sách kỳ bầu cử.");
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  // Lấy ứng viên khi chọn kỳ
  useEffect(() => {
    if (selected === "") {
      setCandidates([]);
      return;
    }
    async function fetchCandidates() {
      setLoading(true);
      setErr("");
      try {
        const contract = getContract();
        const details = await contract.getElectionDetails(Number(selected));
        const count = Number(details[4]);
        const arr = [];
        for (let i = 0; i < count; i++) {
          const c = await contract.getCandidate(Number(selected), i);
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
        setCandidates(arr);
      } catch {
        setCandidates([]);
        setErr("Không thể tải danh sách ứng viên.");
      }
      setLoading(false);
    }
    fetchCandidates();
  }, [selected]);

  // Tìm winner (phiếu cao nhất, nếu hòa thì nhiều người)
  const maxVotes = candidates.length > 0 ? Math.max(...candidates.map(c => c.voteCount)) : 0;
  const winners = candidates.filter(c => c.voteCount === maxVotes && maxVotes > 0);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-7 text-center text-indigo-800">
          📊 Kết quả bầu cử
        </h1>
        <div className="mb-6 flex gap-2 flex-col sm:flex-row items-center">
          <select
            className="w-full sm:w-2/3 px-4 py-2 border rounded-md"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">-- Chọn kỳ bầu cử đã kết thúc --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {err && <div className="mb-4 text-red-500 text-center">{err}</div>}
        {loading ? (
          <div className="text-center py-8 text-gray-600">⏳ Đang tải...</div>
        ) : selected === "" ? (
          <div className="text-center text-gray-500">Hãy chọn kỳ bầu cử để xem kết quả.</div>
        ) : candidates.length === 0 ? (
          <div className="text-center text-gray-500">Không có ứng viên nào cho kỳ này.</div>
        ) : (
          <>
            {winners.length > 0 && (
              <div className="mb-4 text-center text-lg font-semibold text-yellow-700">
                <span role="img" aria-label="win">🏆</span> Ứng viên thắng: {winners.map(w => w.name).join(", ")} ({maxVotes} phiếu)
              </div>
            )}
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
                  <tr key={c.id} className={winners.find(w => w.id === c.id) ? "bg-yellow-50 font-semibold" : ""}>
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border">{c.name}</td>
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
          </>
        )}
      </div>
    </div>
  );
}
