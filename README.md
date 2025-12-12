# Obsidian AI Digest Plugin

Automatically summarize your clippings and weave them into a daily narrative digest.

## Features

### 1. 🤖 Auto-Summarizer
- Automatically detects new markdown files in your `In Box` folder.
- Summarizes the content using AI (OpenAI or Anthropic) into 3 key sections:
    - **One-Line Summary**
    - **3 Key Questions**
    - **Key Concepts** (New!)
    - **Action Item**
- **Smart Truncation**: Automatically handles long texts to save API costs.

### 2. 📰 Daily Narrative Digest
- Generates a serendipitous daily essay connecting all your clippings from the previous day.
- Finds hidden themes and links between unrelated topics.
- **Trigger**: Run the command `Obsidian AI Digest: Generate Daily Digest (Yesterday)`.

---

## Installation

1. Download the `main.js`, `manifest.json`, `styles.css` files.
2. Create a folder `obsidian-ai-digest` in your vault's `.obsidian/plugins/` directory.
3. Move the files into that folder.
4. Reload Obsidian and enable the plugin in **Community Plugins**.

## Configuration

1. Go to **Settings** -> **Obsidian AI Digest**.
2. **API Key**: Enter your OpenAI (`sk-...`) or Anthropic (`sk-ant-...`) key.
3. **AI Provider**: Select your provider.
4. **Target Folder**: Set the folder to watch (Default: `In Box`).
    - *Note*: Creating a file in this folder triggers the AI.
5. **Digest Folder**: Set where to save daily digests (Default: `Daily Notes`).

## Usage

### Auto-Summarization
1. Drop any text/article into the `In Box`.
2. Wait 5 seconds.
3. The summary will be appended to the bottom of the file.

### Manual Summarization
- Open any file and run command: `Obsidian AI Digest: Summarize Current File`.

### Generating Daily Digest
- Run command: `Obsidian AI Digest: Generate Daily Digest (Yesterday)`.
- It will gather all files summarized yesterday and create a new note in `Daily Notes` with a woven narrative.

---

## Development
- `npm install`
- `npm run dev` (for watching changes)
- `npm run build` (for production build)
