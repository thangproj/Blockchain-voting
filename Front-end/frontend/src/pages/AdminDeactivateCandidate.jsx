import React, { useEffect, useState } from "react";
import { getContract, getSigner } from "../ethers"; // Sử dụng ethers.js
import { useCheckAdmin } from "../hooks/useCheckAdmin";
import { useNavigate } from "react-router-dom";

export default function DeactivateCandidate() {
  const isAdmin = useCheckAdmin();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [candidateActive, setCandidateActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [adminAddr, setAdminAddr] = useState("");

  // Kiểm tra quyền admin (dùng hook, không cần tự check provider nữa)
  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const contract = getContract();
        const provider = contract.provider;
        const accounts = await provider.send("eth_requestAccounts", []);
        setCurrentAccount(accounts[0]);
        const admin = await contract.admin();
        setAdminAddr(admin);
      } catch {
        setCurrentAccount("");
        setAdminAddr("");
      }
    }
    fetchAdminInfo();
  }, []);

  // Redirect nếu không phải admin
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Load all elections
  useEffect(() => {
    async function fetchElections() {
      setLoading(true);
      try {
        const contract = getContract();
        const data = await contract.getAllElectionDetails();
        const list = [];
        for (let i = 0; i < data[0].length; i++) {
          list.push({ id: i, title: data[0][i] });
        }
        setElections(list);
      } catch (err) {
        setElections([]);
      }
      setLoading(false);
    }
    fetchElections();
  }, []);

  // Load candidates when election is selected
  useEffect(() => {
    if (!selectedElection) {
      setCandidates([]);
      setSelectedCandidate("");
      setCandidateActive(null);
      return;
    }
    async function fetchCandidates() {
      setLoading(true);
      try {
        const contract = getContract();
        const details = await contract.getElectionDetails(Number(selectedElection));
        const count = Number(details[4]);
        const list = [];
        for (let i = 0; i < count; i++) {
          const c = await contract.getCandidate(Number(selectedElection), i);
          list.push({ id: i, name: c[1], isActive: c[6] });
        }
        setCandidates(list);
      } catch (err) {
        setCandidates([]);
      }
      setLoading(false);
    }
    fetchCandidates();
    // eslint-disable-next-line
  }, [selectedElection, message]); // reload sau khi thay đổi trạng thái

  // Load active state when candidate is selected
  useEffect(() => {
    if (!selectedElection || selectedCandidate === "") {
      setCandidateActive(null);
      return;
    }
    const found = candidates.find(c => c.id === Number(selectedCandidate));
    setCandidateActive(found ? found.isActive : null);
  }, [selectedCandidate, candidates]);

  const handleSetActive = async (active) => {
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
      const tx = await contract.setCandidateActive(
        Number(selectedElection),
        Number(selectedCandidate),
        active
      );
      await tx.wait();
      setMessage(`✅ Ứng viên đã được ${active ? "hiện" : "ẩn"} thành công!`);
    } catch (err) {
      setMessage("❌ Thao tác thất bại. Có thể bạn không phải admin.");
    }
    setLoading(false);
  };

  if (isAdmin === null) return <div>Đang kiểm tra quyền truy cập...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🚫 Ẩn / Hiện ứng viên
        </h1>

        <div className="mb-2 text-xs text-gray-500 text-center">
          <span>
            Địa chỉ ví đang dùng:&nbsp;
            <span className="font-mono">{currentAccount}</span>
          </span>
          <br />
          <span>
            Địa chỉ admin contract:&nbsp;
            <span className="font-mono">{adminAddr}</span>
          </span>
          <br />
          {!isAdmin && (
            <span className="text-red-600 font-semibold">
              (Bạn không phải admin – không thể thay đổi trạng thái ứng viên)
            </span>
          )}
        </div>

        {/* Chọn kỳ bầu cử */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ bầu cử</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedElection}
            onChange={e => {
              setSelectedElection(e.target.value);
              setSelectedCandidate("");
              setCandidateActive(null);
            }}
          >
            <option value="">-- Chọn kỳ bầu cử --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
        {/* Chọn ứng viên */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ứng viên</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedCandidate}
            onChange={e => setSelectedCandidate(e.target.value)}
            disabled={!selectedElection}
          >
            <option value="">-- Chọn ứng viên --</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isActive ? "" : "(Đã ẩn)"}
              </option>
            ))}
          </select>
        </div>
        {/* Trạng thái */}
        {selectedCandidate !== "" && candidateActive !== null && (
          <div className="mb-4 text-center">
            <span className="text-gray-700 text-base">
              Trạng thái hiện tại:&nbsp;
              {candidateActive
                ? <span className="text-green-600 font-bold">Đang hiển thị</span>
                : <span className="text-red-600 font-bold">Đã ẩn</span>
              }
            </span>
          </div>
        )}
        {/* Nút thao tác */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleSetActive(true)}
            disabled={!isAdmin || loading || candidateActive === true || selectedCandidate === ""}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Hiện ứng viên
          </button>
          <button
            onClick={() => handleSetActive(false)}
            disabled={!isAdmin || loading || candidateActive === false || selectedCandidate === ""}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Ẩn ứng viên
          </button>
        </div>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
