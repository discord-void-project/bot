import { svgToBase64 } from '@/utils/image'
import chroma from 'chroma-js'

export const levelUpCardBorderBottom = ({ leftSide, rightSide }: { leftSide: string; rightSide: string; }) => {
    const rgb = chroma(leftSide).rgb();
    const colorMatrix = `${rgb[0] / 255} 0 0 0 0 ${rgb[1] / 255} 0 0 0 0 ${rgb[2] / 255} 0 0 0 0 0 0 1 0`;

    return svgToBase64(`
        <svg xmlns="http://www.w3.org/2000/svg" width="131" height="12" viewBox="0 0 131 12" fill="none">
            <g filter="url(#filter0_d_13_2)">
                <path d="M13.5 2H22.5L11.5 12H2L13.5 2Z" fill="${leftSide}"/>
            </g>
            <g filter="url(#filter1_d_13_2)">
                <path d="M28.5 2H37.5L26.5 12H17L28.5 2Z" fill="${leftSide}"/>
            </g>
            <g filter="url(#filter2_d_13_2)">
                <path d="M43.5 2H52.5L41.5 12H32L43.5 2Z" fill="${leftSide}"/>
            </g>
            <path d="M58.5 2H131L120 12H47L58.5 2Z" fill="${rightSide}"/>
            <defs>
                <filter id="filter0_d_13_2" x="0" y="0" width="24.5" height="14" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset/>
                    <feGaussianBlur stdDeviation="1"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="${colorMatrix}"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_2"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_2" result="shape"/>
                </filter>
                <filter id="filter1_d_13_2" x="15" y="0" width="24.5" height="14" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset/>
                    <feGaussianBlur stdDeviation="1"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="${colorMatrix}"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_2"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_2" result="shape"/>
                </filter>
                <filter id="filter2_d_13_2" x="30" y="0" width="24.5" height="14" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset/>
                    <feGaussianBlur stdDeviation="1"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="${colorMatrix}"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_13_2"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_13_2" result="shape"/>
                </filter>
            </defs>
        </svg>
    `);
};