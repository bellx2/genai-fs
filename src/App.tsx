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
  | "api-key-input"
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

  // APIキーの状態（環境変数から初期化）
  const [apiKey, setApiKey] = useState<string>(process.env.GEMINI_API_KEY || "");
  const [apiKeyInput, setApiKeyInput] = useState("");

  // 初期画面を決定
  const [screen, setScreen] = useState<Screen>(
    process.env.GEMINI_API_KEY ? "store-select" : "api-key-input"
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedStore, setSelectedStore] = useState<FileSearchStore | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // ストア一覧の状態
  const [stores, setStores] = useState<FileSearchStore[]>([]);
  const [loading, setLoading] = useState(!!process.env.GEMINI_API_KEY);
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
  const fetchStores = useCallback(async () => {
    if (!apiKey) return;
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
  }, [apiKey]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // APIキー設定後にストア一覧を取得
  const handleApiKeySubmit = () => {
    if (!apiKeyInput.trim()) return;
    process.env.GEMINI_API_KEY = apiKeyInput.trim();
    setApiKey(apiKeyInput.trim());
    setApiKeyInput("");
    setScreen("store-select");
    setLoading(true);
  };

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

  // テキスト入力処理
  const handleTextInput = (
    input: string,
    key: { escape: boolean; backspace: boolean; delete: boolean; return: boolean; ctrl: boolean; meta: boolean },
    setInput: (fn: (prev: string) => string) => void,
    onSubmit: () => void,
    onCancel: () => void
  ) => {
    if (key.escape) { onCancel(); return; }
    if (key.backspace || key.delete) { setInput((prev) => prev.slice(0, -1)); return; }
    if (key.return) { onSubmit(); return; }
    if (input && !key.ctrl && !key.meta) setInput((prev) => prev + input);
  };

  useInput((input, key) => {
    // qキーは共通で終了（入力画面以外）
    if (input === "q" && !["api-key-input", "store-create", "confirm-store-delete"].includes(screen)) {
      exit();
      return;
    }

    switch (screen) {
      // APIキー入力画面
      case "api-key-input":
        handleTextInput(
          input,
          key,
          setApiKeyInput,
          handleApiKeySubmit,
          exit
        );
        return;

      // 入力を無視する画面
      case "file-browser":
      case "uploading":
      case "store-creating":
      case "store-deleting":
      case "deleting":
        return;

      // ストア作成画面
      case "store-create":
        handleTextInput(
          input,
          key,
          setStoreCreateInput,
          () => { if (storeCreateInput.trim()) handleCreateStore(); },
          () => { setScreen("store-select"); setStoreCreateInput(""); }
        );
        return;

      // ストア削除確認画面
      case "confirm-store-delete": {
        const store = stores[selectedIndex];
        handleTextInput(
          input,
          key,
          setStoreDeleteInput,
          () => { if (store && storeDeleteInput === store.displayName) handleDeleteStore(); },
          () => { setScreen("store-select"); setStoreDeleteInput(""); }
        );
        return;
      }

      // ドキュメント削除確認画面
      case "confirm-delete":
        if (input === "y" || input === "Y") handleDeleteDocument();
        if (input === "n" || input === "N" || key.escape) setScreen("document-detail");
        return;

      // ストア詳細画面
      case "store-detail":
        if (key.escape || input === "b") setScreen("store-select");
        return;

      // ドキュメント詳細画面
      case "document-detail":
        if (key.escape || input === "b") {
          setScreen("document-list");
          setSelectedDocument(null);
        }
        if (input === "d") setScreen("confirm-delete");
        return;

      // ストア一覧画面
      case "store-select":
        if (loading) return;
        if (key.upArrow) setSelectedIndex((prev) => (prev > 0 ? prev - 1 : stores.length - 1));
        if (key.downArrow) setSelectedIndex((prev) => (prev < stores.length - 1 ? prev + 1 : 0));
        if (key.return && stores[selectedIndex]) {
          setSelectedStore(stores[selectedIndex]);
          setScreen("document-list");
          setSelectedIndex(0);
        }
        if (input === "i" && stores.length > 0) setScreen("store-detail");
        if (input === "n") { setScreen("store-create"); setStoreCreateInput(""); }
        if (input === "d" && stores.length > 0) { setScreen("confirm-store-delete"); setStoreDeleteInput(""); }
        return;

      // ドキュメント一覧画面
      case "document-list":
        if (loading) return;
        if (key.upArrow) setSelectedIndex((prev) => (prev > 0 ? prev - 1 : documents.length - 1));
        if (key.downArrow) setSelectedIndex((prev) => (prev < documents.length - 1 ? prev + 1 : 0));
        if ((key.return || input === "i") && documents[selectedIndex]) {
          setSelectedDocument(documents[selectedIndex]);
          setScreen("document-detail");
        }
        if (input === "u") setScreen("file-browser");
        if (key.escape) {
          setScreen("store-select");
          setSelectedStore(null);
          setDocuments([]);
          setSelectedIndex(0);
        }
        return;
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

      {screen === "api-key-input" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="yellow" bold>
              GEMINI_API_KEY is not set
            </Text>
          </Box>
          <Text>Enter your Gemini API key:</Text>
          <Box marginTop={1}>
            <Text dimColor>{">"} </Text>
            <Text color={apiKeyInput.trim() ? "green" : "white"}>
              {apiKeyInput ? "*".repeat(apiKeyInput.length) : ""}
            </Text>
            <Text color="gray">|</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Enter: Submit  Esc: Quit</Text>
          </Box>
        </Box>
      )}

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
