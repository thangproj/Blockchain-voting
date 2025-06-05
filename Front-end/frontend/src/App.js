// File: src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// User
import ConnectWallet from "./pages/ConnectWallet";
import UserHome from "./pages/UserHome";
import UserActiveElectionList from "./pages/UserActiveElectionList.jsx";
import UserVoteCandidates from "./pages/UserVoteCandidates.jsx";
import UserCandidateDetail from "./pages/UserCandidateDetail.jsx";
import CheckVoteStatus from "./pages/CheckVoteStatus";
import UserElectionResults from "./pages/UserElectionResults.jsx";
import UserVoteLog from "./pages/UserVoteLog.jsx";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateElection from "./pages/AdminCreateElection.jsx";
import AdminEditCandidate from "./pages/AdminEditCandidate.jsx";
import AdminAddCandidate from "./pages/AdminAddCandidate.jsx";

import AdminDeactivateCandidate from "./pages/AdminDeactivateCandidate.jsx";
import AdminAllCandidatesByElection from "./pages/AdminAllCandidatesByElection.jsx";
import AdminElectionStatusManager from "./pages/AdminElectionStatusManager.jsx";
import AdminEndElection from "./pages/AdminEndElection.jsx";
import AdminElectionList from "./pages/AdminElectionList.jsx";
import AdminVoteResults from "./pages/AdminVoteResults.jsx";
import AdminVoteLog from "./pages/AdminVoteLog.jsx";
import AdminElectionWinner from "./pages/AdminElectionWinner.jsx";
import AdminElectionDetail from "./pages/AdminElectionDetail.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* User Pages */}
        <Route path="/" element={<ConnectWallet />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/user/vote-log" element={<UserVoteLog />} />
        <Route path="/user/elections" element={<UserActiveElectionList />} />
        <Route path="/user/election/:electionId" element={<AdminElectionDetail />} /> {/* Nếu muốn user xem chi tiết phải dùng UserElectionDetail nếu có, hoặc để admin xem */}
        <Route path="/user/vote/:electionId" element={<UserVoteCandidates />} />
        <Route path="/user/vote/:electionId/candidate/:candidateId" element={<UserCandidateDetail />} />
        <Route path="/user/my-votes" element={<CheckVoteStatus />} />
        <Route path="/user/results" element={<UserElectionResults />} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/elections" element={<AdminElectionList />} />
        <Route path="/admin/create-election" element={<AdminCreateElection />} />
        <Route path="/admin/end-election" element={<AdminEndElection />} />
        <Route path="/admin/all-candidates" element={<AdminAllCandidatesByElection />} />
        <Route path="/admin/deactivate-candidate" element={<AdminDeactivateCandidate />} />
        <Route path="/admin/votes" element={<AdminVoteResults />} />
        <Route path="/admin/vote-log" element={<AdminVoteLog />} />
        <Route path="/admin/elections-winner" element={<AdminElectionWinner />} />
        <Route path="/admin/manage-elections" element={<AdminElectionStatusManager />} />
        <Route path="/admin/edit-candidate" element={<AdminEditCandidate />} />
        <Route path="/admin/add-candidate" element={<AdminAddCandidate />} />
        {/* Nếu admin muốn xem chi tiết kỳ bầu cử */}
        <Route path="/admin/election/:electionId" element={<AdminElectionDetail />} />
      </Routes>
    </Router>
  );
}
