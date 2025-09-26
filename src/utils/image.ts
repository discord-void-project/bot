import { createCanvas, loadImage } from '@napi-rs/canvas'

export async function getDominantColor(imgURL: string, returnRGB: false): Promise<string>;
export async function getDominantColor(imgURL: string, returnRGB ?: true): Promise<number>;
export async function getDominantColor(imgURL: string, returnRGB = true): Promise<number | string> {
    try {
        const img = await loadImage(imgURL);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            r += imageData[i];
            g += imageData[i + 1];
            b += imageData[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hexColor = (r << 16) | (g << 8) | b;
        const hex = hexColor.toString(16).padStart(6, '0').toUpperCase();

        return returnRGB ? +`0x${hex}` : hex;
    } catch (err) {
        console.error(err);
        return returnRGB ? 0x0 : '#000';
    }
}

export const svgToBase64 = (svg: string) => {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}