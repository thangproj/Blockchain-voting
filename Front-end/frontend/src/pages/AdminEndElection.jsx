import React, { useEffect, useState } from "react";
import { getContract, getSigner } from "../ethers";

export default function EndElection() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [adminAddr, setAdminAddr] = useState("");

  // Kiểm tra admin
  useEffect(() => {
    async function checkAdmin() {
      if (!window.ethereum) return;
      try {
        const contract = getContract();
        const provider = contract.provider;
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = accounts[0];
        setCurrentAccount(account);

        const admin = await contract.admin();
        setAdminAddr(admin);
        setIsAdmin(account.toLowerCase() === admin.toLowerCase());
      } catch {
        setCurrentAccount("");
        setAdminAddr("");
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [message]);

  // Lấy danh sách kỳ bầu cử
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      try {
        const contract = getContract();
        // Tránh gọi hàm nếu contract chưa deploy hoặc chưa có kỳ nào
        let count = 0;
        try {
          count = await contract.electionCount();
        } catch (e) {
          setElections([]);
          setLoading(false);
          return;
        }
        if (!count || Number(count) === 0) {
          setElections([]);
          setLoading(false);
          return;
        }

        // Lấy danh sách kỳ bầu cử
        const data = await contract.getAllElectionDetails();
        const results = [];
        for (let i = 0; i < data[0].length; i++) {
          results.push({
            id: i,
            title: data[0][i],
            start: new Date(Number(data[1][i]) * 1000),
            end: new Date(Number(data[2][i]) * 1000),
            isActive: data[3][i],
            isEnded: data[5] ? data[5][i] : !data[3][i], // fallback nếu contract cũ
          });
        }
        setElections(results);
      } catch (err) {
        setElections([]);
      }
      setLoading(false);
    }
    fetchElections();
  }, [message]);

  const handleEndElection = async (electionId) => {
    try {
      if (!window.ethereum) return alert("Vui lòng cài MetaMask");
      if (!isAdmin) {
        setMessage("❌ Bạn không phải admin (chỉ admin mới có quyền này).");
        return;
      }
      setLoading(true);
      setMessage("");
      const contract = getContract(getSigner());
      const provider = contract.provider;
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111) {
        setLoading(false);
        return alert("❌ Vui lòng chuyển MetaMask sang mạng Sepolia.");
      }
      const tx = await contract.endElection(electionId);
      await tx.wait();
      setMessage("✅ Đã kết thúc kỳ bầu cử thành công!");
    } catch (err) {
      setMessage("❌ Thao tác thất bại. Có thể bạn không phải admin.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🔚 Kết thúc kỳ bầu cử</h1>
        <div className="mb-3 text-xs text-gray-500 text-center">
          <span>Địa chỉ ví:&nbsp;<span className="font-mono">{currentAccount}</span></span><br />
          <span>Admin contract:&nbsp;<span className="font-mono">{adminAddr}</span></span><br />
          {!isAdmin && (
            <span className="text-red-600 font-semibold">
              (Bạn không phải admin – không thể kết thúc kỳ bầu cử)
            </span>
          )}
        </div>
        {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}
        {loading && <p className="text-center">⏳ Đang xử lý...</p>}
        <table className="w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Thời gian</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {elections.map(e => (
              <tr key={e.id}>
                <td className="p-2 border text-center">{e.id}</td>
                <td className="p-2 border">{e.title}</td>
                <td className="p-2 border">
                  {e.start.toLocaleString()} → {e.end.toLocaleString()}
                </td>
                <td className="p-2 border">
                  {e.isEnded
                    ? "⛔ Đã kết thúc"
                    : e.isActive
                      ? "🟢 Đang hoạt động"
                      : "🔴 Đã vô hiệu hóa"}
                </td>
                <td className="p-2 border text-center">
                  {!e.isEnded && isAdmin && (
                    <button
                      onClick={() => handleEndElection(e.id)}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Kết thúc kỳ này
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
