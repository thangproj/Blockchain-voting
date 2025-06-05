import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingInfo from "../contracts/VotingInfo.json";

export function useCheckAdmin() {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    async function check() {
      if (!window.ethereum) return setIsAdmin(false);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const contract = new ethers.Contract(VotingInfo.address, VotingInfo.abi, provider);
      const admin = await contract.admin();
      setIsAdmin(account.toLowerCase() === admin.toLowerCase());
    }
    check();
  }, []);

  return isAdmin;
}
