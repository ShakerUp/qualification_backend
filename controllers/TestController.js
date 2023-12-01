import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import TestModel from '../models/TestModel.js';
import TestResultModel from '../models/TestResultModel.js';
import UserModel from '../models/UserModel.js';
import QuestionModel from '../models/QuestionModel.js';

dotenv.config();
const secretKey = process.env.JWT_SECRET_KEY;

export const create = async (req, res) => {
  try {
    const { testName, showCorrectAnswers, questions, category, description } = req.body;

    const newTest = await TestModel.create({
      testName,
      showCorrectAnswers,
      category,
      description,
    });

    const questionPromises = questions.map(async (questionData) => {
      const { questionType, questionText, options, correctAnswer } = questionData;

      const newQuestion = await QuestionModel.create({
        questionType,
        questionText,
        options,
        correctAnswer,
        testId: newTest._id,
      });

      return newQuestion;
    });

    const newQuestions = await Promise.all(questionPromises);

    res.status(201).json({ newTest, newQuestions });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAll = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(category);

    let query = {};
    if (category && category !== '0') {
      query = { category: category };
    }

    const tests = await TestModel.find(query);
    res.json(tests);
  } catch (err) {
    console.error('Error fetching tests:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTestQuestions = async (req, res) => {
  try {
    const testId = req.params.testId;
    const test = await TestModel.findById(testId);
    console.log(test.testName);

    const questions = await QuestionModel.find({ testId }).select('-correctAnswer');

    res.json({
      questions,
      testName: test.testName,
      description: test.description,
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const submit = async (req, res) => {
  const testId = req.params.testId;
  const token = req.headers.authorization;
  const userAnswers = req.body.answers;

  try {
    const decoded = jwt.verify(token, secretKey);
    const { _id } = decoded;
    const questions = await QuestionModel.find({ testId });

    let correctAnswers = 0;
    questions.forEach((question) => {
      const userAnswer = userAnswers[question._id];
      if (userAnswer !== undefined) {
        if (question.questionType === 'multiplechoice') {
          if (userAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        } else if (question.questionType === 'openquestion') {
          if (userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
            correctAnswers++;
          }
        }
      }
    });

    const test = await TestModel.findById(testId);
    const user = await UserModel.findById(_id);
    const totalQuestions = questions.length;
    const mark = ((correctAnswers / totalQuestions) * 12).toFixed(1);
    await TestResultModel.create({
      userId: user._id,
      testId,
      testName: test.testName,
      correctAnswers,
      totalQuestions,
      mark,
    });

    res.json({
      correctAnswers,
      totalQuestions,
      mark,
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const userResult = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401);
    }

    const decoded = jwt.verify(token, secretKey);
    const { _id } = decoded;

    const user = await UserModel.findById(_id);
    const userResults = await TestResultModel.find({ userId: _id });
    res.json({ userResults, name: user.name, surname: user.surname });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCorrectAnswers = async (req, res) => {
  try {
    const testResultId = req.params.testResultId;
    const testResult = await TestResultModel.findById(testResultId);

    if (!testResult) {
      return res.status(404).json({ error: 'Test wasnt done by you' });
    }
    if (testResult.userId != req.userId) {
      return res.status(403).json({ message: 'You haven`t done this test' });
    }
    const testId = testResult._doc.testId;
    const test = await TestModel.findById(testId);

    if (!test) {
      return res.status(404).json({ error: 'Server error' });
    }
    if (test.showCorrectAnswers == false) {
      return res.json({ testName: 'Correct answers are not allowed for this test.' });
    }

    const questions = await QuestionModel.find({ testId })
      .select('_id questionText correctAnswer')
      .lean();

    res.json({
      questions,
      testName: test.testName,
      description: test.description,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
