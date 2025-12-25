import { Box, Text } from "ink";
import type { FileSearchStore } from "../lib/api.ts";
import { formatDate } from "../utils/formatters.ts";

interface StoreDetailProps {
  store: FileSearchStore;
}

// Store詳細表示
export function StoreDetail({ store }: StoreDetailProps) {
  return (
    <Box flexDirection="column" gap={0}>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Name
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
            Full Name
          </Text>
        </Box>
        <Text>{store.name}</Text>
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
