import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "📅 Quản lý kỳ bầu cử",
      actions: [
        { label: "Tạo kỳ bầu cử mới", path: "/admin/create-election" },
        { label: "Kích hoạt / Vô hiệu hóa kỳ bầu cử", path: "/admin/manage-elections" },
        { label: "Kết thúc kỳ bầu cử", path: "/admin/end-election" },
        { label: "Xem danh sách các kỳ bầu cử", path: "/admin/elections" },
      ],
    },
    {
      title: "👤 Quản lý ứng viên",
      actions: [
        { label: "Thêm ứng viên vào kỳ bầu cử", path: "/admin/add-candidate" },
        { label: "Xem danh sách ứng viên của các kỳ", path: "/admin/all-candidates" },
        { label: "Cập nhật thông tin ứng viên", path: "/admin/edit-candidate" },
        { label: "Ẩn / Vô hiệu hóa ứng viên", path: "/admin/deactivate-candidate" },

      ],
    },
    {
      title: "📊 Quản lý kết quả",
      actions: [
        { label: "Xem số phiếu từng ứng viên", path: "/admin/votes" },
        { label: "Xác định ứng viên chiến thắng", path: "/admin/elections-winner" },
        { label: "Xuất dữ liệu kết quả (CSV / JSON)", path: "/admin/export-results" },
        { label: "Xem log hệ thống", path: "/admin/vote-log" },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🛠️ Admin Dashboard</h1>

      {sections.map((section, i) => (
        <div key={i} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {section.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="bg-gray-100 hover:bg-blue-100 text-gray-800 border border-blue-400 px-4 py-2 rounded shadow text-left"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
