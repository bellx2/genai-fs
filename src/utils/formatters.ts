// フォーマット関数

// ファイルサイズをフォーマット
export function formatBytes(bytes: string | undefined): string {
  if (!bytes) return "-";
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// 日時をフォーマット
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("ja-JP");
}

// APIキーをマスク
export function maskApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Not set";
  if (apiKey.length <= 8) return "****";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

// ステータス表示をフォーマット
export function formatState(
  state: string | undefined
): { text: string; color: string } {
  switch (state) {
    case "ACTIVE":
    case "STATE_ACTIVE":
      return { text: "Active", color: "green" };
    case "PENDING":
    case "STATE_PENDING":
      return { text: "Pending", color: "yellow" };
    case "FAILED":
    case "STATE_FAILED":
      return { text: "Failed", color: "red" };
    default:
      return { text: state ?? "-", color: "gray" };
  }
}
