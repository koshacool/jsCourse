const express = require('express')
const path = require('path')

const app = express()

app.get('/main.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.js'))
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})


app.listen(80, '127.0.0.1', (err) => {
  if (err) {
    console.log(err)
    return
  }

  console.log('Listening at http://127.0.0.1')
})