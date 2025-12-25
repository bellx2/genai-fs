import { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import {
  listStores,
  listDocuments,
  uploadFile,
  deleteDocument,
  deleteStore,
  createStore,
  type FileSearchStore,
  type Document,
} from "./lib/api.ts";
import { FileBrowser } from "./components/FileBrowser.tsx";
import { StatusScreen } from "./components/StatusScreen.tsx";
import { StoreList } from "./components/StoreList.tsx";
import { StoreDetail } from "./components/StoreDetail.tsx";
import { StoreForm } from "./components/StoreForm.tsx";
import { DocumentList } from "./components/DocumentList.tsx";
import { DocumentDetail } from "./components/DocumentDetail.tsx";
import { DocumentDeleteConfirm } from "./components/DocumentDeleteConfirm.tsx";
import { maskApiKey } from "./utils/formatters.ts";

// 画面の種類
type Screen =
  | "store-select"
  | "store-detail"
  | "document-list"
  | "document-detail"
  | "file-browser"
  | "uploading"
  | "confirm-delete"
  | "deleting"
  | "confirm-store-delete"
  | "store-deleting"
  | "store-create"
  | "store-creating";

export function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>("store-select");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedStore, setSelectedStore] = useState<FileSearchStore | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // ストア一覧の状態
  const [stores, setStores] = useState<FileSearchStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ドキュメント一覧の状態
  const [documents, setDocuments] = useState<Document[]>([]);

  // アップロード状態
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(true);

  // 削除状態
  const [deleteStatus, setDeleteStatus] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ストア削除状態
  const [storeDeleteInput, setStoreDeleteInput] = useState("");
  const [storeDeleteStatus, setStoreDeleteStatus] = useState<string>("");
  const [isStoreDeleting, setIsStoreDeleting] = useState(false);

  // ストア作成状態
  const [storeCreateInput, setStoreCreateInput] = useState("");
  const [storeCreateStatus, setStoreCreateStatus] = useState<string>("");
  const [isStoreCreating, setIsStoreCreating] = useState(false);

  // ドキュメント一覧を再取得
  const refreshDocuments = useCallback(async () => {
    if (!selectedStore) return;
    try {
      setLoading(true);
      setError(null);
      const result = await listDocuments(selectedStore.name);
      setDocuments(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  // ストア一覧を取得
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await listStores();
        setStores(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // ストア選択時にドキュメント一覧を取得
  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  // ファイル選択時のハンドラ
  const handleFileSelect = async (filePath: string) => {
    if (!selectedStore) return;

    setScreen("uploading");
    setIsUploading(true);
    setUploadStatus(`Uploading: ${filePath.split("/").pop()}`);

    try {
      await uploadFile(selectedStore.name, filePath);
      setIsUploading(false);
      setUploadStatus("Upload complete!");

      // 少し待ってから一覧を更新
      setTimeout(async () => {
        await refreshDocuments();
        setScreen("document-list");
        setSelectedIndex(0);
      }, 1500);
    } catch (e) {
      setIsUploading(false);
      setUploadStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => {
        setScreen("document-list");
      }, 3000);
    }
  };

  const handleFileBrowserCancel = () => {
    setScreen("document-list");
  };

  // ドキュメント削除ハンドラ
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    setScreen("deleting");
    setIsDeleting(true);
    setDeleteStatus(`Deleting: ${selectedDocument.displayName || selectedDocument.name.split("/").pop()}`);

    try {
      await deleteDocument(selectedDocument.name);
      setIsDeleting(false);
      setDeleteStatus("Delete complete!");

      setTimeout(async () => {
        await refreshDocuments();
        setSelectedDocument(null);
        setScreen("document-list");
        setSelectedIndex(0);
      }, 1000);
    } catch (e) {
      setIsDeleting(false);
      setDeleteStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => {
        setScreen("document-detail");
      }, 3000);
    }
  };

  // ストア削除ハンドラ
  const handleDeleteStore = async () => {
    const store = stores[selectedIndex];
    if (!store) return;

    setScreen("store-deleting");
    setIsStoreDeleting(true);
    setStoreDeleteStatus(`Deleting: ${store.displayName}`);

    try {
      await deleteStore(store.name);
      setIsStoreDeleting(false);
      setStoreDeleteStatus("Delete complete!");

      setTimeout(async () => {
        // ストア一覧を再取得
        try {
          setLoading(true);
          const result = await listStores();
          setStores(result);
          setSelectedIndex(0);
        } finally {
          setLoading(false);
        }
        setScreen("store-select");
        setStoreDeleteInput("");
      }, 1000);
    } catch (e) {
      setIsStoreDeleting(false);
      setStoreDeleteStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => {
        setScreen("store-select");
        setStoreDeleteInput("");
      }, 3000);
    }
  };

  // ストア作成ハンドラ
  const handleCreateStore = async () => {
    if (!storeCreateInput.trim()) return;

    setScreen("store-creating");
    setIsStoreCreating(true);
    setStoreCreateStatus(`Creating: ${storeCreateInput}`);

    try {
      await createStore(storeCreateInput.trim());
      setIsStoreCreating(false);
      setStoreCreateStatus("Create complete!");

      setTimeout(async () => {
        // ストア一覧を再取得
        try {
          setLoading(true);
          const result = await listStores();
          setStores(result);
          setSelectedIndex(0);
        } finally {
          setLoading(false);
        }
        setScreen("store-select");
        setStoreCreateInput("");
      }, 1000);
    } catch (e) {
      setIsStoreCreating(false);
      setStoreCreateStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      setTimeout(() => {
        setScreen("store-select");
        setStoreCreateInput("");
      }, 3000);
    }
  };

  const currentItems =
    screen === "store-select" ? stores : screen === "document-list" ? documents : [];

  useInput((input, key) => {
    // ファイルブラウザとアップロード中は専用の入力処理
    if (screen === "file-browser" || screen === "uploading") return;

    if (loading) return;

    // ストア作成画面
    if (screen === "store-create") {
      if (key.escape) {
        setScreen("store-select");
        setStoreCreateInput("");
        return;
      }
      if (key.backspace || key.delete) {
        setStoreCreateInput((prev) => prev.slice(0, -1));
        return;
      }
      if (key.return) {
        if (storeCreateInput.trim()) {
          handleCreateStore();
        }
        return;
      }
      // 通常の文字入力
      if (input && !key.ctrl && !key.meta) {
        setStoreCreateInput((prev) => prev + input);
      }
      return;
    }

    // ストア作成中は入力を無視
    if (screen === "store-creating") return;

    // ストア削除確認画面
    if (screen === "confirm-store-delete") {
      const store = stores[selectedIndex];
      if (key.escape) {
        setScreen("store-select");
        setStoreDeleteInput("");
        return;
      }
      if (key.backspace || key.delete) {
        setStoreDeleteInput((prev) => prev.slice(0, -1));
        return;
      }
      if (key.return) {
        if (store && storeDeleteInput === store.displayName) {
          handleDeleteStore();
        }
        return;
      }
      // 通常の文字入力
      if (input && !key.ctrl && !key.meta) {
        setStoreDeleteInput((prev) => prev + input);
      }
      return;
    }

    // ストア削除中は入力を無視
    if (screen === "store-deleting") return;

    // 削除確認画面
    if (screen === "confirm-delete") {
      if (input === "y" || input === "Y") {
        handleDeleteDocument();
      }
      if (input === "n" || input === "N" || key.escape) {
        setScreen("document-detail");
      }
      return;
    }

    // 削除中は入力を無視
    if (screen === "deleting") return;

    // ストア詳細画面ではEsc/bで戻る
    if (screen === "store-detail") {
      if (key.escape || input === "b") {
        setScreen("store-select");
      }
      if (input === "q") {
        exit();
      }
      return;
    }

    // ドキュメント詳細画面ではEsc/bで戻る、dで削除
    if (screen === "document-detail") {
      if (key.escape || input === "b") {
        setScreen("document-list");
        setSelectedDocument(null);
      }
      if (input === "d") {
        setScreen("confirm-delete");
      }
      if (input === "q") {
        exit();
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentItems.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < currentItems.length - 1 ? prev + 1 : 0));
    }
    if (key.return) {
      if (screen === "store-select") {
        const store = stores[selectedIndex];
        if (store) {
          setSelectedStore(store);
          setScreen("document-list");
          setSelectedIndex(0);
        }
      }
      // Enterキーでドキュメント詳細へ
      if (screen === "document-list" && documents.length > 0) {
        const doc = documents[selectedIndex];
        if (doc) {
          setSelectedDocument(doc);
          setScreen("document-detail");
        }
      }
    }
    // i キーで詳細画面へ
    if (input === "i" && screen === "document-list" && documents.length > 0) {
      const doc = documents[selectedIndex];
      if (doc) {
        setSelectedDocument(doc);
        setScreen("document-detail");
      }
    }
    // u キーでアップロード画面へ
    if (input === "u" && screen === "document-list") {
      setScreen("file-browser");
    }
    // i キーでストア詳細画面へ
    if (input === "i" && screen === "store-select" && stores.length > 0) {
      setScreen("store-detail");
    }
    // d キーでストア削除確認画面へ
    if (input === "d" && screen === "store-select" && stores.length > 0) {
      setScreen("confirm-store-delete");
      setStoreDeleteInput("");
    }
    // n キーでストア作成画面へ
    if (input === "n" && screen === "store-select") {
      setScreen("store-create");
      setStoreCreateInput("");
    }
    if (input === "q") {
      exit();
    }
    if (key.escape) {
      if (screen === "document-list") {
        setScreen("store-select");
        setSelectedStore(null);
        setDocuments([]);
        setSelectedIndex(0);
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Gemini FileStore Manager
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>{maskApiKey()}</Text>
        {selectedStore && (
          <>
            <Text dimColor> / </Text>
            <Text color="yellow">{selectedStore.displayName}</Text>
          </>
        )}
        {selectedDocument && (
          <>
            <Text dimColor> / </Text>
            <Text color="yellow">
              {selectedDocument.displayName || selectedDocument.name.split("/").pop()}
            </Text>
          </>
        )}
      </Box>

      {screen === "store-select" && (
        <StoreList
          stores={stores}
          selectedIndex={selectedIndex}
          loading={loading}
          error={error}
        />
      )}

      {screen === "store-detail" && stores[selectedIndex] && (
        <StoreDetail store={stores[selectedIndex]} />
      )}

      {screen === "store-create" && (
        <StoreForm mode="create" input={storeCreateInput} />
      )}

      {screen === "store-creating" && (
        <StatusScreen isProcessing={isStoreCreating} message={storeCreateStatus} />
      )}

      {screen === "confirm-store-delete" && stores[selectedIndex] && (
        <StoreForm
          mode="delete"
          input={storeDeleteInput}
          storeName={stores[selectedIndex].displayName}
        />
      )}

      {screen === "store-deleting" && (
        <StatusScreen isProcessing={isStoreDeleting} message={storeDeleteStatus} />
      )}

      {screen === "document-list" && (
        <DocumentList
          documents={documents}
          selectedIndex={selectedIndex}
          loading={loading}
          error={error}
        />
      )}

      {screen === "document-detail" && selectedDocument && (
        <DocumentDetail document={selectedDocument} />
      )}

      {screen === "confirm-delete" && selectedDocument && (
        <DocumentDeleteConfirm document={selectedDocument} />
      )}

      {screen === "deleting" && (
        <StatusScreen isProcessing={isDeleting} message={deleteStatus} />
      )}

      {screen === "file-browser" && (
        <FileBrowser onSelect={handleFileSelect} onCancel={handleFileBrowserCancel} />
      )}

      {screen === "uploading" && (
        <StatusScreen isProcessing={isUploading} message={uploadStatus} />
      )}
    </Box>
  );
}
