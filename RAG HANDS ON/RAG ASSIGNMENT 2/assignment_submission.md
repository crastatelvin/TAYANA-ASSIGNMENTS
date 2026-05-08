# Assignment Submission: Post-Event Feedback Conversation
**Event Type:** Mastering AI Agents Webinar

### 1. Greeting Message
"Hi there! Thank you so much for attending our 'Mastering AI Agents' webinar today. We really value your time and would love to hear your thoughts to help us improve. This will only take about a minute—ready to start?"

### 2. Feedback Questions & Grouping

1. How would you describe your initial impression of the session's organization and flow?
   - **Response Grouping:**
     - Positive: Mentions of "smooth," "well-organized," or "clear structure."
     - Neutral: Mentions of "fine," "okay," or "standard."
     - Negative: Mentions of "confusing," "disorganized," or "technical delays."

2. How useful was the depth of the technical content covered today?
   - **Response Grouping:**
     - Positive: Mentions of "valuable," "very helpful," or "learned a lot."
     - Neutral: Mentions of "somewhat useful," "average," or "already knew it."
     - Negative: Mentions of "too basic," "too complex," or "irrelevant."

3. What did you think of the speaker's ability to explain the live coding demonstrations?
   - **Response Grouping:**
     - Positive: Mentions of "clear," "engaging," or "easy to follow."
     - Neutral: Mentions of "alright," "decent," or "could be better."
     - Negative: Mentions of "too fast," "hard to understand," or "unclear."

4. Based on today’s session, how likely are you to attend another workshop with us?
   - **Response Grouping:**
     - Positive: Responses like "definitely," "very likely," or "yes."
     - Neutral: Responses like "maybe," "possibly," or "not sure."
     - Negative: Responses like "unlikely," "no," or "probably not."

5. Overall, how satisfied are you with the value you received for the time spent?
   - **Response Grouping:**
     - Positive: Mentions of "highly satisfied," "great value," or "worth it."
     - Neutral: Mentions of "satisfied," "fair," or "met expectations."
     - Negative: Mentions of "unsatisfied," "waste of time," or "disappointed."

---

## Chatbot Implementation (Python + Gemini)
The logic above has been implemented in a Python script that uses the Gemini API to automatically categorize user responses into these groups.

**File:** [feedback_chatbot.py](file:///c:/Users/Administrator/Desktop/ASSIGNMENTS/RAG%20HANDS%20ON/RAG%202/feedback_chatbot.py)
