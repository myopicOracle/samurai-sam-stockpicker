// import 'dotenv/config'
// import { dates } from './utils/dates' // hardcode for now due to MIME type issue

function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDateNDaysAgo(n) {
    const now = new Date(); // current date and time
    now.setDate(now.getDate() - n); // subtract n days
    return formatDate(now);
}

const dates = {
    startDate: getDateNDaysAgo(3), // alter days to increase/decrease data set
    endDate: getDateNDaysAgo(1) // leave at 1 to get yesterday's data
}

const tickersArr = []

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    console.log('Form submitted!') 
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    const POLYGON_API_KEY = "ZA8Eicm7x5QaiIDTFk2pMIVLSxTV_zsF"
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            // const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_API_KEY}` // hardcoding API key for now
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${POLYGON_API_KEY}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        console.log(typeof stockData) // object
        console.log(stockData) // ['{"ticker":"MSFT","queryCount":3,"resultsCount":3,"adjusted":true,"results":[{"v":1.6469235e+07,"vw":513.3429,"o":515.53,"c":512.57,"h":517.62,"l":511.56,"t":1753761600000,"n":343983},{"v":2.6380434e+07,"vw":520.0145,"o":515.17,"c":513.24,"h":515.95,"l":509.435,"t":1753848000000,"n":517178},{"v":5.1617326e+07,"vw":537.9712,"o":555.225,"c":533.5,"h":555.45,"l":531.9,"t":1753934400000,"n":870710}],"status":"OK","request_id":"83e38a8b6dbb5c6329077a3e625e9511","count":3}']
        fetchReport(stockData.join(''))
    } catch (err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    console.log(typeof data) // string
    console.log(data) // {"ticker":"MSFT","queryCount":3,"resultsCount":3,"adjusted":true,"results":[{"v":1.6469235e+07,"vw":513.3429,"o":515.53,"c":512.57,"h":517.62,"l":511.56,"t":1753761600000,"n":343983},{"v":2.6380434e+07,"vw":520.0145,"o":515.17,"c":513.24,"h":515.95,"l":509.435,"t":1753848000000,"n":517178},{"v":5.1617326e+07,"vw":537.9712,"o":555.225,"c":533.5,"h":555.45,"l":531.9,"t":1753934400000,"n":870710}],"status":"OK","request_id":"83e38a8b6dbb5c6329077a3e625e9511","count":3}

    try {
        const url = "https://openai-api-worker-001.myopic-oracle.workers.dev/"

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        const result = await response.json()
        console.log('Received data:', result)

        renderReport(result)
        
    } catch (err) {
        console.log('Error:', err)
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    }
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}
