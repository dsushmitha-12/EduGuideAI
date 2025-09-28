from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import openai # Use the OpenAI library
from dotenv import load_dotenv
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Load API keys from .env
load_dotenv()
# Use the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Firebase Admin SDK
firebase_key_path = os.getenv("FIREBASE_KEY_PATH")
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)

# Use a Firestore collection for chat history
chat_history_ref = db.collection('chat_history')

@app.route("/ask", methods=["POST"])
def ask_question():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question provided."})

    try:
        # Save user message to Firestore
        chat_history_ref.add({
            "role": "user",
            "content": question,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        # Use OpenAI for the API call
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for students. When answering a question, always include 2-3 relevant resource links at the end of your response, formatted as a markdown list under the heading 'Resources:'. Also, format your response using markdown for headings, bold text, and code blocks for a clean look. "},
                {"role": "user", "content": question}
            ],
            max_tokens=800
        )
        answer = response.choices[0].message["content"]

        # Save AI response to Firestore
        chat_history_ref.add({
            "role": "assistant",
            "content": answer,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return jsonify({"answer": answer})

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"})

# The rest of the routes are unchanged since they use the same logic
# and were working before. You can reuse the rest of your app.py code
# from the version that used the OpenAI API.
# ... (flashcards, quiz, summarize, plan, explain-code, history routes)
@app.route("/flashcards", methods=["POST"])
def generate_flashcards():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided."})

    try:
        prompt = f"From the following text, generate a list of 5-10 flashcards. Each flashcard should have a 'question' and an 'answer'. Return the output as a JSON object, like this: {{ 'flashcards': [{{'question': '...', 'answer': '...'}}] }}. Text: {text}"

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        raw_output = response.choices[0].message["content"]

        json_start = raw_output.find('{')
        json_end = raw_output.rfind('}') + 1
        json_string = raw_output[json_start:json_end]
        flashcards_data = json.loads(json_string)

        return jsonify(flashcards_data)

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided."})

    try:
        prompt = f"From the following text, generate a 5 question multiple-choice quiz. Each question should have a 'question', an array of 'options' and a single correct 'answer'. Return the output as a JSON object, like this: {{'quiz': [{{'id': 1, 'question': '...', 'options': ['...', '...', '...'], 'answer': '...'}}]}}. Text: {text}"

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        raw_output = response.choices[0].message["content"]

        json_start = raw_output.find('{')
        json_end = raw_output.rfind('}') + 1
        json_string = raw_output[json_start:json_end]
        quiz_data = json.loads(json_string)

        return jsonify(quiz_data)

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/summarize", methods=["POST"])
def summarize_text():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided."})

    try:
        prompt = f"Summarize the following text concisely and in bullet points. Return the output in markdown format. Text: {text}"

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500
        )
        summary = response.choices[0].message["content"]

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/plan", methods=["POST"])
def generate_plan():
    data = request.get_json()
    start_date = data.get("semester-start", "")
    exam_dates_text = data.get("exam-dates", "")

    if not start_date or not exam_dates_text:
        return jsonify({"error": "Missing start date or exam dates."})

    try:
        prompt = f"Create a detailed study plan from the semester start date: {start_date} to the given exam dates. The exam dates are in the format 'Subject - Date'. Please format your response using markdown for headings and lists. The exam dates are: {exam_dates_text}"

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        plan = response.choices[0].message["content"]

        return jsonify({"plan": plan})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/explain-code", methods=["POST"])
def explain_code():
    data = request.get_json()
    code = data.get("code", "")
    if not code:
        return jsonify({"error": "No code provided."})

    try:
        prompt = f"Explain the following code snippet for a student. Break down what each part does, identify the programming language, and describe its overall purpose. Return the explanation in markdown format. Code: \n\n{code}"

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        explanation = response.choices[0].message["content"]

        return jsonify({"explanation": explanation})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/history", methods=["GET"])
def get_history():
    try:
        docs = chat_history_ref.order_by('timestamp').stream()
        history = []
        for doc in docs:
            history.append(doc.to_dict())
        return jsonify(history)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)