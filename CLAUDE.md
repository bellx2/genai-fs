# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Gemini FileStore Managerは、GoogleのGemini AIプラットフォームのFileStore APIを操作するNode.js製CLIツールです。

API仕様: https://ai.google.dev/api/file-search/file-search-stores?hl=ja

### 主な機能
- ファイルのアップロード、削除、整理
- ファイルストアの作成・管理
- ファイル検索

## 開発環境

- ランタイム: Bun (Node.jsの代わりにBunを使用)
- 言語: TypeScript

## コマンド

```bash
# 依存関係のインストール
bun install

# 開発モードで実行
bun run dev

# ビルド
bun run build

# テスト実行
bun test

# 単一テストファイルの実行
bun test <ファイルパス>
```

## アーキテクチャ

CLIアプリケーションとして以下の構造を想定:
- `src/` - ソースコード
  - `commands/` - CLIコマンドの実装
  - `lib/` - Gemini FileStore APIとの通信ロジック
  - `utils/` - ユーティリティ関数
- `tests/` - テストファイル

## API認証

Google Gemini APIキーが必要です。環境変数 `GEMINI_API_KEY` で設定してください。
