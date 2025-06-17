"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = useSocket;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
function useSocket(roomId, initialPlayer) {
    const socketRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // Initialize socket connection
        socketRef.current = (0, socket_io_client_1.io)("http://localhost:3000");
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
