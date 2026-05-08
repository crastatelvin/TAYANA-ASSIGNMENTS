import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

# Configure Gemini
API_KEY = "AIzaSyA93FmKWZ1fBQxZovyZ24NaC4SezCvv5u0" # Updated with your key
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Event Configuration
QUESTIONS = [
    "How would you describe your initial impression of the session's organization and flow?",
    "How useful was the depth of the technical content covered today?",
    "What did you think of the speaker's ability to explain the live coding demonstrations?",
    "Based on today’s session, how likely are you to attend another workshop with us?",
    "Overall, how satisfied are you with the value you received for the time spent?"
]

GREETING = "Hi there! Thank you so much for attending our 'Mastering AI Agents' webinar today. We really value your time and would love to hear your thoughts to help us improve. Ready to start?"

def classify_sentiment(question, answer):
    if not API_KEY:
        return "NEUTRAL (API Key Missing)"
    
    prompt = f"""
    Classify the following response into exactly one category: [POSITIVE, NEUTRAL, NEGATIVE].
    Question: {question}
    User Answer: {answer}
    Return ONLY the word: POSITIVE, NEUTRAL, or NEGATIVE.
    """
    try:
        response = model.generate_content(prompt)
        sentiment = response.text.strip().upper()
        return sentiment if sentiment in ["POSITIVE", "NEUTRAL", "NEGATIVE"] else "NEUTRAL"
    except:
        return "NEUTRAL"

@app.route('/')
def index():
    return render_template('index.html', greeting=GREETING)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    step = data.get('step', 0)
    answer = data.get('answer', '')
    
    # Process previous answer if applicable
    result = None
    if step > 0 and step <= len(QUESTIONS):
        prev_question = QUESTIONS[step-1]
        sentiment = classify_sentiment(prev_question, answer)
        result = {"question": prev_question, "answer": answer, "sentiment": sentiment}

    # Get next question
    if step < len(QUESTIONS):
        next_question = QUESTIONS[step]
        return jsonify({
            "next_question": next_question,
            "step": step + 1,
            "is_final": False,
            "processed_result": result
        })
    else:
        return jsonify({
            "message": "Thank you! Your feedback has been recorded.",
            "is_final": True,
            "processed_result": result
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
