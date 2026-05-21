# AI WhatsApp Learning Bot - Project Brief

## Goal

Build a WhatsApp-based AI learning bot for the team, similar to the existing AI WhatsApp updates project.

The bot should send daily AI-related questions, next-day answers, and a weekly recap. It should help the team stay updated on AI concepts, tools, trends, and practical interview-style points.

## Core Schedule

- Monday to Friday, 8:00 PM IST: send daily themed AI questions.
- Tuesday to Saturday, 9:00 AM IST: send answers for the previous evening's questions.
- Saturday, 10:00 AM IST: send a weekly recap of Monday-Friday themes, questions, and key takeaways.

Locked Saturday flow:

- 9:00 AM IST: send Friday answers.
- 10:00 AM IST: send weekly recap separately.
- Do not combine Friday answers and weekly recap into one message.

## Daily Evening Message Format

```text
Today's Theme: <AI theme>

Basic Question:
<basic open-ended AI question>

Intermediate Question:
<intermediate AI question>

Expert Question:
<expert scenario/design/debugging/comparison question>

Tiny AI Update:
<short AI news/info/concept update>

Answers tomorrow at 9:00 AM IST.
```

## Morning Answer Message Format

```text
Answers: <Yesterday's theme>

Basic:
<short crisp interview-style answer>

Intermediate:
<short crisp interview-style answer>

Expert:
<short crisp interview-style answer>

Tiny AI Update Recap:
<optional one-line recap if useful>
```

## Weekly Recap Format

```text
Weekly AI Recap

Themes covered:
- <Monday theme>
- <Tuesday theme>
- <Wednesday theme>
- <Thursday theme>
- <Friday theme>

Top 5 Interview Points:
1. <key point>
2. <key point>
3. <key point>
4. <key point>
5. <key point>

Best Questions This Week:
Basic: <one useful basic question>
Intermediate: <one useful intermediate question>
Expert: <one useful expert question>
```

## Content Scope

The bot can cover any AI-related topic useful for team awareness:

- AI fundamentals
- Generative AI and LLMs
- RAG
- embeddings
- fine-tuning
- prompt engineering
- AI agents
- model evaluation
- hallucinations
- AI governance, privacy, and security
- AI coding tools
- workplace AI usage
- recent AI product/model updates

For now, source links are not required for news-based updates. They can be added later.

## Question Style

- Mostly open-ended.
- Mixed styles are allowed when useful:
  - concept questions
  - comparison questions
  - scenario-based questions
  - debugging/troubleshooting questions
  - architecture/design questions
  - occasional multiple-choice questions
  - recent AI news/info questions

## Answer Style

- Short and crisp.
- Interview-point style.
- No long explanation.
- No separate "why this matters" line for now.
- The answer message should briefly reference the question so it makes sense the next morning.

Example:

```text
Q: How is RAG different from fine-tuning?
A: RAG retrieves external context at answer time; fine-tuning changes model behavior through training. Use RAG for fresh/private knowledge, fine-tuning for style, format, or repeated task behavior.
```

## Dynamic Generation Decision

Use dynamic generation, not a static question bank.

Important rule:

```text
Generate fresh content daily, save it before sending.
```

This means:

1. At 8:00 PM, generate the theme, questions, answers, and tiny update.
2. Save everything to local history.
3. Send only the questions and tiny update to WhatsApp.
4. At 9:00 AM next day, read the saved record and send the matching answers.

This keeps content fresh while ensuring the morning answers always match the previous evening's questions.

## Memory And Repeat Avoidance

The system should remember previously sent questions and avoid repeated or very similar questions.

SQLite is recommended for history storage because it supports:

- daily question storage
- answer lookup
- repeat avoidance
- send status tracking
- weekly recap generation
- future reports or dashboards

## Suggested Data Fields

```text
id
date
weekday
theme
basic_question
basic_answer
intermediate_question
intermediate_answer
expert_question
expert_answer
tiny_update
question_sent_at
answer_sent_at
weekly_recap_included
created_at
updated_at
```

## Suggested Components

```text
generator
- creates theme, questions, answers, and tiny update

history store
- SQLite database
- remembers previous questions and send status

whatsapp sender
- reuse the existing WhatsApp sending setup from the earlier AI updates project

scheduler
- 8 PM IST question job
- 9 AM IST answer job
- Saturday recap job

recap builder
- creates weekly summary from stored Monday-Friday content
```

## Initial Delivery Scope

Version 1 should keep things simple:

- Use the same WhatsApp group as the AI updates project.
- Support one group first; add more recipients later.
- Generate content dynamically.
- Store all content in SQLite.
- Avoid repeats using stored history.
- Send Monday-Friday evening questions.
- Send Tuesday-Saturday morning answers.
- Send a separate Saturday 10:00 AM weekly recap.

## Example Evening Message

```text
Today's Theme: RAG for Internal Knowledge

Basic Question:
What does RAG stand for in generative AI?

Intermediate Question:
Why is RAG often better than fine-tuning for company documents?

Expert Question:
Your internal chatbot gives answers from outdated policy documents. What would you check first?

Tiny AI Update:
Many enterprise AI systems use RAG to connect LLMs with private company knowledge without retraining the model.

Answers tomorrow at 9:00 AM IST.
```

## Example Morning Message

```text
Answers: RAG for Internal Knowledge

Basic:
RAG means Retrieval-Augmented Generation. It retrieves relevant external information before generating an answer.

Intermediate:
RAG is better for company documents because knowledge can stay fresh without retraining the model. Fine-tuning is better for behavior, style, or repeated task patterns.

Expert:
Check document freshness, indexing schedule, retrieval quality, metadata filters, and whether the prompt forces answers from retrieved context only.
```

## Handoff Note For Office Codex

Read this file first, then inspect the existing WhatsApp-related projects in this repository for reusable sending/scheduling patterns:

- `ai_model_tracker`
- `daily-ai-model-whatsapp-update`
- `whatsapp-quiz-bot`

Do not start from a static question bank unless explicitly requested. The intended design is dynamic daily generation with saved history.
