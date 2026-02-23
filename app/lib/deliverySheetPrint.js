/**
 * Delivery Sheet Report – A4 print via new window (same pattern as shiftcloseprint.js).
 * Builds HTML document, opens in popup, triggers print on load.
 * @param {Array} bookings - List of consignment/booking objects in the delivery sheet
 * @param {object} options - { sheetNumber, riderName, vehicleNo, originStation, sheetDate, copyType?, logoUrl? }
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

  const totalPcs = list.reduce((s, b) => s + (parseInt(b.pieces, 10) || 0), 0)
  const totalWt = list.reduce((s, b) => {
    const w = b.weight != null
      ? (typeof b.weight === 'object' && b.weight !== null && typeof b.weight.toString === 'function'
        ? parseFloat(b.weight.toString())
        : parseFloat(b.weight))
      : 0
    return s + (Number.isFinite(w) ? w : 0)
  }, 0)
  const totalAmt = list.reduce((s, b) => s + (parseFloat(b.totalAmount) || 0), 0)

  const row = (b, i) => {
    const originName = b.originCity?.cityName || b.originCity?.name || b.originCityId || '—'
    const destName = b.destinationCity?.cityName || b.destinationCity?.name || b.destinationCityId || '—'
    const payMode = b.paymentMode || b.payMode || '—'
    const status = b.status || '—'
    const w = b.weight != null
      ? (typeof b.weight === 'object' && b.weight !== null && typeof b.weight.toString === 'function'
        ? parseFloat(b.weight.toString())
        : parseFloat(b.weight))
      : 0
    const isVoided = String(status).toUpperCase() === 'VOIDED'
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
      <td class="ds-td ds-td-center ds-status">${escapeHtml(status)}</td>
      <td class="ds-td ds-td-center">${escapeHtml(String(payMode).toLowerCase())}</td>
      <td class="ds-td ds-td-center">${escapeHtml(b.pieces ?? '—')} / ${Number.isFinite(w) ? w : (b.weight ?? '—')}</td>
      <td class="ds-td ds-td-right">RS. ${b.totalAmount != null ? Number(b.totalAmount).toLocaleString() : '—'}</td>
    </tr>`
  }

  const metaBlock = `
    <p>SHEET: <span class="ds-meta-val">${escapeHtml(sheetNumber)}</span></p>
    <p>RIDER: <span class="ds-meta-val">${escapeHtml(riderName)}</span></p>
    <p>VEHICLE: <span class="ds-meta-val">${escapeHtml(vehicleNo)}</span></p>
    <p>ORIGIN: <span class="ds-meta-val">${escapeHtml(originStation)}</span></p>
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
    .ds-voided { background: #fef2f2 !important; }
    .ds-tfoot { background: #f9fafb; font-weight: 900; font-size: 10px; }
    .ds-tfoot td { padding: 8px; }
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
          <th style="width:12%">CN NUMBER</th>
          <th style="width:8%">ORIGIN</th>
          <th style="width:8%">DEST</th>
          <th style="width:15%">SHIPPER</th>
          <th style="width:15%">CONSIGNEE</th>
          <th style="width:6%">STATUS</th>
          <th style="width:6%">MODE</th>
          <th style="width:10%">PCS/WGT</th>
          <th style="width:10%">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${list.map((b, i) => row(b, i)).join('')}
      </tbody>
      <tfoot>
        <tr class="ds-tfoot">
          <td colspan="8" style="text-align:right; text-transform:uppercase; letter-spacing:0.05em;">Delivery Sheet Total</td>
          <td style="text-align:center;">${totalPcs} PCS / ${totalWt.toFixed(2)} KG</td>
          <td style="text-align:right;">RS. ${totalAmt.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
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

function escapeHtml(str) {
  if (str == null) return ''
  const s = String(str)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
