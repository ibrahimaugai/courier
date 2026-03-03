/**
 * Pickup Sheet – A4 print via new window (same pattern as bookingSlipPrint.js).
 * Shows shipper, consignee, pieces, weight, service, etc. plus Customer / Pick-up Staff signature table.
 * @param {object} pickup - Pickup request with pickup.booking
 * @param {object} [bookingDetail] - Full booking from api.trackBooking (optional, merged with pickup.booking)
 * @param {object} [options] - { logoUrl, helpline }
 */
export function printPickupSheet(pickup, bookingDetail = null, options = {}) {
  if (!pickup) return false
  const html = buildPickupSheetDocument(pickup, bookingDetail, options)
  if (!html) return false
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
}

/**
 * Print a batch of pickups in one document – all bookings with full details, each on its own page.
 * @param {string} batchLabel - e.g. batch code "ibrahim-20260219-4"
 * @param {object[]} pickups - Array of pickup requests (each with .booking)
 * @param {object} [bookingDetailsByCnOrId] - Optional map of cnNumber or bookingId -> full booking from api.trackBooking
 * @param {object} [options] - { logoUrl, helpline }
 */
export function printPickupBatchSheet(batchLabel, pickups, bookingDetailsByCnOrId = {}, options = {}) {
  if (!pickups?.length) return false
  const html = buildBatchPickupSheetDocument(batchLabel, pickups, bookingDetailsByCnOrId, options)
  if (!html) return false
  const win = window.open('', '_blank')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
}

function buildPickupSheetDocument(pickup, bookingDetail, options) {
  const b = getMergedBooking(pickup, bookingDetail)
  const barcodes = [{ cn: b.cnNumber || b.cn || '' }]
  const sheetsHtml = buildOnePickupSheetHtml(pickup, bookingDetail, options, 0)
  return wrapPickupPrintDocument(sheetsHtml, barcodes, b.cnNumber || b.cn || 'Pickup')
}

function getMergedBooking(pickup, bookingDetail) {
  return { ...(pickup?.booking || {}), ...(bookingDetail || {}) }
}

function buildBatchPickupSheetDocument(batchLabel, pickups, bookingDetailsByCnOrId, options) {
  const logoUrl = options.logoUrl ?? '/nps-logo.png'
  const helpline = options.helpline ?? '0335-2721975'
  const brandName = 'NPS Courier and Logistics'
  const logoFallbackSvg = `<span class="logo-svg-wrap" aria-hidden="true"><svg class="logo-svg" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h32v20H4V8z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 14h32M12 8v20M28 8v20" stroke="currentColor" stroke-width="1.5"/></svg></span>`
  const logoBlockContent = `<div class="logo-block-inner"><img class="logo-img" src="${escapeHtml(logoUrl)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="logo-fallback">${logoFallbackSvg}<span class="logo-text">${escapeHtml(brandName)}</span></span></div>`

  const bookingRows = pickups.map((p) => {
    const b = getMergedBooking(p, bookingDetailsByCnOrId[p.booking?.cnNumber] || bookingDetailsByCnOrId[p.bookingId] || bookingDetailsByCnOrId[p.booking?.id])
    const cn = b.cnNumber || b.cn || '—'
    const shipperName = b.shipperName || b.customer?.name || '—'
    const shipperPhone = b.shipperPhone || b.customer?.phone || '—'
    const shipperAddr = (p.pickupAddress || b.shipperAddress || b.customer?.address || '—').toString()
    const consigneeName = b.consigneeName || '—'
    const consigneePhone = b.consigneePhone || '—'
    const consigneeAddr = (b.consigneeAddress || '—').toString()
    const origin = b.originCity?.cityName || b.originCity?.name || '—'
    const dest = b.destinationCity?.cityName || b.destinationCity?.name || '—'
    const weightStr = formatWeight(b)
    const pieces = b.pieces != null ? b.pieces : '—'
    const pickupDateStr = p.pickupDate ? new Date(p.pickupDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
    const pickupTimeStr = p.pickupTime || '—'
    const amountStr = b.totalAmount != null ? `Rs. ${formatDecimal(b.totalAmount)}` : '—'
    const content = (b.packetContent || '—').toString()
    return `<tr>
      <td class="ps-td ps-td-cn">${escapeHtml(cn)}</td>
      <td class="ps-td">
        <div class="ps-party-name">${escapeHtml(shipperName)}</div>
        <div class="ps-party-sub">${escapeHtml(shipperPhone)}</div>
        <div class="ps-party-sub">${escapeHtml(shipperAddr)}</div>
      </td>
      <td class="ps-td">
        <div class="ps-party-name">${escapeHtml(consigneeName)}</div>
        <div class="ps-party-sub">${escapeHtml(consigneePhone)}</div>
        <div class="ps-party-sub">${escapeHtml(consigneeAddr)}</div>
      </td>
      <td class="ps-td ps-td-center">${escapeHtml(origin)}</td>
      <td class="ps-td ps-td-center">${escapeHtml(dest)}</td>
      <td class="ps-td ps-td-center">${escapeHtml(weightStr)}</td>
      <td class="ps-td ps-td-center">${escapeHtml(String(pieces))}</td>
      <td class="ps-td ps-td-center">${escapeHtml(pickupDateStr)}</td>
      <td class="ps-td ps-td-center">${escapeHtml(pickupTimeStr)}</td>
      <td class="ps-td ps-td-right">${escapeHtml(amountStr)}</td>
      <td class="ps-td">${escapeHtml(content)}</td>
    </tr>`
  }).join('')

  const signatureTable = `
    <p class="ps-policy">Booked weight may vary with invoice/billing weight as our manifested weight will be treated as final weight.</p>
    <table class="ps-sig-table">
      <thead>
        <tr>
          <th class="ps-sig-th">Customer</th>
          <th class="ps-sig-th">NPS PICK-UP STAFF</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ps-sig-td">
            <table class="ps-sig-inner">
              <tr><td class="ps-sig-label">Name</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Sign and Stamp</td><td class="ps-sig-cell"></td></tr>
            </table>
          </td>
          <td class="ps-sig-td">
            <table class="ps-sig-inner">
              <tr><td class="ps-sig-label">Name</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Courier</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Signature</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Date & Time</td><td class="ps-sig-cell"></td></tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`

  const summaryPage = `
  <div class="ps-page ps-page-summary">
    <div class="ps-sheet">
      <div class="ps-top">
        <div class="ps-top-row">
          <div class="ps-logo-row">${logoBlockContent}</div>
          <div class="ps-title">PICKUP SHEET – ${escapeHtml(batchLabel)}</div>
        </div>
      </div>
      <p class="ps-summary-p">Total: <strong>${pickups.length}</strong> booking(s).</p>
      <div class="ps-table-wrap">
        <table class="ps-table">
          <thead>
            <tr class="ps-thead">
              <th class="ps-th">CN</th>
              <th class="ps-th">Shipper</th>
              <th class="ps-th">Consignee</th>
              <th class="ps-th">Origin</th>
              <th class="ps-th">Dest</th>
              <th class="ps-th">Weight</th>
              <th class="ps-th">Pcs</th>
              <th class="ps-th">Pickup Date</th>
              <th class="ps-th">Time</th>
              <th class="ps-th">Amount</th>
              <th class="ps-th">Content</th>
            </tr>
          </thead>
          <tbody>${bookingRows}</tbody>
        </table>
      </div>
      ${signatureTable}
      <div class="ps-footer">
        <div>Helpline: ${escapeHtml(helpline)}</div>
        <div>Printed: ${new Date().toLocaleString()}</div>
      </div>
    </div>
  </div>`

  const barcodes = pickups.map((p) => {
    const b = getMergedBooking(p, bookingDetailsByCnOrId[p.booking?.cnNumber] || bookingDetailsByCnOrId[p.bookingId] || bookingDetailsByCnOrId[p.booking?.id])
    return { cn: b.cnNumber || b.cn || '' }
  })
  return wrapBatchPickupPrintDocument(summaryPage, barcodes, batchLabel)
}

function buildOnePickupSheetHtml(pickup, bookingDetail, options, barcodeIndex) {
  const b = getMergedBooking(pickup, bookingDetail)
  const logoUrl = options.logoUrl ?? '/nps-logo.png'
  const helpline = options.helpline ?? '0335-2721975'
  const riderName = pickup.riderName || pickup.assignedRider?.name || '—'
  const riderPhone = pickup.riderPhone || pickup.assignedRider?.phone || '—'

  const cn = b.cnNumber || b.cn || ''
  const cnDisplay = cn || '—'
  const shipperName = b.shipperName || b.fullName || b.customer?.name || '—'
  const shipperPhone = b.shipperPhone || b.mobileNumber || b.customer?.phone || '—'
  const shipperAddress = pickup.pickupAddress || b.shipperAddress || b.address || b.customer?.address || '—'
  const consigneeName = b.consigneeName || b.consigneeFullName || '—'
  const consigneePhone = b.consigneePhone || b.consigneeMobileNumber || '—'
  const consigneeAddress = b.consigneeAddress || '—'
  const origin = b.originCity?.cityName || b.originCity?.name || b.originCityId || '—'
  const destination = b.destinationCity?.cityName || b.destinationCity?.name || b.destinationCityId || '—'
  const product = b.product?.productName || b.product?.name || b.productId || '—'
  const service = b.service?.serviceName || b.service?.name || b.serviceId || '—'
  const pieces = b.pieces != null ? b.pieces : '—'
  const weightStr = formatWeight(b)
  const content = b.packetContent || '—'
  const total = b.totalAmount != null ? formatDecimal(b.totalAmount) : '—'
  const amountStr = total !== '—' ? `Rs. ${total}` : '—'
  const payMode = b.paymentMode || b.payMode || '—'
  const bookingDt = b.bookingDate ? new Date(b.bookingDate) : (b.createdAt ? new Date(b.createdAt) : new Date())
  const dateStr = bookingDt.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: '2-digit' })
  const timeStr = bookingDt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })

  const pickupDateStr = pickup.pickupDate ? new Date(pickup.pickupDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const pickupTimeStr = pickup.pickupTime || 'Flexible / Anytime'

  const brandName = 'NPS Courier and Logistics'
  const logoFallbackSvg = `<span class="logo-svg-wrap" aria-hidden="true"><svg class="logo-svg" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h32v20H4V8z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 14h32M12 8v20M28 8v20" stroke="currentColor" stroke-width="1.5"/></svg></span>`
  const logoBlockContent = `<div class="logo-block-inner"><img class="logo-img" src="${escapeHtml(logoUrl)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="logo-fallback">${logoFallbackSvg}<span class="logo-text">${escapeHtml(brandName)}</span></span></div>`

  const signatureTable = `
    <p class="ps-policy">Booked weight may vary with invoice/billing weight as our manifested weight will be treated as final weight.</p>
    <table class="ps-sig-table">
      <thead>
        <tr>
          <th class="ps-sig-th">Customer</th>
          <th class="ps-sig-th">NPS PICK-UP STAFF</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="ps-sig-td">
            <table class="ps-sig-inner">
              <tr><td class="ps-sig-label">Name</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Sign and Stamp</td><td class="ps-sig-cell"></td></tr>
            </table>
          </td>
          <td class="ps-sig-td">
            <table class="ps-sig-inner">
              <tr><td class="ps-sig-label">Name</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Courier</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Signature</td><td class="ps-sig-cell"></td></tr>
              <tr><td class="ps-sig-label">Date & Time</td><td class="ps-sig-cell"></td></tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`

  return `<div class="ps-page">
    <div class="ps-sheet">
      <div class="ps-top">
        <div class="ps-top-row">
          <div class="ps-logo-row">${logoBlockContent}</div>
          <div class="ps-title">Pickup Sheet</div>
          <div class="ps-barcode-wrap"><svg class="ps-cn-barcode" data-barcode-cn="${escapeHtml(cn)}"></svg></div>
        </div>
      </div>
      <div class="ps-two-cols">
        <div class="ps-col-left">
          <div class="ps-row-item"><span class="ps-row-label">CN:</span> ${escapeHtml(cnDisplay)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Product:</span> ${escapeHtml(product)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Service:</span> ${escapeHtml(service)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Origin:</span> ${escapeHtml(origin)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Destination:</span> ${escapeHtml(destination)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Weight:</span> ${escapeHtml(weightStr)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Pieces:</span> ${escapeHtml(pieces)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Pickup Date:</span> ${escapeHtml(pickupDateStr)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Pickup Time:</span> ${escapeHtml(pickupTimeStr)}</div>
        </div>
        <div class="ps-col-right">
          <div class="ps-row-item"><span class="ps-row-label">Amount:</span> ${escapeHtml(amountStr)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Payment:</span> ${escapeHtml(String(payMode).toLowerCase())}</div>
          <div class="ps-row-item"><span class="ps-row-label">Date:</span> ${escapeHtml(dateStr)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Time:</span> ${escapeHtml(timeStr)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Rider:</span> ${escapeHtml(riderName)}</div>
          <div class="ps-row-item"><span class="ps-row-label">Rider Phone:</span> ${escapeHtml(riderPhone)}</div>
        </div>
      </div>
      <div class="ps-packet">
        <div class="ps-packet-title">PACKET CONTENT:</div>
        <div class="ps-packet-value">${escapeHtml(content)}</div>
      </div>
      <div class="ps-party">
        <div class="ps-party-block">
          <div class="ps-party-title">SHIPPER:</div>
          <div class="ps-party-line">${escapeHtml(shipperName)}</div>
          <div class="ps-party-line">${escapeHtml(shipperPhone)}</div>
          <div class="ps-party-line">${escapeHtml(shipperAddress)}</div>
        </div>
        <div class="ps-party-block">
          <div class="ps-party-title">CONSIGNEE:</div>
          <div class="ps-party-line">${escapeHtml(consigneeName)}</div>
          <div class="ps-party-line">${escapeHtml(consigneePhone)}</div>
          <div class="ps-party-line">${escapeHtml(consigneeAddress)}</div>
        </div>
      </div>
      ${signatureTable}
      <div class="ps-footer">
        <div>Helpline: ${escapeHtml(helpline)}</div>
        <div>Printed: ${new Date().toLocaleString()}</div>
      </div>
    </div>
  </div>`
}

function wrapPickupPrintDocument(sheetsHtml, barcodes, titleSuffix) {
  const barcodeScript = barcodes.length
    ? `(function(){ var els = document.querySelectorAll('[data-barcode-cn]'); els.forEach(function(el){ var cn = el.getAttribute('data-barcode-cn'); if (cn && typeof JsBarcode !== 'undefined') try { JsBarcode(el, cn, { format: 'CODE128', width: 2, height: 50 }); } catch(e){} }); })();`
    : ''
  return wrapPickupPrintDocumentWithScript(sheetsHtml, barcodeScript, titleSuffix)
}

function wrapBatchPickupPrintDocument(sheetsHtml, barcodes, batchLabel) {
  const barcodeScript = `(function(){ var els = document.querySelectorAll('[data-barcode-cn]'); els.forEach(function(el){ var cn = el.getAttribute('data-barcode-cn'); if (cn && typeof JsBarcode !== 'undefined') try { JsBarcode(el, cn, { format: 'CODE128', width: 2, height: 50 }); } catch(e){} }); })();`
  return wrapPickupPrintDocumentWithScript(sheetsHtml, barcodeScript, `Batch ${batchLabel}`, true)
}

function wrapPickupPrintDocumentWithScript(sheetsHtml, barcodeScript, titleSuffix, isBatch) {
  const title = titleSuffix ? `Pickup Sheet - ${titleSuffix}` : 'Pickup Sheet'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; color: #111; font-size: 11px; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ps-page { width: 210mm; min-height: 297mm; padding: 10mm; margin: 0 auto; page-break-after: always; }
    .ps-page:last-child { page-break-after: auto; }
    .ps-page-summary .ps-summary-p { margin: 12px 0; font-size: 12px; }
    .ps-summary-table { width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #000; }
    .ps-sum-th, .ps-sum-td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
    .ps-sum-th { font-weight: 900; background: #f3f4f6; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
    .ps-table-wrap { overflow-x: auto; margin: 12px 0 16px; }
    .ps-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 16px; }
    .ps-table th, .ps-table td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; }
    .ps-thead { background: #f3f4f6; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .ps-th { }
    .ps-td { font-size: 9px; }
    .ps-td-cn { font-weight: 900; color: #0c4a6e; }
    .ps-td-center { text-align: center; }
    .ps-td-right { text-align: right; }
    .ps-party-name { font-weight: 700; font-size: 9px; }
    .ps-party-sub { font-size: 8px; color: #555; }
    .ps-sheet { border: 1px solid #333; padding: 14px 16px; background: #fff; }
    .ps-top { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #333; }
    .ps-top-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .ps-logo-row { flex-shrink: 0; }
    .logo-block-inner { display: flex; align-items: center; justify-content: flex-start; }
    .logo-img { max-height: 44px; max-width: 160px; display: block; object-fit: contain; }
    .logo-fallback { display: none; align-items: center; gap: 8px; }
    .logo-svg-wrap { display: inline-flex; }
    .logo-svg { width: 36px; height: 32px; color: #111; }
    .logo-text { font-weight: 700; font-size: 14px; color: #111; }
    .ps-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; flex: 1; text-align: center; }
    .ps-barcode-wrap { flex-shrink: 0; min-height: 44px; display: flex; align-items: center; justify-content: flex-end; }
    .ps-two-cols { display: flex; gap: 24px; margin-bottom: 12px; }
    .ps-col-left { flex: 1; }
    .ps-col-right { flex: 1; text-align: right; }
    .ps-row-item { margin-bottom: 4px; }
    .ps-row-label { font-weight: 800; }
    .ps-packet { margin-bottom: 12px; padding: 6px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; }
    .ps-packet-title { font-weight: 700; font-size: 11px; margin-bottom: 4px; }
    .ps-party { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
    .ps-party-block { }
    .ps-party-title { font-weight: 700; font-size: 11px; margin-bottom: 6px; text-transform: uppercase; }
    .ps-party-line { font-size: 11px; margin-bottom: 2px; }
    .ps-policy { font-size: 10px; color: #444; margin: 12px 0 8px; font-style: italic; }
    .ps-sig-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-top: 8px; }
    .ps-sig-th { border: 1px solid #000; padding: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; background: #f9fafb; }
    .ps-sig-td { border: 1px solid #000; padding: 0; vertical-align: top; width: 50%; }
    .ps-sig-inner { width: 100%; border-collapse: collapse; }
    .ps-sig-inner tr { border-bottom: 1px solid #e5e7eb; }
    .ps-sig-inner tr:last-child { border-bottom: none; }
    .ps-sig-label { padding: 8px 12px; font-weight: 600; color: #475569; width: 30%; border-right: 1px solid #e5e7eb; }
    .ps-sig-cell { padding: 8px 12px; min-height: 36px; border: none; }
    .ps-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 12px; border-top: 1px solid #333; margin-top: 16px; font-size: 10px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .ps-page { box-shadow: none; } .ps-sheet { box-shadow: none; } }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
</head>
<body>
  ${sheetsHtml}
  <script>
    function doPrint() {
      try { ${barcodeScript} } catch(e) {}
      window.print();
    }
    if (document.readyState === 'complete') setTimeout(doPrint, 150);
    else window.addEventListener('load', function() { setTimeout(doPrint, 150); });
  <\/script>
</body>
</html>`
}

function formatDecimal(val) {
  if (val == null) return '—'
  const n = typeof val === 'object' && val !== null && typeof val.toString === 'function'
    ? parseFloat(val.toString())
    : Number(val)
  return Number.isFinite(n) ? n : String(val)
}

function parseWeight(val) {
  if (val == null) return null
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (typeof val === 'object' && val !== null && typeof val.toString === 'function')
    return parseFloat(val.toString())
  return parseFloat(String(val))
}

function formatWeight(b) {
  const w = parseWeight(b.weight)
  if (w != null && !Number.isNaN(w)) return `${w} kg`
  const cw = parseWeight(b.chargeableWeight)
  if (cw != null && !Number.isNaN(cw)) return `${cw} kg`
  return '—'
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
