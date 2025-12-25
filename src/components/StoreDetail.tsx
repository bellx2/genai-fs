import { Box, Text } from "ink";
import type { FileSearchStore } from "../lib/api.ts";
import { formatBytes, formatDate } from "../utils/formatters.ts";

interface StoreDetailProps {
  store: FileSearchStore;
}

// Store詳細表示
export function StoreDetail({ store }: StoreDetailProps) {
  const active = store.activeDocumentsCount ?? "0";
  const pending = store.pendingDocumentsCount ?? "0";
  const failed = store.failedDocumentsCount ?? "0";

  return (
    <Box flexDirection="column" gap={0}>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            DisplayName
          </Text>
        </Box>
        <Text>{store.displayName}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            ID
          </Text>
        </Box>
        <Text>{store.name.split("/").pop()}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            FullID
          </Text>
        </Box>
        <Text>{store.name}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Size
          </Text>
        </Box>
        <Text>{formatBytes(store.sizeBytes)}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Documents
          </Text>
        </Box>
        <Text color="green">{active} active</Text>
        {pending !== "0" && <Text color="yellow"> / {pending} pending</Text>}
        {failed !== "0" && <Text color="red"> / {failed} failed</Text>}
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Created
          </Text>
        </Box>
        <Text>{formatDate(store.createTime)}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Updated
          </Text>
        </Box>
        <Text>{formatDate(store.updateTime)}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Esc/b: Back  q: Quit</Text>
      </Box>
    </Box>
  );
}
