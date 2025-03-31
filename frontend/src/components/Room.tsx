import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

const Room = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<null | Socket>(null);

  useEffect(() => {
    const socket = io(URL);

    socket.on("send-offer", (roomId) => {
      alert("Send offer please");
      setLobby(false);
      socket.emit("offer", {
        sdp: "",
        roomId,
      });
    });

    socket.on("offer", ({ roomId }) => {
      alert("Send answer please");
      setLobby(false);
      socket.emit("answer", {
        roomId,
        sdp: "",
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      setLobby(false);
      alert("Connection done");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });
  }, [name]);

  if (lobby) {
    return <div>Waiting to connect with someone</div>;
  }

  return;
  <div>
    Hi {name}!
    <video width={400} height={400} />
    <video width={400} height={400} />
  </div>;
};

export default Room;
