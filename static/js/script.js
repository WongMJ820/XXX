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
    scrollToBottom();
}

function simulateBotResponse() {
    typingIndicator.style.display = 'block';
    scrollToBottom();

    setTimeout(() => {
        typingIndicator.style.display = 'none';
        
        addMessage("Warning: That Pelita invoice is missing a TIN number. I have flagged it as LHDN non-compliant. Your compliance score has dropped.", 'bot');
        
        // TRIGGER THE DASHBOARD UPDATE!
        updateDashboardFromAPI({
            revenue: 48200,
            expenses: 52000,
            pending: 6,
            liquidity: 0.9,
            // --- NEW DATA BELOW ---
            compliance: 68, // This will turn the circle RED and drop it to 68% full!
            tax: {
                rate: 24, // Bumps them up to the highest tax bracket
                untilNext: 0, 
                progressPct: 90 // Fills the progress bar 90% of the way across
            }
        });

    }, 1500);
}

function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

function updateDashboardFromAPI(apiData) {
    if (!apiData) return;

    const revEl = document.getElementById('dash-revenue');
    if (revEl && apiData.revenue !== undefined) {
        revEl.innerText = `RM${apiData.revenue.toLocaleString('en-US')}`;
        revEl.className = 'mtd-value ' + (apiData.revenue >= 0 ? 'text-green' : 'text-red');
    }

    const expEl = document.getElementById('dash-expenses');
    if (expEl && apiData.expenses !== undefined) {
        expEl.innerText = `RM${apiData.expenses.toLocaleString('en-US')}`;
        expEl.className = 'mtd-value ' + (apiData.expenses > 50000 ? 'text-red' : 'text-orange');
    }

    const pendingEl = document.getElementById('dash-pending');
    if (pendingEl && apiData.pending !== undefined) {
        pendingEl.innerText = `${apiData.pending} invoices`;
        pendingEl.className = 'mtd-value ' + (apiData.pending > 5 ? 'text-red' : '');
    }

    // 4. Update Liquidity
    const liqEl = document.getElementById('dash-liquidity');
    if (liqEl && apiData.liquidity !== undefined) {
        liqEl.innerText = `${apiData.liquidity}x`;
        liqEl.className = 'mtd-value ' + (apiData.liquidity < 1.0 ? 'text-red' : 'text-blue');
    }

    // 5. Update Compliance Score & Circle
    if (apiData.compliance !== undefined) {
        const compText = document.getElementById('dash-compliance');
        const compCircle = document.getElementById('compliance-circle');
        
        if (compText) compText.innerText = apiData.compliance;
        if (compCircle) {
            const circleColor = apiData.compliance < 80 ? '#ef4444' : '#5ab2d3';
            compCircle.style.background = `conic-gradient(${circleColor} ${apiData.compliance}%, #e2e8f0 0)`;
        }
    }

    // 6. Update Tax Bracket Logic
    if (apiData.tax !== undefined) {
        const taxText = document.getElementById('dash-tax-until');
        const progBar = document.getElementById('tax-progress-bar');
        
        if (taxText) taxText.innerText = `RM${apiData.tax.untilNext.toLocaleString('en-US')}`;
        
        if (progBar) {
            progBar.style.background = `linear-gradient(90deg, #10b981 0%, #f59e0b ${apiData.tax.progressPct}%, #e2e8f0 ${apiData.tax.progressPct}%)`;
        }

        document.getElementById('tax-marker-15').classList.remove('active');
        document.getElementById('tax-marker-17').classList.remove('active');
        document.getElementById('tax-marker-24').classList.remove('active');

        if (apiData.tax.rate === 15) document.getElementById('tax-marker-15').classList.add('active');
        else if (apiData.tax.rate === 17) document.getElementById('tax-marker-17').classList.add('active');
        else if (apiData.tax.rate === 24) document.getElementById('tax-marker-24').classList.add('active');
    }
}
