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
        bool isActive; // Thêm trường trạng thái
    }

    struct Election {
        string title;
        bool isActive;
        bool isEnded;
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

    function createElection(string memory _title, uint _startTime, uint _endTime) public onlyAdmin {
        require(_startTime < _endTime, "Invalid time range");
        Election storage e = elections[electionCount];
        e.title = _title;
        e.startTime = _startTime;
        e.endTime = _endTime;
        e.isActive = true;
        electionCount++;
    }

    function addCandidate(
        uint _electionId,
        string memory _name,
        string memory _bio,
        string memory _achievements,
        string memory _image
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(e.isActive, "Election not active");
        e.candidates[e.candidateCount] = Candidate(
            e.candidateCount,
            _name,
            _bio,
            _achievements,
            _image,
            0,
            true // isActive luôn phải có dấu phẩy trước
        );
        e.candidateCount++;
    }

    // Ẩn/Hiện ứng viên
    function setCandidateActive(
        uint _electionId,
        uint _candidateId,
        bool _active
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
        require(_candidateId < e.candidateCount, "Invalid candidate");
        e.candidates[_candidateId].isActive = _active;
    }

    function vote(uint _electionId, uint _candidateId) public {
        Election storage e = elections[_electionId];
        require(block.timestamp >= e.startTime && block.timestamp <= e.endTime, "Election not ongoing");
        require(!e.hasVoted[msg.sender], "You have already voted");
        require(_candidateId < e.candidateCount, "Invalid candidate");
        require(e.candidates[_candidateId].isActive, "Candidate is not active"); // Không cho vote nếu đã ẩn

        e.candidates[_candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;
    }

    // Sửa lại để trả về cả trạng thái isActive (boolean cuối)
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

    function getElectionDetails(uint _electionId)
        public
        view
        returns (string memory title, uint startTime, uint endTime, bool isActive, uint candidateCount, bool isEnded)
    {
        Election storage e = elections[_electionId];
        return (e.title, e.startTime, e.endTime, e.isActive, e.candidateCount, e.isEnded);
    }


    function hasVoted(uint _electionId, address _voter) public view returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }

    function endElection(uint _electionId) public onlyAdmin {
    elections[_electionId].isActive = false;
    elections[_electionId].isEnded = true; // Ghi nhận kết thúc vĩnh viễn
}


    function toggleElectionActive(uint _electionId) public onlyAdmin {
        require(block.timestamp < elections[_electionId].endTime, "Election already ended");
        elections[_electionId].isActive = !elections[_electionId].isActive;
    }

    function getAllElectionDetails()
        public
        view
        returns (
            string[] memory titles,
            uint[] memory starts,
            uint[] memory ends,
            bool[] memory actives,
            uint[] memory candidateCounts,
            bool[] memory endedArr   // <-- Thêm dòng này!
        )
    {
        titles = new string[](electionCount);
        starts = new uint[](electionCount);
        ends = new uint[](electionCount);
        actives = new bool[](electionCount);
        candidateCounts = new uint[](electionCount);
        endedArr = new bool[](electionCount); // <-- Thêm dòng này!

        for (uint i = 0; i < electionCount; i++) {
            Election storage e = elections[i];
            titles[i] = e.title;
            starts[i] = e.startTime;
            ends[i] = e.endTime;
            actives[i] = e.isActive;
            candidateCounts[i] = e.candidateCount;
            endedArr[i] = !e.isActive || block.timestamp > e.endTime; // Xác định trạng thái kết thúc
        }
}


    // Update thông tin ứng viên
    function updateCandidate(
        uint _electionId,
        uint _candidateId,
        string memory _name,
        string memory _bio,
        string memory _achievements,
        string memory _image
    ) public onlyAdmin {
        Election storage e = elections[_electionId];
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
