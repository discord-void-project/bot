import { BitField } from 'discord.js'
import { UserFlags, UserFlagsString } from './UserFlags'

export class UserFlagsBitField extends BitField<UserFlagsString> {
    static Flags = UserFlags
}

export default UserFlagsBitField;