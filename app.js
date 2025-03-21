document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const modelSelect = document.getElementById('modelSelect');
    const temperatureInput = document.getElementById('temperatureInput');
    const temperatureValue = document.getElementById('temperatureValue');
    const maxTokensInput = document.getElementById('maxTokensInput');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Chat history
    let chatHistory = [];

    // Initialize settings from localStorage
    function initializeSettings() {
        const settings = deepseekAPI.getSettings();
        apiKeyInput.value = settings.apiKey;
        modelSelect.value = settings.model;
        temperatureInput.value = settings.temperature;
        temperatureValue.textContent = settings.temperature;
        maxTokensInput.value = settings.maxTokens;

        // Enable send button if API key is set
        sendButton.disabled = !settings.apiKey.trim();
    }

    // Toggle settings panel
    settingsButton.addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
    });

    // Close settings panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!settingsPanel.contains(event.target) && 
            !settingsButton.contains(event.target) && 
            settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
        }
    });

    // Update temperature value display
    temperatureInput.addEventListener('input', () => {
        temperatureValue.textContent = temperatureInput.value;
    });

    // Save settings
    saveSettingsButton.addEventListener('click', () => {
        deepseekAPI.setApiKey(apiKeyInput.value);
        deepseekAPI.setModel(modelSelect.value);
        deepseekAPI.setTemperature(parseFloat(temperatureInput.value));
        deepseekAPI.setMaxTokens(parseInt(maxTokensInput.value));
        
        settingsPanel.classList.remove('active');
        
        // Enable send button if API key is set
        sendButton.disabled = !apiKeyInput.value.trim();
        
        // Show confirmation message
        addSystemMessage('Settings saved successfully!');
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
        
        // Enable/disable send button based on input
        sendButton.disabled = !userInput.value.trim() || !deepseekAPI.getSettings().apiKey;
    });

    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Add message to chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = message ${isUser ? 'user-message' : 'ai-message'};
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Process markdown-like formatting for code blocks
        if (!isUser) {
            content = formatMessage(content);
        }
        
        messageContent.innerHTML = isUser ? <p>${content}</p> : content;
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }

    // Add system message
    function addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = <p>${content}</p>;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add loading indicator
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.id = 'loadingMessage';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            loadingContent.appendChild(dot);
        }
        
        loadingDiv.appendChild(loadingContent);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove loading indicator
    function removeLoadingIndicator() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    // Format message (handle code blocks, etc.)
    function formatMessage(content) {
        // Replace language code  with code blocks
        content = content.replace(/(\w*)([\s\S]*?)/g, function(match, language, code) {
            return <div class="code-block" data-language="${language}">${code.trim()}</div>;
        });
        
        // Replace single line code with inline code
        content = content.replace(/([^]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <p> tags
        const paragraphs = content.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim()) {
                // Skip wrapping code blocks in <p>
                if (p.includes('<div class="code-block"')) {
                    return p;
                }
                return <p>${p.replace(/\n/g, '<br>')}</p>;
            }
            return '';
        }).join('');
    }

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, true);
        
        // Add message to chat history
        chatHistory.push({ 
            role: 'user', 
            content: message 
        });
        
        // Clear input and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        sendButton.disabled = true;
        
        // Show loading indicator
        addLoadingIndicator();
        
        try {
            // Send message to DeepSeek API
            const response = await deepseekAPI.sendMessage(chatHistory);
            
            // Remove loading indicator
            removeLoadingIndicator();
            
            // Get assistant response
            const assistantMessage = response.choices[0].message;
            
            // Add assistant message to chat
            addMessage(assistantMessage.content);
            
            // Add to chat history
            chatHistory.push(assistantMessage);
        } catch (error) {
            // Remove loading indicator
            removeLoadingIndicator();
            
            // Show error message
            addSystemMessage(Error: ${error.message});
            console.error('Error:', error);
        }
    }

    // Initialize the app
    initializeSettings();
});
