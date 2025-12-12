import { App, TFile, Notice, normalizePath } from 'obsidian';
import { LLMService } from './LLMService';

export class DigestGenerator {
    app: App;
    llmService: LLMService;
    digestFolder: string;
    language: string;

    constructor(app: App, llmService: LLMService, digestFolder: string, language: string) {
        this.app = app;
        this.llmService = llmService;
        this.digestFolder = digestFolder;
        this.language = language;
    }

    async generateDigest(targetDate: string = '') {
        // Default to yesterday if date not provided
        if (!targetDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            targetDate = yesterday.toISOString().split('T')[0];
        }

        new Notice(`Generating Digest for ${targetDate}...`);

        // 1. Query Files
        const summaries: { title: string; link: string; summary: string }[] = [];
        const files = this.app.vault.getMarkdownFiles();

        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (!cache?.frontmatter) continue;

            if (cache.frontmatter['summary_date'] === targetDate) {
                // Extract the summary section
                const content = await this.app.vault.read(file);
                // Regex to find content between "## 💡 AI 요약" and next heading or end of file
                // Improved regex to be more robust
                const match = content.match(/## 💡 AI 요약([\s\S]*?)(^#|\Z)/m);

                if (match && match[1]) {
                    summaries.push({
                        title: file.basename,
                        link: `[[${file.basename}]]`,
                        summary: match[1].trim()
                    });
                }
            }
        }

        if (summaries.length === 0) {
            new Notice(`No summaries found for ${targetDate}`);
            return;
        }

        // 2. Construct Prompt
        const summaryText = summaries.map(s => `Title: ${s.title}\nSummary:\n${s.summary}`).join('\n\n---\n\n');

        const systemPrompt = `You are an insightful newsletter editor. 
        Your task is to weave the following summaries into a coherent, serendipitous narrative in ${this.language}.
        
        Guidelines:
        - **Storytelling**: Don't just list them. Connect them. Find hidden themes (e.g., "Efficiency", "Creativity") that link unrelated topics.
        - **Format**: Write in prose (paragraphs). Use the title as a link like [[Title]] naturally in the sentence.
        - **Tone**: Intellectual but accessible. 
        - **Structure**:
            # 📰 Daily Knowledge Digest (${targetDate})
            
            [Narrative Prose...]
            
            ## References
            - [[Title 1]]
            - [[Title 2]]
        `;

        try {
            // 3. Call LLM
            const digestContent = await this.llmService.complete(summaryText, systemPrompt);

            // 4. Write to File
            const filename = `${this.digestFolder}/${targetDate}.md`;
            const normalizedPath = normalizePath(filename);

            let file = this.app.vault.getAbstractFileByPath(normalizedPath);

            if (file instanceof TFile) {
                // Append if exists
                await this.app.vault.append(file, `\n\n${digestContent}`);
                new Notice(`Appended Digest to ${normalizedPath}`);
            } else {
                // Create if not exists
                // Ensure folder exists
                if (!this.app.vault.getAbstractFileByPath(normalizePath(this.digestFolder))) {
                    await this.app.vault.createFolder(normalizePath(this.digestFolder));
                }

                await this.app.vault.create(normalizedPath, digestContent);
                new Notice(`Created Digest: ${normalizedPath}`);
            }

        } catch (error) {
            console.error('Digest Generation Error:', error);
            new Notice(`Failed to generate digest: ${error.message}`);
        }
    }
}
