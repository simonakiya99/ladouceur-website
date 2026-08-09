import { useRef, useState } from 'react'
import { translations } from '../i18n/translations'

function Order({ lang }) {
  const formRef = useRef()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const T = translations[lang]

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(formRef.current)).toString(),
    })
      .then(() => {
        setStatus('success')
        setLoading(false)
        formRef.current.reset()
      })
      .catch(() => {
        setStatus('error')
        setLoading(false)
      })
  }

  return (
    <section className="order-section" id="bestelling">
      <div className="order-layout">
        <div className="order-info">
          <h2>{T.order_title_pre}<em>{T.order_title_em}</em></h2>
          <p>{T.order_intro}</p>
          <ul className="order-steps">
            <li>
              <div className="step-num">1</div>
              <div className="step-text">{T.step1}</div>
            </li>
            <li>
              <div className="step-num">2</div>
              <div className="step-text">{T.step2}</div>
            </li>
            <li>
              <div className="step-num">3</div>
              <div className="step-text">{T.step3}</div>
            </li>
            <li>
              <div className="step-num">4</div>
              <div className="step-text">{T.step4}</div>
            </li>
          </ul>
        </div>

        <div className="order-form">
          <div className="form-title">{T.form_title}</div>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            name="bestelling"
            data-netlify="true"
            netlify-honeypot="bot-field"
          >
            <input type="hidden" name="form-name" value="bestelling" />
            <p style={{ display: 'none' }}>
              <label>
                Laat dit veld leeg: <input name="bot-field" />
              </label>
            </p>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="f-voornaam">{T.label_firstname}</label>
                <input id="f-voornaam" type="text" name="voornaam" placeholder={T.ph_firstname} required />
              </div>
              <div className="form-group">
                <label htmlFor="f-achternaam">{T.label_lastname}</label>
                <input id="f-achternaam" type="text" name="achternaam" placeholder={T.ph_lastname} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="f-email">{T.label_email}</label>
              <input id="f-email" type="email" name="email" placeholder={T.ph_email} required />
            </div>
            <div className="form-group">
              <label htmlFor="f-telefoon">{T.label_phone}</label>
              <input id="f-telefoon" type="tel" name="telefoon" placeholder={T.ph_phone} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="f-type">{T.label_type}</label>
                <select id="f-type" name="soort_taart" className="order-select" required>
                  <option value="">{T.label_type}</option>
                  <option value={T.option_wedding}>{T.option_wedding}</option>
                  <option value={T.option_birthday}>{T.option_birthday}</option>
                  <option value={T.option_special}>{T.option_special}</option>
                  <option value={T.option_other}>{T.option_other}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="f-datum">{T.label_date}</label>
                <input
                  id="f-datum"
                  type="date"
                  name="datum"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="f-wensen">{T.label_wishes}</label>
              <textarea
                id="f-wensen"
                name="wensen"
                className="order-textarea"
                placeholder={T.ph_wishes}
                required
              ></textarea>
            </div>

            {status === 'success' && <div className="form-success">{T.success_msg}</div>}
            {status === 'error' && <div className="form-error">{T.error_msg}</div>}

            <button type="submit" className="btn-form" disabled={loading}>
              {loading ? T.btn_sending : T.btn_submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Order
