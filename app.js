// app.js
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
    const themeSelect = document.getElementById('themeSelect');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const fileInput = document.getElementById('fileInput');
    const imageInput = document.getElementById('imageInput');
    const attachmentsPreview = document.getElementById('attachmentsPreview');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    
    // Log elements to debug
    console.log('Send button element:', sendButton);

    // Chat history and attachments
    let chatHistory = [];
    let currentAttachments = [];

    // Apply theme
    function applyTheme() {
        const settings = deepseekAPI.getSettings();
        if (settings.theme === 'light') {
            document.body.classList.add('light-theme');
            if (themeSelect) themeSelect.value = 'light';
        } else {
            document.body.classList.remove('light-theme');
            if (themeSelect) themeSelect.value = 'dark';
        }
    }

    // Initialize settings from localStorage
    function initializeSettings() {
        const settings = deepseekAPI.getSettings();
        apiKeyInput.value = settings.apiKey;
        modelSelect.value = settings.model;
        temperatureInput.value = settings.temperature;
        temperatureValue.textContent = settings.temperature;
        maxTokensInput.value = settings.maxTokens;
        themeSelect.value = settings.theme;

        // Apply theme
        applyTheme();

        // Enable send button if API key is set
        if (settings.apiKey.trim()) {
            sendButton.disabled = false;
            sendButton.classList.add('active');
        } else {
            sendButton.disabled = true;
            sendButton.classList.remove('active');
        }
        
        console.log('Settings initialized:', settings);
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
        console.log('Saving settings...');
        deepseekAPI.setApiKey(apiKeyInput.value);
        deepseekAPI.setModel(modelSelect.value);
        deepseekAPI.setTemperature(parseFloat(temperatureInput.value));
        deepseekAPI.setMaxTokens(parseInt(maxTokensInput.value));
        deepseekAPI.setTheme(themeSelect.value);
        
        // Apply theme
        applyTheme();
        
        settingsPanel.classList.remove('active');
        
        // Enable send button if API key is set
        if (apiKeyInput.value.trim()) {
            sendButton.disabled = false;
            sendButton.classList.add('active');
        } else {
            sendButton.disabled = true;
            sendButton.classList.remove('active');
        }
        
        // Show confirmation message
        addSystemMessage('Settings saved successfully!');
        console.log('Settings saved:', deepseekAPI.getSettings());
    });

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
        
        // Enable/disable send button based on input
        updateSendButtonState();
    });

    // Handle file input changes
    fileInput.addEventListener('change', (event) => {
        handleFileSelection(event.target.files);
    });

    // Handle image input changes
    imageInput.addEventListener('change', (event) => {
        handleFileSelection(event.target.files);
    });

    // Handle file selection
    function handleFileSelection(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            // Check file size (limit to 5MB for this example)
            if (file.size > 5 * 1024 * 1024) {
                addSystemMessage(`File "${file.name}" exceeds the 5MB size limit.`);
                return;
            }
            
            // Add to current attachments
            currentAttachments.push(file);
            
            // Create preview
            createAttachmentPreview(file);
        });
        
        // Update send button state
        updateSendButtonState();
    }

    // Create attachment preview
    function createAttachmentPreview(file) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'attachment-preview';
        previewDiv.dataset.name = file.name;
        
        if (file.type.startsWith('image/')) {
            // Image preview
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            previewDiv.appendChild(img);
        } else {
            // File icon preview
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-icon';
            
            const icon = document.createElement('i');
            
            // Set appropriate icon based on file type
            if (file.type.includes('pdf')) {
                icon.className = 'fas fa-file-pdf';
            } else if (file.type.includes('doc')) {
                icon.className = 'fas fa-file-word';
            } else if (file.type.includes('text')) {
                icon.className = 'fas fa-file-alt';
            } else {
                icon.className = 'fas fa-file';
            }
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            fileIcon.appendChild(icon);
            fileIcon.appendChild(fileName);
            previewDiv.appendChild(fileIcon);
        }
        
        // Add remove button
        const removeButton = document.createElement('div');
        removeButton.className = 'remove-attachment';
        removeButton.innerHTML = '&times;';
        removeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            
            // Remove from current attachments
            const index = currentAttachments.findIndex(a => a.name === file.name);
            if (index !== -1) {
                currentAttachments.splice(index, 1);
            }
            
            // Remove preview
            previewDiv.remove();
            
            // Update send button state
            updateSendButtonState();
        });
        
        previewDiv.appendChild(removeButton);
        attachmentsPreview.appendChild(previewDiv);
    }

    // Update send button state
    function updateSendButtonState() {
        const hasInput = userInput.value.trim().length > 0;
        const hasAttachments = currentAttachments.length > 0;
        const hasApiKey = deepseekAPI.getSettings().apiKey.trim().length > 0;
        
        if ((hasInput || hasAttachments) && hasApiKey) {
            sendButton.disabled = false;
            sendButton.classList.add('active');
        } else {
            sendButton.disabled = true;
            sendButton.classList.remove('active');
        }
    }

    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!sendButton.disabled) {
                console.log('Enter key pressed, sending message');
                sendMessage();
            }
        }
    });

    // Send message on button click
    if (sendButton) {
        console.log('Adding event listener to send button');
        sendButton.addEventListener('click', () => {
            console.log('Send button clicked');
            sendMessage();
        });
    } else {
        console.error('Send button not found in the DOM');
    }

    // Add message to chat
    function addMessage(content, isUser = false, attachments = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Process markdown-like formatting for code blocks
        if (!isUser) {
            content = formatMessage(content);
        }
        
        messageContent.innerHTML = isUser ? `<p>${content}</p>` : content;
        
        // Add attachments if any
        if (attachments && attachments.length > 0) {
            const attachmentsDiv = document.createElement('div');
            attachmentsDiv.className = 'message-attachments';
            
            attachments.forEach(file => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                if (file.type.startsWith('image/')) {
                    // Image attachment
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.alt = file.name;
                    
                    // Make image clickable for preview
                    img.addEventListener('click', () => {
                        showImagePreview(URL.createObjectURL(file));
                    });
                    
                    attachmentDiv.appendChild(img);
                } else {
                    // File attachment
                    const fileIcon = document.createElement('div');
                    fileIcon.className = 'file-icon';
                    
                    const icon = document.createElement('i');
                    if (file.type.includes('pdf')) {
                        icon.className = 'fas fa-file-pdf';
                    } else if (file.type.includes('doc')) {
                        icon.className = 'fas fa-file-word';
                    } else if (file.type.includes('text')) {
                        icon.className = 'fas fa-file-alt';
                    } else {
                        icon.className = 'fas fa-file';
                    }
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name;
                    
                    fileIcon.appendChild(icon);
                    fileIcon.appendChild(fileName);
                    attachmentDiv.appendChild(fileIcon);
                }
                
                attachmentsDiv.appendChild(attachmentDiv);
            });
            
            messageContent.appendChild(attachmentsDiv);
        }
        
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
        messageContent.innerHTML = `<p>${content}</p>`;
        
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
        // Replace ```language code ``` with code blocks
        content = content.replace(/```(\w*)([\s\S]*?)```/g, function(match, language, code) {
            return `<div class="code-block" data-language="${language}">${code.trim()}</div>`;
        });
        
        // Replace single line code with inline code
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <p> tags
        const paragraphs = content.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim()) {
                // Skip wrapping code blocks in <p>
                if (p.includes('<div class="code-block"')) {
                    return p;
                }
                return `<p>${p.replace(/\n/g, '<br>')}</p>`;
            }
            return '';
        }).join('');
    }

    // Show image preview in modal
    function showImagePreview(src) {
        modalImage.src = src;
        imageModal.style.display = 'block';
    }

    // Close image preview modal
    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // Send message function
    async function sendMessage() {
        console.log('sendMessage function called');
        const message = userInput.value.trim();
        const hasAttachments = currentAttachments.length > 0;
        
        if (!message && !hasAttachments) {
            console.log('No message or attachments to send');
            return;
        }

        console.log('Sending message:', message);
        console.log('Attachments:', currentAttachments);
        
        // Add user message to chat
        addMessage(message, true, currentAttachments);
        
        // Add message to chat history
        chatHistory.push({ 
            role: 'user', 
            content: message 
        });
        
        // Make a copy of current attachments before clearing
        const attachmentsCopy = [...currentAttachments];
        
        // Clear input, attachments, and reset height
        userInput.value = '';
        userInput.style.height = 'auto';
        currentAttachments = [];
        attachmentsPreview.innerHTML = '';
        sendButton.disabled = true;
        sendButton.classList.remove('active');
        
        // Show loading indicator
        addLoadingIndicator();
        
        try {
            // Send message to DeepSeek API
            const response = await deepseekAPI.sendMessage(chatHistory, attachmentsCopy);
            
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
            addSystemMessage(`Error: ${error.message}`);
            console.error('Error:', error);
        }
    }

    // Initialize the app
    initializeSettings();
    
    // Set focus on input field
    userInput.focus();
    
    console.log('App initialized');
});
