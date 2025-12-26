import { Box, Text } from "ink";
import type { Document } from "../lib/api.ts";
import { formatBytes, formatDate, formatState } from "../utils/formatters.ts";

interface DocumentDetailProps {
  document: Document;
}

// Document詳細表示
export function DocumentDetail({ document }: DocumentDetailProps) {
  const state = formatState(document.state);

  return (
    <Box flexDirection="column" gap={0}>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Name
          </Text>
        </Box>
        <Text>{document.displayName || "-"}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            ID
          </Text>
        </Box>
        <Text>{document.name.split("/").pop()}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            MIME Type
          </Text>
        </Box>
        <Text>{document.mimeType || "-"}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Size
          </Text>
        </Box>
        <Text>{formatBytes(document.sizeBytes)}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            State
          </Text>
        </Box>
        <Text color={state.color}>{state.text}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Created
          </Text>
        </Box>
        <Text>{formatDate(document.createTime)}</Text>
      </Box>
      <Box>
        <Box width={14}>
          <Text bold dimColor>
            Updated
          </Text>
        </Box>
        <Text>{formatDate(document.updateTime)}</Text>
      </Box>

      {document.customMetadata && document.customMetadata.length > 0 && (
        <>
          <Box marginTop={1}>
            <Text bold color="yellow">
              Custom Metadata:
            </Text>
          </Box>
          {document.customMetadata.map((meta) => (
            <Box key={meta.key}>
              <Box width={14}>
                <Text dimColor>{meta.key}</Text>
              </Box>
              <Text>{meta.stringValue ?? meta.numericValue ?? "-"}</Text>
            </Box>
          ))}
        </>
      )}
      <Box marginTop={1}>
        <Text dimColor>Esc/b: Back  q: Quit</Text>
      </Box>
    </Box>
  );
}
