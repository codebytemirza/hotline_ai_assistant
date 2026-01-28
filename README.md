# Hotline Suicide Help Assistant (Mehak)

![Mehak Banner](https://triage-assistant.vercel.app/og-image.svg)

> **"Providing Immediate Professional Support & Hope"**

The **Hotline Suicide Help Assistant**, code-named **Mehak**, is an AI-powered crisis intervention prototype designed to provide immediate, warm, and professional support to individuals in distress. Leveraging the **OpenAI Realtime API**, Mehak offers a low-latency voice-to-voice experience, ensuring that those in need aren't left waiting.

---

## 🌟 Mission & Vision

This project was built by **Sadaqat & Abdullah** with a singular goal: to create a technology-driven bridge for crisis intervention. We believe that in moments of crisis, every second counts. Mehak is designed to:
- Provide an **immediate response** when human operators might be busy.
- Use a **warm, non-judgmental voice** (`shimmer`) to de-escalate stress.
- **Identify critical risks** in real-time and trigger emergency rescue notifications.
- Bridge the gap between initial contact and professional human intervention.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Custom **"Serious Paper Art"** Design System)
- **Backend/API**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) (Local) / [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions) (Production)
- **AI Core**: [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) (`gpt-4o-realtime-preview`)
- **Voice**: `shimmer` (Soft, warm female voice)
- **Protocols**: WebRTC for low-latency audio streaming

---

## ✨ Core Features

### 🎙️ Real-time Voice Intervention
Mehak talks and listens in real-time using WebRTC. There is no "record and wait" delay; the conversation flows naturally, which is critical for empathy and rapport.

### 🧠 Crisis Detection & Triage
Behind the scenes, the system continuously analyzes the transcript for crisis markers. It categorizes the distress level into:
- **Intake**: Initial information gathering.
- **Counseling**: Active listening and support.
- **Crisis Detected**: Immediate de-escalation protocols.
- **Rescue Notified**: Automatic triggering of emergency support if the risk is critical.

### 🎨 "Serious Paper Art" UI
The interface uses a custom-built design system inspired by tactile paper and ink.
- **Warm Muted Tones**: Helping to calm the user visually.
- **Split Screen Layout**: One side for the user (Client Panel), one side for the AI (Mehak Panel).
- **Session Visualization**: Real-time progress graph of the triage process.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- An OpenAI API Key with access to the Realtime API models.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd triage_assistant
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running Locally
You can run the full environment (Frontend + Express Token Server) using one command:
```bash
npm run dev:full
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 📂 Project Structure

```text
├── api/                # Serverless functions (Vercel)
│   └── session.js      # OpenAI Session token generator
├── src/
│   ├── components/     # UI Components (ClientPanel, MehakPanel, etc.)
│   ├── hooks/          # Custom hooks (Audio capture, Realtime session)
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Main application entry
│   ├── index.css       # Design system & Global styles
│   └── App.css         # Layout & Component styles
├── server.js           # Local Express server for token generation
└── vercel.json         # Vercel deployment configuration
```

---

## 📦 Deployment

This project is optimized for **Vercel**.
1. Ensure your `OPENAI_API_KEY` is added to your Vercel Project Environment Variables.
2. Deploy using the Vercel CLI or via GitHub integration.

See [deployment_guide.md](file:///d:/LottoGraph_Agent_backend/triage_assistant/deployment_guide.md) for step-by-step instructions.

---

## ⚠️ Safety Disclaimer

> [!CAUTION]
> **This is a PROTOTYPE.** This AI assistant is not a substitute for professional medical advice, diagnosis, or treatment. It is intended for research and demonstration purposes only. If you or someone you know is in immediate danger, please contact your local emergency services (e.g., 988 in the US/Canada, 999 in the UK).

---

## 🤝 Authors
- **Sadaqat**
- **Abdullah**

*Built with care for humanity.*