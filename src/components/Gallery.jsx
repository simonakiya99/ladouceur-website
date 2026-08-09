import { useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

function Gallery({ lang, cakes = [] }) {
  const [active, setActive] = useState('alle')
  const [hoveredId, setHoveredId] = useState(null)
  const T = translations[lang]

  useEffect(() => {
    const reset = () => setHoveredId(null)
    document.addEventListener('touchstart', reset, { passive: true })
    return () => document.removeEventListener('touchstart', reset)
  }, [])

  const handleCardTouch = (e, cakeId) => {
    e.stopPropagation()
    setHoveredId(cakeId)
  }

  const filters = [
    { key: 'alle', label: T.filter_all },
    { key: 'bruiloft', label: T.filter_wedding },
    { key: 'verjaardag', label: T.filter_birthday },
    { key: 'speciaal', label: T.filter_special },
  ]

  const filtered = active === 'alle' ? cakes : cakes.filter(c => c.category === active)

  const getCategoryTag = (category) => {
    if (category === 'bruiloft') return T.tag_wedding
    if (category === 'verjaardag') return T.tag_birthday
    return T.tag_special
  }

  const orderCake = (cake) => {
    const select = document.querySelector('.order-select')
    const textarea = document.querySelector('.order-textarea')
    if (select) {
      if (cake.category === 'bruiloft') select.value = T.option_wedding
      else if (cake.category === 'verjaardag') select.value = T.option_birthday
      else select.value = T.option_special
    }
    if (textarea) textarea.value = cake.title[lang]
    document.getElementById('bestelling')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="gallery-section" id="galerij">
      <div className="section-header">
        {T.gallery_tag && <span className="section-tag">{T.gallery_tag}</span>}
        <h2 className="section-title">{T.gallery_title_pre}<em>{T.gallery_title_em}</em></h2>
        <div className="divider"></div>
      </div>

      <div className="filter-buttons">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-btn ${active === f.key ? 'active' : ''}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map(cake => (
          <div
            key={cake.id}
            className="gallery-card"
            onMouseEnter={() => setHoveredId(cake.id)}
            onMouseLeave={() => setHoveredId(null)}
            onTouchStart={(e) => handleCardTouch(e, cake.id)}
          >
            <div className="gallery-img-wrap">
              <img
                src={cake.img}
                alt={cake.title[lang]}
                loading="lazy"
                style={{
                  transform: hoveredId === cake.id ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.6s ease'
                }}
              />
              <div className="gallery-overlay" style={{
                opacity: hoveredId === cake.id ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }}>
                <button
                  className="btn-order-cake"
                  onClick={() => orderCake(cake)}
                  style={{
                    transform: hoveredId === cake.id ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.4s ease'
                  }}
                >
                  {T.btn_order_cake}
                </button>
              </div>
            </div>
            <div className="gallery-card-body">
              <span className="cake-card-tag">{getCategoryTag(cake.category)}</span>
              <h3 className="gallery-card-title">{cake.title[lang]}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Gallery
