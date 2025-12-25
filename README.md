# Gemini FileStore Manager

A terminal-based UI tool for managing Google Gemini FileStore.

## Quick Start

```bash
# Using npx
GEMINI_API_KEY=your_api_key npx genai-fs

# Using bunx
GEMINI_API_KEY=your_api_key bunx genai-fs
```

## Features

- **Store Management**: Create, view, and delete FileSearch stores
- **Document Management**: Upload, view, and delete documents
- **Interactive UI**: Navigate with keyboard shortcuts
- **File Browser**: Built-in file browser for uploading files

## Requirements

- [Bun](https://bun.sh) or Node.js runtime
- Google Gemini API key

## Installation

### Global Install

```bash
# npm
npm install -g genai-fs

# bun
bun add -g genai-fs
```

### Run without install

```bash
# npx
npx genai-fs

# bunx
bunx genai-fs
```

## Setup

Set your Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY=your_api_key_here
```

Then run (after global install):

```bash
genai-fs
```

## Keyboard Shortcuts

### Store List
| Key | Action |
|-----|--------|
| Up/Down | Navigate stores |
| Enter | Open store (view documents) |
| i | View store info |
| n | Create new store |
| d | Delete store |
| q | Quit |

### Document List
| Key | Action |
|-----|--------|
| Up/Down | Navigate documents |
| i | View document info |
| u | Upload file |
| Esc | Back to store list |
| q | Quit |

### Document/Store Detail
| Key | Action |
|-----|--------|
| d | Delete (document only) |
| Esc/b | Back |
| q | Quit |

### File Browser
| Key | Action |
|-----|--------|
| Up/Down | Navigate files |
| Enter | Select file / Open directory |
| Esc | Cancel |

## API Reference

This tool uses the [GenAI FileSearch API](https://ai.google.dev/api/file-search/file-search-stores).

## License

MIT
