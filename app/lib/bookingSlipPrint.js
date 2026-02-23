/**
 * Builds A4 booking slip HTML (two halves: Customer Copy + Accounts Copy) and opens print dialog.
 * TCS-style layout: logo, single CN barcode, staff code, route code, weight fix.
 * @param {object} booking - Booking/consignment data (from API or form)
 * @param {object} [options] - Optional: { config: { staffCode, routeCode, username }, logoUrl }
 */
export function printBookingSlip(booking, options = {}) {
  if (!booking) return

  const b = booking
  const config = options.config || {}
  const staffCode = config.staffCode ?? '—'
  const routeCode = config.routeCode ?? '—'
  const username = config.username ?? '—'
  const logoUrl = options.logoUrl ?? '/nps-logo.png'

  const cell = (label, value) =>
    `<tr><td class="label">${escapeHtml(label)}</td><td class="value">${escapeHtml(String(value ?? '—'))}</td></tr>`

  const cn = b.cnNumber || b.cn || ''
  const cnDisplay = cn || '—'
  const shipperName = b.shipperName || b.fullName || b.customer?.name || '—'
  const shipperPhone = b.shipperPhone || b.mobileNumber || b.customer?.phone || '—'
  const shipperAddress = b.shipperAddress || b.address || b.customer?.address || '—'
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
  const rate = b.rate != null ? formatDecimal(b.rate) : '—'
  const other = b.otherAmount != null && Number(b.otherAmount) !== 0 ? formatDecimal(b.otherAmount) : '—'
  const total = b.totalAmount != null ? formatDecimal(b.totalAmount) : '—'
  const payMode = b.paymentMode || b.payMode || '—'
  const bookingDt = b.bookingDate ? new Date(b.bookingDate) : (b.createdAt ? new Date(b.createdAt) : new Date())
  const dateStr = bookingDt.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: '2-digit' })
  const timeStr = bookingDt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const orgnDstn = `${origin} / ${destination}`

  // Preferred delivery (On Time Service) – format like "18 Feb 2026 at 6:46 AM"
  const preferredDateRaw = b.preferredDeliveryDate ?? b.preferred_delivery_date
  const preferredTimeRaw = b.preferredDeliveryTime ?? b.preferred_delivery_time
  const formatPreferredDate = (dateVal) => {
    if (!dateVal) return ''
    const d = dateVal instanceof Date ? dateVal : new Date(String(dateVal).includes('T') ? dateVal : String(dateVal) + 'T12:00:00')
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  const formatPreferredTime = (timeVal) => {
    if (!timeVal) return ''
    const parts = String(timeVal).split(':').map(Number)
    const h = parts[0]
    const m = parts[1] || 0
    if (h === 12) return `12:${String(m).padStart(2, '0')} PM`
    if (h === 0) return `12:${String(m).padStart(2, '0')} AM`
    return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }
  const preferredDeliveryFormatted =
    preferredDateRaw || preferredTimeRaw
      ? [formatPreferredDate(preferredDateRaw), formatPreferredTime(preferredTimeRaw)].filter(Boolean).join(' at ')
      : ''
  const isOnTimeService = String(b.service?.serviceName || b.service?.name || b.serviceId || '').trim() === 'On Time Service'
  const preferredDeliveryLine =
    isOnTimeService &&
    preferredDeliveryFormatted &&
    `<div class="row-item preferred-delivery-row"><span class="row-label">Preferred delivery (On Time Service):</span> ${escapeHtml(preferredDeliveryFormatted)}</div>`

  const amountStr = total !== '—' ? `Rs. ${total}` : '—'
  const helpline = options.helpline ?? '0335-2721975'
  const website = options.website ?? 'NPS.com.pk'

  // Origin/Dest codes (e.g. JHN-LHE)
  const originCode = b.originCity?.cityCode || b.originCity?.code || (typeof origin === 'string' ? origin.substring(0, 3).toUpperCase() : '—')
  const destCode = b.destinationCity?.cityCode || b.destinationCity?.code || (typeof destination === 'string' ? destination.substring(0, 3).toUpperCase() : '—')
  const orgDest = `${originCode}-${destCode}`

  // Payment Details breakdown
  const rateVal = b.rate != null ? Number(b.rate) : 0
  const piecesVal = b.pieces != null ? Number(b.pieces) : 1
  const otherVal = b.otherAmount != null ? Number(b.otherAmount) : 0
  const codAmt = b.codAmount != null ? Number(b.codAmount) : 0
  const payModeUpper = String(b.paymentMode || b.payMode || '').toUpperCase()
  const isCod = payModeUpper === 'COD'

  const serviceChg = rateVal * piecesVal
  // Other Amount: positive = additional charges (Add), negative = discount
  const valueAddedService = otherVal > 0 ? otherVal : 0
  const discount = otherVal < 0 ? Math.abs(otherVal) : 0

  const totalNum = b.totalAmount != null ? parseFloat(String(b.totalAmount)) : (serviceChg + otherVal + (isCod ? codAmt : 0))

  // Handling instructions and Remarks: support %%%REMARKS%%% in handlingInstructions, or separate fields
  const handlingRaw = b.handlingInstructions || ''
  let instructions = '—'
  let remarks = '—'
  if (typeof handlingRaw === 'string' && handlingRaw.includes('%%%REMARKS%%%')) {
    const parts = handlingRaw.split('%%%REMARKS%%%')
    instructions = (parts[0] || '').trim() || '—'
    remarks = (parts[1] || '').trim() || (b.remarks || '').trim() || '—'
  } else if (handlingRaw) {
    instructions = handlingRaw.trim() || '—'
    remarks = (b.remarks || '').trim() || '—'
  } else {
    instructions = (b.instructions || '').trim() || '—'
    remarks = (b.remarks || '').trim() || '—'
  }
  const insuredValue = b.declaredValue != null ? formatDecimal(b.declaredValue) : '0'
  const customerRef = b.customerRef || b.dcReferenceNo || '—'
  const shipperCnic = b.shipperCnic || b.customer?.cnic || b.cnic || '—'
  const creditCardAuthId = b.creditCardAuthId || b.creditCardAuth || '—'

  // Express Center Cut Of Time: heading always shown; value only when current time is outside 6 AM–8 PM
  const now = new Date()
  const hour = now.getHours()
  const showCutOffValue = hour < 6 || hour >= 20
  const cutOffTimeStr = showCutOffValue
    ? now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  const brandName = config.stationCode || 'NPS Courier and Logistics'
  const logoFallbackSvg = `<span class="logo-svg-wrap" aria-hidden="true"><svg class="logo-svg" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h32v20H4V8z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 14h32M12 8v20M28 8v20" stroke="currentColor" stroke-width="1.5"/></svg></span>`
  const logoBlockContent = `<div class="logo-block-inner"><img class="logo-img" src="${escapeHtml(logoUrl)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="logo-fallback">${logoFallbackSvg}<span class="logo-text">${escapeHtml(brandName)}</span></span></div>`

  const slipSection = (copyLabel, barcodeId) => `
    <div class="half">
      <div class="slip-top">
        <div class="logo-row">${logoBlockContent}</div>
        <div class="copy-type">${escapeHtml(copyLabel)}</div>
        <div class="barcode-wrap"><svg id="${escapeHtml(barcodeId)}" class="cn-barcode"></svg></div>
      </div>

      <table class="grid-table">
        <tr>
          <td class="grid-cell"><span class="grid-label">Product</span><br>${escapeHtml(product)}</td>
          <td class="grid-cell"><span class="grid-label">Service Type</span><br>${escapeHtml(service)}</td>
        </tr>
        <tr>
          <td class="grid-cell"><span class="grid-label">Payment Mode</span><br>${escapeHtml(String(payMode))}</td>
          <td class="grid-cell"><span class="grid-label">Date-Time</span><br>${escapeHtml(dateStr)} ${escapeHtml(timeStr)}</td>
        </tr>
        <tr>
          <td class="grid-cell"><span class="grid-label">ORG-DEST</span><br>${escapeHtml(orgDest)}</td>
          <td class="grid-cell"><span class="grid-label">Pieces | Weight</span><br>${escapeHtml(pieces)} Pcs - ${escapeHtml(weightStr)}</td>
        </tr>
        <tr>
          <td class="grid-cell"><span class="grid-label">Staff #</span><br>${escapeHtml(staffCode)}</td>
          <td class="grid-cell"><span class="grid-label">Route Code</span><br>${escapeHtml(routeCode)}</td>
        </tr>
      </table>

      <div class="section">
        <div class="kv-row" style="margin-bottom:4px"><span class="kv-label">Origin:</span> ${escapeHtml(origin)} | <span class="kv-label">Destination:</span> ${escapeHtml(destination)} </div>
      </div>

      <div class="section shipper-consignee-row">
        <div class="shipper-col">
          <div class="section-title">Shipper Details</div>
          <div class="kv-row"><span class="kv-label">Name:</span> ${escapeHtml(shipperName)}</div>
          <div class="kv-row"><span class="kv-label">Phone:</span> ${escapeHtml(shipperPhone)}</div>
          <div class="kv-row"><span class="kv-label">Address:</span> ${escapeHtml(shipperAddress)}</div>
        </div>
        <div class="consignee-col">
          <div class="section-title">Consignee Details</div>
          <div class="kv-row"><span class="kv-label">Name:</span> ${escapeHtml(consigneeName)}</div>
          <div class="kv-row"><span class="kv-label">Phone:</span> ${escapeHtml(consigneePhone)}</div>
          <div class="kv-row"><span class="kv-label">Address:</span> ${escapeHtml(consigneeAddress)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Item Details</div>
        <table class="doc-table">
          <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
          <tr><td>${escapeHtml(content)}</td><td>${escapeHtml(pieces)}</td><td>${escapeHtml(amountStr)}</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="kv-row"><span class="kv-label">Insured Value:</span> Rs. ${escapeHtml(insuredValue)}</div>
        <div class="kv-row"><span class="kv-label">Customer Ref #:</span> ${escapeHtml(customerRef)}</div>
        <div class="kv-row"><span class="kv-label">Express Center Cut Of Time:</span> ${cutOffTimeStr ? escapeHtml(cutOffTimeStr) : '—'}</div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <table class="payment-table">
          <tr><td class="pay-label">Service CHG:</td><td class="pay-val">${escapeHtml(formatDecimal(serviceChg))}</td></tr>
          ${discount > 0 ? `<tr><td class="pay-label">Discount:</td><td class="pay-val">${escapeHtml(formatDecimal(discount))}</td></tr>` : ''}
          ${valueAddedService > 0 ? `<tr><td class="pay-label">Other Amount (Add):</td><td class="pay-val">${escapeHtml(formatDecimal(valueAddedService))}</td></tr>` : ''}
          ${isCod && codAmt > 0 ? `<tr><td class="pay-label">COD Amount:</td><td class="pay-val">${escapeHtml(formatDecimal(codAmt))}</td></tr>` : ''}
          <tr><td class="pay-label pay-total">TOTAL:</td><td class="pay-val pay-total">${escapeHtml(formatDecimal(totalNum))}</td></tr>
        </table>
      </div>

      <div class="section remarks-instructions-row">
        <div class="remarks-col">
          <div class="section-title">Remarks</div>
          <div class="remarks-box">${escapeHtml(remarks)}</div>
        </div>
        <div class="instructions-col">
          <div class="section-title">Instructions</div>
          <div class="remarks-box">${escapeHtml(instructions)}</div>
        </div>
      </div>

      ${preferredDeliveryLine ? `<div class="section">${preferredDeliveryLine}</div>` : ''}

      <div class="slip-footer">
        <div class="footer-left">
          <div>Helpline: ${escapeHtml(helpline)}</div>
          <div>Website: ${escapeHtml(website)}</div>
        </div>
        <div class="footer-right">
          <div>Customer Signature: _________________________</div>
        </div>
      </div>

    </div>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Booking Slip - ${escapeHtml(cnDisplay)}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; color: #111; font-size: 10px; line-height: 1.35; }
    .page { width: 297mm; min-height: 210mm; padding: 8mm; margin: 0 auto; display: flex; flex-direction: row; gap: 12px; }
    .half { flex: 1; min-width: 0; border: 1px solid #333; padding: 10px 12px; background: #fff; }
    .slip-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333; flex-wrap: wrap; }
    .logo-row { flex-shrink: 0; }
    .logo-block-inner { display: flex; align-items: center; }
    .logo-img { max-height: 36px; max-width: 120px; object-fit: contain; }
    .logo-fallback { display: none; align-items: center; gap: 6px; }
    .logo-svg-wrap { display: inline-flex; }
    .logo-svg { width: 28px; height: 24px; color: #111; }
    .logo-text { font-weight: 700; font-size: 12px; }
    .cn-block { flex: 1; text-align: center; }
    .cn-label { font-weight: 700; }
    .cn-value { font-weight: 900; font-size: 14px; letter-spacing: 0.05em; }
    .copy-type { font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .barcode-wrap { min-height: 36px; }
    .cn-barcode { display: block; }
    .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .grid-table td { border: 1px solid #333; padding: 4px 6px; width: 50%; }
    .grid-label { font-weight: 700; font-size: 8px; text-transform: uppercase; }
    .section { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .section-title { font-weight: 700; font-size: 9px; text-transform: uppercase; margin-bottom: 4px; }
    .kv-row { font-size: 9px; margin-bottom: 2px; }
    .kv-label { font-weight: 700; margin-right: 4px; }
    .doc-table, .payment-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .doc-table th, .doc-table td, .payment-table td { border: 1px solid #ccc; padding: 3px 6px; }
    .doc-table th { font-weight: 700; }
    .payment-table .pay-label { font-weight: 600; }
    .payment-table .pay-val { text-align: right; }
    .payment-table .pay-total { font-weight: 900; border-top: 1px solid #333; }
    .remarks-box { min-height: 20px; font-size: 9px; }
    .remarks-instructions-row { display: flex; gap: 16px; }
    .remarks-col, .instructions-col { flex: 1; min-width: 0; }
    .shipper-consignee-row { display: flex; gap: 16px; }
    .shipper-col, .consignee-col { flex: 1; min-width: 0; }
    .slip-footer { display: flex; justify-content: space-between; padding-top: 6px; border-top: 1px solid #333; font-size: 8px; margin-top: 6px; }
    .slip-footer-terms { margin-top: 4px; font-size: 7px; color: #555; text-align: center; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { box-shadow: none; gap: 8px; }
      .half { box-shadow: none; break-inside: avoid; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body>
  <div class="page">
    <span id="cn-value" style="display:none">${escapeHtml(cn)}</span>
    ${slipSection('Customer Copy', 'barcode-left')}
    ${slipSection('Accounts Copy', 'barcode-right')}
  </div>
  <script>
    (function() {
      var cn = (document.getElementById('cn-value') && document.getElementById('cn-value').textContent) || '';
      function doPrint() {
        try {
          if (cn && typeof JsBarcode !== 'undefined') {
            var left = document.getElementById('barcode-left');
            var right = document.getElementById('barcode-right');
            if (left) JsBarcode(left, cn, { format: 'CODE128', width: 1.5, height: 40 });
            if (right) JsBarcode(right, cn, { format: 'CODE128', width: 1.5, height: 40 });
          }
        } catch (e) {}
        window.print();
      }
      if (document.readyState === 'complete') doPrint();
      else window.addEventListener('load', doPrint);
    })();
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    console.warn('Popup blocked: allow popups to print booking slip.')
    return false
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
}

/**
 * COD-specific slip: three copies (Accounts, Customer, Shipper) on one A4.
 * Same logo as printBookingSlip. Layout matches TCS-style COD slip.
 * @param {object} booking - Booking/consignment data
 * @param {object} [options] - { config: { staffCode, routeCode, username }, logoUrl }
 */
export function printCodSlip(booking, options = {}) {
  if (!booking) return

  const b = booking
  const config = options.config || {}
  const logoUrl = options.logoUrl ?? '/nps-logo.png'
  const brandName = config.stationCode || 'NPS Courier and Logistics'
  const logoFallbackSvg = `<span class="logo-svg-wrap" aria-hidden="true"><svg class="logo-svg" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h32v20H4V8z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 14h32M12 8v20M28 8v20" stroke="currentColor" stroke-width="1.5"/></svg></span>`
  const logoBlockContent = `<div class="cod-logo"><img class="cod-logo-img" src="${escapeHtml(logoUrl)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="logo-fallback">${logoFallbackSvg}<span class="logo-text">${escapeHtml(brandName)}</span></span></div>`

  const cn = b.cnNumber || b.cn || ''
  const shipperName = b.shipperName || b.fullName || b.customer?.name || '—'
  const shipperPhone = b.shipperPhone || b.mobileNumber || b.customer?.phone || '—'
  const shipperAddress = b.shipperAddress || b.address || b.customer?.address || '—'
  const consigneeName = b.consigneeName || b.consigneeFullName || '—'
  const consigneePhone = b.consigneePhone || b.consigneeMobileNumber || '—'
  const consigneeAddress = b.consigneeAddress || '—'
  const origin = b.originCity?.cityName || b.originCity?.name || (typeof b.originCityId === 'string' ? b.originCityId : '—')
  const destination = b.destinationCity?.cityName || b.destinationCity?.name || (typeof b.destinationCityId === 'string' ? b.destinationCityId : '—')
  const service = b.service?.serviceName || b.service?.name || b.serviceId || '—'
  const pieces = b.pieces != null ? b.pieces : '—'
  const weightStr = formatWeight(b)
  const content = b.packetContent || '—'
  const rateVal = b.rate != null ? Number(b.rate) : 0
  const piecesVal = b.pieces != null ? Number(b.pieces) : 1
  const otherVal = b.otherAmount != null ? Number(b.otherAmount) : 0
  const shippingChargesVal = rateVal * piecesVal + otherVal
  const shippingCharges = formatDecimal(shippingChargesVal)
  const totalVal = b.totalAmount != null ? parseFloat(String(b.totalAmount)) : null
  const codAmountVal = b.codAmount != null ? parseFloat(String(b.codAmount)) : null
  const codAmountNum = codAmountVal != null && !isNaN(codAmountVal)
    ? codAmountVal
    : (totalVal != null && !isNaN(totalVal) ? Math.max(0, totalVal - shippingChargesVal) : 0)
  const codAmount = codAmountNum > 0 ? formatDecimal(codAmountNum) : '—'
  const totalNum = shippingChargesVal + codAmountNum
  const total = b.totalAmount != null ? formatDecimal(b.totalAmount) : formatDecimal(totalNum)
  const codAmountStr = `RS${String(Math.round(totalNum)).replace(/[\s,]/g, '')}` || 'RS0'
  const bookingDt = b.bookingDate ? new Date(b.bookingDate) : (b.createdAt ? new Date(b.createdAt) : new Date())
  const dateStr = bookingDt.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = bookingDt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
  const declaredValue = b.declaredValue != null ? formatDecimal(b.declaredValue) : '—'
  const handlingRaw = b.handlingInstructions || ''
  const parts = typeof handlingRaw === 'string' && handlingRaw.includes('%%%REMARKS%%%')
    ? handlingRaw.split('%%%REMARKS%%%')
    : handlingRaw ? [handlingRaw, ''] : ['', '']
  const handlingInstructions = (parts[0] || '').trim() || '—'
  const remarks = (parts[1] || (b.remarks || '')).trim() || '—'
  const customerRef = (b.customerRef || b.dcReferenceNo || '').toString().trim() || '—'

  const disclaimer = "Please don't accept, if shipment is not intact. Before paying the COD, shipment can not be open."
  const contactLine = `Incase of complaints, pls contact to ${escapeHtml(shipperName)}. Ph: ${escapeHtml(shipperPhone || '—')}`
  const helpline = options.helpline ?? '0335-2721975'

  const codSlipSection = (copyLabel, cnBarcodeId, codBarcodeId) => `
    <div class="cod-slip">
      <table class="cod-table">
        <tr>
          <td class="cod-td-logo" rowspan="2">${logoBlockContent}</td>
          <td class="cod-td-barcode" colspan="2">
            <div class="cod-barcode-wrap"><svg id="${escapeHtml(cnBarcodeId)}" class="cod-cn-barcode"></svg></div>
            <div class="cod-cn-number">${escapeHtml(cn || '—')}</div>
            <div class="cod-copy-type">${escapeHtml(copyLabel)}</div>
          </td>
          <td class="cod-td-meta">
            <div><strong>Date:</strong> ${escapeHtml(dateStr)}</div>
            <div><strong>Time:</strong> ${escapeHtml(timeStr)}</div>
            <div><strong>Service:</strong> ${escapeHtml(service)}</div>
            <div><strong>Origin:</strong> ${escapeHtml(origin)}</div>
            <div><strong>Destination:</strong> ${escapeHtml(destination)}</div>
          </td>
        </tr>
        <tr>
          <td class="cod-td-party" colspan="2">
            <div class="cod-label">Shipper</div>
            <div class="cod-value">${escapeHtml(shipperName)}</div>
            <div class="cod-value">Ph: ${escapeHtml(shipperPhone)}</div>
            <div class="cod-value">${escapeHtml(shipperAddress || origin)}</div>
          </td>
          <td class="cod-td-party">
            <div class="cod-label">Consignee</div>
            <div class="cod-value">${escapeHtml(consigneeName)}</div>
            <div class="cod-value">${escapeHtml(consigneeAddress)} ${escapeHtml(consigneePhone)}</div>
          </td>
        </tr>
        <tr>
          <td class="cod-td-label">Pieces</td>
          <td class="cod-td-val">${escapeHtml(String(pieces))}</td>
          <td class="cod-td-label">Weight</td>
          <td class="cod-td-val">${escapeHtml(weightStr)}</td>
        </tr>
        <tr>
          <td class="cod-td-label">Declared Insurance Value</td>
          <td class="cod-td-val" colspan="3">${escapeHtml(declaredValue)}</td>
        </tr>
        <tr>
          <td class="cod-td-cod" colspan="2"><strong>COD AMOUNT</strong></td>
          <td class="cod-td-cod-barcode" colspan="2">
            <div class="cod-barcode-wrap cod-amount-barcode"><svg id="${escapeHtml(codBarcodeId)}" class="cod-amount-barcode-svg"></svg></div>
            <div class="cod-amount-value">Rs. ${escapeHtml(total)}</div>
          </td>
        </tr>
        <tr>
          <td class="cod-td-label">Product Detail</td>
          <td class="cod-td-val" colspan="3">${escapeHtml(content)}</td>
        </tr>
        <tr>
          <td class="cod-td-label">Payment</td>
          <td class="cod-td-val" colspan="3">
            <div><strong>Shipping:</strong> Rs. ${escapeHtml(shippingCharges)}</div>
            <div><strong>Order Amount:</strong> Rs. ${escapeHtml(codAmount)}</div>
            <div><strong>Total:</strong> Rs. ${escapeHtml(total)}</div>
          </td>
        </tr>
        <tr>
          <td class="cod-td-label">Handling Instructions</td>
          <td class="cod-td-val" colspan="3">${escapeHtml(handlingInstructions)}</td>
        </tr>
        <tr>
          <td class="cod-td-label">Customer Ref. #</td>
          <td class="cod-td-val" colspan="3">${escapeHtml(customerRef)}</td>
        </tr>
        <tr>
          <td class="cod-td-label">Remarks</td>
          <td class="cod-td-val" colspan="3">${escapeHtml(remarks)}</td>
        </tr>
      </table>
      <div class="cod-disclaimer">${disclaimer}</div>
      <div class="cod-contact">${contactLine}</div>
      <div class="cod-helpline">Helpline: ${escapeHtml(helpline)}</div>
      <div class="cod-cut">-------------</div>
    </div>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>COD Slip - ${escapeHtml(cn || '')}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; color: #111; font-size: 10px; }
    .cod-page { width: 210mm; min-height: 297mm; padding: 8mm; margin: 0 auto; }
    .cod-slip { border: 1px solid #333; padding: 10px; margin-bottom: 6px; background: #fff; break-inside: avoid; }
    .cod-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .cod-table td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
    .cod-td-logo { width: 18%; }
    .cod-td-barcode { width: 32%; text-align: center; }
    .cod-td-meta { width: 25%; font-size: 9px; }
    .cod-td-party { width: 50%; }
    .cod-td-label { width: 20%; font-weight: 700; }
    .cod-td-val { }
    .cod-td-cod { font-weight: 700; text-align: center; }
    .cod-td-cod-barcode { text-align: center; }
    .cod-logo { display: flex; align-items: center; justify-content: flex-start; }
    .cod-logo-img { max-height: 36px; max-width: 120px; object-fit: contain; }
    .cod-logo .logo-fallback { display: none; align-items: center; gap: 6px; }
    .cod-logo .logo-svg-wrap { display: inline-flex; }
    .cod-logo .logo-svg { width: 28px; height: 24px; color: #111; }
    .cod-logo .logo-text { font-weight: 700; font-size: 12px; }
    .cod-barcode-wrap { min-height: 32px; }
    .cod-cn-barcode, .cod-amount-barcode-svg { display: block; margin: 0 auto; }
    .cod-cn-number { font-weight: 700; font-size: 11px; margin-top: 2px; }
    .cod-copy-type { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
    .cod-label { font-weight: 700; font-size: 9px; margin-bottom: 2px; }
    .cod-value { font-size: 9px; }
    .cod-amount-value { font-weight: 700; font-size: 12px; margin-top: 2px; }
    .cod-disclaimer { font-size: 8px; margin-top: 6px; padding-top: 4px; border-top: 1px solid #ccc; }
    .cod-contact { font-size: 8px; margin-top: 2px; }
    .cod-helpline { font-size: 8px; margin-top: 2px; font-weight: 700; }
    .cod-cut { font-size: 8px; color: #666; margin-top: 4px; text-align: center; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cod-page { box-shadow: none; }
      .cod-slip { box-shadow: none; margin-bottom: 4px; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body>
  <div class="cod-page">
    <span id="cod-cn-value" style="display:none">${escapeHtml(cn)}</span>
    <span id="cod-amount-value" style="display:none">${escapeHtml(codAmountStr)}</span>
    ${codSlipSection('Accounts Copy', 'cod-cn-1', 'cod-amt-1')}
    ${codSlipSection('Customer Copy', 'cod-cn-2', 'cod-amt-2')}
    ${codSlipSection('Shipper Copy', 'cod-cn-3', 'cod-amt-3')}
  </div>
  <script>
    (function() {
      var cn = (document.getElementById('cod-cn-value') && document.getElementById('cod-cn-value').textContent) || '';
      var amt = (document.getElementById('cod-amount-value') && document.getElementById('cod-amount-value').textContent) || 'RS0';
      function doPrint() {
        try {
          if (typeof JsBarcode !== 'undefined') {
            for (var i = 1; i <= 3; i++) {
              var el = document.getElementById('cod-cn-' + i);
              if (el && cn) JsBarcode(el, cn, { format: 'CODE128', width: 1.5, height: 36, displayValue: false });
              var amtEl = document.getElementById('cod-amt-' + i);
              if (amtEl && amt) JsBarcode(amtEl, amt, { format: 'CODE128', width: 1.5, height: 28, displayValue: false });
            }
          }
        } catch (e) {}
        window.print();
      }
      if (document.readyState === 'complete') doPrint();
      else window.addEventListener('load', doPrint);
    })();
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    console.warn('Popup blocked: allow popups to print COD slip.')
    return false
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  return true
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
