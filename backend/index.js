const { Server, Socket } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();

const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected!", socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;

    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });

    socket.join(room);

    io.to(socket.id).emit("room:joined", data);
  });

  socket.on('user:call', (data) => {
    const { to, offer } = data;
    io.to(to).emit('incoming:call', { from: socket.id, offer })
  })

  socket.on('call:accepted', (data) => {
    const { to, ans } = data;
    io.to(to).emit('call:accepted', { from: socket.id, ans })
  })

  socket.on('peer:nego:needed', (data) => {
    const { to, offer } = data;
    io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
  })

  socket.on('peer:nego:done',(data)=>{
    const { to, ans } = data;
    io.to(to).emit('peer:nego:final', { from: socket.id, ans });
  })
});
