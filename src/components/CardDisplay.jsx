import { useState } from "react";
import Image from "next/image";
import { CARD_BACK_IMAGE } from "@/lib/card-utils";
import { cn } from "@/lib/utils";
export function CardDisplay({ card, isFaceUp, isSelectable, isSelected, onClick, className, }) {
    const [isHovered, setIsHovered] = useState(false);
    return (<div className={cn("relative transition-all duration-200 cursor-pointer", isSelectable && "hover:scale-105", isSelected && "ring-4 ring-primary ring-offset-2", className)} onClick={isSelectable ? onClick : undefined} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Image src={isFaceUp ? card.imageSrc : CARD_BACK_IMAGE} alt={isFaceUp ? card.name : "Card Back"} width={100} height={140} className={cn("rounded-lg shadow-lg transition-transform duration-200", isHovered && isSelectable && "transform -translate-y-2")}/>
    </div>);
}
export function PlayerHand({ cards, isCurrentPlayer, hasViewedBottomRow, hasSwappedTopRow, onCardClick, selectedCardIndex, }) {
    return (<div className="grid grid-cols-3 gap-2">
      {cards.map((card, index) => {
            const isBottomRow = index >= 3;
            const isFaceUp = isCurrentPlayer && (isBottomRow ? hasViewedBottomRow : false);
            const isSelectable = isCurrentPlayer &&
                ((isBottomRow && !hasSwappedTopRow) ||
                    (!isBottomRow && hasSwappedTopRow));
            return (<CardDisplay key={card.id} card={card} isFaceUp={isFaceUp} isSelectable={isSelectable} isSelected={selectedCardIndex === index} onClick={() => onCardClick === null || onCardClick === void 0 ? void 0 : onCardClick(index)} className={cn("w-[100px] h-[140px]", isBottomRow ? "border-b-2 border-primary" : "")}/>);
        })}
    </div>);
}
