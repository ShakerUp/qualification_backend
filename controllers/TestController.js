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
      userId: req.userId,
      numberOfQuestions: questions.length,
      timesDone: 0,
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
          if (userAnswer[0] === question.correctAnswer[0]) {
            correctAnswers++;
          }
        } else if (question.questionType === 'openquestion') {
          if (
            userAnswer[0].trim().toLowerCase() === question.correctAnswer[0].trim().toLowerCase()
          ) {
            correctAnswers++;
            console.log('open');
          }
        } else if (question.questionType === 'multipleanswer') {
          const userSelectedOptions = userAnswer || [];
          const correctOptions = question.correctAnswer || [];
          if (arraysEqual(userSelectedOptions, correctOptions)) {
            correctAnswers++;
            console.log('answers');
          }
        }
      }
    });

    const test = await TestModel.findById(testId);
    const user = await UserModel.findById(_id);
    const totalQuestions = questions.length;
    const mark = ((correctAnswers / totalQuestions) * 12).toFixed(1);

    await TestModel.findByIdAndUpdate(testId, {
      $inc: { timesDone: 1 },
    });

    await TestResultModel.create({
      userId: user._id,
      testId,
      testName: test.testName,
      correctAnswers,
      totalQuestions,
      mark,
      userAnswers,
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

function arraysEqual(arr1, arr2) {
  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  return (
    sortedArr1.length === sortedArr2.length &&
    sortedArr1.every((value, index) => value === sortedArr2[index])
  );
}

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
    if (test.showCorrectAnswers === false && req.userRole === 'user') {
      return res.json({ testName: 'Correct answers are not allowed for this test.' });
    }

    const questions = await QuestionModel.find({ testId })
      .select('_id questionText correctAnswer')
      .lean();

    res.json({
      questions,
      testName: test.testName,
      description: test.description,
      fullName: req.fullName,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const teacherTests = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const tests = await TestModel.find({ userId });

    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: 'No tests found for this teacher' });
    }

    res.status(200).json({ tests });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const teacherResults = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Fetch all tests created by the teacher
    const tests = await TestModel.find({ userId });

    if (!tests || tests.length === 0) {
      return res.status(404).json({ message: 'No tests found for this teacher' });
    }

    // Get an array of testIds
    const testIds = tests.map((test) => test._id);

    // Fetch all test results for the teacher's tests
    const testResults = await TestResultModel.find({ testId: { $in: testIds } });

    if (!testResults || testResults.length === 0) {
      return res.status(404).json({ message: "No results found for this teacher's tests" });
    }
    const userResults = await Promise.all(
      testResults.map(async (testResult) => {
        const userId = testResult.userId;
        const user = await UserModel.findById(userId, 'name surname');

        return {
          _id: testResult._id,
          testId: testResult.testId,
          testName: testResult.testName,
          userName: `${user.name} ${user.surname}`,
          createdAt: testResult.createdAt,
          mark: testResult.mark,
          userAnswers: testResult.userAnswers,
        };
      }),
    );

    res.status(200).json({ userResults });
  } catch (error) {
    console.error('Error fetching teacher results:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
