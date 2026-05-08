let currentStep = 0;
const totalSteps = 5;
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const progressBar = document.getElementById('progressBar');
const summaryModal = document.getElementById('summaryModal');
const summaryList = document.getElementById('summaryList');

const summaryData = [];

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';

    // Add User Message to UI
    appendMessage('user', text);

    // Call API
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step: currentStep, answer: text })
        });

        const data = await response.json();

        // Update progress
        currentStep = data.step;
        updateProgress();

        // Store result for summary
        if (data.processed_result) {
            summaryData.push(data.processed_result);
        }

        // Add Bot Message
        if (data.is_final) {
            appendMessage('bot', data.message);
            setTimeout(showSummary, 1500);
        } else {
            setTimeout(() => {
                appendMessage('bot', data.next_question);
            }, 600);
        }

    } catch (error) {
        appendMessage('bot', "Sorry, I'm having trouble connecting to the server.");
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `
        <div class="avatar">${sender === 'bot' ? 'AI' : 'YOU'}</div>
        <div class="text-content">
            <p>${text}</p>
        </div>
    `;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateProgress() {
    const percentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
}

function showSummary() {
    summaryList.innerHTML = summaryData.map(item => `
        <div class="summary-item">
            <div class="label">Question: ${item.question}</div>
            <div class="val">${item.answer} <span class="sentiment-badge ${item.sentiment}">${item.sentiment}</span></div>
        </div>
    `).join('');
    summaryModal.style.display = 'flex';
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initial Welcome
updateProgress();
