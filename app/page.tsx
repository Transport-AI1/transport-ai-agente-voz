"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Bot,
  Check,
  CheckCircle2,
  Headphones,
  Mic,
  MicOff,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type RecognitionResult = {
  transcript: string;
};

type RecognitionEvent = {
  results: ArrayLike<ArrayLike<RecognitionResult>>;
};

type RecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type VoiceWindow = Window & {
  SpeechRecognition?: new () => RecognitionInstance;
  webkitSpeechRecognition?: new () => RecognitionInstance;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "¡Hola! Soy el asistente de voz de Transport AI. ¿En qué puedo ayudarte hoy?",
  },
];

const suggestions = [
  "¿Qué servicios ofrecéis?",
  "Quiero automatizar mi empresa",
  "Quiero hablar con el equipo",
];

function getReply(message: string): string {
  const text = message.toLowerCase();

  if (
    text.includes("servicio") ||
    text.includes("ofrec") ||
    text.includes("hacéis") ||
    text.includes("haceis")
  ) {
    return "En Transport AI ayudamos a las empresas a mejorar sus procesos con páginas web profesionales, agentes de inteligencia artificial, automatizaciones, integraciones y software adaptado a sus necesidades. ¿Qué parte de tu negocio te gustaría mejorar?";
  }

  if (
    text.includes("precio") ||
    text.includes("cuánto") ||
    text.includes("cuanto") ||
    text.includes("coste") ||
    text.includes("presupuesto")
  ) {
    return "El precio depende de lo que necesite tu empresa, del alcance del proyecto y de las integraciones necesarias. Podemos estudiar tu caso y preparar una propuesta personalizada. ¿Me cuentas brevemente qué tienes en mente?";
  }

  if (
    text.includes("web") ||
    text.includes("página") ||
    text.includes("pagina") ||
    text.includes("tienda")
  ) {
    return "Podemos ayudarte a crear una web profesional, una página de captación o una tienda online. También podemos incorporar un asistente de IA para responder preguntas y facilitar que tus visitantes contacten contigo.";
  }

  if (
    text.includes("automat") ||
    text.includes("proceso") ||
    text.includes("empresa") ||
    text.includes("trabajo")
  ) {
    return "Podemos analizar tareas repetitivas, consultas de clientes, gestión de solicitudes y procesos que actualmente realizas de forma manual. La idea es automatizar lo que aporte valor sin obligarte a sustituir todas tus herramientas actuales.";
  }

  if (
    text.includes("voz") ||
    text.includes("llamada") ||
    text.includes("teléfono") ||
    text.includes("telefono") ||
    text.includes("hablar")
  ) {
    return "Un agente de voz puede atender consultas, orientar a las personas y recoger solicitudes mediante una conversación hablada. Según la integración, también puede derivar consultas a una persona del equipo.";
  }

  if (
    text.includes("contact") ||
    text.includes("equipo") ||
    text.includes("persona") ||
    text.includes("whatsapp") ||
    text.includes("reunión") ||
    text.includes("reunion")
  ) {
    return "¡Claro! Puedes contactar directamente con el equipo de Transport AI por WhatsApp. Pulsa el botón de contacto de esta página y podrás explicar qué necesitas para valorar el siguiente paso.";
  }

  if (
    text.includes("transporte") ||
    text.includes("logística") ||
    text.includes("logistica") ||
    text.includes("mensajería") ||
    text.includes("mensajeria")
  ) {
    return "Trabajamos también en soluciones para transporte y logística: gestión de incidencias, automatización de consultas, coordinación de operaciones e integración con herramientas existentes. Podemos adaptar la propuesta a los procesos de tu empresa.";
  }

  if (
    text.includes("hola") ||
    text.includes("buenas") ||
    text.includes("buenos días") ||
    text.includes("buenas tardes")
  ) {
    return "¡Hola! Encantado de atenderte. Puedo explicarte nuestros servicios, orientarte sobre posibles automatizaciones o ayudarte a contactar con el equipo. ¿Qué necesitas?";
  }

  return "Gracias por tu consulta. Puedo orientarte sobre páginas web, agentes de IA, automatizaciones, integraciones y soluciones para empresas. Si me explicas un poco más lo que necesitas, te ayudaré a identificar el siguiente paso.";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [status, setStatus] = useState("Preparado para ayudarte");
  const [error, setError] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const nextIdRef = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(text: string) {
    if (!voiceEnabled || typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      setError("Tu navegador no permite reproducir voz. Puedes seguir usando el chat.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("es")
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("El asistente está hablando");
    };

    utterance.onend = () => {
      setSpeaking(false);
      setStatus("Preparado para ayudarte");
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setStatus("Puedes seguir escribiendo o hablando");
    };

    window.speechSynthesis.speak(utterance);
  }

  function sendMessage(value?: string) {
    const text = (value ?? input).trim();
    if (!text) return;

    setError("");
    setInput("");

    const userMessage: Message = {
      id: nextIdRef.current++,
      role: "user",
      text,
    };

    const reply = getReply(text);

    const assistantMessage: Message = {
      id: nextIdRef.current++,
      role: "assistant",
      text: reply,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setStatus("Respuesta preparada");

    if (voiceEnabled) {
      window.setTimeout(() => speak(reply), 250);
    }
  }

  function startListening() {
    setError("");

    if (typeof window === "undefined") return;

    const voiceWindow = window as VoiceWindow;
    const Recognition =
      voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setError(
        "El reconocimiento de voz no está disponible en este navegador. Prueba con Chrome o utiliza el cuadro de texto."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new Recognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setListening(false);

      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setStatus("No se ha podido reconocer la voz");
      setError(
        "No hemos podido escuchar el mensaje. Comprueba el permiso del micrófono e inténtalo de nuevo."
      );
    };

    recognition.onend = () => {
      setListening(false);
      setStatus("Preparado para ayudarte");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      setStatus("Te estoy escuchando...");
    } catch {
      setListening(false);
      setError("No se ha podido activar el micrófono. Vuelve a intentarlo.");
    }
  }

  function resetConversation() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    recognitionRef.current?.stop();
    setListening(false);
    setSpeaking(false);
    setMessages(initialMessages);
    setInput("");
    setError("");
    setStatus("Preparado para ayudarte");
    nextIdRef.current = 2;
  }

  const whatsappUrl =
    "https://wa.me/34659980603?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20un%20agente%20de%20voz%20con%20IA.";

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="#inicio" aria-label="Transport AI, inicio">
          <span className="brand-mark">
            <AudioLines size={23} />
          </span>
          <span>
            <strong>Transport AI</strong>
            <small>VOICE INTELLIGENCE</small>
          </span>
        </a>

        <div className="nav-links">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#capacidades">Capacidades</a>
          <a href="#demo">Demostración</a>
        </div>

        <a className="nav-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
          Hablar con el equipo <ArrowRight size={16} />
        </a>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" />
            INTELIGENCIA ARTIFICIAL CONVERSACIONAL
          </div>

          <h1>
            Conversaciones que
            <br />
            <span>trabajan por ti.</span>
          </h1>

          <p className="hero-description">
            Un asistente de voz inteligente que atiende consultas, orienta a
            tus clientes y facilita la gestión de solicitudes. Disponible para
            tu negocio, cuando lo necesites.
          </p>

          <div className="hero-actions">
            <a className="button-primary" href="#demo">
              <Mic size={18} /> Probar el asistente
            </a>
            <a className="button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">
              Solicitar información <ArrowRight size={17} />
            </a>
          </div>

          <div className="hero-points">
            <span>
              <CheckCircle2 size={16} /> Atención conversacional
            </span>
            <span>
              <CheckCircle2 size={16} /> Interacción por voz o texto
            </span>
            <span>
              <CheckCircle2 size={16} /> Adaptable a cada negocio
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orb-glow" />
          <div className="voice-card">
            <div className="voice-card-top">
              <div className="assistant-identity">
                <div className="assistant-avatar">
                  <Bot size={25} />
                </div>
                <div>
                  <strong>Asistente virtual</strong>
                  <span>
                    <i className="live-dot" /> Disponible para ayudarte
                  </span>
                </div>
              </div>
              <span className="secure-label">
                <ShieldCheck size={14} /> IA
              </span>
            </div>

            <div className="voice-orb-wrap">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="voice-orb">
                <AudioLines size={48} strokeWidth={1.5} />
              </div>
              <span className="orb-dot dot-one" />
              <span className="orb-dot dot-two" />
              <span className="orb-dot dot-three" />
            </div>

            <div className="visualizer" aria-label="Visualización decorativa de voz">
              {[18, 30, 23, 43, 27, 50, 34, 60, 39, 25, 47, 31, 55, 24, 42, 19, 33, 23, 45, 28, 18].map(
                (height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height}px`, animationDelay: `${index * 0.055}s` }}
                  />
                )
              )}
            </div>

            <p className="voice-caption">
              <Sparkles size={15} /> Escucha, comprende y responde
            </p>

            <div className="sample-bubble">
              <span className="bubble-label">TÚ</span>
              <p>Quiero información sobre vuestros servicios.</p>
            </div>

            <div className="sample-bubble ai-bubble">
              <span className="bubble-label">ASISTENTE</span>
              <p>
                Claro. Puedo explicarte nuestras soluciones y ayudarte a dar el
                siguiente paso.
              </p>
            </div>

            <div className="voice-card-bottom">
              <span>
                <ShieldCheck size={15} /> Experiencia conversacional
              </span>
              <span className="wave-icon">
                <AudioLines size={17} />
              </span>
            </div>
          </div>

          <div className="floating-note note-top">
            <span className="floating-icon">
              <Zap size={18} />
            </span>
            <span>
              <strong>Respuestas ágiles</strong>
              <small>Atención automatizada</small>
            </span>
          </div>

          <div className="floating-note note-bottom">
            <span className="floating-icon green">
              <Check size={18} />
            </span>
            <span>
              <strong>Solicitudes guiadas</strong>
              <small>Menos pasos manuales</small>
            </span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <span className="strip-icon"><MessageCircle size={19} /></span>
          <span><strong>Conversación natural</strong><small>Voz y texto</small></span>
        </div>
        <div>
          <span className="strip-icon"><Headphones size={19} /></span>
          <span><strong>Atención inteligente</strong><small>Consultas y solicitudes</small></span>
        </div>
        <div>
          <span className="strip-icon"><Zap size={19} /></span>
          <span><strong>Procesos optimizados</strong><small>Diseñado para tu empresa</small></span>
        </div>
        <div>
          <span className="strip-icon"><ShieldCheck size={19} /></span>
          <span><strong>Control y supervisión</strong><small>Con límites definidos</small></span>
        </div>
      </section>

      <section className="section capabilities" id="capacidades">
        <div className="section-heading">
          <div className="eyebrow">UNA NUEVA FORMA DE ATENDER</div>
          <h2>Mucho más que una voz.</h2>
          <p>
            Un punto de entrada sencillo para resolver consultas y acompañar a
            tus clientes durante sus gestiones.
          </p>
        </div>

        <div className="capability-grid">
          <article className="capability-card">
            <span className="capability-icon"><MessageCircle size={23} /></span>
            <span className="card-number">01 / CONVERSACIÓN</span>
            <h3>Responde consultas</h3>
            <p>
              Ofrece respuestas iniciales sobre servicios, horarios, procesos
              y preguntas frecuentes.
            </p>
          </article>

          <article className="capability-card">
            <span className="capability-icon"><Headphones size={23} /></span>
            <span className="card-number">02 / ORIENTACIÓN</span>
            <h3>Guía al usuario</h3>
            <p>
              Formula preguntas, recoge información relevante y ayuda a
              identificar qué necesita cada persona.
            </p>
          </article>

          <article className="capability-card">
            <span className="capability-icon"><Zap size={23} /></span>
            <span className="card-number">03 / AUTOMATIZACIÓN</span>
            <h3>Facilita solicitudes</h3>
            <p>
              Puede diseñarse para registrar solicitudes y conectarse con las
              herramientas que ya utiliza tu empresa.
            </p>
          </article>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="demo-intro">
          <div className="eyebrow"><span className="live-dot" /> DEMOSTRACIÓN INTERACTIVA</div>
          <h2>Tu próximo asistente empieza aquí.</h2>
          <p>
            Escribe una consulta o pulsa el micrófono y habla. Prueba una
            conversación de ejemplo y descubre cómo podría ser la experiencia
            para tus clientes.
          </p>

          <div className="demo-benefits">
            <div><CheckCircle2 size={18} /><span>Habla o escribe en español</span></div>
            <div><CheckCircle2 size={18} /><span>Escucha las respuestas cuando la voz esté disponible</span></div>
            <div><CheckCircle2 size={18} /><span>Prueba consultas habituales de una empresa</span></div>
          </div>

          <div className="demo-disclaimer">
            <ShieldCheck size={18} />
            <p>
              Esta es una demo local con respuestas predefinidas. Una solución
              real puede configurarse con IA, telefonía y sistemas empresariales
              según los requisitos del proyecto.
            </p>
          </div>
        </div>

        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-profile">
              <div className="chat-avatar"><Bot size={23} /></div>
              <div>
                <strong>Asistente Transport AI</strong>
                <span><i className="live-dot" /> Demo interactiva</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className={`icon-button ${voiceEnabled ? "active" : ""}`}
                onClick={() => {
                  setVoiceEnabled((current) => {
                    const next = !current;
                    if (!next && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                      setSpeaking(false);
                    }
                    return next;
                  });
                }}
                aria-label={voiceEnabled ? "Desactivar voz" : "Activar voz"}
                title={voiceEnabled ? "Desactivar voz" : "Activar voz"}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                className="icon-button"
                onClick={resetConversation}
                aria-label="Reiniciar conversación"
                title="Reiniciar conversación"
              >
                <RotateCcw size={17} />
              </button>
            </div>
          </div>

          <div className="chat-status">
            <span className={listening ? "status-pulse" : "status-dot"} />
            {listening ? "Te estoy escuchando..." : speaking ? "El asistente está hablando..." : status}
          </div>

          <div className="chat-messages">
            <div className="chat-date">CONVERSACIÓN DE DEMOSTRACIÓN</div>

            {messages.map((message) => (
              <div
                className={`message-row ${message.role === "user" ? "user-row" : ""}`}
                key={message.id}
              >
                {message.role === "assistant" && (
                  <div className="message-avatar"><Bot size={17} /></div>
                )}
                <div className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.role === "assistant" ? "Asistente IA · Demo" : "Tú"}
                  </span>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="suggestions">
              <span>PRUEBA PREGUNTANDO</span>
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => sendMessage(suggestion)}>
                  {suggestion} <ArrowRight size={14} />
                </button>
              ))}
            </div>
          )}

          {error && <div className="chat-error"><X size={15} /> {error}</div>}

          <div className="chat-composer">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu consulta..."
                aria-label="Escribe tu consulta"
              />

              <button
                type="button"
                className={`mic-button ${listening ? "listening" : ""}`}
                onClick={startListening}
                aria-label={listening ? "Detener micrófono" : "Hablar con el asistente"}
                title={listening ? "Detener micrófono" : "Hablar con el asistente"}
              >
                {listening ? <MicOff size={19} /> : <Mic size={19} />}
              </button>

              <button type="submit" className="send-button" aria-label="Enviar mensaje">
                <Send size={18} />
              </button>
            </form>
            <div className="composer-footer">
              <span><ShieldCheck size={13} /> Demo de voz y texto</span>
              <span>Pulsa el micrófono para hablar</span>
            </div>
          </div>
        </div>
      </section>

      <section className="steps-section" id="como-funciona">
        <div className="section-heading">
          <div className="eyebrow">DEL PRIMER HOLA A LA SOLUCIÓN</div>
          <h2>Simple para el usuario. Útil para tu negocio.</h2>
        </div>

        <div className="steps-grid">
          <div className="step-item">
            <span className="step-number">01</span>
            <h3>El usuario pregunta</h3>
            <p>Inicia una conversación mediante voz o texto.</p>
          </div>
          <div className="step-item">
            <span className="step-number">02</span>
            <h3>El asistente orienta</h3>
            <p>Interpreta la consulta y responde según la configuración.</p>
          </div>
          <div className="step-item">
            <span className="step-number">03</span>
            <h3>La empresa avanza</h3>
            <p>La solución puede derivar solicitudes o conectarse con tus sistemas.</p>
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-icon"><AudioLines size={27} /></div>
        <div>
          <div className="eyebrow">DISEÑADO PARA TU NEGOCIO</div>
          <h2>¿Y si tu empresa pudiera atender de otra manera?</h2>
          <p>Cuéntanos qué necesitas y estudiaremos una solución adaptada a tus procesos.</p>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="button-primary">
          <MessageCircle size={18} /> Hablar por WhatsApp <ArrowRight size={17} />
        </a>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark"><AudioLines size={21} /></span>
          <span><strong>Transport AI</strong><small>VOICE INTELLIGENCE</small></span>
        </a>
        <p>Inteligencia artificial aplicada a empresas.</p>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">Contactar <ArrowRight size={14} /></a>
        <span className="footer-copy">© {new Date().getFullYear()} Transport AI</span>
      </footer>

      {mobileChatOpen && (
        <div className="mobile-chat-notice">
          <button onClick={() => setMobileChatOpen(false)} aria-label="Cerrar">
            <X size={18} />
          </button>
          La demostración está disponible en la sección de conversación.
          <a href="#demo" onClick={() => setMobileChatOpen(false)}>Ir a la demo <ArrowDown size={14} /></a>
        </div>
      )}

      <button
        className="mobile-float-button"
        onClick={() => {
          setMobileChatOpen(true);
          document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <Phone size={18} /> Probar asistente
      </button>
    </main>
  );
}
