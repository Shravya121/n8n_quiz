const express = require('express');
const router = express.Router();
const axios = require('axios');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// @POST /api/quiz/generate — call n8n webhook to generate MCQs
router.post('/generate', protect, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || topic.trim().length < 2) {
      return res.status(400).json({ message: 'Please provide a valid topic' });
    }

    let questions;

    try {
      console.log(`🤖 Calling n8n webhook for topic: ${topic}`);

      const n8nResponse = await axios.post(
        process.env.N8N_WEBHOOK_URL,
        {
          topic: topic.trim(),
          count: 20,
          studentId: req.user.studentId,
          userId: req.user._id
        },
        { timeout: 90000 }
      );

      const data = n8nResponse.data;
      console.log('📦 n8n raw response:', JSON.stringify(data).slice(0, 300));

      // Handle multiple possible response structures from n8n + Gemini
      if (Array.isArray(data)) {
        const first = data[0];
        if (first?.questions) {
          questions = first.questions;
        } else if (first?.json?.questions) {
          questions = first.json.questions;
        }
      } else if (data?.questions) {
        questions = data.questions;
      } else if (data?.json?.questions) {
        questions = data.json.questions;
      } else if (typeof data === 'string') {
        const cleaned = data.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        questions = parsed.questions;
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Could not extract questions from n8n response');
      }

      console.log(`✅ Got ${questions.length} questions from n8n`);

    } catch (webhookError) {
      console.error('⚠️ n8n webhook error:', webhookError.message);
      console.log('🔄 Falling back to mock questions...');
      questions = generateMockQuestions(topic, 20);
    }

    // Validate & clean each question before saving
    const cleanedQuestions = questions.map((q, i) => ({
      question: q.question || `Question ${i + 1}`,
      options: {
        A: q.options?.A || q.options?.a || '',
        B: q.options?.B || q.options?.b || '',
        C: q.options?.C || q.options?.c || '',
        D: q.options?.D || q.options?.d || ''
      },
      correctAnswer: (q.correctAnswer || q.correct_answer || 'A').toUpperCase(),
      explanation: q.explanation || ''
    }));

    const quiz = await Quiz.create({
      user: req.user._id,
      topic: topic.trim(),
      questions: cleanedQuestions,
      totalQuestions: cleanedQuestions.length,
      status: 'generated',
      timeStarted: new Date()
    });

    // Return questions WITHOUT correctAnswer (hidden from client during quiz)
    const sanitizedQuestions = quiz.questions.map((q, i) => ({
      _id: q._id,
      index: i,
      question: q.question,
      options: q.options
    }));

    res.status(201).json({
      message: 'Quiz generated successfully',
      quizId: quiz._id,
      topic: quiz.topic,
      totalQuestions: quiz.totalQuestions,
      questions: sanitizedQuestions
    });

  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    res.status(500).json({ message: 'Failed to generate quiz. Please try again.' });
  }
});

// @POST /api/quiz/:id/submit — submit answers & calculate score
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.status === 'completed') {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    const attempts = [];
    let score = 0;

    quiz.questions.forEach((question, index) => {
      const selectedAnswer = answers[String(index)];
      if (selectedAnswer) {
        const isCorrect = selectedAnswer === question.correctAnswer;
        if (isCorrect) score++;
        attempts.push({ questionIndex: index, selectedAnswer, isCorrect });
      }
    });

    const timeCompleted = new Date();
    const timeTaken = Math.round((timeCompleted - quiz.timeStarted) / 1000);

    quiz.attempts = attempts;
    quiz.score = score;
    quiz.status = 'completed';
    quiz.timeCompleted = timeCompleted;
    quiz.timeTaken = timeTaken;
    await quiz.save();

    const results = quiz.questions.map((q, i) => ({
      index: i,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      selectedAnswer: answers[String(i)] || null,
      isCorrect: answers[String(i)] === q.correctAnswer
    }));

    res.json({
      message: 'Quiz submitted successfully',
      quizId: quiz._id,
      score,
      totalQuestions: quiz.totalQuestions,
      percentage: Math.round((score / quiz.totalQuestions) * 100),
      timeTaken,
      results
    });

  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// @GET /api/quiz/history
router.get('/history', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .select('-questions -attempts')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz history' });
  }
});

// @GET /api/quiz/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status !== 'completed') return res.status(400).json({ message: 'Quiz not yet completed' });
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// --- MOCK GENERATOR (fallback if n8n is unavailable) ---
function generateMockQuestions(topic, count) {
  const mockData = [
    { q: `What is the fundamental concept of ${topic}?`, opts: { A: 'A core principle', B: 'A secondary rule', C: 'An exception', D: 'A myth' }, ans: 'A' },
    { q: `Which method best describes ${topic} analysis?`, opts: { A: 'Qualitative only', B: 'Quantitative only', C: 'Both qualitative and quantitative', D: 'Neither' }, ans: 'C' },
    { q: `Who pioneered the study of ${topic}?`, opts: { A: 'Newton', B: 'Einstein', C: 'Depends on the domain', D: 'Unknown' }, ans: 'C' },
    { q: `What is a key limitation in ${topic}?`, opts: { A: 'Speed', B: 'Accuracy', C: 'Cost', D: 'All of the above' }, ans: 'D' },
    { q: `In ${topic}, the term "baseline" refers to?`, opts: { A: 'Starting reference point', B: 'End result', C: 'Error margin', D: 'Sample size' }, ans: 'A' },
  ];
  const questions = [];
  for (let i = 0; i < count; i++) {
    const base = mockData[i % mockData.length];
    questions.push({
      question: `[Q${i + 1}] ${base.q}`,
      options: base.opts,
      correctAnswer: base.ans,
      explanation: `This is the correct answer because it best represents the principles of ${topic}.`
    });
  }
  return questions;
}

module.exports = router;