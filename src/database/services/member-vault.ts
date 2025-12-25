import db from '@/database/db'

import {
    MemberVaultCreateInput,
    MemberVaultFindUniqueArgs,
    MemberVaultGetPayload,
    MemberVaultModel,
    MemberVaultUpdateInput,
    MemberVaultUpsertArgs,
} from '@/database/core/models'
import { memberService } from './member'
import { MemberVaultCapacityTier } from '../core/enums'

export type MemberVaultCreateInputWithoutUserAndGuild = Omit<MemberVaultCreateInput, 'member'>

interface MemberVaultWhere {
    guildId: string
    userId: string
}

interface BaseNumberFieldData {
    field: keyof MemberVaultModel
}

interface NumberFieldUpdateData extends BaseNumberFieldData {
    amount: number;
}

interface NumberFieldSetData extends BaseNumberFieldData {
    value: number;
}

interface NumberFieldOptions {
    max?: number
    min?: number
}

interface TierCapacityData {
    [currency: string]: {
        capacity: number;
        stealChanceIncrease: number;
    }
}

export const tierCapacity: Record<string, TierCapacityData> = {
    TIER_0: {
        guildCoins: {
            capacity: 50_000,
            stealChanceIncrease: 0
        }
    },
    TIER_1: {
        guildCoins: {
            capacity: 75_000,
            stealChanceIncrease: 2.5
        }
    },
    TIER_2: {
        guildCoins: {
            capacity: 150_000,
            stealChanceIncrease: 5
        }
    },
    TIER_3: {
        guildCoins: {
            capacity: 225_000,
            stealChanceIncrease: 7.5
        }
    },
    TIER_4: {
        guildCoins: {
            capacity: 300_000,
            stealChanceIncrease: 10
        }
    },
    TIER_5: {
        guildCoins: {
            capacity: 375_000,
            stealChanceIncrease: 12.5
        }
    },
    TIER_6: {
        guildCoins: {
            capacity: 450_000,
            stealChanceIncrease: 15
        }
    },
    TIER_7: {
        guildCoins: {
            capacity: 525_000,
            stealChanceIncrease: 17.5
        },
    },
    TIER_8: {
        guildCoins: {
            capacity: 600_000,
            stealChanceIncrease: 20
        }
    },
}

export const tierCapacityCost = {
    TIER_0: 0,
    TIER_1: 12_500,
    TIER_2: 25_000,
    TIER_3: 37_500,
    TIER_4: 50_000,
    TIER_5: 62_500,
    TIER_6: 75_000,
    TIER_7: 87_500,
    TIER_8: 100_000,
}

interface TierSecurityData {
    vaultStealBonus: number;
    protectionDuration: number;
}

export const tierSecurity: Record<string, TierSecurityData> = {
    TIER_0: {
        vaultStealBonus: 0,
        protectionDuration: 0
    },
    TIER_1: {
        vaultStealBonus: -5,
        protectionDuration: 45
    },
    TIER_2: {
        vaultStealBonus: -7.5,
        protectionDuration: 90
    },
}

// X + (27500 * TIER)
export const tierSecurityCost = {
    TIER_0: 0,
    TIER_1: 100_000,
    TIER_2: 155_000,
}

class MemberVaultService {
    constructor(public model: typeof db.memberVault) { }

    // -- Utils -- //
    private _buildWhere(where: MemberVaultWhere) {
        return { userId_guildId: where }
    }

    private _connectOrCreateMember(where: MemberVaultWhere) {
        return {
            member: {
                connectOrCreate: {
                    where: {
                        userId_guildId: where
                    },
                    create: {
                        user: {
                            connectOrCreate: {
                                where: { id: where.userId },
                                create: { id: where.userId }
                            }
                        },
                        guild: {
                            connectOrCreate: {
                                where: { id: where.guildId },
                                create: { id: where.guildId }
                            }
                        }
                    }
                }
            }
        };
    }

    private async _updateNumberField(
        where: MemberVaultWhere,
        data: NumberFieldUpdateData,
        options?: NumberFieldOptions
    ) {
        const vault = await this.findOrCreate(where);

        const currentValue = vault[data.field] as number;
        const newValue = Math.clamp(currentValue + data.amount, options?.min ?? 0, options?.max ?? Infinity);

        return await this.update(where, {
            [data.field]: newValue
        });
    }

    private async _setNumberField(
        where: MemberVaultWhere,
        data: NumberFieldSetData,
        options?: NumberFieldOptions
    ) {
        return this.updateOrCreate(where, {
            [data.field]: Math.clamp(data.value, options?.min ?? 0, options?.max ?? Infinity)
        });
    }

    // -- CRUD -- //
    async findById<Options extends Omit<MemberVaultFindUniqueArgs, 'where'>>(
        where: MemberVaultWhere,
        options?: Options
    ) {
        return await this.model.findUnique({
            ...options,
            where: this._buildWhere(where)
        }) as MemberVaultGetPayload<Options>;
    }

    async findOrCreate<Options extends Omit<MemberVaultUpsertArgs, 'where' | 'update' | 'create'>>(
        where: MemberVaultWhere,
        options?: Options & {
            data?: Partial<MemberVaultCreateInputWithoutUserAndGuild>
        },
    ) {
        const { data, ...props } = options ?? {}

        return await this.model.upsert({
            ...props,
            where: this._buildWhere(where),
            update: {},
            create: {
                ...data,
                ...this._connectOrCreateMember(where)
            }
        }) as unknown as MemberVaultGetPayload<Options>
    }

    async updateOrCreate<Options extends Omit<MemberVaultUpsertArgs, 'where' | 'update' | 'create'>>(
        where: MemberVaultWhere,
        data: Partial<MemberVaultCreateInputWithoutUserAndGuild>,
        options?: Options
    ) {
        return await this.model.upsert({
            ...options,
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                ...this._connectOrCreateMember(where)
            }
        }) as unknown as MemberVaultGetPayload<Options>
    }

    async create(where: MemberVaultWhere, data?: MemberVaultCreateInputWithoutUserAndGuild) {
        return await this.model.create({
            data: {
                ...this._connectOrCreateMember(where),
                ...data
            }
        })
    }

    async update(where: MemberVaultWhere, data: MemberVaultUpdateInput) {
        return await this.model.update({
            where: this._buildWhere(where),
            data
        });
    }

    async delete(where: MemberVaultWhere) {
        return await this.model.delete({ where: this._buildWhere(where) });
    }

    // -- Guild Points -- //
    async addGuildCoins(where: MemberVaultWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'guildCoins',
            amount
        }, options);
    }

    async removeGuildCoins(where: MemberVaultWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'guildCoins',
            amount: -amount
        }, options);
    }

    async setGuildCoins(where: MemberVaultWhere, value: number, options?: NumberFieldOptions) {
        return await this._setNumberField(where, {
            field: 'guildCoins',
            value
        }, options);
    }

    async withdrawGuildCoins(where: MemberVaultWhere, amount: number | 'all') {
        const vault = await this.findOrCreate(where);

        return await db.$transaction(async (tx) => {
            if (vault.guildCoins <= 0) {
                throw new Error('The vault is empty');
            }

            let toWithdraw: number

            if (amount === 'all') {
                toWithdraw = vault.guildCoins;
            } else {
                toWithdraw = Math.clamp(amount, 0, vault.guildCoins);
            }

            const vaultCtx = Object.create(this, {
                model: { value: tx.memberVault }
            });

            const memberCtx = Object.create(memberService, {
                model: { value: tx.member }
            });

            await this.removeGuildCoins.call(vaultCtx, where, toWithdraw);
            await memberService.addGuildCoins.call(memberCtx, where, toWithdraw);

            return Object.assign(await this.findById(where), {
                withdrawn: toWithdraw
            });
        });
    }

    // -- Tiers -- //
    async getNextTier(where: MemberVaultWhere) {
        const memberBank = await this.findOrCreate(where);
        const currentTier = memberBank.capacityTier;

        const tiers = Object.values(MemberVaultCapacityTier);
        const currentIndex = tiers.indexOf(currentTier);
        const nextIndex = currentIndex + 1;

        if (nextIndex >= tiers.length) {
            return null;
        }

        const nextTier = tiers[nextIndex];

        return {
            value: nextTier,
            cost: tierCapacityCost[nextTier],
            capacity: tierCapacity[nextTier],
        };
    }

    async upgradeTier(where: MemberVaultWhere) {
        const newTier = await this.getNextTier(where);
        if (!newTier) return;

        return await this.updateOrCreate(where, {
            capacityTier: newTier.value
        });
    }

    async downgradeTier() {
        //    
    }

    async resetTier() {
        // 
    }
}

export const memberVaultService = new MemberVaultService(db.memberVault)