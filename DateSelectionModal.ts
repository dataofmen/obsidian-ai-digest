import { App, Modal, Setting, moment, TFile, Notice } from 'obsidian';

export class DateSelectionModal extends Modal {
    targetFolder: string;
    result: string;
    onSubmit: (result: string) => void;

    constructor(app: App, targetFolder: string, onSubmit: (result: string) => void) {
        super(app);
        this.targetFolder = targetFolder;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: 'Select Date for Digest' });

        // 1. Scan files to find available dates
        const dateCounts: Record<string, number> = {};
        const files = this.app.vault.getMarkdownFiles();

        files.forEach(file => {
            if (this.targetFolder && this.targetFolder !== '/' && !file.path.startsWith(this.targetFolder)) {
                return;
            }
            // Use local date string
            const date = moment(file.stat.ctime).format('YYYY-MM-DD');
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });

        // Sort dates descending
        const sortedDates = Object.keys(dateCounts).sort((a, b) => b.localeCompare(a));

        if (sortedDates.length === 0) {
            contentEl.createEl('p', { text: `⚠️ No files found in '${this.targetFolder}'. Please check your settings.` });

            // Allow manual entry fallback
            new Setting(contentEl)
                .setName('Manual Date Entry')
                .setDesc('No files found, but you can try entering a date manually.')
                .addText((text) => {
                    text.inputEl.type = 'date';
                    text.setValue(moment().format('YYYY-MM-DD'));
                    text.onChange((value) => {
                        this.result = value;
                    });
                });
        } else {
            // Default to most recent date
            this.result = sortedDates[0];

            new Setting(contentEl)
                .setName('Select Date')
                .setDesc(`Choose a date from '${this.targetFolder}' containing files.`)
                .addDropdown(dropdown => {
                    sortedDates.forEach(date => {
                        dropdown.addOption(date, `${date} (${dateCounts[date]} files)`);
                    });
                    dropdown.setValue(this.result);
                    dropdown.onChange((value) => {
                        this.result = value;
                    });
                });
        }

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Generate Digest')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        // If result is empty (e.g. initial load with no files and no manual input change), safe default?
                        // Actually logic above sets this.result.
                        if (this.result) {
                            this.onSubmit(this.result);
                        } else {
                            new Notice('Please select or enter a date.');
                        }
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
