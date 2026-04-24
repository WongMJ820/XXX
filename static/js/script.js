const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        userInput.value = '';
        simulateBotResponse();
    }
});

function addMessage(text, sender) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    messageDiv.innerHTML = `
        <div class="bubble">${text}</div>
        <span class="timestamp">${time}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function simulateBotResponse() {
    // Show typing indicator
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate network delay
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        addMessage("This is a demo response! You can connect this frontend to an API easily.", 'bot');
    }, 1500);
}