// Amazon Purchase History Analyzer core logic

const fileInput = document.getElementById('csv-file')
const filters = document.getElementById('filters')
const visuals = document.getElementById('visuals')
const yearFrom = document.getElementById('year-from')
const yearTo = document.getElementById('year-to')
const applyBtn = document.getElementById('apply-filters')
const clearBtn = document.getElementById('clear-data')

let rawRows = []
let parsed = []
let charts = {}
let displayCurrency = 'USD'

function resetState(){
  rawRows = []
  parsed = []
  visuals.classList.add('hidden')
  filters.classList.add('hidden')
  clearTables()
  destroyCharts()
}

function clearTables(){
  document.querySelector('#top-high tbody').innerHTML = ''
  document.querySelector('#top-low tbody').innerHTML = ''
}

function destroyCharts(){
  Object.values(charts).forEach(c=>{try{c.destroy()}catch(e){}})
  charts = {}
}

// Utility: aggregateBy(array, keyFn, [valueFn])
function aggregateBy(arr, keyFn, valueFn) {
  const map = new Map();
  arr.forEach(item => {
    const key = keyFn(item);
    if (key == null) return;
    const val = valueFn ? valueFn(item) : 1;
    map.set(key, (map.get(key) || 0) + val);
  });
  // Return as array of [key, value] sorted by key (for charts)
  return Array.from(map.entries()).sort((a, b) => {
    if (typeof a[0] === 'number' && typeof b[0] === 'number') return a[0] - b[0];
    return String(a[0]).localeCompare(String(b[0]));
  });
}

fileInput.addEventListener('change', (e)=>{
  const f = e.target.files && e.target.files[0]
  if(!f) return
  if(!f.name.match(/\.csv$/i)){
    alert('Please upload a CSV file. Locate your Amazon Retail Order History CSV file.');
    return
  }
  resetState()
  Papa.parse(f, {
    header:true,
    skipEmptyLines:true,
    complete: (res)=>{
      const requiredCols = [
        'OrderDate','TotalOwed','ProductName','OrderStatus','Currency'
      ]
      const headers = res.meta.fields || []
      const hasAll = requiredCols.every(col=>headers.some(h=>h.replace(/\s+/g,'').toLowerCase().includes(col.toLowerCase())))
      if(!hasAll){
        alert('This file does not contain the required columns. Please locate your Amazon Retail Order History CSV file.');
        return
      }
      rawRows = res.data
      parsed = normalizeRows(rawRows)
      if(parsed.length===0) return
      displayCurrency = getMajorityCurrency(parsed)
      populateYearSelectors(parsed)
      renderAll(parsed)
      filters.classList.remove('hidden')
      visuals.classList.remove('hidden')
    }
  })
})

clearBtn.addEventListener('click', ()=>{
  resetState()
  fileInput.value = ''
})

applyBtn.addEventListener('click', ()=>{
  const from = parseInt(yearFrom.value,10)
  const to = parseInt(yearTo.value,10)
  const filtered = parsed.filter(r=>r.year>=from && r.year<=to)
  renderAll(filtered)
})

function normalizeRows(rows){
  return rows.map(r=>{
    const total = parseFloat((r['TotalOwed']||r['Total Owed']||r['Total'])?.replace(/[^0-9.-]+/g,'') || 0)
    const date = new Date(r['OrderDate'] || r['Order Date'])
    const product = r['ProductName'] || r['Product Name'] || r['product_name'] || r['Product'] || ''
    const currency = r['Currency'] || 'USD'
    return {
      raw: r,
      total: Number.isFinite(total)?total:0,
      date: isNaN(date.getTime())?null:date,
      product,
      currency,
      year: isNaN(date.getTime())?null:date.getFullYear(),
      month: isNaN(date.getTime())?null:date.getMonth()+1,
      weekday: isNaN(date.getTime())?null:date.getDay()
    }
  }).filter(r=>r.date)
}

function getMajorityCurrency(rows){
  const freq = rows.reduce((acc,r)=>{acc[r.currency]=(acc[r.currency]||0)+1;return acc}, {})
  return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0]||'USD'
}

function populateYearSelectors(rows){
  const years = Array.from(new Set(rows.map(r=>r.year))).sort((a,b)=>a-b)
  yearFrom.innerHTML = ''
  yearTo.innerHTML = ''
  years.forEach(y=>{
    const o1 = document.createElement('option'); o1.value = y; o1.textContent = y
    const o2 = document.createElement('option'); o2.value = y; o2.textContent = y
    yearFrom.appendChild(o1); yearTo.appendChild(o2)
  })
  if(years.length>0){ yearFrom.value = years[0]; yearTo.value = years[years.length-1] }
}

function renderAll(rows){
  destroyCharts()
  clearTables()
  renderYearChart(rows)
  renderMonthChart(rows)
  renderWeekdayChart(rows)
  renderPaymentTypeChart(rows)
  renderTopTables(rows)
}

function renderYearChart(rows){
  const agg = aggregateBy(rows, r=>r.year, r=>r.total)
  const labels = agg.map(a=>a[0])
  const data = agg.map(a=>a[1])
  const ctx = document.getElementById('chart-year').getContext('2d')
  charts.year = new Chart(ctx, {
    type:'bar',
    data:{labels, datasets:[{label:'Total Spend', data, backgroundColor:'#3b82f6'}]},
    options:{responsive:true}
  })
}

function renderMonthChart(rows){
  const agg = aggregateBy(rows, r=>r.month, r=>r.total)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const labels = agg.map(a=>months[a[0]-1])
  const data = agg.map(a=>a[1])
  const ctx = document.getElementById('chart-month').getContext('2d')
  charts.month = new Chart(ctx, {type:'bar', data:{labels, datasets:[{label:'Spend', data, backgroundColor:'#10b981'}]}})
}

function renderWeekdayChart(rows){
  const agg = aggregateBy(rows, r=>r.weekday)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const totalPurchases = agg.reduce((sum, a) => sum + a[1], 0)
  const labels = agg.map(a=>days[a[0]])
  const data = agg.map(a=>((a[1]/totalPurchases)*100).toFixed(1))
  const ctx = document.getElementById('chart-weekday').getContext('2d')
  charts.weekday = new Chart(ctx, {
    type:'pie',
    data:{labels, datasets:[{data, backgroundColor:["#ef4444","#f97316","#f59e0b","#facc15","#84cc16","#34d399","#60a5fa"]}]},
    options:{
      plugins:{
        tooltip:{
          callbacks:{
            label: function(context){
              return `${context.label}: ${context.parsed}%`;
            }
          }
        }
      }
    }
  })
}

function renderPaymentTypeChart(rows){
  const canvas = document.getElementById('chart-payment')
  if (!canvas) return // If canvas is missing, do nothing
  // Aggregate by payment type, summing total spend for each
  if (typeof aggregateBy !== 'function') return // If aggregateBy is missing, do nothing
  const agg = aggregateBy(
    rows,
    r => r.raw['Payment Instrument Type'] || r.raw['PaymentInstrumentType'],
    r => r.total
  )
  if (!agg.length) {
    canvas.style.display = 'none';
    return
  } else {
    canvas.style.display = '';
  }
  const labels = agg.map(a=>a[0]||'Unknown')
  const total = agg.reduce((sum, a) => sum + a[1], 0)
  const data = agg.map(a=>((a[1]/total)*100).toFixed(1))
  const ctx = canvas.getContext('2d')
  charts.payment = new Chart(ctx, {
    type:'pie',
    data:{labels, datasets:[{data, backgroundColor:["#6366f1","#f59e42","#10b981","#f43f5e","#facc15","#a21caf","#0ea5e9"]}]},
    options:{
      plugins:{
        tooltip:{
          callbacks:{
            label: function(context){
              return `${context.label}: ${context.parsed}%`;
            }
          }
        }
      }
    }
  })
}

function renderTopTables(rows){
  // Skip 'Cancelled' for top purchases
  const sorted = rows.filter(r => r.raw['OrderStatus'] !== 'Cancelled').sort((a,b)=>b.total - a.total)
  const top = sorted.slice(0,5)
  const low = getLowestPurchases(sorted)
  const th = document.querySelector('#top-high tbody')
  const tl = document.querySelector('#top-low tbody')
  top.forEach(r=>{
    const tr = document.createElement('tr')
    tr.style.background = '#173c2a' // greenish for highest
    tr.innerHTML = `<td>${escapeHtml(r.product)}</td><td>${formatDate(r.date)}</td><td>${formatCurrency(r.total,r.currency)}</td>`
    th.appendChild(tr)
  })
  low.forEach(r=>{
    const tr = document.createElement('tr')
    tr.style.background = '#3c1717' // reddish for lowest
    tr.innerHTML = `<td>${escapeHtml(r.product)}</td><td>${formatDate(r.date)}</td><td>${formatCurrency(r.total,r.currency)}</td>`
    tl.appendChild(tr)
  })
}

// When calculating lowest spends, skip rows where OrderStatus === 'Cancelled' or TotalOwed == 0
function getLowestPurchases(data, count = 5) {
  return data
    .filter(row => row.raw['OrderStatus'] !== 'Cancelled' && row.total > 0)
    .sort((a, b) => a.total - b.total)
    .slice(0, count);
}

function formatCurrency(n, curr) {
  curr = displayCurrency || curr || 'USD';
  return n.toLocaleString(undefined, { style: 'currency', currency: curr });
}

function escapeHtml(s){
  return (s||'').replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;' }[c]||c))
}

function formatDate(date){
  if (!date) return ''
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  return date.toLocaleDateString(undefined, options)
}