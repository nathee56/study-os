'use client';

import { useState, useCallback } from 'react';
import { callLLM } from '@/lib/thaillm';

export interface ExamQuestion {
  id: string;
  type: 'multiple-choice' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  questions: ExamQuestion[];
}

export function useExamGenerator() {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  const generateExam = useCallback(async (
    sourceContent: string,
    type: 'multiple-choice' | 'essay' | 'mixed' = 'mixed',
    questionCount: number = 5
  ) => {
    setIsGenerating(true);
    setIsFinished(false);
    setResult(null);
    setCurrentIndex(0);

    const typeInstruction = type === 'multiple-choice' 
      ? 'สร้างข้อสอบปรนัย 4 ตัวเลือกเท่านั้น'
      : type === 'essay'
      ? 'สร้างข้อสอบอัตนัยเท่านั้น'
      : 'สร้างข้อสอบผสมทั้งปรนัยและอัตนัย';

    const prompt = `คุณเป็นครูผู้เชี่ยวชาญ ${typeInstruction} จำนวน ${questionCount} ข้อ จากเนื้อหาที่กำหนดให้

เนื้อหา:
${sourceContent.slice(0, 4000)}

ตอบในรูปแบบ JSON อย่างเดียว ห้ามมีข้อความอื่น:
[
  {
    "type": "multiple-choice",
    "question": "คำถาม",
    "options": ["ก. ตัวเลือก1", "ข. ตัวเลือก2", "ค. ตัวเลือก3", "ง. ตัวเลือก4"],
    "correctAnswer": "ก. ตัวเลือก1",
    "explanation": "อธิบายเฉลย"
  },
  {
    "type": "essay",
    "question": "คำถาม",
    "correctAnswer": "คำตอบที่ถูกต้อง",
    "explanation": "อธิบายเฉลย"
  }
]`;

    try {
      const response = await callLLM('openthaigpt-thaillm-8b-instruct-v7.2', [
        { role: 'system', content: 'คุณเป็นครูที่สร้างข้อสอบ ตอบเป็น JSON เท่านั้น' },
        { role: 'user', content: prompt },
      ]);

      const content = response.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format');
      
      const parsed = JSON.parse(jsonMatch[0]);
      const formattedQuestions: ExamQuestion[] = parsed.map((q: Record<string, unknown>, i: number) => ({
        id: `q-${i}`,
        type: q.type || 'multiple-choice',
        question: q.question,
        options: q.options || undefined,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        userAnswer: undefined,
        isCorrect: undefined,
      }));

      setQuestions(formattedQuestions);
    } catch (err) {
      console.error('Exam generation error:', err);
      // Fallback with sample questions
      setQuestions([{
        id: 'q-0',
        type: 'multiple-choice',
        question: 'ไม่สามารถสร้างข้อสอบได้ กรุณาลองใหม่อีกครั้ง',
        options: ['ก. ลองใหม่', 'ข. ลองใหม่', 'ค. ลองใหม่', 'ง. ลองใหม่'],
        correctAnswer: 'ก. ลองใหม่',
        explanation: 'กรุณาลองสร้างข้อสอบใหม่อีกครั้ง',
      }]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const submitAnswer = useCallback((questionId: string, answer: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      
      let isCorrect = false;
      if (q.type === 'multiple-choice') {
        isCorrect = answer === q.correctAnswer;
      } else {
        // For essay, mark as needs review (simple keyword matching)
        const keywords = q.correctAnswer.split(' ').filter(w => w.length > 2);
        const matchCount = keywords.filter(kw => answer.toLowerCase().includes(kw.toLowerCase())).length;
        isCorrect = matchCount >= Math.ceil(keywords.length * 0.3);
      }

      return { ...q, userAnswer: answer, isCorrect };
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finish exam
      setIsFinished(true);
      const answered = questions.filter(q => q.userAnswer !== undefined);
      const correct = answered.filter(q => q.isCorrect).length;
      setResult({
        totalQuestions: questions.length,
        correctAnswers: correct,
        score: Math.round((correct / questions.length) * 100),
        questions,
      });
    }
  }, [currentIndex, questions]);

  const resetExam = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setIsFinished(false);
    setResult(null);
  }, []);

  return {
    questions,
    currentQuestion: questions[currentIndex] || null,
    currentIndex,
    isGenerating,
    isFinished,
    result,
    generateExam,
    submitAnswer,
    nextQuestion,
    resetExam,
  };
}
