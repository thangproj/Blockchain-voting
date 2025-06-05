import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function ElectionCandidates() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");

  // Load election info & candidates
  useEffect(() => {
    const loadElectionAndCandidates = async () => {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setCurrentAccount(account);

        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
        const details = await contract.getElectionDetails(Number(electionId));
        const electionData = {
          id: electionId,
          title: details[0],
          start: new Date(Number(details[1]) * 1000),
          end: new Date(Number(details[2]) * 1000),
          isActive: details[3],
          candidateCount: Number(details[4])
        };
        setElection(electionData);

        // Kiểm tra đã bầu chưa
        const voted = await contract.hasVoted(Number(electionId), account);
        setHasVoted(voted);

        // Lấy danh sách ứng viên
        const arr = [];
        for (let i = 0; i < electionData.candidateCount; i++) {
          const res = await contract.getCandidate(Number(electionId), i);
          arr.push({
            id: res[0].toNumber ? res[0].toNumber() : Number(res[0]),
            name: res[1],
            bio: res[2],
            achievements: res[3],
            image: res[4],
            voteCount: res[5].toNumber ? res[5].toNumber() : Number(res[5]),
            isActive: res[6],
          });
        }
        setCandidates(arr);
      } catch (err) {
        setMessage("Không thể tải dữ liệu kỳ bầu cử.");
      }
      setLoading(false);
    };
    loadElectionAndCandidates();
  }, [electionId]);

  // Bầu chọn
  const handleVote = async () => {
    if (selectedId === null) {
      setMessage("❌ Hãy chọn một ứng viên để bầu!");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, signer);

      const tx = await contract.vote(Number(electionId), selectedId);
      await tx.wait();
      setMessage("✅ Bạn đã bầu chọn thành công!");
      setHasVoted(true);
    } catch (err) {
      setMessage("❌ Bầu chọn thất bại hoặc bạn đã bầu rồi.");
    }
    setLoading(false);
  };

  // Status & UI helpers
  const now = new Date();
  const isOngoing = election && election.isActive && now >= election.start && now <= election.end;
  const ended = election && now > election.end;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Election Info */}
        {election && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t-8 border-blue-400">
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">{election.title}</h2>
              <div className="text-sm text-gray-500 mb-1">
                <span>📅 {election.start.toLocaleString()} </span>
                <span className="mx-1">→</span>
                <span>⏳ {election.end.toLocaleString()}</span>
              </div>
              <div>
                {ended ? (
                  <span className="text-red-600 font-semibold">⛔ Đã kết thúc</span>
                ) : isOngoing ? (
                  <span className="text-green-600 font-semibold">🟢 Đang diễn ra</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">⏳ Sắp diễn ra</span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 sm:mt-0 text-indigo-600 hover:underline font-semibold text-sm"
            >
              ← Quay lại
            </button>
          </div>
        )}

        {/* Message/Status */}
        {message && <div className="mb-4 text-center text-blue-700">{message}</div>}

        {/* List Candidates */}
        <h3 className="text-lg font-semibold text-gray-700 mb-5">Danh sách ứng viên</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">⏳ Đang tải...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-7">
            {candidates.map(c => (
              <div
                key={c.id}
                className={`bg-white rounded-2xl p-5 shadow-md flex flex-col justify-between border hover:shadow-xl transition-all
                  ${!c.isActive ? "opacity-60 grayscale" : ""}
                  ${selectedId === c.id ? "border-2 border-indigo-500" : ""}
                `}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 rounded-full border object-cover shadow"
                  />
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-gray-500 text-xs">Số phiếu: {c.voteCount}</div>
                  </div>
                </div>
                <div className="mb-2 text-gray-700">
                  <span className="font-semibold">Tiểu sử:</span> {c.bio}
                </div>
                {/* Nút xem chi tiết */}
                <button
                  className="underline text-indigo-600 text-sm mb-3 hover:text-indigo-800"
                  onClick={() => navigate(`/user/vote/${electionId}/candidate/${c.id}`)}


                >
                  Xem chi tiết
                </button>
                {/* Radio chọn để bầu */}
                {isOngoing && !hasVoted && c.isActive && (
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="radio"
                      name="vote"
                      value={c.id}
                      checked={selectedId === c.id}
                      onChange={() => setSelectedId(c.id)}
                      className="accent-indigo-500"
                    />
                    <span className="text-indigo-700 font-medium">Chọn để bầu</span>
                  </label>
                )}
                {!c.isActive && (
                  <div className="text-xs text-gray-500 mt-2">(Ứng viên đã ẩn)</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vote button */}
        {isOngoing && !hasVoted && (
          <div className="flex justify-center mt-8">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2 rounded-xl shadow-xl text-lg"
              onClick={handleVote}
              disabled={selectedId === null || loading}
            >
              🗳️ Xác nhận bầu chọn
            </button>
          </div>
        )}
        {hasVoted && (
          <div className="flex justify-center mt-8 text-green-700 font-semibold">
            Bạn đã bầu chọn kỳ này.
          </div>
        )}
        {ended && (
          <div className="flex justify-center mt-8 text-gray-500 italic">
            Kỳ bầu cử đã kết thúc, không thể bầu chọn.
          </div>
        )}
      </div>
    </div>
  );
}
