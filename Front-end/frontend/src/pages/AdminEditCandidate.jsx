import React, { useEffect, useState } from "react";
import { getContract, getSigner } from "../ethers"; // Sử dụng ethers.js

export default function UpdateCandidate() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    achievements: "",
    policies: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
          list.push({ id: i, name: c[1] });
        }
        setCandidates(list);
      } catch (err) {
        setCandidates([]);
      }
      setLoading(false);
    }
    fetchCandidates();
  }, [selectedElection]);

  // Load candidate info when candidate is selected
  useEffect(() => {
    if (!selectedElection || selectedCandidate === "") {
      setForm({
        name: "",
        bio: "",
        achievements: "",
        policies: "",
        image: ""
      });
      return;
    }
    async function fetchCandidate() {
      setLoading(true);
      try {
        const contract = getContract();
        const data = await contract.getCandidate(Number(selectedElection), Number(selectedCandidate));
        let [achievements, policies] = data[3].split("--- Chính sách tranh cử ---");
        policies = policies ? policies.trim() : "";
        setForm({
          name: data[1],
          bio: data[2],
          achievements: achievements ? achievements.trim() : "",
          policies,
          image: data[4]
        });
      } catch (err) {
        setForm({
          name: "",
          bio: "",
          achievements: "",
          policies: "",
          image: ""
        });
      }
      setLoading(false);
    }
    fetchCandidate();
    // eslint-disable-next-line
  }, [selectedCandidate, selectedElection]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!selectedElection || selectedCandidate === "") {
      setMessage("❌ Vui lòng chọn kỳ bầu cử và ứng viên.");
      return;
    }
    if (!form.name || !form.bio || !form.achievements || !form.image) {
      setMessage("❌ Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    try {
      if (!window.ethereum) return alert("Vui lòng cài MetaMask");
      const contract = getContract(getSigner());
      const provider = contract.provider;
      const { chainId } = await provider.getNetwork();
      if (chainId !== 11155111) {
        return alert("❌ Vui lòng chuyển MetaMask sang mạng Sepolia.");
      }
      const achievementsWithPolicies = `${form.achievements}\n\n--- Chính sách tranh cử ---\n${form.policies}`;
      const tx = await contract.updateCandidate(
        Number(selectedElection),
        Number(selectedCandidate),
        form.name,
        form.bio,
        achievementsWithPolicies,
        form.image
      );
      await tx.wait();
      setMessage("✅ Cập nhật ứng viên thành công!");
    } catch (error) {
      setMessage("❌ Cập nhật thất bại. Có thể bạn không phải admin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          ✏️ Cập nhật Thông tin Ứng viên
        </h1>
        {/* Chọn kỳ bầu cử */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ bầu cử</label>
          <select
            className="w-full px-4 py-2 border rounded-md"
            value={selectedElection}
            onChange={e => {
              setSelectedElection(e.target.value);
              setSelectedCandidate("");
              setForm({ name: "", bio: "", achievements: "", policies: "", image: "" });
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
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Form cập nhật ứng viên */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên ứng viên</label>
        <input
          type="text"
          name="name"
          placeholder="Nguyễn Văn A"
          value={form.name}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
          disabled={selectedCandidate === ""}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử</label>
        <textarea
          name="bio"
          placeholder="Tóm tắt tiểu sử..."
          value={form.bio}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
          disabled={selectedCandidate === ""}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Thành tích & Kinh nghiệm</label>
        <textarea
          name="achievements"
          placeholder="Thành tích nổi bật..."
          value={form.achievements}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
          disabled={selectedCandidate === ""}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Chính sách tranh cử</label>
        <textarea
          name="policies"
          placeholder="Chính sách tranh cử (cách nhau bởi dấu xuống dòng)"
          value={form.policies}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
          disabled={selectedCandidate === ""}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh ứng viên</label>
        <input
          type="text"
          name="image"
          placeholder="https://..."
          value={form.image}
          onChange={handleChange}
          className="mb-4 w-full px-4 py-2 border rounded-md"
          disabled={selectedCandidate === ""}
        />

        <button
          onClick={handleUpdate}
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700"
          disabled={!selectedElection || selectedCandidate === "" || loading}
        >
          Lưu thay đổi
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
