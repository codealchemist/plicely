const express = require('express')

const app = express()
const port = process.env.PORT || 9090

function setRoutes () {
  app.use(express.static('dist'))

  app.use((req, res) => {
    res.sendStatus(404)
  })
}

setRoutes()
app.listen(port, () =>
  console.log(`plicely-server listening on http://localhost:${port}`)
)
