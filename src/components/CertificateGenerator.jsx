import { useRef, useState } from 'react'

function formatDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function CertificateGenerator() {
  const [name, setName] = useState('')
  const [date, setDate] = useState(today())
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef()

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const safeName = name.trim() || 'Certificate'
      await html2pdf().set({
        margin: 0,
        filename: `Certificate_${safeName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'png' },
        html2canvas: { scale: 4, useCORS: true, logging: false, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }).from(certRef.current).save()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="cert-generator">
      <div className="cert-controls">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="c-naam">Recipient name</label>
            <input
              id="c-naam"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatima Hassan"
            />
          </div>
          <div className="form-group">
            <label htmlFor="c-datum">Date</label>
            <input
              id="c-datum"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <button type="button" className="btn-form" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Bezig met genereren...' : 'Download PDF'}
        </button>
      </div>

      <p className="cert-mobile-notice">📱 Best viewed on a desktop or laptop — scroll right to see the full certificate.</p>

      <div className="cert-scroll-wrap">
        <div id="certificaat" ref={certRef}>
          <div className="cert-border-outer"></div>
          <div className="cert-border-inner"></div>

          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <svg key={corner} className={`cert-flourish ${corner}`} viewBox="-10 -10 120 120" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12,12 C45,4 70,4 88,16 C96,20 94,30 86,30 C80,30 78,24 84,22" />
                <path d="M12,12 C4,45 4,70 16,88 C20,96 30,94 30,86 C30,80 24,78 22,84" />
              </g>
              <g fill="#C9A84C">
                <circle cx="86" cy="30" r="1.8" />
                <circle cx="30" cy="86" r="1.8" />
                <path d="M12,12 l4,4 l-4,4 l-4,-4 z" />
              </g>
            </svg>
          ))}

          <div className="cert-content">
            <img src="/certificate/logo-gold.png" alt="Selam Bakery" className="cert-logo" />

            <div className="cert-top-rule"></div>

            <h1 className="cert-title">Certificate of Appreciation</h1>

            <div className="cert-name-label">Presented to</div>
            <div className="cert-name">{name.trim() || '—'}</div>

            <div className="cert-mid-rule"></div>

            <p className="cert-body-text">
              In recognition of dedication, creativity, and passion<br />
              shown in cake making and decoration.
            </p>
            <p className="cert-wish-text">Wishing continued growth, success, and joy in every creation ahead.</p>

            <div className="cert-footer">
              <div className="cert-field">
                <span className="cert-field-label">Date:</span>
                <span className="cert-field-value">{formatDate(date)}</span>
              </div>
              <div className="cert-field">
                <span className="cert-field-label">Signature:</span>
                <img src="/certificate/signature.png" alt="" className="cert-signature-img" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateGenerator
