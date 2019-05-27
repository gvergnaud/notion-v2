const Io = require('socket.io')
const http = require('http')

const server = http.createServer((req, res) => {
  res.end('Ok')
})

const io = Io(server)

io.on('connection', socket => {
  socket.on('action', action => {
    socket.broadcast.emit('action', action)
  })
})

server.listen(process.env.PORT || 3001)
