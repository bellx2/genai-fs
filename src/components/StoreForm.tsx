import { Box, Text } from "ink";

interface StoreFormProps {
  mode: "create" | "delete";
  input: string;
  storeName?: string; // 削除時の確認用
}

// Store作成/削除確認フォーム
export function StoreForm({ mode, input, storeName }: StoreFormProps) {
  const isValid =
    mode === "create" ? input.trim().length > 0 : input === storeName;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color={mode === "create" ? "green" : "red"} bold>
          {mode === "create" ? "Create new store" : "Delete this store?"}
        </Text>
      </Box>
      <Text>
        {mode === "create"
          ? "Enter the store name:"
          : `To delete "${storeName}", type the store name to confirm:`}
      </Text>
      <Box marginTop={1}>
        <Text dimColor>{">"} </Text>
        <Text color={isValid ? "green" : "white"}>{input}</Text>
        <Text color="gray">|</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          {mode === "create" ? "Enter: Create" : "Enter: Confirm"}  Esc: Cancel
        </Text>
      </Box>
    </Box>
  );
}
