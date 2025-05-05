import { io } from "socket.io-client";

const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const socket = io(url);

export default socket;
