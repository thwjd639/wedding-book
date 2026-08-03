import { useState } from 'react'
import type { PersonIntro } from '../data/introInfo'
import { groomIntro, brideIntro } from '../data/introInfo'

function PersonCard({ person }: { person: PersonIntro }) {
  const [photoFailed, setPhotoFailed] = useState(false)

  return (
    <div className="intro-card">
      <div className="intro-photo">
        {!photoFailed ? (
          <img
            src={person.photo}
            alt={`${person.role} ${person.name}`}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="intro-photo-fallback">{person.name[0]}</div>
        )}
      </div>

      <p className="intro-role">{person.role}</p>
      <p className="intro-name">{person.name}</p>

      <div className="intro-meta">
        <p>{person.mbti}</p>
        <p>취미: {person.hobby}</p>
        <p>특기: {person.specialty}</p>
      </div>

      <p className="intro-icon" aria-hidden="true">{person.icon}</p>

      <div className="intro-message">
        <p>{person.leadLine}</p>
        <p><strong>{person.tagline}</strong>{person.taglineSuffix}</p>
        {person.closingLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}

export default function IntroSection() {
  return (
    <section id="intro">
      <h2>신랑 신부 소개</h2>
      <div className="intro-grid">
        <PersonCard person={groomIntro} />
        <PersonCard person={brideIntro} />
      </div>
    </section>
  )
}
