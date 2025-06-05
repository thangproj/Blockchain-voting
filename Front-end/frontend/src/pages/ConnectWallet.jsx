import React from "react";
import { useNavigate } from "react-router-dom";

export default function ConnectWallet() {
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask để sử dụng ứng dụng.");
      return;
    }
    try {
      // Yêu cầu MetaMask kết nối
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // Kết nối thành công → chuyển hướng sang trang chủ người dùng
      navigate("/User-home");
    } catch (error) {
      alert("Kết nối MetaMask thất bại.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">🦊 Đăng nhập bằng MetaMask</h1>
        <button
          className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold text-lg hover:bg-indigo-700"
          onClick={handleConnect}
        >
          Kết nối MetaMask
        </button>
      </div>
    </div>
  );
}
