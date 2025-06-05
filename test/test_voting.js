const { expect } = require("chai");

describe("Voting", function () {
  async function deployVotingFixture() {
    const [admin, voter1, voter2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    return { voting, admin, voter1, voter2 };
  }

it("Admin should add a candidate", async function () {
  const { voting } = await deployVotingFixture();
  await voting.addCandidate("Alice", "Bio", "Award", "ipfs://img");

  const [id, name, bio, achievements, image, voteCount] = await voting.getCandidate(0);

  expect(name).to.equal("Alice");
  expect(voteCount).to.equal(0);
});

  it("Non-admin should not be able to add candidate", async function () {
    const { voting, voter1 } = await deployVotingFixture();

    await expect(
      voting.connect(voter1).addCandidate("Bob", "Bio", "Achieve", "img")
    ).to.be.revertedWith("Only admin can add candidates");
  });

  it("User should vote and vote count should increase", async function () {
  const { voting, voter1 } = await deployVotingFixture();
  await voting.addCandidate("Charlie", "Bio", "Win", "img");

  await voting.connect(voter1).vote(0);

  const [ , , , , , voteCount] = await voting.getCandidate(0);
  expect(voteCount).to.equal(1);
});

  it("Should not allow double voting from same address", async function () {
    const { voting, voter1 } = await deployVotingFixture();

    await voting.addCandidate("Delta", "Bio", "Champ", "img");

    await voting.connect(voter1).vote(0);

    await expect(voting.connect(voter1).vote(0)).to.be.revertedWith(
      "You have already voted"
    );
  });

  it("Should not allow voting for invalid candidate", async function () {
    const { voting, voter2 } = await deployVotingFixture();

    await expect(voting.connect(voter2).vote(99)).to.be.revertedWith(
      "Invalid candidate"
    );
  });

  it("Should return correct candidate data", async function () {
    const { voting } = await deployVotingFixture();

    await voting.addCandidate("Echo", "Bio", "Medal", "img");

    const [id, name, bio, achievements, image, voteCount] =
      await voting.getCandidate(0);

    expect(id).to.equal(0);
    expect(name).to.equal("Echo");
    expect(bio).to.equal("Bio");
    expect(achievements).to.equal("Medal");
    expect(image).to.equal("img");
    expect(voteCount).to.equal(0);
  });
});
