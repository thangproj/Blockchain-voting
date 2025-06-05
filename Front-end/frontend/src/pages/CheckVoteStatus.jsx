import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function CheckVoteStatus() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError("");
      setVotes([]);
      try {
        if (!window.ethereum) {
          setError("Vui lòng cài đặt MetaMask.");
          setLoading(false);
          return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const acc = await signer.getAddress();
        setAccount(acc);

        const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);

        // Lấy tất cả các kỳ bầu cử
        const data = await contract.getAllElectionDetails();
        const elections = [];
        for (let i = 0; i < data[0].length; i++) {
          elections.push({
            id: i,
            title: data[0][i],
            startTime: new Date(Number(data[1][i]) * 1000),
            endTime: new Date(Number(data[2][i]) * 1000),
            isActive: data[3][i],
            isEnded: data[5] ? data[5][i] : false,
            candidateCount: Number(data[4][i]),
          });
        }

        // Kiểm tra từng kỳ user đã vote chưa
        const result = [];
        for (let election of elections) {
          try {
            // Gọi hàm contract: getVotedCandidateId(electionId, address)
            // Nếu contract KHÔNG có hàm này, cần dùng event (VoteCast)
            let votedId = null;
            let votedAt = null;
            // Cách 1: contract có hàm getVotedCandidateId (uint electionId, address user) returns (int)
            if (contract.getVotedCandidateId) {
              votedId = await contract.getVotedCandidateId(election.id, acc);
              if (votedId < 0) votedId = null;
            }

            // Nếu không có hàm, dùng event VoteCast để tra cứu
            if (votedId === null) {
              const filter = contract.filters.VoteCast(election.id, acc);
              const logs = await contract.queryFilter(filter, 0, "latest");
              if (logs.length > 0) {
                votedId = logs[0].args.candidateId.toNumber();
                votedAt = new Date(logs[0].args.timestamp.toNumber() * 1000);
              }
            }

            if (votedId !== null && votedId !== undefined) {
              // Lấy info candidate đã vote
              const c = await contract.getCandidate(election.id, votedId);
              result.push({
                electionTitle: election.title,
                electionId: election.id,
                startTime: election.startTime,
                endTime: election.endTime,
                isEnded: election.isEnded,
                candidateId: votedId,
                candidateName: c[1],
                candidateImage: c[4],
                votedAt: votedAt,
              });
            }
          } catch (e) {
            // Có thể kỳ này chưa vote, skip
          }
        }

        setVotes(result);
      } catch (e) {
        setError("Không thể tải dữ liệu. Có thể bạn chưa kết nối ví hoặc mạng chậm.");
      }
      setLoading(false);
    }

    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">📝 Trạng thái bỏ phiếu của bạn</h1>
        <div className="mb-4 text-center text-sm text-gray-600">
          Ví hiện tại: <span className="font-mono">{account}</span>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">⏳ Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : votes.length === 0 ? (
          <div className="text-center text-gray-500">
            Bạn chưa tham gia bỏ phiếu ở kỳ bầu cử nào.
          </div>
        ) : (
          <table className="w-full table-auto border text-sm mb-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Tên kỳ bầu cử</th>
                <th className="p-2 border">Thời gian</th>
                <th className="p-2 border">Ứng viên đã vote</th>
                <th className="p-2 border">Ảnh</th>
                <th className="p-2 border">Thời gian vote</th>
                <th className="p-2 border">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((v, idx) => (
                <tr key={idx}>
                  <td className="p-2 border text-center">{idx + 1}</td>
                  <td className="p-2 border font-semibold">{v.electionTitle}</td>
                  <td className="p-2 border">
                    <div>{v.startTime.toLocaleString()}<br/>→ {v.endTime.toLocaleString()}</div>
                  </td>
                  <td className="p-2 border">{v.candidateName}</td>
                  <td className="p-2 border text-center">
                    {v.candidateImage ? <img src={v.candidateImage} alt="" className="w-10 h-10 object-cover rounded-full inline-block" /> : "-"}
                  </td>
                  <td className="p-2 border text-center">{v.votedAt ? v.votedAt.toLocaleString() : "-"}</td>
                  <td className="p-2 border text-center">
                    {v.isEnded ? <span className="text-red-600 font-semibold">Đã kết thúc</span> : <span className="text-green-600 font-semibold">Đang diễn ra</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
