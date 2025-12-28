import { App, TFile, Notice, normalizePath, moment } from 'obsidian';
import { LLMService } from './LLMService';

export class DigestGenerator {
    app: App;
    llmService: LLMService;
    targetFolder: string;
    digestFolder: string;
    language: string;

    constructor(app: App, llmService: LLMService, targetFolder: string, digestFolder: string, language: string) {
        this.app = app;
        this.llmService = llmService;
        this.targetFolder = targetFolder;
        this.digestFolder = digestFolder;
        this.language = language;
    }

    async generateDigest(targetDate: string = '') {
        // Default to yesterday if date not provided
        if (!targetDate) {
            targetDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        }

        new Notice(`🔍 Searching files for ${targetDate}...`);

        // 1. Query Files
        const summaries: { title: string; link: string; content: string }[] = [];
        const files = this.app.vault.getMarkdownFiles();

        let foundCount = 0;
        let dateMatchCount = 0;
        let folderMatchCount = 0;

        for (const file of files) {
            // Check Creation Date using moment for reliability
            const fileDate = moment(file.stat.ctime).format('YYYY-MM-DD');

            if (fileDate !== targetDate) continue;
            dateMatchCount++;

            // Check if in targetFolder
            if (this.targetFolder && this.targetFolder !== '/') {
                if (!file.path.startsWith(this.targetFolder)) {
                    continue;
                }
            }
            folderMatchCount++;

            const content = await this.app.vault.read(file);

            // Try to find summary first
            const match = content.match(/## 💡 AI 요약([\s\S]*?)(^#|\Z)/m);
            let textToUse = "";

            if (match && match[1]) {
                textToUse = match[1].trim();
            } else {
                // Extended limit to 5000 chars for better context
                textToUse = content.substring(0, 5000);
            }

            summaries.push({
                title: file.basename,
                link: `[[${file.basename}]]`,
                content: textToUse
            });
            foundCount++;
        }

        if (summaries.length === 0) {
            new Notice(`⚠️ No files found for ${targetDate}.\n(Date Matches: ${dateMatchCount}, Folder Matches: ${folderMatchCount})`);
            return;
        }

        new Notice(`✅ Found ${foundCount} files. Generating Insight...`);

        // 2. Construct Prompt
        const summaryText = summaries.map(s => `Title: ${s.title}\nContent:\n${s.content}`).join('\n\n---\n\n');

        const systemPrompt = `You are a Knowledge Integrator and Insight Generator.
        You are analyzing a set of notes created on ${targetDate}.
        Your goal is to synthesize these notes to find connections, implications, and generate new ideas.
        Language: ${this.language} (Korean)
        **IMPORTANT LANGUAGE RULE**: Write primarily in Korean, but for ALL technical terms, key concepts, or proper nouns, you MUST provide the English term in parentheses upon first mention. Example: "지식 그래프(Knowledge Graph)", "생성형 AI(Generative AI)".

        **Input Notes:**
        ${summaryText}

        **Task:**
        1. **Connections**: How do these notes relate to each other? Are there common themes, contradictions, or complementary ideas?
        2. **Implications**: What are the deeper meanings or consequences of these ideas?
        3. **New Ideas**: Based on these combinations, suggest novel ideas or questions for further research.
        4. **Concept Map**: Visualize the key concepts and their relationships using Mermaid.
            - **CRITICAL SYNTAX RULES**:
                - Use \`graph LR\` or \`mindmap\`.
                - **MUST USE QUOTES** for all node labels. Example: \`A["Label Text"]\` NOT \`A[Label Text]\`.
                - Use simple alphanumeric IDs (A, B, C...).
                - Do NOT include special characters ((), [], {}) inside labels unless strictly necessary and quoted.
            - Only connect nodes with strong logical links. Do not force connections.
        5. **Source Summaries**: Provide a brief 3-line summary for each source note to give context.

        **Output Format:**
        # 🧠 Daily Insight Report (${targetDate})

        ## 🗺️ Knowledge Map
        (Mermaid diagram. Ensure valid syntax with quoted labels.)

        ## 🔗 Connections & Patterns
        (Analyze the relationships between the notes.)

        ## 💭 Key Implications
        (Discuss deeper meanings/consequences.)

        ## 💡 New Idea Generation
        (Propose new ideas or research directions.)

        ## 📝 Executive Summary
        (Briefly answer: What did I collect today?)

        ## 📚 Source Summaries
        - [[Title 1]]
            - Summary Line 1
            - Summary Line 2
            - Summary Line 3
        - [[Title 2]]
            - Summary Line 1...
        `;

        try {
            // 3. Call LLM
            const digestContent = await this.llmService.complete(summaryText, systemPrompt);

            // 4. Write to File
            // Ensure digest folder exists
            if (!this.app.vault.getAbstractFileByPath(normalizePath(this.digestFolder))) {
                await this.app.vault.createFolder(normalizePath(this.digestFolder));
            }

            const filename = `${this.digestFolder}/${targetDate}.md`;
            const normalizedPath = normalizePath(filename);

            let file = this.app.vault.getAbstractFileByPath(normalizedPath);

            if (file instanceof TFile) {
                // Append if exists
                await this.app.vault.append(file, `\n\n---\n\n${digestContent}`);
                new Notice(`Appended Digest to ${normalizedPath}`);
            } else {
                // Create if not exists
                await this.app.vault.create(normalizedPath, digestContent);
                new Notice(`Created Digest: ${normalizedPath}`);
            }

        } catch (error) {
            console.error('Digest Generation Error:', error);
            new Notice(`Failed to generate digest: ${error.message}`);
        }
    }
}
