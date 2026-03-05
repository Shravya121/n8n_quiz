const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation: { type: String }
});

const attemptSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  isCorrect: { type: Boolean, required: true }
});

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  attempts: [attemptSchema],
  score: {
    type: Number,
    default: null
  },
  totalQuestions: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['generated', 'in-progress', 'completed'],
    default: 'generated'
  },
  timeStarted: { type: Date },
  timeCompleted: { type: Date },
  timeTaken: { type: Number }, // in seconds
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for percentage
quizSchema.virtual('percentage').get(function() {
  if (this.score === null || !this.totalQuestions) return null;
  return Math.round((this.score / this.totalQuestions) * 100);
});

quizSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
