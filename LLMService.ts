import { requestUrl, RequestUrlParam } from 'obsidian';

export interface LLMConfig {
    apiKey: string;
    provider: 'openai' | 'anthropic';
    model: string;
}

export class LLMService {
    config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
    }

    updateConfig(config: LLMConfig) {
        this.config = config;
    }

    async complete(prompt: string, systemPrompt: string = ''): Promise<string> {
        if (!this.config.apiKey) {
            throw new Error('API Key is missing');
        }

        if (this.config.provider === 'openai') {
            return this.callOpenAI(prompt, systemPrompt);
        } else if (this.config.provider === 'anthropic') {
            return this.callAnthropic(prompt, systemPrompt);
        }

        throw new Error('Invalid AI Provider');
    }

    private async callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
        const url = 'https://api.openai.com/v1/chat/completions';

        const body = {
            model: this.config.model || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        };

        const headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
        };

        try {
            const req: RequestUrlParam = {
                url: url,
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            };

            const response = await requestUrl(req);

            if (response.status !== 200) {
                throw new Error(`OpenAI API Error: ${response.status}`);
            }

            const data = response.json;
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Request Failed:', error);
            throw error;
        }
    }

    private async callAnthropic(prompt: string, systemPrompt: string): Promise<string> {
        const url = 'https://api.anthropic.com/v1/messages';

        const body = {
            model: this.config.model || 'claude-3-5-sonnet-20240620',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                { role: 'user', content: prompt }
            ]
        };

        const headers = {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        };

        try {
            const req: RequestUrlParam = {
                url: url,
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            };

            const response = await requestUrl(req);

            if (response.status !== 200) {
                throw new Error(`Anthropic API Error: ${response.status}`);
            }

            const data = response.json;
            return data.content[0].text;
        } catch (error) {
            console.error('Anthropic Request Failed:', error);
            throw error;
        }
    }
}
