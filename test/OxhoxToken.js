const { expect } = require("chai");
const { ethers } = require("hardhat"); 
describe("OxToken contract", function () {
  // Global vars
  let Token;
  let oxhoxToken;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("OxToken");
    [owner, addr1, addr2] = await ethers.getSigners();

    oxhoxToken = await Token.deploy(tokenCap, tokenBlockReward);
    // await oxhoxToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await oxhoxToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await oxhoxToken.balanceOf(owner.address);
      expect(await oxhoxToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the max capped supply to the argument provided during deployment", async function () {
      const cap = await oxhoxToken.cap();
      expect(cap).to.equal(
        ethers.parseUnits(tokenCap.toString(), 18)
      );
    });

  it("Should set the blockReward to the argument provided during deployment", async function () {
    const blockReward = await oxhoxToken.blockReward();
    expect(blockReward).to.equal(
      ethers.parseUnits(tokenBlockReward.toString(), 18)
    );
  });
  });

describe("Transactions", function () {
  it("Should transfer tokens between accounts", async function () {
    const transferAmount = ethers.parseUnits("50", 18);

    await oxhoxToken.transfer(addr1.address, transferAmount);

    const addr1Balance = await oxhoxToken.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);

    await oxhoxToken.connect(addr1).transfer(addr2.address, transferAmount);

    const addr2Balance = await oxhoxToken.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(transferAmount);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const initialOwnerBalance = await oxhoxToken.balanceOf(owner.address);

    const oneToken = ethers.parseUnits("1", 18);
    await expect(
      oxhoxToken.connect(addr1).transfer(owner.address, oneToken)
    ).to.be.reverted;

    expect(await oxhoxToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
  });

  it("Should update balances after transfers", async function () {
    const initialOwnerBalance = await oxhoxToken.balanceOf(owner.address);
    const transferAmount1 = ethers.parseUnits("100", 18);
    const transferAmount2 = ethers.parseUnits("50", 18);

    await oxhoxToken.transfer(addr1.address, transferAmount1);
    await oxhoxToken.transfer(addr2.address, transferAmount2);

    const finalOwnerBalance = await oxhoxToken.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount1 - transferAmount2);

    const addr1Balance = await oxhoxToken.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount1);

    const addr2Balance = await oxhoxToken.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(transferAmount2);
  });
});
});