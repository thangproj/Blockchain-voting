import React, { useEffect, useState } from "react";
import { getContract } from "../ethers";

// Helper export CSV
function exportCSV(data, filename = "vote_log.csv") {
  const csv = [
    "Kỳ bầu cử,Địa chỉ ví,Ứng viên,Số hiệu ứng viên,Thời gian",
    ...data.map(row =>
      `"${row.electionTitle}","${row.voter}","${row.candidateName}","${row.candidateId}","${row.timestamp}"`
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function VoteLog() {
  const [elections, setElections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  // Lấy tất cả các kỳ bầu cử (KHÔNG lọc active)
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      setErr("");
      try {
        const contract = getContract();
        const data = await contract.getAllElectionDetails();
        const list = [];
        for (let i = 0; i < data[0].length; i++) {
          list.push({ id: i, title: data[0][i] });
        }
        setElections(list);
      } catch (e) {
        setErr("Không thể tải danh sách kỳ bầu cử");
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  // Load vote logs khi chọn kỳ bầu cử
  useEffect(() => {
    if (!selectedElection) {
      setLogs([]);
      return;
    }
    async function fetchLogs() {
      setLoading(true);
      setErr("");
      try {
        const contract = getContract();
        const filter = contract.filters.VoteCast(Number(selectedElection));
        const events = await contract.queryFilter(filter, 0, "latest");
        const electionTitle = elections.find(e => Number(e.id) === Number(selectedElection))?.title || "";
        const electionDetail = await contract.getElectionDetails(Number(selectedElection));
        const candidateCount = Number(electionDetail[4]);
        const candidateMap = {};
        for (let i = 0; i < candidateCount; i++) {
          const c = await contract.getCandidate(Number(selectedElection), i);
          candidateMap[c[0].toString()] = c[1];
        }

        const logsData = events.map(e => ({
          electionTitle,
          voter: e.args.voter,
          candidateId: e.args.candidateId.toString(),
          candidateName: candidateMap[e.args.candidateId.toString()] || `#${e.args.candidateId}`,
          timestamp: new Date(e.args.timestamp.toNumber() * 1000).toLocaleString(),
        }));

        setLogs(logsData.reverse()); // Mới nhất lên đầu
      } catch (e) {
        setErr("Không thể tải log lịch sử bỏ phiếu.");
        setLogs([]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [selectedElection, elections]);

  // Filter
  const filtered = logs.filter(
    row =>
      row.voter.toLowerCase().includes(search.toLowerCase()) ||
      row.candidateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🗒️ Lịch sử bỏ phiếu</h1>
        <div className="mb-4 flex flex-col md:flex-row gap-2 items-center">
          <select
            className="w-full md:w-1/2 px-4 py-2 border rounded-md"
            value={selectedElection}
            onChange={e => setSelectedElection(e.target.value)}
          >
            <option value="">-- Chọn kỳ bầu cử --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <input
            className="w-full md:w-1/2 px-4 py-2 border rounded-md"
            placeholder="Tìm theo tên ứng viên hoặc địa chỉ ví"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={!selectedElection}
          />
        </div>
        {err && <div className="mb-3 text-red-500">{err}</div>}
        {loading ? (
          <div className="text-center">⏳ Đang tải...</div>
        ) : selectedElection === "" ? (
          <div className="text-center text-gray-500">Chọn kỳ bầu cử để xem lịch sử.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500">Không có log nào cho kỳ này.</div>
        ) : (
          <>
            <table className="w-full table-auto border text-sm mb-3">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Địa chỉ ví</th>
                  <th className="p-2 border">Ứng viên</th>
                  <th className="p-2 border">Số hiệu</th>
                  <th className="p-2 border">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border font-mono">{row.voter}</td>
                    <td className="p-2 border">{row.candidateName}</td>
                    <td className="p-2 border text-center">{row.candidateId}</td>
                    <td className="p-2 border">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
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
