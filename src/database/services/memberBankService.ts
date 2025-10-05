import { MemberBankTier, Prisma } from '@prisma/client'
import prisma from '../prisma'

export const tierCapacity = {
	TIER_0: 50_000,
	TIER_1: 75_000,
	TIER_2: 150_000,
	TIER_3: 225_000,
	TIER_4: 300_000,
	TIER_5: 375_000,
	TIER_6: 450_000,
	TIER_7: 525_000,
	TIER_8: 600_000,
}

export const tierCost = {
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

const find = async (
	userId: string,
	guildId: string,
) => {
	return await prisma.memberBank.findUnique({
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
	data?: {
		update?: Prisma.MemberBankUpdateInput
		create?: Omit<Prisma.MemberBankCreateInput, 'member' | 'memberId'>
	}
) => {
	return await prisma.memberBank.upsert({
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

const findOrCreate = async (userId: string, guildId: string, data?: Omit<Prisma.MemberBankCreateInput, 'member' | 'memberId'>) => {
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
	const currentTier = memberBank.tier;

	const tiers = Object.values(MemberBankTier);
	const currentIndex = tiers.indexOf(currentTier);
	const nextIndex = currentIndex + 1;

	if (nextIndex >= tiers.length) {
		return null;
	}

	const nextTier = tiers[nextIndex] as MemberBankTier;

	return {
		value: nextTier,
		cost: tierCost[nextTier],
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
