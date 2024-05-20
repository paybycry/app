import { arbitrum, foundry, mainnet, polygon } from "viem/chains";

const chainMapping: { [key: number]: any } = {
  1: mainnet,
  137: polygon,
  42161: arbitrum,
  31337: foundry,
  // Add more chains as needed
};

export default chainMapping;
