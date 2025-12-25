import { Box, Text } from "ink";
import { Spinner } from "./Spinner.tsx";

interface StatusScreenProps {
  isProcessing: boolean;
  message: string;
}

// 処理中/完了/エラー表示
export function StatusScreen({ isProcessing, message }: StatusScreenProps) {
  const isError = message.startsWith("Error");

  return (
    <Box flexDirection="column">
      {isProcessing ? (
        <Spinner message={message} />
      ) : (
        <Text color={isError ? "red" : "green"}>{message}</Text>
      )}
    </Box>
  );
}
