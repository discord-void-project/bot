import { guildModuleService } from '@/database/services'
import { defaultGuildModuleSettings } from '@/database/utils'
import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [moduleName] }) {
        if (!moduleName) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Euh.. Je crois que tu as oublié de mettre le nom du module que tu veux reset hehe..`)
                ]
            });
        }

        if (!(moduleName in defaultGuildModuleSettings)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Mhh.. Je ne trouves pas de module avec ce nom, t'es certain d'avoir utilisé le bon nom ? 🤔`)
                ]
            });
        }

        await guildModuleService.resetSettings({
            guildId: message.guild.id,
            moduleName: moduleName as any
        });

        return await message.reply({
            embeds: [
                EmbedUI.createSuccessMessage({
                    title: `🔍 Debug - Reset d'un module de serveur`,
                    description: `Youpi ! J'ai fini de reset le module tout est bon :)`
                })
            ]
        });
    }
});
