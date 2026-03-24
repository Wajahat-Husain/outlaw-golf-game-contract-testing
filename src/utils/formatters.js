import { TOKEN_DECIMALS_NUM } from "./constants";

export const formatTokenAmount = (
  rawAmount,
  decimals = TOKEN_DECIMALS_NUM,
) => {
  return (rawAmount / 10 ** decimals).toFixed(Math.min(decimals, 9));
};

export const parseTokenAmount = (
  amount,
  decimals = TOKEN_DECIMALS_NUM,
) => {
  return Math.floor(parseFloat(amount) * 10 ** decimals);
};

export const parseTokenAmountExact = (
  amount,
  decimals = TOKEN_DECIMALS_NUM,
) => {
  const normalized = String(amount ?? "").trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error("Invalid token amount format.");
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  if (fractionalPart.length > decimals) {
    throw new Error(`Amount supports up to ${decimals} decimal places.`);
  }

  const paddedFraction = fractionalPart.padEnd(decimals, "0");
  const baseUnits = `${wholePart}${paddedFraction}`.replace(/^0+/, "") || "0";
  return baseUnits;
};

export const formatPublicKey = (publicKey, startChars = 4, endChars = 4) => {
  const address = publicKey.toString();
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatTimestamp = (timestamp) => {
  if (timestamp == null) return "N/A";
  const sec =
    typeof timestamp?.toNumber === "function"
      ? timestamp.toNumber()
      : Number(timestamp);
  if (!Number.isFinite(sec)) return "N/A";
  return new Date(sec * 1000).toLocaleString();
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
