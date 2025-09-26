import { svgToBase64 } from '@/utils/image'

export const levelUpCardBorderTop = ({ fill }: { fill: string; }) => {
    return svgToBase64(`
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="23" viewBox="0 0 25 23" fill="none">
            <path d="M0 0H25L25 23L0 0Z" fill="${fill}"/>
        </svg>
    `);
};