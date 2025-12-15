import { MemberVaultCapacityTier } from '@/database/core/enums'
import db from '@/database/db'
import { tierCapacity, tierCapacityCost } from './member-vault'

const find = async (
	userId: string,
	guildId: string,
) => {
	return await db.memberVault.findUnique({
		where: {
			userId_guildId: {
				userId,
				guildId
			}
		}
	});
}

const updateOrCreate = async (
	userId: string,
	guildId: string,
	data?: any
) => {
	return await db.memberVault.upsert({
		where: { userId_guildId: { userId, guildId } },
		update: data?.update ?? {},
		create: {
			...data?.create,
			member: {
				connectOrCreate: {
					where: { userId_guildId: { userId, guildId } },
					create: {
						user: {
							connectOrCreate: {
								where: { id: userId },
								create: { id: userId },
							},
						},
						guild: {
							connectOrCreate: {
								where: { id: guildId },
								create: { id: guildId },
							},
						},
					},
				},
			},
		},
	})
}

const findOrCreate = async (userId: string, guildId: string, data?: any) => {
	return await updateOrCreate(userId, guildId, {
		create: data
	});
}

const addFunds = async (userId: string, guildId: string, amount: number) => {
	return await updateOrCreate(userId, guildId, {
		create: {
			funds: amount
		},
		update: {
			funds: {
				increment: amount
			}
		}
	});
}

const removeFunds = async (userId: string, guildId: string, amount: number) => {
	return await updateOrCreate(userId, guildId, {
		create: {
			funds: amount
		},
		update: {
			funds: {
				decrement: amount
			}
		}
	});
}

const setFunds = async (userId: string, guildId: string, amount: number) => {
	return await updateOrCreate(userId, guildId, {
		create: {
			funds: amount
		},
		update: {
			funds: amount
		}
	});
}

const getNextTier = async (userId: string, guildId: string) => {
	const memberBank = await findOrCreate(userId, guildId);
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
};

const upgradeTier = async (userId: string, guildId: string) => {
	const newTier = await getNextTier(userId, guildId);
	if (!newTier) return;

	return await updateOrCreate(userId, guildId, {
		update: { tier: newTier.value }
	});
}

export const memberBankService = {
	find,
	findOrCreate,
	updateOrCreate,
	addFunds,
	removeFunds,
	setFunds,
	getNextTier,
	upgradeTier,
}
