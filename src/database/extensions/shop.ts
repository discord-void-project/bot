import { Prisma } from '../core/client'

export const shopExtension = Prisma.defineExtension({
    result: {
        shop: {
            isOpen: {
                needs: {
                    isOpen: true,
                    expiresAt: true
                },
                compute({ isOpen, expiresAt }) {
                    if (!expiresAt || !isOpen) return isOpen;

                    const now = new Date();
                    const expiresDate = new Date(expiresAt);

                    return now < expiresDate;
                }
            },
        },
    },
})