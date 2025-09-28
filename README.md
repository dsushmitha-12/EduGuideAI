# 📚 EduGuide AI: Your Smart Study Companion

EduGuide AI is an all-in-one AI assistant designed for college students to streamline their academic life. It leverages cutting-edge AI models and a robust back-end to provide instant, personalized support for studying, planning, and note-taking.

## ✨ Features

-   **🧠 General AI:** Ask any question and receive a detailed, well-formatted answer with external resource links.
-   **📝 Smart Summarizer:** Paste your lecture notes or articles and get a concise, bullet-point summary.
-   **🗂️ Flashcard Generator:** Automatically create interactive, flip-able flashcards from any text for quick and effective revision.
-   **🎲 Interactive Quiz:** Generate multiple-choice quizzes from your study material to test your knowledge.
-   **📅 Semester Planner:** Generate a personalized study schedule based on your semester start date and exam deadlines.
-   **💻 Code Explainer:** Paste a code snippet and get a detailed breakdown of what it does, perfect for computer science students.
-   **💾 Persistent Chat History:** Your conversations are securely saved using a Firebase database, so you never lose track of your study progress.
-   **🌙 Dark Mode:** A user-friendly interface with a dark mode option for late-night studying.

## 🚀 How It's Built

Our project is a full-stack application built with the following technologies:

-   **Frontend:** HTML, CSS, JavaScript
-   **Backend:** Python (Flask)
-   **AI Model:** OpenAI GPT-4o-mini
-   **Database:** Google Cloud Firestore
-   **Version Control:** Git & GitHub

## 💻 Getting Started

### Prerequisites

-   Python 3.8+
-   An OpenAI API Key
-   A Google Cloud Project (for Firestore)

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/dsushmitha-12/eduguide-ai.git](https://github.com/dsushmitha-12/eduguide-ai.git)
    cd eduguide-ai/backend
    ```
2.  **Set up the Backend:**
    ```bash
    python -m venv venv
    source venv/Scripts/activate  # On Windows: .\venv\Scripts\activate
    pip install Flask Flask-Cors openai firebase-admin python-dotenv
    ```
3.  **Configure API Keys:**
    * Create a file named `.env` in the `backend` folder.
    * Add your OpenAI API Key and the path to your Firebase service account key file.
    ```
    OPENAI_API_KEY=your_openai_api_key_here
    FIREBASE_KEY_PATH=firebase-key.json
    ```
4.  **Run the Server:**
    ```bash
    python app.py
    ```

### Using the App

Open `index.html` in your browser. The app will connect to the running local server, and you can start using all the features.

## 🏆 GT Hackathon 2025 Submission

This project was a 48-hour prototype for the GT Hackathon. We are proud of what we accomplished and are excited to demonstrate the power of AI in education.