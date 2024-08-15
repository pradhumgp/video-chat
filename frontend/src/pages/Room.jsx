import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../store/socket";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;
    console.log(email, "joined the room");
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`incoming call from ${from}, ${offer}`);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeededIncoming = useCallback(
    async (data) => {
      const { from, offer } = data;
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeededFinal = useCallback(async (data) => {
    const { ans } = data;
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoNeededFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoNeededFinal);
    };
  }, [
    handleCallAccepted,
    handleIncomingCall,
    handleNegoNeededFinal,
    handleNegoNeededIncoming,
    handleUserJoined,
    socket,
  ]);
  return (
    <>
    <div className="flex flex-col items-center w-screen h-screen gap-6 p-4 bg-red-400">
      <h1 className="text-4xl font-bold text-white">Room Page</h1>
      <h4 className="text-white">{remoteSocketId ? "Connected" : "No one in room"}</h4>
      <div className="flex gap-4">
      {myStream && <button onClick={sendStreams} className="p-1 bg-white rounded-sm">Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser} className="p-1 bg-white rounded-sm">CALL</button>}
      </div>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        {myStream && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white">My Stream</p>
            <ReactPlayer playing url={myStream} muted width={'100%'} height={'100%'} controls/>
          </div>
        )}
        {remoteStream && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white">Remote Stream</p>
            <ReactPlayer playing url={remoteStream}  muted width={'100%'} height={'100%'} controls/>
            </div>
        )}
      </div>
      </div>
    </>
  );
};

export default Room;
