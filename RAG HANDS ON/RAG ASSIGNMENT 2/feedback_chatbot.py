import os
import google.generativeai as genai
from typing import List, Dict

# Configuration
# Note: You need to set your GOOGLE_API_KEY environment variable
# API Key Configuration
API_KEY = "AIzaSyA93FmKWZ1fBQxZovyZ24NaC4SezCvv5u0" # Updated with your key

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-pro')

class FeedbackAssistant:
    def __init__(self):
        self.event_type = "Mastering AI Agents Webinar"
        self.questions = [
            "How would you describe your initial impression of the session's organization and flow?",
            "How useful was the depth of the technical content covered today?",
            "What did you think of the speaker's ability to explain the live coding demonstrations?",
            "Based on today’s session, how likely are you to attend another workshop with us?",
            "Overall, how satisfied are you with the value you received for the time spent?"
        ]
        self.responses = []
        self.current_question_index = 0

    def get_greeting(self):
        return f"Hi there! Thank you so much for attending our '{self.event_type}' today. We really value your time and would love to hear your thoughts to help us improve. This will only take about a minute—ready to start?"

    def classify_sentiment(self, question: str, answer: str) -> str:
        """Uses Gemini to classify the response into Positive, Neutral, or Negative based on predefined logic."""
        prompt = f"""
        You are an expert feedback analyst. Classify the following response into exactly one of these categories: [POSITIVE, NEUTRAL, NEGATIVE].
        
        Context:
        Question: {question}
        User Answer: {answer}
        
        Classification Rules:
        - POSITIVE: Clear satisfaction, enthusiasm, helpfulness, or high ratings.
        - NEUTRAL: Average, "okay", indifferent, or mixed feedback.
        - NEGATIVE: Disappointment, confusion, too fast/slow, or low ratings.
        
        Return ONLY the word: POSITIVE, NEUTRAL, or NEGATIVE.
        """
        try:
            response = model.generate_content(prompt)
            sentiment = response.text.strip().upper()
            if sentiment in ["POSITIVE", "NEUTRAL", "NEGATIVE"]:
                return sentiment
            return "NEUTRAL" # Fallback
        except Exception as e:
            return "NEUTRAL"

    def start_conversation(self):
        print("\n--- AI Feedback Assistant ---")
        print(self.get_greeting())
        input("\n(Press Enter to begin or type 'ready') ")

        for i, question in enumerate(self.questions):
            print(f"\nQ{i+1}: {question}")
            answer = input("Your Answer: ")
            
            # Show a thinking state
            print("Processing feedback...")
            sentiment = self.classify_sentiment(question, answer)
            
            self.responses.append({
                "question_num": i + 1,
                "question_text": question,
                "answer_text": answer,
                "grouping": sentiment
            })

        self.show_summary()

    def show_summary(self):
        print("\n" + "="*50)
        print("FEEDBACK SUMMARY (Structured Data)")
        print("="*50)
        for resp in self.responses:
            print(f"\nQuestion {resp['question_num']}: {resp['question_text']}")
            print(f"User Response: {resp['answer_text']}")
            print(f"Response Grouping: {resp['grouping']}")
        
        print("\n" + "="*50)
        print("Thank you! Your feedback has been structured and saved for review.")
        print("="*50)

if __name__ == "__main__":
    assistant = FeedbackAssistant()
    assistant.start_conversation()
