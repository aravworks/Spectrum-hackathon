import { useState } from "react";
import "../styles/ai-chatbot/ai-chatbot.css";

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
      text:
        "Hello! I'm the ECOVERSE Environmental Intelligence Assistant. I can help you explore product lifecycles, waste streams, environmental impact, treatment pathways, and research data.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const generateResponse = (question) => {
    const text = question.toLowerCase();

    if (
      text.includes("trace") ||
      text.includes("lifecycle")
    ) {
      return (
        "ECOVERSE traces a product across its lifecycle: raw material, resource use, manufacturing, transport, consumption, return or unsold stage, reuse or repair, recycling, and final disposal. Each stage can include source information and a confidence level."
      );
    }

    if (
      text.includes("gap") ||
      text.includes("traceability")
    ) {
      return (
        "A Traceability Gap represents missing lifecycle information. For example, a product may have manufacturing data but no documented information about its post-consumer destination. ECOVERSE presents this as a data gap rather than automatically treating it as evidence of wrongdoing."
      );
    }

    if (
      text.includes("textile") ||
      text.includes("fashion")
    ) {
      return (
        "Textile environmental impact can involve raw-material use, water consumption, energy, manufacturing waste, transportation, product use, returns, reuse, recycling, and final disposal. ECOVERSE can connect these stages to available evidence and clearly label modelled estimates."
      );
    }

    if (
      text.includes("carbon") ||
      text.includes("emission") ||
      text.includes("methane")
    ) {
      return (
        "Carbon and methane indicators can be used to examine how different waste pathways may affect climate impact. ECOVERSE separates measured or sourced information from modelled estimates so users can understand the assumptions behind the result."
      );
    }

    if (
      text.includes("treatment") ||
      text.includes("recycling") ||
      text.includes("landfill")
    ) {
      return (
        "Waste treatment pathways can include recycling, composting, material recovery, energy recovery, and landfill. Different pathways can produce different recovery, residual-waste, carbon, and methane outcomes. Treatment Simulation in ECOVERSE is intended as decision-support modelling."
      );
    }

    if (
      text.includes("research") ||
      text.includes("data")
    ) {
      return (
        "The Research Data Lab is designed for exploring environmental datasets. Researchers can filter information by category, location, year, and other attributes while reviewing source, methodology, confidence, assumptions, and limitations."
      );
    }

    if (
      text.includes("confidence") ||
      text.includes("verified")
    ) {
      return (
        "ECOVERSE distinguishes different data confidence states: verified or external information, company-reported information, modelled estimates, and unavailable information. This prevents different types of evidence from being presented as equally certain."
      );
    }

    return (
      "I can help you explore ECOVERSE's environmental intelligence system. Try asking about product traceability, waste treatment, carbon and methane, environmental impact, research data, or traceability gaps."
    );
  };

  const sendMessage = (messageText = input) => {
    const cleanMessage = messageText.trim();

    if (!cleanMessage || isTyping) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: cleanMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(cleanMessage);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          type: "bot",
          text: response,
        },
      ]);

      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="page ai-chatbot-page">

      {/* HEADER */}

      <div className="page-header ai-chatbot-header">
        <div>
          <div className="eyebrow">
            ECOVERSE INTELLIGENCE / AI ASSISTANT
          </div>

          <h1>Environmental AI Assistant</h1>

          <p>
            Ask questions about products, waste,
            environmental impact, lifecycle data,
            treatment pathways and research.
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

              <div className="ai-agent-icon">
                E
              </div>

              <div>
                <strong>
                  ECOVERSE AI
                </strong>

                <span>
                  Environmental Intelligence Assistant
                </span>
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
                  <div className="message-avatar">
                    E
                  </div>
                )}

                <div className="message-content">

                  <span className="message-role">
                    {message.type === "bot"
                      ? "ECOVERSE AI"
                      : "YOU"}
                  </span>

                  <p>
                    {message.text}
                  </p>

                </div>

              </div>

            ))}

            {isTyping && (
              <div className="ai-message bot-message">

                <div className="message-avatar">
                  E
                </div>

                <div className="message-content">

                  <span className="message-role">
                    ECOVERSE AI
                  </span>

                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* INPUT */}

          <form
            className="ai-input-area"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask ECOVERSE anything..."
              disabled={isTyping}
            />

            <button
              type="submit"
              disabled={
                !input.trim() || isTyping
              }
            >
              Send
            </button>

          </form>

          <div className="ai-input-note">
            AI responses are informational and may
            contain modelled or incomplete information.
          </div>

        </section>

        {/* SIDE PANEL */}

        <aside className="ai-chat-sidebar">

          {/* SUGGESTIONS */}

          <section className="panel ai-suggestions">

            <div className="eyebrow">
              SUGGESTED QUESTIONS
            </div>

            <h2>
              Explore ECOVERSE
            </h2>

            <div className="suggestion-list">

              {suggestedQuestions.map(
                (question) => (

                  <button
                    type="button"
                    key={question}
                    onClick={() =>
                      sendMessage(question)
                    }
                  >
                    <span>→</span>
                    {question}
                  </button>

                )
              )}

            </div>

          </section>

          {/* CAPABILITIES */}

          <section className="panel ai-capabilities">

            <div className="eyebrow">
              AI CAPABILITIES
            </div>

            <h2>
              What I can help with
            </h2>

            <div className="ai-capability-list">

              <div>
                <span>01</span>
                <strong>
                  Product Lifecycle
                </strong>
                <p>
                  Understand product stages and
                  traceability.
                </p>
              </div>

              <div>
                <span>02</span>
                <strong>
                  Environmental Impact
                </strong>
                <p>
                  Explore waste, carbon, water and
                  resource indicators.
                </p>
              </div>

              <div>
                <span>03</span>
                <strong>
                  Waste Intelligence
                </strong>
                <p>
                  Understand treatment, recovery and
                  disposal pathways.
                </p>
              </div>

              <div>
                <span>04</span>
                <strong>
                  Research Support
                </strong>
                <p>
                  Explore datasets, methodology and
                  data confidence.
                </p>
              </div>

            </div>

          </section>

        </aside>

      </div>

      {/* AI PRINCIPLES */}

      <section className="ai-principles">

        <div>
          <div className="eyebrow">
            ECOVERSE AI PRINCIPLES
          </div>

          <h2>
            Intelligence with context.
          </h2>

          <p>
            The assistant should distinguish sourced
            information from modelled estimates and
            identify uncertainty rather than presenting
            every answer as a verified fact.
          </p>
        </div>

        <div className="ai-principle-grid">

          <div>
            <span>01</span>
            <strong>TRACE</strong>
            <p>
              Connect information across product
              and waste lifecycles.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>VERIFY</strong>
            <p>
              Preserve source and confidence
              information.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>MEASURE</strong>
            <p>
              Explain environmental indicators
              and assumptions.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>UNDERSTAND</strong>
            <p>
              Turn complex environmental data into
              understandable information.
            </p>
          </div>

        </div>

      </section>

      {/* DISCLAIMER */}

      <div className="ai-disclaimer">

        <div className="disclaimer-icon">
          i
        </div>

        <div>
          <strong>
            AI demonstration mode
          </strong>

          <p>
            This frontend currently uses local
            demonstration responses. Connect this page
            to the ECOVERSE FastAPI AI endpoint when the
            backend is ready. Production responses should
            include appropriate sources, confidence and
            uncertainty information.
          </p>
        </div>

      </div>

    </div>
  );
}

export default AIChatbotPage;