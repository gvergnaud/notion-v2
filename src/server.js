const Io = require('socket.io')
const http = require('http')

const server = http.createServer((req, res) => {
  res.end('Ok')
})

const io = Io(server)

let lines = [{ type: 'h1', content: '', id: 'init' }]

io.on('connection', socket => {
  socket.emit('action', { type: 'INIT_STATE', lines })

  socket.on('action', action => {
    socket.broadcast.emit('action', action)
  })

  socket.on('updateState', _lines => {
    lines = _lines
  })
})

server.listen(process.env.PORT || 3001)
