import { MediaGalleryBuilder, MediaGalleryItemData } from 'discord.js'

export const createMediaGallery = (items: MediaGalleryItemData[]) => {
    return new MediaGalleryBuilder({ items }).toJSON();
}