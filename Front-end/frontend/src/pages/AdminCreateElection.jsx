import React, { useState, useEffect } from "react";
import { useCheckAdmin } from "../hooks/useCheckAdmin";
import { useNavigate } from "react-router-dom";
import { getContract, getSigner } from "../ethers"; // <-- Dùng file ethers.js

export default function CreateElection() {
  const isAdmin = useCheckAdmin();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

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

      const contract = getContract(getSigner());
      const provider = contract.provider;
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111) {
        setLoading(false);
        return alert("❌ Vui lòng chuyển MetaMask sang mạng Sepolia.");
      }

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

  if (isAdmin === null) return <div>Đang kiểm tra quyền truy cập...</div>;

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
