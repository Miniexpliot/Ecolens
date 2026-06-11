/**
 * @fileoverview EcoLens application module: chat-widget.js
 * Follows strict Google JavaScript Style Guide.
 */
import { Store } from '../state.js';
import { chatRespond } from '../ai-engine.js';
import { sanitizeText } from '../sanitize.js';

export function renderChatWidget() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-widget collapsed';

  wrapper.innerHTML = `
    <button class="chat-widget__fab" aria-label="Open AI Assistant">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
      </svg>
    </button>
    <div class="chat-widget__panel">
      <div class="chat-widget__header">
        <div class="chat-widget__title">
          <span class="ai-avatar">✨</span> EcoLens AI
        </div>
        <button class="chat-widget__close" aria-label="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="chat-widget__body">
        <div class="chat-messages" id="chat-messages" aria-live="polite">
          <div class="chat-message ai">
            <div class="chat-message-avatar">✨</div>
            <div class="chat-message-bubble">Hi! I'm EcoLens AI. What would you like to know about your footprint?</div>
          </div>
        </div>
        <div class="chat-input-area chat-suggestions">
          <!-- Predefined questions will be generated here -->
        </div>
      </div>
    </div>
  `;

  // Interaction logic
  const fab = wrapper.querySelector('.chat-widget__fab');
  const closeBtn = wrapper.querySelector('.chat-widget__close');
  const suggestionsContainer = wrapper.querySelector('.chat-suggestions');
  const messagesContainer = wrapper.querySelector('#chat-messages');

  let currentSuggestions = [
    'What is a carbon footprint?',
    'How can I reduce my daily emissions?',
    'Why is climate change important?',
  ];

  const renderSuggestions = () => {
    suggestionsContainer.innerHTML = '';
    const state = Store.getState();

    // Tailor suggestions if we have a report
    if (state.reportGenerated && state.emissions) {
      const e = state.emissions;
      const highest = Object.keys(e)
        .filter((k) => k !== 'total')
        .sort((a, b) => e[b] - e[a])[0];

      currentSuggestions = [
        `How can I reduce my ${highest} emissions?`,
        `Am I doing better than the national average?`,
        `What is the easiest way to save 1 ton of CO₂?`,
      ];
    }

    currentSuggestions.forEach((q) => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggestion-btn';
      btn.textContent = q;
      btn.addEventListener('click', () => {
        sendMessage(q);
      });
      suggestionsContainer.appendChild(btn);
    });
  };

  // Re-render suggestions when store updates
  Store.subscribe(() => {
    renderSuggestions();
  });

  // Initial render
  renderSuggestions();

  const toggleChat = () => {
    const isCollapsed = wrapper.classList.toggle('collapsed');
    if (!isCollapsed) {
      const firstBtn = suggestionsContainer.querySelector(
        '.chat-suggestion-btn'
      );
      if (firstBtn) {
        firstBtn.focus();
      } else {
        closeBtn.focus();
      }
    } else {
      fab.focus();
    }
  };

  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !wrapper.classList.contains('collapsed')) {
      toggleChat();
    }
  });

  const sendMessage = (text) => {
    if (!text) return;

    const cleanText = sanitizeText(text);
    addMessage(cleanText, 'user');

    // Generate AI Response
    setTimeout(async () => {
      const state = Store.getState();
      const response = await chatRespond(cleanText, state);
      addMessage(response, 'ai');
    }, 500);
  };

  const addMessage = (text, sender) => {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message ${sender}`;

    let innerContent = '';
    if (sender === 'ai') {
      innerContent += '<div class="chat-message-avatar">✨</div>';
    } else {
      innerContent += '<div class="chat-message-avatar">👤</div>';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-message-bubble';

    // Parse basic markdown (**) to strong tags securely without innerHTML
    const parts = text.split(/(\*\*.*?\*\*)/g);
    parts.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const strong = document.createElement('strong');
        strong.textContent = part.slice(2, -2);
        bubble.appendChild(strong);
      } else if (part) {
        bubble.appendChild(document.createTextNode(part));
      }
    });

    msgEl.innerHTML = innerContent;
    msgEl.appendChild(bubble);

    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  return wrapper;
}
