import { BitField } from 'discord.js'
import { PrismaUserFlags, PrismaUserFlagsString } from './PrismaUserFlags'

export class PrismaUserFlagsBitField extends BitField<PrismaUserFlagsString> {
    static Flags = PrismaUserFlags
}

export default PrismaUserFlagsBitField;