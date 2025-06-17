"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardDisplay = CardDisplay;
exports.PlayerHand = PlayerHand;
const react_1 = require("react");
const image_1 = __importDefault(require("next/image"));
const card_utils_1 = require("@/lib/card-utils");
const utils_1 = require("@/lib/utils");
function CardDisplay({ card, isFaceUp, isSelectable, isSelected, onClick, className, }) {
    const [isHovered, setIsHovered] = (0, react_1.useState)(false);
    return (<div className={(0, utils_1.cn)("relative transition-all duration-200 cursor-pointer", isSelectable && "hover:scale-105", isSelected && "ring-4 ring-primary ring-offset-2", className)} onClick={isSelectable ? onClick : undefined} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <image_1.default src={isFaceUp ? card.imageSrc : card_utils_1.CARD_BACK_IMAGE} alt={isFaceUp ? card.name : "Card Back"} width={100} height={140} className={(0, utils_1.cn)("rounded-lg shadow-lg transition-transform duration-200", isHovered && isSelectable && "transform -translate-y-2")}/>
    </div>);
}
function PlayerHand({ cards, isCurrentPlayer, hasViewedBottomRow, hasSwappedTopRow, onCardClick, selectedCardIndex, }) {
    return (<div className="grid grid-cols-3 gap-2">
      {cards.map((card, index) => {
            const isBottomRow = index >= 3;
            const isFaceUp = isCurrentPlayer && (isBottomRow ? hasViewedBottomRow : false);
            const isSelectable = isCurrentPlayer &&
                ((isBottomRow && !hasSwappedTopRow) ||
                    (!isBottomRow && hasSwappedTopRow));
            return (<CardDisplay key={card.id} card={card} isFaceUp={isFaceUp} isSelectable={isSelectable} isSelected={selectedCardIndex === index} onClick={() => onCardClick === null || onCardClick === void 0 ? void 0 : onCardClick(index)} className={(0, utils_1.cn)("w-[100px] h-[140px]", isBottomRow ? "border-b-2 border-primary" : "")}/>);
        })}
    </div>);
}
