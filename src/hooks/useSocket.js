import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
export function useSocket(roomId, initialPlayer) {
    const socketRef = useRef(null);
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io("http://localhost:3000");
        // Join game room
        socketRef.current.emit("joinGame", roomId, initialPlayer);
        return () => {
            var _a;
            (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
        };
    }, [roomId, initialPlayer]);
    const startGame = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("startGame", roomId);
    };
    const viewBottomRow = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("viewBottomRow", roomId, initialPlayer.id);
    };
    const drawFromDeck = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("drawFromDeck", roomId, initialPlayer.id);
    };
    const drawFromDiscard = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("drawFromDiscard", roomId, initialPlayer.id);
    };
    const swapCard = (cardIndex) => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("swapCard", roomId, initialPlayer.id, cardIndex);
    };
    const callStop = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("callStop", roomId, initialPlayer.id);
    };
    return {
        socket: socketRef.current,
        startGame,
        viewBottomRow,
        drawFromDeck,
        drawFromDiscard,
        swapCard,
        callStop,
    };
}
