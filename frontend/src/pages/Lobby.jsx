import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../store/socket";
import { useNavigate } from "react-router-dom";
const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = useCallback((data)=>{
    const { room } = data;
    navigate(`/room/${room}`);
  },[])

  useEffect(()=>{
    socket.on('room:joined', handleJoinRoom)
    return () => {
      socket.off('room:joined', handleJoinRoom)
    }
  },[handleJoinRoom, socket])

  

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit('room:join', { email, room });
    },
    [email, room, socket]
  );

  return (
    <>
    <div className="flex flex-col gap-12 items-center justify-center w-screen h-screen bg-red-400 p-4">
      <h1 className="text-4xl text-white font-bold">Lobby</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-12 items-center text-white">
        <div className="flex gap-4 items-center w-full justify-between">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          className="text-black p-2 rounded-md"
          onChange={(e) => setEmail(e.target.value)}
        />
        </div>
        <div className="flex gap-4 items-center w-full justify-between">
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          className="text-black p-2 rounded-md"
          onChange={(e) => setRoom(e.target.value)}
        />
        </div>
        <button className="bg-white px-4 py-1 rounded-md text-black">Join</button>
      </form>
      </div>
    </>
  );
};

export default Lobby;
