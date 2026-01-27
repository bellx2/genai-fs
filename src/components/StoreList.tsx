import { Box, Text } from "ink";
import type { FileSearchStore } from "../lib/api.ts";
import { formatDate } from "../utils/formatters.ts";

interface StoreListProps {
  stores: FileSearchStore[];
  selectedIndex: number;
  loading: boolean;
  error: string | null;
}

// Store一覧テーブル
export function StoreList({
  stores,
  selectedIndex,
  loading,
  error,
}: StoreListProps) {
  if (loading) {
    return <Text color="gray">Loading...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error}</Text>;
  }

  if (stores.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="gray">No stores found</Text>
        <Box marginTop={1}>
          <Text dimColor>n: New  q: Quit</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box gap={1} marginBottom={1}>
        <Box width={24}>
          <Text bold dimColor>
            Name
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
      {(() => {
        const maxVisible = 20;
        const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
        const visibleStores = stores.slice(startIndex, startIndex + maxVisible);
        return visibleStores.map((store, idx) => {
          const actualIndex = startIndex + idx;
          return (
            <Box key={store.name} gap={1}>
              <Box width={24}>
                <Text color={actualIndex === selectedIndex ? "green" : "white"}>
                  {actualIndex === selectedIndex ? "❯ " : "  "}
                  {store.displayName.slice(0, 20)}
                </Text>
              </Box>
              <Box width={22}>
                <Text dimColor>{formatDate(store.createTime)}</Text>
              </Box>
              <Box width={22}>
                <Text dimColor>{formatDate(store.updateTime)}</Text>
              </Box>
            </Box>
          );
        });
      })()}
      <Box marginTop={1}>
        <Text dimColor>
          {stores.length > 20 && `(${selectedIndex + 1}/${stores.length}) `}
          Up/Down: Select  Enter: Open  i: Info  n: New  d: Delete  q: Quit
        </Text>
      </Box>
    </Box>
  );
}
