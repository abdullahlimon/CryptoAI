export type Sector = {
  slug: string;
  name: string;
  blurb: string;
  coinIds: string[];
};

export const SECTORS: Sector[] = [
  {
    slug: "ai",
    name: "AI",
    blurb: "Compute, agents, and inference networks.",
    coinIds: [
      "render-token",
      "fetch-ai",
      "bittensor",
      "the-graph",
      "near",
      "internet-computer",
      "akash-network",
      "ocean-protocol",
    ],
  },
  {
    slug: "rwa",
    name: "RWA",
    blurb: "Tokenized real-world assets and yield.",
    coinIds: ["chainlink", "ondo-finance", "pendle", "maker", "centrifuge"],
  },
  {
    slug: "depin",
    name: "DePIN",
    blurb: "Decentralized physical infrastructure.",
    coinIds: [
      "render-token",
      "helium",
      "filecoin",
      "akash-network",
      "iotex",
      "theta-token",
    ],
  },
  {
    slug: "l2",
    name: "Layer 2",
    blurb: "Rollups, ZK, and EVM scaling.",
    coinIds: ["arbitrum", "optimism", "matic-network", "starknet", "mantle"],
  },
  {
    slug: "gaming",
    name: "Gaming",
    blurb: "On-chain games and play-to-earn.",
    coinIds: [
      "immutable-x",
      "ronin",
      "axie-infinity",
      "gala",
      "the-sandbox",
      "decentraland",
    ],
  },
  {
    slug: "memes",
    name: "Memes",
    blurb: "High-beta culture coins.",
    coinIds: ["dogecoin", "shiba-inu", "pepe", "dogwifcoin", "bonk", "floki"],
  },
  {
    slug: "defi",
    name: "DeFi",
    blurb: "Decentralized exchanges, lending, governance.",
    coinIds: [
      "uniswap",
      "aave",
      "maker",
      "curve-dao-token",
      "compound-governance-token",
      "lido-dao",
    ],
  },
  {
    slug: "liquid_staking",
    name: "LSTs",
    blurb: "Liquid staking and restaking tokens.",
    coinIds: [
      "lido-dao",
      "rocket-pool",
      "ether-fi",
      "frax-share",
      "jito-governance-token",
    ],
  },
];

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
