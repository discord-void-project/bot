import { svgToBase64 } from '@/utils/image'

export const levelUpCardBg = ({ fill, stroke }: { fill: string; stroke: string; }) => {
    return svgToBase64(`
        <svg width="268" height="96" viewBox="0 0 268 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M149 81H148.254L147.69 81.4886L133.254 94H48C22.5949 94 2 73.4051 2 48C2 22.5949 22.5949 2 48 2H237.212L266 28.8691V81H149Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
        </svg>
    `);
}