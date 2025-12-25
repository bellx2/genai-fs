# Gemini FileStore Manager

A terminal-based UI tool for managing Google Gemini FileStore API. Built with React Ink and Bun.

## Features

- **Store Management**: Create, view, and delete FileSearch stores
- **Document Management**: Upload, view, and delete documents
- **Interactive UI**: Navigate with keyboard shortcuts
- **File Browser**: Built-in file browser for uploading files

## Requirements

- [Bun](https://bun.sh) runtime
- Google Gemini API key

## Installation

```bash
bun install
```

## Setup

Set your Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY=your_api_key_here
```

## Usage

```bash
bun run dev
```

Or run directly:

```bash
bun run src/index.tsx
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

This tool uses the [Gemini FileSearch API](https://ai.google.dev/api/file-search/file-search-stores).

## License

MIT
