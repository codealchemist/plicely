import humanize from 'humanize-duration'

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
const $addMarkBtn = document.getElementById('addMarkBtn')
const marks = []
let lastMark = {}

$addMarkBtn.addEventListener('click', addMark)

function addMark () {
  navigator.geolocation.getCurrentPosition(onLocation, onError)
}

function getElapsedTime (date1, date2) {
  if (!date2) return null
  return date1.getTime() - date2.getTime()
}

function onLocation ({ coords }) {
  const { latitude, longitude } = coords
  console.log('Add mark for:', coords)
  const date = new Date()
  const year = date.getFullYear()
  const month = months[date.getMonth()]
  const dayName = days[date.getDay()]
  const dayNum = date.getDate()
  const minute = `0${date.getMinutes()}`.substr(-2)
  const hour = `0${date.getHours()}`.substr(-2)
  const dateString = `${dayName} ${dayNum}, ${month} ${year} @ ${hour}:${minute}`
  const name = window.prompt('Location name') || 'Unknown'

  const elapsed = getElapsedTime(date, lastMark.date)
  const mark = {
    ...coords,
    name,
    date,
    elapsed
  }
  lastMark = mark
  marks.push(mark)

  // HTML output.
  let elapsedHtml = ''
  if (elapsed) elapsedHtml = `<span class="elapsed">${humanize(elapsed, { round: true })}</span>`
  $marks.innerHTML += `
    ${elapsedHtml}
    <li>
      <label>${name}</label>
      <pre>LAT ${latitude} / LON ${longitude}</pre>
      <pre class="date">${dateString}</pre>
    </li>
  `
  document.activeElement.blur()
}

function onError (e) {
  console.log('ERROR', e)
  $error.innerHTML = `ERROR: ${e.message}`
}
