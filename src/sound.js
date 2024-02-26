// This contract is on testnet, update to the PRD contract address after deployment
const SOUND_CONTRACT_ADDRESS = "0x72D35D3C8405C5c1a71DDA497ed2587Fcc75f4e2";

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
    inputs: [{ internalType: "address", name: "trustee_", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
    inputs: [
      { internalType: "address", name: "contractAddress", type: "address" },
      { internalType: "uint256", name: "tokenID", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct OwnerData.Data",
        name: "data",
        type: "tuple",
      },
    ],
    name: "add",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "contractAddress", type: "address" },
      { internalType: "uint256", name: "tokenID", type: "uint256" },
    ],
    name: "get",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
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
    inputs: [
      { internalType: "address", name: "contractAddress", type: "address" },
      { internalType: "uint256", name: "tokenID", type: "uint256" },
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bytes", name: "dataHash", type: "bytes" },
          { internalType: "string", name: "metadata", type: "string" },
        ],
        internalType: "struct OwnerData.Data",
        name: "data",
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
        name: "signature",
        type: "tuple",
      },
    ],
    name: "signedAdd",
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

export async function getData(contractAddress, tokenID) {
  return contract.methods.get(contractAddress, tokenID).call();
}
