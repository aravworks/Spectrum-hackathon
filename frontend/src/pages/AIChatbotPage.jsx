import { useState, useRef, useEffect } from "react";
import "../styles/ai-chatbot/ai-chatbot.css";

const BACKEND = "https://spectrum-hackathon.onrender.com/api/v1";

const suggestedQuestions = [
  "How does ECOVERSE trace a product lifecycle?",
  "What is a traceability gap?",
  "Explain the environmental impact of textile waste.",
  "How does waste treatment affect carbon emissions?",
];

function AIChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm the ECOVERSE Environmental Intelligence Assistant powered by GPT-4. I can help you explore product lifecycles, waste streams, environmental impact, treatment pathways, and research data.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isTyping) return;

    setInput("");
    const userMsg = { id: Date.now(), type: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("ecoverseToken");

      // Build conversation history in OpenAI format
      const history = messages
        .map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.text,
        }));
      history.push({ role: "user", content: userText });

      const res = await fetch(`${BACKEND}/chatbot/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: `Sorry, I couldn't reach the AI right now. Error: ${err.message}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="page ai-chatbot-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">ECOVERSE INTELLIGENCE / AI ASSISTANT</div>
          <h1>Environmental AI Assistant</h1>
          <p>
            Ask questions about products, waste, environmental impact, lifecycle
            data, treatment pathways and research.
          </p>
        </div>
        <div className="ai-status">
          <span />
          AI SYSTEM ONLINE
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="ai-chat-layout">
        {/* CHAT */}
        <section className="panel ai-chat-panel">
          <div className="ai-chat-topbar">
            <div className="ai-agent">
              <div className="ai-agent-icon">E</div>
              <div>
                <strong>ECOVERSE AI</strong>
                <span>Environmental Intelligence Assistant · GPT-4</span>
              </div>
            </div>
            <div className="ai-online">
              <span />
              Online
            </div>
          </div>

          <div className="ai-message-area">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.type === "user"
                    ? "ai-message user-message"
                    : "ai-message bot-message"
                }
              >
                {message.type === "bot" && (
                  <div className="message-avatar">E</div>
                )}
                <div className="message-content">
                  <span className="message-role">
                    {message.type === "bot" ? "ECOVERSE AI" : "YOU"}
                  </span>
                  <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ai-message bot-message">
                <div className="message-avatar">E</div>
                <div className="message-content">
                  <span className="message-role">ECOVERSE AI</span>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <form className="ai-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ECOVERSE anything..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!input.trim() || isTyping}>
              Send
            </button>
          </form>

          <div className="ai-input-note">
            Powered by GPT-4 Turbo. Responses are informational and may contain
            modelled or incomplete information.
          </div>
        </section>

        {/* SIDE PANEL */}
        <aside className="ai-chat-sidebar">
          {/* SUGGESTIONS */}
          <section className="panel ai-suggestions">
            <div className="eyebrow">SUGGESTED QUESTIONS</div>
            <h2>Explore ECOVERSE</h2>
            <div className="suggestion-list">
              {suggestedQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => sendMessage(question)}
                  disabled={isTyping}
                >
                  <span>→</span>
                  {question}
                </button>
              ))}
            </div>
          </section>

          {/* CAPABILITIES */}
          <section className="panel ai-capabilities">
            <div className="eyebrow">AI CAPABILITIES</div>
            <h2>What I can help with</h2>
            <div className="ai-capability-list">
              <div>
                <span>01</span>
                <strong>Product Lifecycle</strong>
                <p>Understand product stages and traceability.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Environmental Impact</strong>
                <p>Explore waste, carbon, water and resource indicators.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Waste Intelligence</strong>
                <p>Understand treatment, recovery and disposal pathways.</p>
              </div>
              <div>
                <span>04</span>
                <strong>Research Support</strong>
                <p>Explore datasets, methodology and data confidence.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* AI PRINCIPLES */}
      <section className="ai-principles">
        <div>
          <div className="eyebrow">ECOVERSE AI PRINCIPLES</div>
          <h2>Intelligence with context.</h2>
          <p>
            The assistant distinguishes sourced information from modelled
            estimates and identifies uncertainty rather than presenting every
            answer as a verified fact.
          </p>
        </div>
        <div className="ai-principle-grid">
          <div>
            <span>01</span>
            <strong>TRACE</strong>
            <p>Connect information across product and waste lifecycles.</p>
          </div>
          <div>
            <span>02</span>
            <strong>VERIFY</strong>
            <p>Preserve source and confidence information.</p>
          </div>
          <div>
            <span>03</span>
            <strong>MEASURE</strong>
            <p>Explain environmental indicators and assumptions.</p>
          </div>
          <div>
            <span>04</span>
            <strong>UNDERSTAND</strong>
            <p>Turn complex environmental data into understandable information.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AIChatbotPage;