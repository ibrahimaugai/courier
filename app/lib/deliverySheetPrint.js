/**
 * Delivery Sheet Report – A4 print via new window (same pattern as shiftcloseprint.js).
 * Builds HTML document, opens in popup, triggers print on load.
 * @param {Array} bookings - List of consignment/booking objects in the delivery sheet
 * @param {object} options - { sheetNumber, riderName, vehicleNo, originStation, sheetDate, copyType?, logoUrl?, citiesMap? }
 * @param {object} [options.citiesMap] - optional id -> { cityName } to resolve origin/destination when API does not include nested city
 */
export function printDeliverySheetReport(bookings = [], options = {}) {
  const list = Array.isArray(bookings) ? bookings : []
  const sheetNumber = options.sheetNumber ?? '—'
  const riderName = options.riderName ?? '—'
  const vehicleNo = options.vehicleNo ?? '—'
  const originStation = options.originStation ?? '—'
  const copyType = options.copyType ?? 'DELIVERY PHASE 1 - ON ROUTE'
  const reportDate = options.sheetDate ? new Date(options.sheetDate) : new Date()
  const dateStr = reportDate.toLocaleDateString()
  const logoUrl = options.logoUrl ?? '/nps-logo.png'
  const citiesMap = options.citiesMap || null

  const totalPcs = list.reduce((s, b) => s + (parseInt(b.pieces, 10) || 0), 0)
  const totalWt = list.reduce((s, b) => {
    const w = b.weight != null
      ? (typeof b.weight === 'object' && b.weight !== null && typeof b.weight.toString === 'function'
        ? parseFloat(b.weight.toString())
        : parseFloat(b.weight))
      : 0
    return s + (Number.isFinite(w) ? w : 0)
  }, 0)
  const isCodBooking = (b) => {
    const p = String(b.paymentMode || b.payMode || b.productId || b.product?.productName || '').toUpperCase()
    return p === 'COD' || p.includes('COD')
  }
  const totalAmt = list.reduce((s, b) => s + (isCodBooking(b) ? (parseFloat(b.codAmount || b.totalAmount) || 0) : 0), 0)

  const cityDisplay = (raw) => {
    if (raw == null || raw === '') return '—'
    const s = String(raw).trim()
    if (/^[0-9a-f-]{36}$/i.test(s)) return '—'
    return s
  }

  const getCityName = (cityObj, idFallback, citiesLookup) => {
    if (cityObj && typeof cityObj === 'object') {
      const name = cityObj.cityName ?? cityObj.city_name ?? cityObj.name
      if (name) return cityDisplay(name)
    }
    const id = idFallback
    if (citiesLookup && id) {
      const c = citiesLookup[id]
      const name = c?.cityName ?? c?.city_name ?? c?.name
      if (name) return cityDisplay(name)
    }
    return cityDisplay(id)
  }

  const row = (b, i) => {
    const originName = getCityName(b.originCity || b.origin_city, b.originCityId || b.origin_city_id, citiesMap)
    const destName = getCityName(b.destinationCity || b.destination_city, b.destinationCityId || b.destination_city_id, citiesMap)
    const status = '' // blank so rider can write delivery status by hand
    const w = b.weight != null
      ? (typeof b.weight === 'object' && b.weight !== null && typeof b.weight.toString === 'function'
        ? parseFloat(b.weight.toString())
        : parseFloat(b.weight))
      : 0
    const isVoided = String(b.status || '').toUpperCase() === 'VOIDED'
    const isCod = isCodBooking(b)
    const amountCell = isCod && (b.codAmount != null || b.totalAmount != null)
      ? `RS. ${Number(b.codAmount ?? b.totalAmount).toLocaleString()}`
      : ''
    return `
    <tr class="${isVoided ? 'ds-voided' : ''}">
      <td class="ds-td ds-td-num">${i + 1}</td>
      <td class="ds-td ds-td-cn">${escapeHtml(b.cnNumber || '—')}</td>
      <td class="ds-td ds-td-center">${escapeHtml(originName)}</td>
      <td class="ds-td ds-td-center">${escapeHtml(destName)}</td>
      <td class="ds-td">
        <div class="ds-party-name">${escapeHtml(b.shipperName || '—')}</div>
        <div class="ds-party-sub">${escapeHtml(b.shipperPhone || '')}</div>
      </td>
      <td class="ds-td">
        <div class="ds-party-name">${escapeHtml(b.consigneeName || '—')}</div>
        <div class="ds-party-sub">${escapeHtml(b.consigneePhone || '')}</div>
      </td>
      <td class="ds-td ds-td-center ds-status ds-blank">${escapeHtml(status)}</td>
      <td class="ds-td ds-td-center">${escapeHtml(b.pieces ?? '—')} / ${Number.isFinite(w) ? w : (b.weight ?? '—')}</td>
      <td class="ds-td ds-td-right">${amountCell}</td>
      <td class="ds-td ds-td-blank"></td>
      <td class="ds-td ds-td-blank"></td>
      <td class="ds-td ds-td-blank"></td>
    </tr>`
  }

  const metaBlock = `
    <p>SHEET: <span class="ds-meta-val">${escapeHtml(sheetNumber)}</span></p>
    <p>RIDER: <span class="ds-meta-val">${escapeHtml(riderName)}</span></p>
    <p>VEHICLE: <span class="ds-meta-val">${escapeHtml(vehicleNo)}</span></p>
    <p>DATE: ${escapeHtml(dateStr)}</p>`

  const signatureBlock = `
    <div class="ds-signatures">
      <div class="ds-sig-block">
        <div class="ds-sig-line"></div>
        <p class="ds-sig-label">Rider Signature</p>
        <p class="ds-sig-sub">Delivery Personnel</p>
      </div>
      <div class="ds-sig-block">
        <div class="ds-sig-line"></div>
        <p class="ds-sig-label">Authorized Signature</p>
        <p class="ds-sig-sub">Station Manager</p>
      </div>
    </div>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Delivery Sheet - ${escapeHtml(sheetNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; color: #111; font-size: 11px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ds-page { width: 210mm; min-height: 297mm; padding: 12mm; margin: 0 auto; }
    .ds-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
    .ds-header-left { display: flex; align-items: center; gap: 12px; }
    .ds-logo { height: 56px; width: auto; display: block; }
    .ds-title { font-size: 20px; font-weight: 900; text-transform: uppercase; }
    .ds-copy-type { font-size: 10px; font-weight: 700; color: #444; letter-spacing: 0.1em; }
    .ds-header-right { text-align: right; }
    .ds-sheet { font-size: 18px; font-weight: 900; color: #0c4a6e; }
    .ds-meta { font-size: 10px; margin-top: 4px; }
    .ds-meta-val { font-weight: 900; }
    .ds-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 16px; }
    .ds-table th, .ds-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
    .ds-thead { background: #f3f4f6; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .ds-td { font-size: 9px; }
    .ds-td-num { text-align: center; }
    .ds-td-cn { font-weight: 900; color: #0c4a6e; }
    .ds-td-center { text-align: center; }
    .ds-td-right { text-align: right; }
    .ds-party-name { font-weight: 700; font-size: 9px; }
    .ds-party-sub { font-size: 8px; color: #555; }
    .ds-status { font-weight: 700; text-transform: uppercase; font-size: 8px; }
    .ds-blank { min-height: 24px; }
    .ds-td-blank { min-height: 24px; border-bottom: 1px solid #e5e7eb; }
    .ds-voided { background: #fef2f2 !important; }
    .ds-total-row { display: flex; align-items: center; gap: 16px; padding: 10px 8px; background: #f9fafb; border: 1px solid #000; border-top: none; font-weight: 900; font-size: 10px; }
    .ds-total-label { text-transform: uppercase; letter-spacing: 0.05em; flex: 1; }
    .ds-total-pcs { min-width: 100px; text-align: center; }
    .ds-total-amt { min-width: 80px; text-align: right; }
    .ds-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 32px; padding: 0 24px; }
    .ds-sig-block { text-align: center; }
    .ds-sig-line { border-top: 1px solid #000; padding-top: 8px; margin-bottom: 4px; }
    .ds-sig-label { font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .ds-sig-sub { font-size: 8px; color: #555; font-style: italic; margin-top: 2px; }
    .ds-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #6b7280; display: flex; justify-content: space-between; text-transform: uppercase; font-weight: 700; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .ds-page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="ds-page">
    <div class="ds-header">
      <div class="ds-header-left">
        <img src="${escapeHtml(logoUrl)}" alt="NPS Logo" class="ds-logo" />
        <div>
          <h1 class="ds-title">Delivery Sheet Report</h1>
          <p class="ds-copy-type">${escapeHtml(copyType)}</p>
        </div>
      </div>
      <div class="ds-header-right">
        <div class="ds-sheet">SHEET: ${escapeHtml(sheetNumber)}</div>
        <div class="ds-meta">${metaBlock}</div>
      </div>
    </div>

    <table class="ds-table">
      <thead>
        <tr class="ds-thead">
          <th style="width:3%">SR</th>
          <th style="width:10%">CN NUMBER</th>
          <th style="width:7%">ORIGIN</th>
          <th style="width:7%">DEST</th>
          <th style="width:12%">SHIPPER</th>
          <th style="width:12%">CONSIGNEE</th>
          <th style="width:6%">STATUS</th>
          <th style="width:8%">PCS/WGT</th>
          <th style="width:8%">AMOUNT</th>
          <th style="width:10%">CUSTOMER SIGNATURE</th>
          <th style="width:9%">CUSTOMER PHONE</th>
          <th style="width:8%">CUSTOMER CNIC</th>
        </tr>
      </thead>
      <tbody>
        ${list.map((b, i) => row(b, i)).join('')}
      </tbody>
    </table>
    <div class="ds-total-row">
      <span class="ds-total-label">Delivery Sheet Total</span>
      <span class="ds-total-pcs">${totalPcs} PCS / ${totalWt.toFixed(2)} KG</span>
      <span class="ds-total-amt">RS. ${totalAmt.toLocaleString()}</span>
    </div>
    ${signatureBlock}
    <div class="ds-footer">
      <span>Printed on: ${new Date().toLocaleString()}</span>
      <span>Helpline: 0335-2721975 | Delivery Sheet - NPS Courier</span>
    </div>
  </div>
  <script>
    (function() {
      function doPrint() { window.print(); }
      if (document.readyState === 'complete') doPrint();
      else window.addEventListener('load', doPrint);
    })();
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    console.warn('Popup blocked: allow popups to print delivery sheet report.')
    return false
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
}

/**
 * Delivery Sheet Phase 2 Report – printed after delivery with status and receiver details.
 * @param {object} sheetData - { sheetNumber, riderName, riderMobile, vehicleNo, sheetDate, bookings, deliverySheetShipments }
 * @param {object} options - { logoUrl? }
 */
export function printDeliverySheetPhase2Report(sheetData, options = {}) {
  const logoUrl = options.logoUrl ?? '/nps-logo.png'
  const bookings = Array.isArray(sheetData?.bookings) ? sheetData.bookings : []
  const shipments = Array.isArray(sheetData?.deliverySheetShipments) ? sheetData.deliverySheetShipments : []
  const getShipment = (bookingId) => shipments.find(s => s.bookingId === bookingId)

  const sheetNumber = sheetData?.sheetNumber ?? '—'
  const riderName = sheetData?.rider?.name ?? sheetData?.riderName ?? '—'
  const vehicleNo = sheetData?.vehicle?.vehicleNumber ?? sheetData?.vehicleNo ?? '—'
  const reportDate = sheetData?.sheetDate ? new Date(sheetData.sheetDate) : new Date()
  const dateStr = reportDate.toLocaleDateString()

  const totalPcs = bookings.reduce((s, b) => s + (parseInt(b.pieces, 10) || 0), 0)
  const totalWt = bookings.reduce((s, b) => {
    const w = b.weight != null ? (typeof b.weight === 'object' ? parseFloat(b.weight.toString()) : parseFloat(b.weight)) : 0
    return s + (Number.isFinite(w) ? w : 0)
  }, 0)
  const isCod = (b) => String(b.paymentMode || b.payMode || b.productId || b.product?.productName || '').toUpperCase().includes('COD')
  const totalAmt = bookings.reduce((s, b) => s + (isCod(b) ? (parseFloat(b.codAmount || b.totalAmount) || 0) : 0), 0)

  const row = (b, i) => {
    const ship = getShipment(b.id)
    const status = ship?.deliveryStatusText ?? ship?.deliveryStatus ?? 'PENDING'
    const receiverName = ship?.receiverName ?? ''
    const receiverCnic = ship?.receiverCnic ?? ''
    const receiverPhone = ship?.receiverPhone ?? ''
    const w = b.weight != null ? (typeof b.weight === 'object' ? parseFloat(b.weight.toString()) : parseFloat(b.weight)) : 0
    const codAmt = isCod(b) && (b.codAmount != null || b.totalAmount != null) ? `RS. ${Number(b.codAmount ?? b.totalAmount).toLocaleString()}` : ''
    return `
    <tr>
      <td class="ds-td ds-td-num">${i + 1}</td>
      <td class="ds-td ds-td-cn">${escapeHtml(b.cnNumber || '—')}</td>
      <td class="ds-td">${escapeHtml(b.consigneeName || '—')}</td>
      <td class="ds-td">${escapeHtml(b.consigneePhone || '')}</td>
      <td class="ds-td ds-td-addr">${escapeHtml((b.consigneeAddress || '').substring(0, 40))}${(b.consigneeAddress || '').length > 40 ? '…' : ''}</td>
      <td class="ds-td ds-td-center">${Number.isFinite(w) ? w : (b.weight ?? '—')} KG</td>
      <td class="ds-td ds-td-right">${codAmt}</td>
      <td class="ds-td ds-td-center ds-status">${escapeHtml(status)}</td>
      <td class="ds-td">${escapeHtml(receiverName)}</td>
      <td class="ds-td">${escapeHtml(receiverCnic)}</td>
      <td class="ds-td">${escapeHtml(receiverPhone)}</td>
    </tr>`
  }

  const metaBlock = `
    <p>SHEET: <span class="ds-meta-val">${escapeHtml(sheetNumber)}</span></p>
    <p>RIDER: <span class="ds-meta-val">${escapeHtml(riderName)}</span></p>
    <p>VEHICLE: <span class="ds-meta-val">${escapeHtml(vehicleNo)}</span></p>
    <p>DATE: ${escapeHtml(dateStr)}</p>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Delivery Sheet Phase 2 - ${escapeHtml(sheetNumber)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; color: #111; font-size: 11px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ds-page { width: 210mm; min-height: 297mm; padding: 12mm; margin: 0 auto; }
    .ds-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
    .ds-header-left { display: flex; align-items: center; gap: 12px; }
    .ds-logo { height: 56px; width: auto; display: block; }
    .ds-title { font-size: 18px; font-weight: 900; text-transform: uppercase; }
    .ds-copy-type { font-size: 10px; font-weight: 700; color: #444; }
    .ds-header-right { text-align: right; }
    .ds-meta { font-size: 10px; margin-top: 4px; }
    .ds-meta-val { font-weight: 900; }
    .ds-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 16px; font-size: 9px; }
    .ds-table th, .ds-table td { border: 1px solid #000; padding: 5px 6px; vertical-align: top; }
    .ds-thead { background: #f3f4f6; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .ds-td-num { text-align: center; }
    .ds-td-cn { font-weight: 900; color: #0c4a6e; }
    .ds-td-center { text-align: center; }
    .ds-td-right { text-align: right; }
    .ds-td-addr { max-width: 120px; }
    .ds-status { font-weight: 700; text-transform: uppercase; }
    .ds-total-row { display: flex; align-items: center; gap: 16px; padding: 10px 8px; background: #f9fafb; border: 1px solid #000; border-top: none; font-weight: 900; font-size: 10px; }
    .ds-total-label { text-transform: uppercase; letter-spacing: 0.05em; flex: 1; }
    .ds-total-pcs { min-width: 100px; text-align: center; }
    .ds-total-amt { min-width: 80px; text-align: right; }
    .ds-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #6b7280; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="ds-page">
    <div class="ds-header">
      <div class="ds-header-left">
        <img src="${escapeHtml(logoUrl)}" alt="Logo" class="ds-logo" />
        <div>
          <h1 class="ds-title">Delivery Sheet Report – Phase 2</h1>
          <p class="ds-copy-type">Delivery completed / proof of delivery</p>
        </div>
      </div>
      <div class="ds-header-right">
        <div class="ds-meta">${metaBlock}</div>
      </div>
    </div>
    <table class="ds-table">
      <thead>
        <tr class="ds-thead">
          <th style="width:3%">SR</th>
          <th style="width:10%">CN NUMBER</th>
          <th style="width:12%">CONSIGNEE</th>
          <th style="width:9%">PHONE</th>
          <th style="width:14%">ADDRESS</th>
          <th style="width:6%">WGT</th>
          <th style="width:8%">AMOUNT</th>
          <th style="width:8%">STATUS</th>
          <th style="width:12%">RECEIVER NAME</th>
          <th style="width:10%">RECEIVER CNIC</th>
          <th style="width:8%">RECEIVER PHONE</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map((b, i) => row(b, i)).join('')}
      </tbody>
    </table>
    <div class="ds-total-row">
      <span class="ds-total-label">Total</span>
      <span class="ds-total-pcs">${totalPcs} PCS / ${totalWt.toFixed(2)} KG</span>
      <span class="ds-total-amt">RS. ${totalAmt.toLocaleString()}</span>
    </div>
    <div class="ds-footer">
      <span>Printed on: ${new Date().toLocaleString()}</span>
      <span>Helpline: 0335-2721975 | Delivery Sheet Phase 2 - NPS Courier</span>
    </div>
  </div>
  <script>
    (function() {
      function doPrint() { window.print(); }
      if (document.readyState === 'complete') doPrint();
      else window.addEventListener('load', doPrint);
    })();
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    console.warn('Popup blocked: allow popups to print delivery sheet Phase 2 report.')
    return false
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
}

function escapeHtml(str) {
  if (str == null) return ''
  const s = String(str)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
