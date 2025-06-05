// src/pages/AddCandidate.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export default function AddCandidate() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    achievements: "",
    policies: "",
    image: "",
    electionId: "" // Lưu electionId chọn được
  });
  const [elections, setElections] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load các kỳ bầu cử đang hoạt động
  const loadElections = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
      const data = await contract.getAllElectionDetails();
      const now = new Date();

      const activeElections = [];
      for (let i = 0; i < data[0].length; i++) {
        const startTime = new Date(Number(data[1][i]) * 1000);
        const endTime = new Date(Number(data[2][i]) * 1000);
        const isActive = data[3][i];
        if (startTime > now && isActive) {
  // Kỳ sắp diễn ra (tương lai) và đang active
  activeElections.push({
    id: i,
    title: data[0][i] + " (Sắp diễn ra)",
    startTime,
    endTime
  });
}
    if (startTime <= now && endTime >= now && isActive) {
      // Kỳ đang diễn ra
      activeElections.push({
        id: i,
        title: data[0][i] + " (Đang diễn ra)",
        startTime,
        endTime
      });
    }

      }
      setElections(activeElections);
    } catch (err) {
      setMessage("❌ Không thể tải danh sách kỳ bầu cử.");
      setElections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadElections();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.electionId) {
      setMessage("❌ Vui lòng chọn kỳ bầu cử.");
      return;
    }
    if (!form.name || !form.bio || !form.achievements || !form.policies || !form.image) {
      setMessage("❌ Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      if (!window.ethereum) return alert("Vui lòng cài MetaMask");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111) {
        return alert("❌ Vui lòng chuyển MetaMask sang mạng Sepolia.");
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        VotingInfo.address,
        VotingInfo.abi,
        signer
      );
      const achievementsWithPolicies = `${form.achievements}\n\n--- Chính sách tranh cử ---\n${form.policies}`;
      const tx = await contract.addCandidate(
        Number(form.electionId),
        form.name,
        form.bio,
        achievementsWithPolicies,
        form.image
      );
      await tx.wait();

      setMessage("✅ Ứng viên đã được thêm thành công!");
      setForm({
        name: "",
        bio: "",
        achievements: "",
        policies: "",
        image: "",
        electionId: ""
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Thêm ứng viên thất bại. Có thể bạn không phải admin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          👨‍⚖️ Thêm Ứng viên Tổng thống
        </h1>

        {/* Chọn kỳ bầu cử */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chọn kỳ bầu cử đang hoạt động
        </label>
        {loading ? (
          <div className="mb-4 text-gray-500">Đang tải danh sách kỳ bầu cử...</div>
        ) : elections.length === 0 ? (
          <div className="mb-4 text-red-500">Không có kỳ bầu cử nào đang hoạt động.</div>
        ) : (
          <select
            name="electionId"
            value={form.electionId}
            onChange={handleChange}
            className="mb-4 w-full px-4 py-2 border rounded-md"
          >
            <option value="">-- Chọn kỳ bầu cử --</option>
            {elections.map((el) => (
              <option key={el.id} value={el.id}>
                {el.title} (Từ {el.startTime.toLocaleString()} đến {el.endTime.toLocaleString()})
              </option>
            ))}
          </select>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Tên ứng viên</label>
        <input
          type="text"
          name="name"
          placeholder="Nguyễn Văn A"
          value={form.name}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
        <textarea
          name="bio"
          placeholder="Tóm tắt tiểu sử..."
          value={form.bio}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Thành tích & Kinh nghiệm</label>
        <textarea
          name="achievements"
          placeholder="Thành tích nổi bật..."
          value={form.achievements}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Chính sách tranh cử</label>
        <textarea
          name="policies"
          placeholder="Chính sách tranh cử (cách nhau bởi dấu xuống dòng)"
          value={form.policies}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh ứng viên</label>
        <input
          type="text"
          name="image"
          placeholder="https://..."
          value={form.image}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
        />

        <button
          onClick={handleAdd}
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700"
          disabled={loading || elections.length === 0}
        >
          ➕ Thêm ứng viên
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
