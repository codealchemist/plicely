import peer from './peer'
import humanize from 'humanize-duration'
import OfflinePluginRuntime from 'offline-plugin/runtime'
import './style.css'

OfflinePluginRuntime.install()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const $error = document.getElementById('error')
const $marks = document.getElementById('marks')
const $addMarkButton = document.getElementById('add-mark-button')
const $addMarkLabel = document.getElementById('add-mark-label')
const marks = []
let lastMark = {}

// Only the initiator can add marks.
if (peer.isInitiator) {
  $addMarkButton.style.display = 'flex'
  $addMarkButton.addEventListener('click', addMark)
  $addMarkLabel.innerHTML = 'Add Marks'
}

function addMark () {
  console.log('ADD MARK')
  const options = {
    timeout: 3000,
    enableHighAccuracy: true,
    maximumAge: Infinity
  }

  // Mock
  // onLocation({
  //   coords: {
  //     latitude: 34.9809098,
  //     longitude: 38.98798798
  //   }
  // })
  navigator.geolocation.getCurrentPosition(onLocation, onError, options)
}

function getElapsedTime (date1, date2) {
  if (!date2) return null
  return date1.getTime() - date2.getTime()
}

// Adds mark after getting geolocation.
function onLocation ({ coords }) {
  console.log('GOT LOCATION', coords)
  let name = window.prompt('Location name')
  if (name === null) return
  name = name || 'Unknown'

  const { latitude, longitude } = coords
  const date = new Date()
  const year = date.getFullYear()
  const month = months[date.getMonth()]
  const dayName = days[date.getDay()]
  const dayNum = date.getDate()
  const minute = `0${date.getMinutes()}`.substr(-2)
  const hour = `0${date.getHours()}`.substr(-2)
  const dateString = `${dayName} ${dayNum}, ${month} ${year} @ ${hour}:${minute}`

  const elapsed = getElapsedTime(date, lastMark.date)
  const mark = {
    ...coords,
    name,
    date,
    dateString,
    elapsed
  }
  lastMark = mark
  marks.push(mark)
  console.log('MARK added', mark)
  peer.send({ mark })

  // HTML output.
  appendMark(mark)

  // Hide keyboard on mobile.
  document.activeElement.blur()

  // Update label on first added mark.
  if (marks.length === 1) $addMarkLabel.innerHTML = 'Marks'
}

function appendMark (mark) {
  const { name, elapsed, latitude, longitude, dateString } = mark
  let elapsedHtml = ''
  if (elapsed) {
    elapsedHtml = `<span class="elapsed">${humanize(elapsed, {
      round: true
    })}</span>`
  }
  $marks.innerHTML += `
    ${elapsedHtml}
    <li>
      <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="blank">
        <label>${name}</label>
        <pre class="truncate">LAT ${latitude} / LON ${longitude}</pre>
        <pre class="date">${dateString}</pre>
      </a>
    </li>
  `
}

function onError (e) {
  console.log('ERROR', e)
  $error.innerHTML = `ERROR: ${e.message}`
}

peer.onData(data => {
  // TODO: sync whole collection

  const message = JSON.parse(data)
  console.log('Peer GOT DATA', data)
  console.log('Peer GOT MESSAGE', message)
  const { payload } = message || {}
  const { mark } = payload || {}
  if (mark.name) appendMark(mark)
})

peer.onError(error => {
  console.error('Peer GOT ERROR', error)
})
