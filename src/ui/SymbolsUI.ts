export const BoxSymbolsUI = {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    vertical: '║',
    horizontal: '═',
    get cornerTopLeft() {
        return this.topLeft + this.horizontal;
    },
    get cornerTopRight() {
        return this.horizontal + this.topRight;
    },
    get cornerBottomLeft() {
        return this.bottomLeft + this.horizontal;
    },
    get cornerBottomRight() {
        return this.horizontal + this.bottomRight;
    },
};

export const SymbolsUI = {
    pointedStar: '✦',
    box: BoxSymbolsUI,
}