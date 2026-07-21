import { useEffect, useState } from 'react'
import { scrambleFrame } from '../lib/textScramble'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSound } from '../context/SoundContext'
import { useContent } from '../context/ContentContext'

const SCRAMBLE_FRAMES = 14
const FRAME_INTERVAL_MS = 30

function FaqItem({ id, question, answer, isOpen, onToggle }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [displayedAnswer, setDisplayedAnswer] = useState(answer)

  useEffect(() => {
    if (!isOpen) return

    if (prefersReducedMotion) {
      setDisplayedAnswer(answer)
      return
    }

    let frame = 0
    setDisplayedAnswer(scrambleFrame(answer, 0))

    const intervalId = window.setInterval(() => {
      frame += 1
      if (frame >= SCRAMBLE_FRAMES) {
        setDisplayedAnswer(answer)
        window.clearInterval(intervalId)
        return
      }
      const revealCount = Math.round((frame / SCRAMBLE_FRAMES) * answer.length)
      setDisplayedAnswer(scrambleFrame(answer, revealCount))
    }, FRAME_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [isOpen, answer, prefersReducedMotion])

  const questionId = `faq-question-${id}`
  const answerId = `faq-answer-${id}`

  return (
    <li className="border-b border-white/10 py-3 first:pt-0 last:border-b-0">
      <button
        type="button"
        id={questionId}
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
        data-testid={`faq-toggle-${id}`}
        className="flex w-full items-start gap-2 text-left font-subhead text-sm text-walla-mist hover:text-laser-teal sm:text-base"
      >
        <span aria-hidden="true" className="text-laser-teal">
          {isOpen ? '>' : '$'}
        </span>
        {question}
      </button>

      {isOpen && (
        <p
          id={answerId}
          role="region"
          aria-labelledby={questionId}
          data-testid={`faq-answer-${id}`}
          className="mt-2 pl-5 font-body text-sm text-walla-mist/80"
        >
          {displayedAnswer}
        </p>
      )}
    </li>
  )
}

export function FaqSection() {
  const faqSection = useContent('faqSection')
  const [openId, setOpenId] = useState(null)
  const { playOpen, playClose } = useSound()

  return (
    <section id="faq" aria-label="Frequently asked questions" className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-subhead text-xs uppercase tracking-[0.3em] text-laser-teal">
        {faqSection.eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-gradient-shift text-3xl font-extrabold uppercase tracking-wide sm:text-5xl">
        {faqSection.title}
      </h2>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-electric-wheat/70" />
          <span className="h-3 w-3 rounded-full bg-laser-teal/70" />
          <span className="h-3 w-3 rounded-full bg-cyber-blue/70" />
          <span className="ml-3 font-subhead text-xs text-walla-mist/50">whitmhack@faq:~</span>
        </div>

        <ul className="px-4 py-2">
          {faqSection.questions.map((item) => (
            <FaqItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              isOpen={openId === item.id}
              onToggle={() => {
                if (openId === item.id) playClose()
                else playOpen()
                setOpenId((current) => (current === item.id ? null : item.id))
              }}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
