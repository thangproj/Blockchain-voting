// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string bio;
        string achievements;
        string image;
        uint voteCount;
        bool isActive;
    }

    struct Election {
        string title;
        bool isActive; // true = đang hoạt động, false = tạm dừng (pause)
        bool isEnded;  // true = đã kết thúc (không thể bật lại)
        uint startTime;
        uint endTime;
        uint candidateCount;
        mapping(uint => Candidate) candidates;
        mapping(address => bool) hasVoted;
    }

    address public admin;
    uint public electionCount = 0;
    mapping(uint => Election) public elections; // electionId => Election

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Tạo kỳ bầu cử mới
    function createElection(string memory _title, uint _startTime, uint _endTime) public onlyAdmin {
        require(_startTime < _endTime, "Invalid time range");
        Election storage e = elections[electionCount];
        e.title = _title;
        e.startTime = _startTime;
        e.endTime = _endTime;
        e.isActive = true;
        e.isEnded = false;
        electionCount++;
    }

    // Thêm ứng viên
    function addCandidate(
        uint _electionId,
        string memory _name,
        string memory _bio,
        string memory _achievements,
        string memory _image
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(!e.isEnded, "Election ended");
        require(e.isActive, "Election not active");
        e.candidates[e.candidateCount] = Candidate(
            e.candidateCount,
            _name,
            _bio,
            _achievements,
            _image,
            0,
            true
        );
        e.candidateCount++;
    }

    // Ẩn/hiện ứng viên
    function setCandidateActive(
        uint _electionId,
        uint _candidateId,
        bool _active
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(_candidateId < e.candidateCount, "Invalid candidate");
        e.candidates[_candidateId].isActive = _active;
    }

    // Vote
    function vote(uint _electionId, uint _candidateId) public {
        Election storage e = elections[_electionId];
        require(!e.isEnded, "Election ended");
        require(e.isActive, "Election not active");
        require(block.timestamp >= e.startTime && block.timestamp <= e.endTime, "Election not ongoing");
        require(!e.hasVoted[msg.sender], "You have already voted");
        require(_candidateId < e.candidateCount, "Invalid candidate");
        require(e.candidates[_candidateId].isActive, "Candidate is not active");
        e.candidates[_candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;
        emit VoteCast(_electionId, msg.sender, _candidateId, block.timestamp);
    }

    // Lấy thông tin ứng viên
    function getCandidate(uint _electionId, uint _candidateId)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            string memory,
            string memory,
            uint,
            bool
        )
    {
        Candidate memory c = elections[_electionId].candidates[_candidateId];
        return (
            c.id,
            c.name,
            c.bio,
            c.achievements,
            c.image,
            c.voteCount,
            c.isActive
        );
    }

    // Lấy chi tiết kỳ bầu cử
    function getElectionDetails(uint _electionId)
        public
        view
        returns (string memory title, uint startTime, uint endTime, bool isActive, uint candidateCount, bool isEnded)
    {
        Election storage e = elections[_electionId];
        return (e.title, e.startTime, e.endTime, e.isActive, e.candidateCount, e.isEnded || block.timestamp > e.endTime);
    }

    // Kiểm tra đã bầu chưa
    function hasVoted(uint _electionId, address _voter) public view returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }

    // Kết thúc kỳ bầu cử (không mở lại được nữa)
    function endElection(uint _electionId) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(!e.isEnded, "Already ended");
        e.isActive = false;
        e.isEnded = true;
    }

    // Tạm dừng hoặc kích hoạt lại (chỉ khi chưa kết thúc)
    function toggleElectionActive(uint _electionId) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(!e.isEnded, "Election ended");
        e.isActive = !e.isActive;
    }

    // Lấy tất cả kỳ bầu cử
    function getAllElectionDetails()
        public
        view
        returns (
            string[] memory titles,
            uint[] memory starts,
            uint[] memory ends,
            bool[] memory actives,
            uint[] memory candidateCounts,
            bool[] memory endedArr
        )
    {
        titles = new string[](electionCount);
        starts = new uint[](electionCount);
        ends = new uint[](electionCount);
        actives = new bool[](electionCount);
        candidateCounts = new uint[](electionCount);
        endedArr = new bool[](electionCount);

        for (uint i = 0; i < electionCount; i++) {
            Election storage e = elections[i];
            titles[i] = e.title;
            starts[i] = e.startTime;
            ends[i] = e.endTime;
            actives[i] = e.isActive;
            candidateCounts[i] = e.candidateCount;
            // Kết thúc nếu admin bấm "end" hoặc hết hạn thời gian
            endedArr[i] = e.isEnded || block.timestamp > e.endTime;
        }
    }

    // Cập nhật ứng viên
    function updateCandidate(
        uint _electionId,
        uint _candidateId,
        string memory _name,
        string memory _bio,
        string memory _achievements,
        string memory _image
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(!e.isEnded, "Election ended");
        require(e.isActive, "Election not active");
        require(_candidateId < e.candidateCount, "Invalid candidate");
        Candidate storage c = e.candidates[_candidateId];
        c.name = _name;
        c.bio = _bio;
        c.achievements = _achievements;
        c.image = _image;
    }

    event VoteCast(
        uint indexed electionId,
        address indexed voter,
        uint candidateId,
        uint timestamp
    );
}
