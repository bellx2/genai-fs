// Gemini FileStore API クライアント
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return apiKey;
}

// Google GenAI クライアント
let _client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!_client) {
    _client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return _client;
}

// ストアの型定義
export interface FileSearchStore {
  name: string; // 例: "fileSearchStores/xxx"
  displayName: string;
  createTime?: string;
  updateTime?: string;
  activeDocumentsCount?: string; // アクティブなドキュメント数
  pendingDocumentsCount?: string; // 処理中のドキュメント数
  failedDocumentsCount?: string; // 失敗したドキュメント数
  sizeBytes?: string; // ストア全体のサイズ
}

// ドキュメントの状態
export type DocumentState = "STATE_UNSPECIFIED" | "PENDING" | "ACTIVE" | "FAILED";

// カスタムメタデータ
export interface CustomMetadata {
  key: string;
  stringValue?: string;
  numericValue?: number;
}

// ドキュメントの型定義
export interface Document {
  name: string; // 例: "fileSearchStores/xxx/documents/yyy"
  displayName?: string;
  mimeType?: string;
  sizeBytes?: string;
  createTime?: string;
  updateTime?: string;
  state?: DocumentState;
  customMetadata?: CustomMetadata[];
}

interface ListStoresResponse {
  fileSearchStores?: FileSearchStore[];
  nextPageToken?: string;
}

interface ListDocumentsResponse {
  documents?: Document[];
  nextPageToken?: string;
}

// ストア一覧を全件取得
export async function listStores(): Promise<FileSearchStore[]> {
  const apiKey = getApiKey();
  const all: FileSearchStore[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: "20" });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${BASE_URL}/fileSearchStores?${params}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch stores: ${error}`);
    }

    const data = (await response.json()) as ListStoresResponse;
    all.push(...(data.fileSearchStores ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

// ストアを作成
export async function createStore(displayName: string): Promise<FileSearchStore> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/fileSearchStores?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create store: ${error}`);
  }

  // 長時間実行オペレーションが返される
  const operation = await response.json();
  // 完了を待つ場合はポーリングが必要だが、一旦オペレーション結果を返す
  return operation as FileSearchStore;
}

// ストアを削除
export async function deleteStore(storeName: string): Promise<void> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/${storeName}?key=${apiKey}`;

  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete store: ${error}`);
  }
}

// ドキュメント一覧を全件取得
export async function listDocuments(storeName: string): Promise<Document[]> {
  const apiKey = getApiKey();
  const all: Document[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ key: apiKey, pageSize: "20" });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${BASE_URL}/${storeName}/documents?${params}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch documents: ${error}`);
    }

    const data = (await response.json()) as ListDocumentsResponse;
    all.push(...(data.documents ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

// ドキュメント詳細を取得
export async function getDocument(documentName: string): Promise<Document> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/${documentName}?key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch document: ${error}`);
  }

  return (await response.json()) as Document;
}

// アップロードオペレーションのレスポンス
export interface UploadOperation {
  name: string;
  done?: boolean;
  error?: { code: number; message: string };
  response?: Document;
}

// ドキュメントを削除
export async function deleteDocument(documentName: string): Promise<void> {
  const apiKey = getApiKey();
  // force=trueで強制削除
  const url = `${BASE_URL}/${documentName}?key=${apiKey}&force=true`;

  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete document: ${error}`);
  }
}

// ユニークIDのシンボリックリンクを作成（非ASCIIや長いファイル名対策）
async function createUploadSymlink(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  const uid = crypto.randomUUID();
  const symlinkPath = path.join(os.tmpdir(), `${uid}${ext}`);
  await fs.symlink(path.resolve(filePath), symlinkPath);
  return symlinkPath;
}

// ファイルをアップロード（Google GenAI SDKを使用）
export async function uploadFile(
  storeName: string,
  filePath: string
): Promise<void> {
  const client = getClient();

  // ユニークIDのシンボリックリンク経由でアップロードし、displayNameで元のファイル名を設定
  const symlinkPath = await createUploadSymlink(filePath);

  try {
    let operation = await client.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: storeName,
      file: symlinkPath,
      config: { displayName: path.basename(filePath) },
    });

    // 完了まで待機
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      operation = await client.operations.get({ operation });
    }

    if (operation.error) {
      throw new Error(`Upload failed: ${operation.error.message}`);
    }
  } finally {
    await fs.unlink(symlinkPath).catch(() => {});
  }
}
