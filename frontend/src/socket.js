import { io } from "socket.io-client"

const socket = io("https://attendance-system-j9d3.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
  withCredentials: true
})

export default socket
