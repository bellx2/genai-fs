import { Spinner, StatusMessage } from "@inkjs/ui";

interface StatusScreenProps {
  isProcessing: boolean;
  message: string;
}

// 処理中/完了/エラー表示
export function StatusScreen({ isProcessing, message }: StatusScreenProps) {
  const isError = message.startsWith("Error");

  if (isProcessing) {
    return <Spinner label={message} />;
  }

  return (
    <StatusMessage variant={isError ? "error" : "success"}>
      {message}
    </StatusMessage>
  );
}
