'use client';

import { useState, useMemo } from 'react';
import { useVoice } from '@/lib/hooks/useVoice';
import { useExamGenerator } from '@/lib/hooks/useExamGenerator';
import { useNotes } from '@/lib/hooks/useNotes';
import { useTodos } from '@/lib/hooks/useTodos';
import { callLLM, buildSystemPrompt } from '@/lib/thaillm';
import { IconMicrophone, IconSparkle, IconFileText, IconCheck, IconX, IconVolume, IconVolumeOff } from '@/components/ui/Icons';

type Mode = 'tutor' | 'exam';

export default function VoiceTutorPage() {
  const { isListening, isSpeaking, transcript, interimTranscript, isSupported, startListening, stopListening, speak, stopSpeaking, clearTranscript } = useVoice();
  const { questions, currentQuestion, currentIndex, isGenerating, isFinished, result, generateExam, submitAnswer, nextQuestion, resetExam } = useExamGenerator();
  const { notes } = useNotes();
  const { todos } = useTodos();

  const [mode, setMode] = useState<Mode>('tutor');
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [examType, setExamType] = useState<'multiple-choice' | 'essay' | 'mixed'>('mixed');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [essayAnswer, setEssayAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const systemPrompt = useMemo(() => buildSystemPrompt({
    todos: todos.filter(t => !t.done).map(t => t.title).join(', '),
    notes: notes.slice(0, 5).map(n => n.title).join(', '),
  }), [todos, notes]);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;
    setIsThinking(true);
    setAiResponse('');
    try {
      const messages = [
        { role: 'system', content: systemPrompt + '\nตอบสั้นกระชับ เหมาะกับการฟัง ไม่ใช้ markdown ไม่ต้องมีข้อความ "แนะนำ:" ท้ายคำตอบ' },
        { role: 'user', content: question },
      ];
      const res = await callLLM(MODELS.openthaigpt, messages);
      const text = res.choices[0].message.content;
      // Remove suggestion line
      const clean = text.split('\n').filter((l: string) => !l.startsWith('แนะนำ:')).join('\n').trim();
      setAiResponse(clean);
      if (autoSpeak) speak(clean);
    } catch (err) {
      console.error('Voice AI Error:', err);
      setAiResponse('ขออภัย ไม่สามารถตอบได้ในขณะนี้');
    } finally {
      setIsThinking(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      const finalText = transcript + interimTranscript;
      if (finalText.trim()) handleAskAI(finalText);
    } else {
      clearTranscript();
      setAiResponse('');
      startListening();
    }
  };

  const handleGenerateExam = () => {
    if (!selectedNote) return;
    const content = `${selectedNote.title}\n${selectedNote.body}`;
    generateExam(content, examType, 5);
    setAnswered(false);
    setSelectedAnswer('');
    setEssayAnswer('');
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    const answer = currentQuestion.type === 'multiple-choice' ? selectedAnswer : essayAnswer;
    if (!answer) return;
    submitAnswer(currentQuestion.id, answer);
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setSelectedAnswer('');
    setEssayAnswer('');
    setAnswered(false);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={mode === 'tutor' ? 'btn-primary' : 'btn-ghost'} onClick={() => { setMode('tutor'); resetExam(); }}
          style={{ flex: 1, borderRadius: 12 }}>
          <IconMicrophone size={16} /> ติวเตอร์เสียง
        </button>
        <button className={mode === 'exam' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('exam')}
          style={{ flex: 1, borderRadius: 12 }}>
          <IconSparkle size={16} /> ข้อสอบจำลอง
        </button>
      </div>

      {mode === 'tutor' ? (
        /* ===== TUTOR MODE ===== */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Mic Button */}
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isListening && (
              <>
                <div className="mic-pulse-ring" style={{ animationDelay: '0s' }} />
                <div className="mic-pulse-ring" style={{ animationDelay: '0.5s' }} />
                <div className="mic-pulse-ring" style={{ animationDelay: '1s' }} />
              </>
            )}
            <button onClick={handleMicToggle} className="btn-neumorphic"
              style={{
                width: 100, height: 100, borderRadius: '50%', position: 'relative', zIndex: 2,
                background: isListening ? 'var(--orange)' : undefined,
                color: isListening ? '#fff' : 'var(--orange)',
              }}>
              <IconMicrophone size={36} />
            </button>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-hint)', textAlign: 'center' }}>
            {!isSupported ? 'เบราว์เซอร์ไม่รองรับการฟังเสียง' :
              isListening ? 'กำลังฟัง... พูดได้เลย' :
              isThinking ? 'กำลังคิด...' : 'กดเพื่อพูดคุยกับ AI'}
          </p>

          {/* Auto-speak toggle */}
          <button className="btn-ghost" onClick={() => { setAutoSpeak(!autoSpeak); if (isSpeaking) stopSpeaking(); }}
            style={{ fontSize: 12, padding: '6px 14px', gap: 6 }}>
            {autoSpeak ? <IconVolume size={14} /> : <IconVolumeOff size={14} />}
            {autoSpeak ? 'อ่านออกเสียง: เปิด' : 'อ่านออกเสียง: ปิด'}
          </button>

          {/* Transcript */}
          {(transcript || interimTranscript) && (
            <div className="card" style={{ width: '100%', background: 'var(--cream)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 6 }}>คุณพูดว่า:</div>
              <p style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                {transcript}<span style={{ color: 'var(--text-hint)' }}>{interimTranscript}</span>
              </p>
            </div>
          )}

          {/* AI Response */}
          {isThinking && (
            <div className="card" style={{ width: '100%' }}>
              <div className="typing-indicator" style={{ padding: 12 }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          {aiResponse && (
            <div className="card" style={{ width: '100%', borderLeft: '3px solid var(--orange)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <IconSparkle size={14} style={{ color: 'var(--orange)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>Study AI</span>
                {isSpeaking && (
                  <button className="btn-icon" onClick={stopSpeaking} style={{ marginLeft: 'auto', padding: 4 }}>
                    <IconVolumeOff size={14} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{aiResponse}</p>
            </div>
          )}

          {/* Voice Wave Visualizer */}
          {isListening && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 30 }}>
              {[0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1, 0].map((delay, i) => (
                <div key={i} className="voice-wave-bar" style={{ animationDelay: `${delay}s`, height: 4 }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ===== EXAM MODE ===== */
        <div>
          {questions.length === 0 && !isGenerating ? (
            /* Source Selection */
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <IconSparkle size={32} style={{ color: 'var(--orange)', marginBottom: 12 }} />
              <h3 style={{ marginBottom: 6 }}>สร้างข้อสอบจำลอง</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                เลือกโน้ตที่ต้องการให้ AI สร้างข้อสอบ
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto' }}>
                <select className="input" value={selectedNoteId} onChange={(e) => setSelectedNoteId(e.target.value)}>
                  <option value="">เลือกโน้ต...</option>
                  {notes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                </select>
                <select className="input" value={examType} onChange={(e) => setExamType(e.target.value as typeof examType)}>
                  <option value="mixed">ผสม (ปรนัย + อัตนัย)</option>
                  <option value="multiple-choice">ปรนัยเท่านั้น</option>
                  <option value="essay">อัตนัยเท่านั้น</option>
                </select>
                <button className="btn-primary" onClick={handleGenerateExam} disabled={!selectedNoteId}
                  style={{ borderRadius: 12 }}>
                  <IconSparkle size={16} /> สร้างข้อสอบ
                </button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div className="typing-indicator" style={{ justifyContent: 'center', marginBottom: 16 }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>AI กำลังสร้างข้อสอบ...</p>
            </div>
          ) : isFinished && result ? (
            /* Results */
            <div style={{ textAlign: 'center' }}>
              <div className="card" style={{ padding: 32, marginBottom: 16 }}>
                <h3 style={{ marginBottom: 16 }}>ผลสอบ</h3>
                <div className="score-circle" style={{
                  margin: '0 auto 16px',
                  color: result.score >= 80 ? 'var(--success)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                  ['--score-pct' as string]: `${result.score}%`,
                }}>
                  {result.score}%
                </div>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                  {result.score >= 80 ? 'ยอดเยี่ยม! 🎉' : result.score >= 50 ? 'ผ่านได้! 💪' : 'ต้องทบทวนอีก 📖'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  ตอบถูก {result.correctAnswers} จาก {result.totalQuestions} ข้อ
                </p>
              </div>
              {/* Review */}
              {result.questions.map((q, i) => (
                <div key={q.id} className="card" style={{ marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: q.isCorrect ? 'var(--success-light)' : 'var(--danger-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {q.isCorrect ? <IconCheck size={14} style={{ color: 'var(--success)' }} /> : <IconX size={14} style={{ color: 'var(--danger)' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>ข้อ {i + 1}: {q.question}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>คำตอบของคุณ: {q.userAnswer}</p>
                      <p style={{ fontSize: 12, color: 'var(--success)' }}>เฉลย: {q.correctAnswer}</p>
                      {q.explanation && <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>{q.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn-primary" onClick={resetExam} style={{ marginTop: 16, borderRadius: 12 }}>
                สร้างข้อสอบใหม่
              </button>
            </div>
          ) : currentQuestion ? (
            /* Active Question */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="pill pill-orange">ข้อ {currentIndex + 1}/{questions.length}</span>
                <span style={{ fontSize: 12, color: 'var(--text-hint)' }}>{currentQuestion.type === 'multiple-choice' ? 'ปรนัย' : 'อัตนัย'}</span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 20 }}>
                <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, lineHeight: 1.6 }}>{currentQuestion.question}</h3>
              </div>
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentQuestion.options.map((opt, i) => (
                    <button key={i}
                      className={`exam-option ${selectedAnswer === opt ? 'selected' : ''} ${answered ? (opt === currentQuestion.correctAnswer ? 'correct' : selectedAnswer === opt ? 'incorrect' : '') : ''}`}
                      onClick={() => !answered && setSelectedAnswer(opt)}
                      disabled={answered}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
                      }}>{String.fromCharCode(65 + i)}</div>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea className="input" rows={4} placeholder="พิมพ์คำตอบของคุณ..."
                  value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)}
                  disabled={answered}
                  style={{ resize: 'vertical', borderRadius: 12 }} />
              )}
              {answered && currentQuestion.explanation && (
                <div className="card" style={{ marginTop: 16, borderLeft: '3px solid var(--success)', background: 'var(--success-light)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>อธิบายเฉลย</div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{currentQuestion.explanation}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                {!answered ? (
                  <button className="btn-primary" onClick={handleSubmitAnswer} style={{ flex: 1, borderRadius: 12 }}
                    disabled={currentQuestion.type === 'multiple-choice' ? !selectedAnswer : !essayAnswer.trim()}>
                    ส่งคำตอบ
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleNextQuestion} style={{ flex: 1, borderRadius: 12 }}>
                    {currentIndex < questions.length - 1 ? 'ข้อถัดไป →' : 'ดูผลสอบ 🎯'}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
