import Canvas from '@napi-rs/canvas'
import { request } from 'undici'
import chroma from 'chroma-js'

import { levelUpCardBg } from './bg'
import { levelUpCardBorderBottom } from './borderBottom'
import { levelUpCardBorderTop } from './borderTop'

interface LevelUpCardOptions {
    username: string;
    avatarURL: string;
    accentColor: string;
    newLevel: string | number;
}

export const levelUpCard = async ({
    username,
    avatarURL,
    accentColor,
    newLevel
}: LevelUpCardOptions) => {
    const canvas = Canvas.createCanvas(268, 96);
    const ctx = canvas.getContext('2d');                
    
    function isDark(color: string) {
        return chroma(color).luminance() < 0.2;
    }

    let bgColor = null;
    let textColor = null;

    if (isDark(accentColor)) {
        accentColor = chroma.mix(accentColor, 'white', 0.4, 'oklab').hex();
        bgColor = chroma.mix(accentColor, 'white', 0.5, 'oklab').hex();
        textColor = '#FFFFFF';
    } else {
        bgColor = chroma.mix(accentColor, 'black', 0.4, 'oklab').hex();
        textColor = chroma.mix(accentColor, 'white', 0.2, 'oklab').hex();
    }

    const lightColor = chroma.mix(accentColor, 'white', 0.8, 'oklab').hex();
    const blackColor = chroma.mix(accentColor, 'white', 0.2, 'oklab').hex();

    const bgImage = await Canvas.loadImage(levelUpCardBg({ fill: bgColor, stroke: accentColor }));
    ctx.drawImage(bgImage, 0, 0, 268, 96);

    const borderTop = await Canvas.loadImage(levelUpCardBorderTop({ fill: blackColor }));
    ctx.drawImage(borderTop, 243, 0, 25, 23);

    const borderBottom = await Canvas.loadImage(levelUpCardBorderBottom({ leftSide: lightColor, rightSide: blackColor }));
    ctx.drawImage(borderBottom, 139, 86, 129, 10);

    const { body } = await request(avatarURL);
    const avatar = await Canvas.loadImage(await body.arrayBuffer());

    ctx.font = `14px Quantico Bold`;
    ctx.fillStyle = textColor;
    ctx.fillText(username.toUpperCase(), 110, (canvas.height / 2) - 14);

    ctx.font = `22px Quantico Bold`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`NIVEAU ${newLevel}`, 110, (canvas.height / 2) + 8);

    ctx.beginPath();
    ctx.arc(96 / 2, 96 / 2, (96 / 2) - 4, 0, Math.PI * 2, true);
    ctx.closePath();

    ctx.lineWidth = 8;
    ctx.strokeStyle = accentColor; 
    ctx.stroke();
    
    ctx.clip();

    ctx.drawImage(avatar, 0, 0, 96, 96);

    return await canvas.encode('png');
}