import { Box, Text } from "ink";
import type { Document } from "../lib/api.ts";
import { formatBytes, formatDate, formatState } from "../utils/formatters.ts";

interface DocumentListProps {
  documents: Document[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
}

// Document一覧テーブル
export function DocumentList({
  documents,
  selectedIndex,
  loading,
  error,
}: DocumentListProps) {
  if (loading) {
    return <Text color="gray">Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  if (documents.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="gray">No documents found</Text>
        <Box marginTop={1}>
          <Text dimColor>u: Upload  Esc: Back  q: Quit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box gap={1} marginBottom={1}>
        <Box width={28}>
          <Text bold dimColor>
            Name
          </Text>
        </Box>
        <Box width={10}>
          <Text bold dimColor>
            State
          </Text>
        </Box>
        <Box width={12}>
          <Text bold dimColor>
            Size
          </Text>
        </Box>
        <Box width={22}>
          <Text bold dimColor>
            Created
          </Text>
        </Box>
        <Box width={22}>
          <Text bold dimColor>
            Updated
          </Text>
        </Box>
      </Box>
      {documents.map((doc, index) => {
        const state = formatState(doc.state);
        const name = doc.displayName || doc.name.split("/").pop() || "";
        return (
          <Box key={doc.name} gap={1}>
            <Box width={28}>
              <Text color={index === selectedIndex ? "green" : "white"}>
                {index === selectedIndex ? "❯ " : "  "}
                {name.slice(0, 24)}
              </Text>
            </Box>
            <Box width={10}>
              <Text color={state.color}>{state.text}</Text>
            </Box>
            <Box width={12}>
              <Text dimColor>{formatBytes(doc.sizeBytes)}</Text>
            </Box>
            <Box width={22}>
              <Text dimColor>{formatDate(doc.createTime)}</Text>
            </Box>
            <Box width={22}>
              <Text dimColor>{formatDate(doc.updateTime)}</Text>
            </Box>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>Up/Down: Select  Enter/i: Info  d: Delete  u: Upload  Esc: Back  q: Quit</Text>
      </Box>
    </Box>
  );
}
