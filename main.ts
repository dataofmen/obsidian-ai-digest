import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, debounce, TFolder } from 'obsidian';
import { LLMService, LLMConfig } from './LLMService';
import { DigestGenerator } from './DigestGenerator';
import { DateSelectionModal } from './DateSelectionModal';

interface ObsidianAIDigestSettings {
    apiKey: string;
    aiProvider: 'openai' | 'anthropic';
    model: string;
    targetFolder: string;
    digestFolder: string;
    language: string;
}

const DEFAULT_SETTINGS: ObsidianAIDigestSettings = {
    apiKey: '',
    aiProvider: 'openai',
    model: 'gpt-4o-mini',
    targetFolder: 'In Box',
    digestFolder: 'Daily Notes',
    language: 'Korean'
}

export default class ObsidianAIDigest extends Plugin {
    settings: ObsidianAIDigestSettings;
    llmService: LLMService;
    digestGenerator: DigestGenerator;

    async onload() {
        await this.loadSettings();

        // Initialize LLM Service
        this.llmService = new LLMService({
            apiKey: this.settings.apiKey,
            provider: this.settings.aiProvider,
            model: this.settings.model
        });

        // Initialize Digest Generator
        this.digestGenerator = new DigestGenerator(
            this.app,
            this.llmService,
            this.settings.targetFolder,
            this.settings.digestFolder,
            this.settings.language
        );

        // Add Settings Tab
        this.addSettingTab(new ObsidianAIDigestSettingTab(this.app, this));



        // ... (existing imports)

        // ... inside ObsidianAIDigest class ...

        // Add Command - Manual Trigger for Digest
        this.addCommand({
            id: 'generate-daily-digest-date',
            name: 'Generate Daily Digest (Select Date)',
            callback: () => {
                new DateSelectionModal(this.app, this.settings.targetFolder, async (date) => {
                    await this.digestGenerator.generateDigest(date);
                }).open();
            }
        });

        // Add Command - Manual Summarize Current File
        this.addCommand({
            id: 'summarize-current-file',
            name: 'Summarize Current File',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    if (!checking) {
                        this.processFile(activeFile, true);
                    }
                    return true;
                }
                return false;
            }
        });

        // Add File Watcher
        // We use 'modify' event with debounce to catch changes after paste/sync
        const debouncedProcess = debounce(this.processFile.bind(this), 5000, true);

        this.registerEvent(this.app.vault.on('modify', (file) => {
            if (file instanceof TFile && file.parent?.path === this.settings.targetFolder) {
                debouncedProcess(file);
            }
        }));

        // Also catch creation if file is moved into folder
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
            if (file instanceof TFile && file.parent?.path === this.settings.targetFolder) {
                // Logic: If moved TO In Box, process it
                debouncedProcess(file);
            }
        }));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update LLM Service config when settings change
        if (this.llmService) {
            this.llmService.updateConfig({
                apiKey: this.settings.apiKey,
                provider: this.settings.aiProvider,
                model: this.settings.model
            });
        }
        // Update Digest Generator config
        if (this.digestGenerator) {
            this.digestGenerator.targetFolder = this.settings.targetFolder;
            this.digestGenerator.digestFolder = this.settings.digestFolder;
            this.digestGenerator.language = this.settings.language;
        }
    }

    async processFile(file: TFile, manualOverride: boolean = false) {
        // 1. Validation
        if (!file || file.extension !== 'md') return;

        // Skip if already processed (unless forced)
        const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (!manualOverride && frontmatter && frontmatter['processed'] === true) {
            console.log(`Skipping ${file.name}: Already processed.`);
            return;
        }

        console.log(`Processing file: ${file.name}`);
        new Notice(`🤖 AI Digest: Summarizing ${file.name}...`);

        try {
            // 2. Read Content
            const content = await this.app.vault.read(file);

            // 3. Truncate if too long (Simple Head-Tail for now)
            // Approx 4 chars per token. 5000 tokens ~ 20000 chars.
            let inputContent = content;
            if (content.length > 20000) {
                inputContent = content.substring(0, 10000) + "\n\n...[Content Truncated]...\n\n" + content.substring(content.length - 10000);
            }

            // 4. Call LLM
            const systemPrompt = `You are an expert summarizer. 
            Summarize the following markdown content in ${this.settings.language}. 
            Output format:
            ## 💡 AI 요약
            - **한 줄 요약**: (One sentence summary)
            - **핵심 질문 3가지**:
                1. (Question 1)
                2. (Question 2)
                3. (Question 3)
            - **핵심 개념**: (List of technical terms or concepts that require further study)
                - **(Concept Name)**: (Brief definition)
            - **액션 아이템**: (What user should do/apply)
            `;

            const summary = await this.llmService.complete(inputContent, systemPrompt);

            // 5. Append & Update Frontmatter
            await this.app.fileManager.processFrontMatter(file, (fm) => {
                fm['processed'] = true;
                fm['summary_date'] = new Date().toISOString().split('T')[0];
            });

            await this.app.vault.append(file, `\n\n${summary}`);

            new Notice(`✅ AI Digest: Summarized ${file.name}`);

        } catch (error) {
            console.error('Summarization Error:', error);
            new Notice(`❌ AI Digest Error: ${error.message}`);
        }
    }
}

class ObsidianAIDigestSettingTab extends PluginSettingTab {
    plugin: ObsidianAIDigest;

    constructor(app: App, plugin: ObsidianAIDigest) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.createEl('h2', { text: 'Obsidian AI Digest Settings' });

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Enter your OpenAI or Anthropic API Key')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Test API Connection')
            .setDesc('Check if your API key works')
            .addButton(button => button
                .setButtonText('Test Connection')
                .onClick(async () => {
                    button.setButtonText('Testing...');
                    button.setDisabled(true);
                    try {
                        await this.plugin.llmService.testConnection();
                        new Notice('✅ Connection Successful!');
                        button.setButtonText('Test Connection');
                    } catch (error) {
                        new Notice(`❌ Connection Failed: ${error.message}`);
                        button.setButtonText('Test Failed');
                    } finally {
                        button.setDisabled(false);
                    }
                }));

        new Setting(containerEl)
            .setName('AI Provider')
            .setDesc('Choose your AI provider')
            .addDropdown(dropdown => dropdown
                .addOption('openai', 'OpenAI')
                .addOption('anthropic', 'Anthropic')
                .setValue(this.plugin.settings.aiProvider)
                .onChange(async (value) => {
                    this.plugin.settings.aiProvider = value as 'openai' | 'anthropic';
                    // Reset model to default for provider
                    if (value === 'openai') this.plugin.settings.model = 'gpt-4o-mini';
                    else this.plugin.settings.model = 'claude-3-5-sonnet-20240620';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Model Name')
            .setDesc('Specific model ID (e.g. gpt-4o, claude-3-5-sonnet-20240620)')
            .addText(text => text
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Language')
            .setDesc('Language for the summary (Korean, English, etc.)')
            .addText(text => text
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.plugin.saveSettings();
                }));

        const folders = this.app.vault.getAllLoadedFiles()
            .filter(f => f instanceof TFolder)
            .map(f => f.path)
            .sort();

        // Add root folder explicitly if needed, but TFolder usually covers it as '/' or empty string?
        // getAllLoadedFiles usually returns root as well ('/').

        new Setting(containerEl)
            .setName('Target Folder')
            .setDesc('Folder to watch for new clippings')
            .addDropdown(dropdown => {
                folders.forEach(folder => dropdown.addOption(folder, folder));
                dropdown.setValue(this.plugin.settings.targetFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.targetFolder = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Digest Folder')
            .setDesc('Folder to save Daily Digests')
            .addDropdown(dropdown => {
                folders.forEach(folder => dropdown.addOption(folder, folder));
                dropdown.setValue(this.plugin.settings.digestFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.digestFolder = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
