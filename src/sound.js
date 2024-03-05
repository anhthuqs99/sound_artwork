// This contract is on testnet, update to the PRD contract address after deployment
const SOUND_CONTRACT_ADDRESS = "0xe53a1E65740E9fE3314D5c271cAa309BC95145cD";

const NETWORKS = {
  mainnet: 1,
  sepolia: 11155111,
};

const RPC_ENDPOINT = {
  1: "https://ethereum.publicnode.com",
  11155111: "https://ethereum-sepolia.publicnode.com",
};

const SOUND_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "signer_", type: "address" },
      { internalType: "address", name: "costReceiver_", type: "address" },
      { internalType: "uint256", name: "cost_", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "CostIsZero", type: "error" },
  { inputs: [], name: "CostReceiverIsZeroAddress", type: "error" },
  { inputs: [], name: "IndexOutOfBounds", type: "error" },
  { inputs: [], name: "InvalidParameters", type: "error" },
  { inputs: [], name: "InvalidSignature", type: "error" },
  { inputs: [], name: "OwnerAndSenderMismatch", type: "error" },
  { inputs: [], name: "OwnerDataAlreadyAdded", type: "error" },
  { inputs: [], name: "PaymentRequiredForPublicToken", type: "error" },
  { inputs: [], name: "SenderIsNotTheOwner", type: "error" },
  { inputs: [], name: "TrusteeIsZeroAddress", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenID",
        type: "uint256",
      },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "uint256", name: "blockNumber", type: "uint256" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        indexed: false,
        internalType: "struct OwnerData.Data",
        name: "data",
        type: "tuple",
      },
    ],
    name: "DataAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "contractAddress_", type: "address" },
      { internalType: "uint256", name: "tokenID_", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "uint256", name: "blockNumber", type: "uint256" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct OwnerData.Data",
        name: "data_",
        type: "tuple",
      },
    ],
    name: "add",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "cost",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "contractAddress_", type: "address" },
      { internalType: "uint256", name: "tokenID_", type: "uint256" },
      { internalType: "uint256", name: "startIndex", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "get",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "uint256", name: "blockNumber", type: "uint256" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct OwnerData.Data[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "contractAddress_", type: "address" },
      { internalType: "uint256", name: "tokenID_", type: "uint256" },
      { internalType: "uint256[]", name: "indexes_", type: "uint256[]" },
    ],
    name: "remove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "cost_", type: "uint256" }],
    name: "setCost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "contractAddresses_",
        type: "address[]",
      },
      { internalType: "uint256[]", name: "tokenIDs_", type: "uint256[]" },
      { internalType: "bool", name: "isPublic_", type: "bool" },
    ],
    name: "setPublicTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "contractAddress_", type: "address" },
      { internalType: "uint256", name: "tokenID_", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "uint256", name: "blockNumber", type: "uint256" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct OwnerData.Data",
        name: "data_",
        type: "tuple",
      },
      {
        components: [
          { internalType: "bytes", name: "ownerSign", type: "bytes" },
          { internalType: "uint256", name: "expiryBlock", type: "uint256" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
          { internalType: "uint8", name: "v", type: "uint8" },
        ],
        internalType: "struct OwnerData.Signature",
        name: "signature_",
        type: "tuple",
      },
    ],
    name: "signedAdd",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const networkID = NETWORKS.sepolia;
var contract;
var web3;

export async function setContract(rpcEndpoint) {
  rpcEndpoint = rpcEndpoint || RPC_ENDPOINT[networkID];
  if (!contract) {
    web3 = new Web3(rpcEndpoint);
    contract = new web3.eth.Contract(
      SOUND_CONTRACT_ABI,
      SOUND_CONTRACT_ADDRESS
    );
  }
}

export async function getData(contractAddress, tokenID, startIndex, count) {
  try {
    return contract.methods
      .get(contractAddress, tokenID, startIndex, count)
      .call();
  } catch (error) {
    console.log("Failed to get data from contract:", error);
  }
}
