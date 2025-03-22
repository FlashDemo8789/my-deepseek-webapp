// apiService.js
class DeepSeekAPI {
    constructor() {
        // Initialize with hardcoded API key for testing
        this.apiKey = 'sk-4991c423c5664711a5845c05d887f31b';
        localStorage.setItem('deepseekApiKey', this.apiKey);
        
        this.model = localStorage.getItem('deepseekModel') || 'deepseek-chat';
        this.temperature = parseFloat(localStorage.getItem('deepseekTemperature') || '0.7');
        this.maxTokens = parseInt(localStorage.getItem('deepseekMaxTokens') || '1024');
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.theme = localStorage.getItem('theme') || 'dark';
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
    
    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('theme', theme);
    }

    getSettings() {
        return {
            apiKey: this.apiKey,
            model: this.model,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            theme: this.theme
        };
    }

    async sendMessage(messages, attachments = []) {
        if (!this.apiKey) {
            throw new Error('API key is not set. Please configure your API key in settings.');
        }

        try {
            console.log('Sending API request with key:', this.apiKey);
            console.log('Messages:', messages);
            console.log('Attachments:', attachments);
            
            // Prepare the request body
            const requestBody = {
                model: this.model,
                messages: this.prepareMessagesWithAttachments(messages, attachments),
                temperature: this.temperature,
                max_tokens: this.maxTokens
            };
            
            console.log('Request body:', requestBody);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API response error:', errorData);
                throw new Error(errorData.error?.message || 'Failed to get response from DeepSeek API');
            }

            const data = await response.json();
            console.log('API response:', data);
            return data;
        } catch (error) {
            console.error('Error sending message to DeepSeek API:', error);
            throw error;
        }
    }
    
    // Prepare messages with attachments in a format compatible with the API
    prepareMessagesWithAttachments(messages, attachments) {
        // If there are no new attachments, return messages as is
        if (!attachments || attachments.length === 0) {
            return messages;
        }
        
        // Clone the messages array to avoid modifying the original
        const preparedMessages = [...messages];
        
        // Get the last message (which should be the user's message)
        const lastMessage = preparedMessages[preparedMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'user') {
            // Create an array of attachment descriptions
            const attachmentDescriptions = attachments.map(attachment => {
                if (attachment.type.startsWith('image/')) {
                    return `[Attached Image: ${attachment.name}]`;
                } else {
                    return `[Attached File: ${attachment.name} (${attachment.type})]`;
                }
            });
            
            // Append attachment descriptions to the message content
            const updatedContent = lastMessage.content + '\n\n' + attachmentDescriptions.join('\n');
            
            // Update the last message with the new content
            preparedMessages[preparedMessages.length - 1] = {
                ...lastMessage,
                content: updatedContent
            };
        }
        
        return preparedMessages;
    }
    
    // For future implementation: Upload attachment to cloud storage and get URL
    async uploadAttachment(file) {
        // This is a placeholder function for future implementation
        // In a real application, you would upload the file to a server or cloud storage
        // and return a URL that can be sent to the API
        
        console.log('File upload not implemented yet:', file.name);
        
        // Return a mock URL for now
        return {
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file)
        };
    }
}

// Create a singleton instance
const deepseekAPI = new DeepSeekAPI();
