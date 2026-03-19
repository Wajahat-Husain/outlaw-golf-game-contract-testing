import { TOKEN_DECIMALS } from "./constants";

export const formatTokenAmount = (lamports, decimals = TOKEN_DECIMALS) => {
  return (lamports / Math.pow(10, decimals)).toFixed(decimals);
};

export const parseTokenAmount = (amount, decimals = TOKEN_DECIMALS) => {
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
};

export const formatPublicKey = (publicKey, startChars = 4, endChars = 4) => {
  const address = publicKey.toString();
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatBpsToPercentage = (bps) => {
  return (bps / 100).toFixed(2);
};

export const parsePercentageToBps = (percentage) => {
  return Math.round(parseFloat(percentage) * 100);
};

export const formatWagerStatus = (status) => {
  if (!status) return "Unknown";
  const statusKey = Object.keys(status)[0];
  return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
};
