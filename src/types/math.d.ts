declare global {
    interface Math {
        clamp(num: number, min: number, max: number): number;
    }
}

export {}