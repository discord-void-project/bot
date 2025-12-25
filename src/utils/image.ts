import { createCanvas, loadImage } from '@napi-rs/canvas'
import chroma from 'chroma-js'

interface GetDominantColorBaseOptions {
    minLuminance?: number;
}

interface GetDominantColorRGBOptions extends GetDominantColorBaseOptions {
    returnRGB?: true;
}

interface GetDominantColorHexOptions extends GetDominantColorBaseOptions {
    returnRGB: false;
}

export async function getDominantColor(imgURL: string, options?: GetDominantColorRGBOptions): Promise<number>;
export async function getDominantColor(imgURL: string, options: GetDominantColorHexOptions): Promise<string>;
export async function getDominantColor(
    imgURL: string,
    {
        returnRGB = true,
        minLuminance = 0.4
    }: GetDominantColorRGBOptions | GetDominantColorHexOptions = {}
): Promise<number | string> {
    try {
        const img = await loadImage(imgURL)
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0, img.width, img.height)
        const data = ctx.getImageData(0, 0, img.width, img.height).data

        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
            r += data[i]
            g += data[i + 1]
            b += data[i + 2]
            count++
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        let color = chroma.rgb(r, g, b)

        let [L, a, b2] = color.oklab()
        if (L < minLuminance) {
            color = chroma.oklab(minLuminance, a, b2)
        }

        return returnRGB
            ? color.num()
            : color.hex().toUpperCase();
    } catch (err) {
        console.error(err)
        return returnRGB ? 0x000000 : '#000000'
    }
}

export const svgToBase64 = (svg: string) => {
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}