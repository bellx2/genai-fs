import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { readdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { homedir } from "os";

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
}

interface FileBrowserProps {
  onSelect: (filePath: string) => void;
  onCancel: () => void;
  initialPath?: string;
}

// ファイルサイズをフォーマット
function formatSize(bytes: number | undefined): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileBrowser({ onSelect, onCancel, initialPath }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState(initialPath || homedir());
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ディレクトリの内容を読み込む
  useEffect(() => {
    const loadDirectory = async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await readdir(currentPath);
        const fileEntries: FileEntry[] = [];

        // 親ディレクトリへのエントリ
        const parent = dirname(currentPath);
        if (parent !== currentPath) {
          fileEntries.push({
            name: "..",
            path: parent,
            isDirectory: true,
          });
        }

        // 各アイテムの情報を取得
        for (const name of items) {
          // 隠しファイルをスキップ
          if (name.startsWith(".")) continue;

          try {
            const fullPath = join(currentPath, name);
            const stats = await stat(fullPath);
            fileEntries.push({
              name,
              path: fullPath,
              isDirectory: stats.isDirectory(),
              size: stats.isFile() ? stats.size : undefined,
            });
          } catch {
            // アクセスできないファイルはスキップ
          }
        }

        // ディレクトリを先に、その後ファイルをソート
        fileEntries.sort((a, b) => {
          if (a.name === "..") return -1;
          if (b.name === "..") return 1;
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

        setEntries(fileEntries);
        setSelectedIndex(0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load directory");
      } finally {
        setLoading(false);
      }
    };

    loadDirectory();
  }, [currentPath]);

  useInput((input, key) => {
    if (loading) return;

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : entries.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < entries.length - 1 ? prev + 1 : 0));
    }
    if (key.return) {
      const selected = entries[selectedIndex];
      if (selected) {
        if (selected.isDirectory) {
          setCurrentPath(selected.path);
        } else {
          onSelect(selected.path);
        }
      }
    }
    if (key.escape || input === "q") {
      onCancel();
    }
  });

  // 表示するエントリ数を制限（スクロール対応）
  const maxVisible = 15;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleEntries = entries.slice(startIndex, startIndex + maxVisible);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="yellow">Select a file:</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>Current path: </Text>
        <Text>{currentPath}</Text>
      </Box>

      {loading && <Text color="gray">Loading...</Text>}
      {error && <Text color="red">Error: {error}</Text>}

      {!loading && !error && entries.length === 0 && (
        <Text color="gray">No files found</Text>
      )}

      {!loading && !error && entries.length > 0 && (
        <Box flexDirection="column">
          {visibleEntries.map((entry, idx) => {
            const actualIndex = startIndex + idx;
            const isSelected = actualIndex === selectedIndex;
            return (
              <Box key={entry.path} gap={1}>
                <Text color={isSelected ? "green" : "white"}>
                  {isSelected ? "❯ " : "  "}
                  {entry.isDirectory ? "📁 " : "📄 "}
                  {entry.name}
                </Text>
                {!entry.isDirectory && entry.size !== undefined && (
                  <Text dimColor>{formatSize(entry.size)}</Text>
                )}
              </Box>
            );
          })}
          {entries.length > maxVisible && (
            <Text dimColor>
              ({selectedIndex + 1}/{entries.length})
            </Text>
          )}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Up/Down: Select  Enter: Confirm/Open  Esc: Cancel</Text>
      </Box>
    </Box>
  );
}
