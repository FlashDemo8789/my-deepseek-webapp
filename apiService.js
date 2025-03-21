class DeepSeekAPI {
    constructor() {
        this.apiKey = localStorage.getItem('deepseekApiKey') || '';
        this.model = localStorage.getItem('deepseekModel') || 'deepseek-chat';
        this.temperature = parseFloat(localStorage.getItem('deepseekTemperature') || '0.7');
        this.maxTokens = parseInt(localStorage.getItem('deepseekMaxTokens') || '1024');
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('deepseekApiKey', apiKey);
    }

    setModel(model) {
        this.model = model;
        localStorage.setItem('deepseekModel', model);
    }

    setTemperature(temperature) {
        this.temperature = temperature;
        localStorage.setItem('deepseekTemperature', temperature);
    }

    setMaxTokens(maxTokens) {
        this.maxTokens = maxTokens;
        localStorage.setItem('deepseekMaxTokens', maxTokens);
    }

    getSettings() {
        return {
            apiKey: this.apiKey,
            model: this.model,
            temperature: this.temperature,
            maxTokens: this.maxTokens
        };
    }

    async sendMessage(messages) {
        if (!this.apiKey) {
            throw new Error('API key is not set. Please configure your API key in settings.');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': Bearer sk-4991c423c5664711a5845c05d887f31b
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: this.temperature,
                    max_tokens: this.maxTokens
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from DeepSeek API');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending message to DeepSeek API:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const deepseekAPI = new DeepSeekAPI();
