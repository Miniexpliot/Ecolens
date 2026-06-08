import { Store } from '../state.js';
import { chatRespond } from '../ai-engine.js';
import { sanitizeText } from '../sanitize.js';

export function renderChatWidget() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-widget collapsed';
  
  wrapper.innerHTML = `
    <div class="chat-widget__header" role="button" tabindex="0" aria-expanded="false">
      <div class="chat-widget__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
        </svg>
        EcoLens AI
      </div>
      <button class="chat-widget__toggle" aria-label="Toggle chat">
        <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div class="chat-widget__body">
      <div class="chat-messages" id="chat-messages" aria-live="polite">
        <div class="chat-message ai">Hi! I'm EcoLens AI. What would you like to know about your footprint?</div>
      </div>
      <div class="chat-input-area chat-suggestions">
        <!-- Predefined questions will be generated here -->
      </div>
    </div>
  `;

  // Interaction logic
  const header = wrapper.querySelector('.chat-widget__header');
  const suggestionsContainer = wrapper.querySelector('.chat-suggestions');
  const messagesContainer = wrapper.querySelector('#chat-messages');

  const SUGGESTIONS = [
    "How can I reduce my footprint?",
    "How much does my diet contribute?",
    "Are my travel emissions too high?",
    "Why is my home energy so high?",
    "Can you help me improve?"
  ];

  // Render suggestion buttons
  SUGGESTIONS.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'chat-suggestion-btn';
    btn.textContent = q;
    btn.addEventListener('click', () => {
      sendMessage(q);
    });
    suggestionsContainer.appendChild(btn);
  });

  const toggleChat = () => {
    wrapper.classList.toggle('collapsed');
    const isExpanded = !wrapper.classList.contains('collapsed');
    header.setAttribute('aria-expanded', isExpanded);
  };

  header.addEventListener('click', toggleChat);
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleChat();
    }
  });

  const sendMessage = (text) => {
    if (!text) return;

    // Sanitize user input
    const cleanText = sanitizeText(text);
    
    // Add User Message
    addMessage(cleanText, 'user');

    // Generate AI Response
    setTimeout(() => {
      const state = Store.getState();
      const response = chatRespond(cleanText, state);
      addMessage(response, 'ai');
    }, 500); // slight delay for natural feel
  };

  const addMessage = (text, sender) => {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${sender}`;
    
    // Parse basic markdown (**) to strong tags securely without innerHTML
    const parts = text.split(/(\*\*.*?\*\*)/g);
    parts.forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        msgEl.appendChild(strong);
      } else if (part) {
        msgEl.appendChild(document.createTextNode(part));
      }
    });
    
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  return wrapper;
}
