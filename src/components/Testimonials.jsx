import { translations } from '../i18n/translations'
import testimonials from '../data/testimonials'

function Testimonials({ lang }) {
  const T = translations[lang]

  return (
    <section className="testimonials-section">
      <div className="section-header">
        <span className="section-tag">{T.testimonials_tag}</span>
        <h2 className="section-title">
          {T.testimonials_title_pre}<em>{T.testimonials_title_em}</em>{T.testimonials_title_post}
        </h2>
        <div className="divider" />
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">"{t[lang].text}"</p>
            <div className="testimonial-author">
              <span className="testimonial-name">{t[lang].name}</span>
              <span className="testimonial-occasion">{t[lang].occasion}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
