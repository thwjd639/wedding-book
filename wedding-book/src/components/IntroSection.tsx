import { weddingInfo } from '../data/weddingInfo'

export default function IntroSection() {
  return (
    <section id="intro">
      <h2>그레타가 이어준 인연</h2>
      <div className="intro-image-wrap">
        <img src={weddingInfo.introImageUrl} alt="그레타가 이어준 인연" />
      </div>
    </section>
  )
}
