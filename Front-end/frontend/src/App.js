// File: src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// User
import ConnectWallet from "./pages/ConnectWallet";
import UserHome from "./pages/UserHome";
import UserElectionList from "./pages/UserElectionList";
import ElectionCandidates from "./pages/UserElectionCandidates";
import CandidateDetail from "./pages/CandidateDetail";
import CheckVoteStatus from "./pages/CheckVoteStatus";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import EditCandidate from "./pages/EditCandidate";
import AddCandidate from "./pages/AddCandidate";
import DeactivateCandidate from "./pages/DeactivateCandidate";
import AllCandidatesByElection from "./pages/AllCandidatesByElection";
import ElectionStatusManager from "./pages/ElectionStatusManager";
import EndElection from "./pages/EndElection";
import ElectionList from "./pages/ElectionList";
import VoteResults from "./pages/VoteResults";
import VoteLog from "./pages/VoteLog";
import ElectionWinner from "./pages/ElectionWinner";

// Detail
import ElectionDetail from "./pages/ElectionDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* User Pages */}
        <Route path="/" element={<ConnectWallet />} />
        <Route path="/user-home" element={<UserHome />} />
        <Route path="/user/elections" element={<UserElectionList />} />
        <Route path="/user/election/:electionId" element={<ElectionDetail />} />
        <Route path="/user/vote/:electionId" element={<ElectionCandidates />} />
        <Route path="/user/vote/:electionId/candidate/:candidateId" element={<CandidateDetail />} />
        <Route path="/user/my-votes" element={<CheckVoteStatus />} />



        {/* Admin Pages */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/elections" element={<ElectionList />} />
        <Route path="/admin/create-election" element={<CreateElection />} />
        <Route path="/admin/end-election" element={<EndElection />} />
        <Route path="/admin/all-candidates" element={<AllCandidatesByElection />} />
        <Route path="/admin/deactivate-candidate" element={<DeactivateCandidate />} />
        <Route path="/admin/votes" element={<VoteResults />} />
        <Route path="/admin/vote-log" element={<VoteLog />} />
        <Route path="/admin/elections-winner" element={<ElectionWinner />} />
        <Route path="/admin/manage-elections" element={<ElectionStatusManager />} />
        <Route path="/admin/edit-candidate" element={<EditCandidate />} />
        <Route path="/admin/add-candidate" element={<AddCandidate />} />
      </Routes>
    </Router>
  );
}

