# 🧠 Summurai — AI-Powered Chrome Extension for Smarter Learning
---

## 🎯 Problem

Many students see **Learning Hub** not as a _hub of learning_, but as a _dumping ground_ for resources.

Why?  
Because most of the content — slides, PDFs, and documents — is static, non-interactive, and difficult to engage with directly in the browser.  
Students must **download**, **open**, and **manually read** through pages of material just to understand what’s important.

Assignments and labs can be equally confusing, buried under unclear text and formatting.  
Students are left asking:

> “What exactly do I have to do here?”

---

## 💡 Our Solution — Summurai

**Summurai** transforms Learning Hub into an actual _hub of learning_.

It’s a **Chromium-based extension** that uses **Google Gemini AI** to analyze the content of any resource (slides, PDFs, assignments, labs, or notes) and instantly generate **clear, concise summaries** right inside the browser — no downloads needed.

### What It Does

- 🧩 Detects if a resource is a **lecture**, **assignment**, or **general** text.
- 🧠 Uses AI (Gemini 1.5 Pro) to **summarize** the content in plain language.
- ⚡ Works directly in the browser on pages from **Learning Hub, Google Docs, Slides, and PDFs**.
- 💬 Provides a short, actionable overview of tasks, goals, or learning points.

Summurai helps students **understand faster**, **learn smarter**, and **engage directly** with their resources.

---

## 🔍 Example Use Cases

| Type           | Input                                                              | Output                                                                                    |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Lecture**    | “Today’s lecture covers pipeline hazards and how to resolve them.” | “This lecture explains pipeline hazards and techniques for resolving them in CPU design.” |
| **Assignment** | “Lab 3: Implement a sorting algorithm using linked lists.”         | “Assignment: Build a linked-list-based sorting algorithm.”                                |
| **General**    | “Welcome to the new semester at BCIT!”                             | “General announcement.”                                                                   |

---

## 🛠️ How It Works

1. **Content Extraction:**  
   The extension scans visible text on the active tab (from PDFs, slides, or pages).

2. **AI Classification:**  
   The text is sent to the **Gemini 1.5 Pro model**, which classifies it as _lecture_, _assignment_, or _general_.

3. **AI Summarization:**  
   If it’s an assignment or lecture, Gemini generates a short, human-readable summary.

4. **Display:**  
   The summary and classification appear in a clean popup for the user — no clutter, no confusion.

---

## ⚙️ Technical Overview

**Architecture**

- Manifest V3 Chrome Extension
- Content script to extract visible text
- Background service worker for API handling
- Popup UI built with HTML, CSS, and JavaScript
- Gemini 1.5 Pro integration via Google’s Generative AI SDK

**Core AI Function**

- Model: `gemini-1.5-pro`
- Task: Classify (`lecture`, `assignment`, `general`) and summarize
- Deterministic output (temperature = 0 for consistency)

---

## 🧩 Tech Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Browser        | Chromium (Chrome, Edge, Brave) |
| Frontend       | HTML, CSS, JavaScript          |
| AI Backend     | Google Gemini 1.5 Pro          |
| API Handling   | Node.js                        |
| Extension Type | Manifest V3                    |

---

## 🚀 Installation & Demo

### Prerequisites

- Chrome browser (v110+)
- Gemini API Key

### Setup

1. Clone or download this repository.
2. Navigate to `chrome://extensions/` in Chrome.
3. Turn on **Developer Mode** (top-right).
4. Click **Load unpacked** and select the project folder.
5. Add your **Gemini API key** in the `.env` or directly in the background script.
6. Open a page with lecture or assignment text (e.g., Learning Hub page).
7. Click the **Summurai icon** in your extensions bar.

🎉 Summurai will analyze the page and generate a summary instantly!

---

## 🔮 Future Vision

- Auto-detect and summarize all Learning Hub resources in a course.
- Extract and highlight key deadlines or rubric details.
- Integrate with BCIT Connect or Google Classroom.
- Enable export of summaries to notes or calendars.

---

## 🔐 Privacy & Ethics

- Summurai processes **only visible text** — no hidden data or tracking.
- No content is stored or shared externally.
- All API communication is handled securely.

---

## 🧠 Impact

Summurai bridges the gap between **dumped resources** and **active learning**.  
By giving students instant understanding, it turns passive material into interactive knowledge.

Because learning hubs should be **for learning**, not **just storage**.

---

---

## 📜 License

MIT License © 2025  
Created for **Arsen Madi**
