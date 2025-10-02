import {
    ThumbnailBuilder,
    APIThumbnailComponent,
    APIUnfurledMediaItem
} from 'discord.js'

export type ThumbnailOptions = Omit<APIThumbnailComponent, 'type' | 'id' | 'media'>

export const createThumbnail = (media: APIUnfurledMediaItem, options?: ThumbnailOptions) => {
    return new ThumbnailBuilder({
        ...options,
        media: media
    }).toJSON();
}