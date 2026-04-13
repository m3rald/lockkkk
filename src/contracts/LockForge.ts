export const LOCKFORGE_ADDRESS = "0xe66056b793de16774678f09ff74b35c97aa32f4d";

export const LOCKFORGE_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_descriptionIpfs", "type": "string" },
      { "internalType": "address", "name": "_seller", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "uint256", "name": "_deliveryDays", "type": "uint256" }
    ],
    "name": "createDeal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_dealId", "type": "uint256" }],
    "name": "acceptDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_dealId", "type": "uint256" },
      { "internalType": "string", "name": "_proofIpfs", "type": "string" }
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_dealId", "type": "uint256" }],
    "name": "approveRelease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_dealId", "type": "uint256" }],
    "name": "openDispute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_buyer", "type": "address" }],
    "name": "getDealsByBuyer",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "deliveryDays", "type": "uint256" },
          { "internalType": "string", "name": "descriptionIpfs", "type": "string" },
          { "internalType": "string", "name": "proofIpfs", "type": "string" },
          { "internalType": "enum LockForge.Status", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct LockForge.Deal[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_seller", "type": "address" }],
    "name": "getDealsBySeller",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "deliveryDays", "type": "uint256" },
          { "internalType": "string", "name": "descriptionIpfs", "type": "string" },
          { "internalType": "string", "name": "proofIpfs", "type": "string" },
          { "internalType": "enum LockForge.Status", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct LockForge.Deal[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreatedDeals",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "address", "name": "seller", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "deliveryDays", "type": "uint256" },
          { "internalType": "string", "name": "descriptionIpfs", "type": "string" },
          { "internalType": "string", "name": "proofIpfs", "type": "string" },
          { "internalType": "enum LockForge.Status", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
        ],
        "internalType": "struct LockForge.Deal[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export enum DealStatus {
  Created = 0,
  Accepted = 1,
  ProofSubmitted = 2,
  Completed = 3,
  Disputed = 4
}
