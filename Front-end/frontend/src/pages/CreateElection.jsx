// src/pages/CreateElection.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json"; // ✅ Gộp abi + address

export default function CreateElection() {
  const [form, setForm] = useState({ title: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { title, start, end } = form;

    if (!title || !start || !end) {
      return setMessage("❌ Vui lòng nhập đầy đủ thông tin.");
    }

    const startTime = Math.floor(new Date(start).getTime() / 1000);
    const endTime = Math.floor(new Date(end).getTime() / 1000);

    if (startTime >= endTime) {
      return setMessage("❌ Thời gian bắt đầu phải trước thời gian kết thúc.");
    }

    try {
      setLoading(true);
      setMessage("");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // đảm bảo ví được kết nối
      const signer = provider.getSigner();
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, signer);

      const tx = await contract.createElection(title, startTime, endTime);
      await tx.wait();

      setMessage("✅ Tạo kỳ bầu cử thành công!");
      setForm({ title: "", start: "", end: "" });
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi tạo kỳ bầu cử. Hãy kiểm tra ví hoặc contract.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🗳️ Tạo kỳ bầu cử mới</h2>

      <div className="space-y-4">
        <input
          name="title"
          type="text"
          placeholder="Tên kỳ bầu cử"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block mb-1">⏱️ Bắt đầu</label>
            <input
              name="start"
              type="datetime-local"
              value={form.start}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex-1">
            <label className="block mb-1">⏳ Kết thúc</label>
            <input
              name="end"
              type="datetime-local"
              value={form.end}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Đang xử lý..." : "➕ Tạo kỳ bầu cử"}
        </button>

        {message && <div className="mt-4 text-sm text-center">{message}</div>}
      </div>
    </div>
  );
}
