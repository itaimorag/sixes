import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "./types";

export const SocketContext = createContext<Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null>(null);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);

  const initializeSocket = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      console.error("Max connection retries reached");
      setIsConnecting(false);
      return;
    }

    console.log(
      `Attempting to connect (attempt ${retryCount + 1}/${MAX_RETRIES})...`
    );

    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: RETRY_DELAY,
      reconnectionAttempts: MAX_RETRIES,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      setSocket(newSocket);
      setIsConnecting(false);
      setRetryCount(0);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setRetryCount((prev) => prev + 1);

      if (retryCount < MAX_RETRIES - 1) {
        setTimeout(() => {
          console.log("Retrying connection...");
          newSocket.connect();
        }, RETRY_DELAY);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    return () => {
      console.log("Cleaning up socket connection...");
      newSocket.close();
    };
  }, [retryCount]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>
            Connecting to server...{" "}
            {retryCount > 0 ? `(Attempt ${retryCount}/${MAX_RETRIES})` : ""}
          </p>
        </div>
      </div>
    );
  }

  if (!socket && !isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Failed to connect to server after {MAX_RETRIES} attempts.</p>
          <button
            onClick={() => {
              setRetryCount(0);
              setIsConnecting(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
}
