// src/ethers.js
import { ethers } from "ethers";
import VotingInfo from "./contracts/VotingInfo.json"; // Đường dẫn đúng tới file ABI của bạn

// Lấy provider (để chỉ đọc dữ liệu)
export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.providers.Web3Provider(window.ethereum);
}

// Lấy signer (để thực hiện giao dịch cần ký)
export function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

// Lấy contract instance (dùng để gọi hàm contract, truyền vào signer nếu muốn gửi giao dịch, hoặc provider nếu chỉ đọc)
export function getContract(signerOrProvider = null) {
  const p = signerOrProvider || getProvider();
  return new ethers.Contract(VotingInfo.address, VotingInfo.abi, p);
}

// Lấy account hiện tại (có thể dùng trong useEffect hoặc sự kiện connect)
export async function getCurrentAccount() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

// Kiểm tra network (ví dụ, mạng Sepolia là 11155111)
export async function checkNetwork(chainId = 11155111) {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return Number(network.chainId) === Number(chainId);
}

// Chuyển network nếu cần
export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }], // 0xaa36a7 là Hex của 11155111
    });
    return true;
  } catch (err) {
    return false;
  }
}
