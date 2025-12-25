import { Box, Text } from "ink";
import type { Document } from "../lib/api.ts";

interface DocumentDeleteConfirmProps {
  document: Document;
}

// Document削除確認ダイアログ
export function DocumentDeleteConfirm({
  document,
}: DocumentDeleteConfirmProps) {
  const name = document.displayName || document.name.split("/").pop();

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="red" bold>
          Delete this document?
        </Text>
      </Box>
      <Text>{name}</Text>
      <Box marginTop={1}>
        <Text dimColor>y: Delete  n/Esc: Cancel</Text>
      </Box>
    </Box>
  );
}
