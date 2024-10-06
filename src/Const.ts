export const ERROR_CODE_STILL_IN_COOLDOWN = 499
export const ERROR_CODE_NOT_FOUND = 598
export const ERROR_CODE_SLOT_EMPTY = 491

export const MonsterEnum = {
    Chicken: 'chicken',
    Yellow_Slime: 'yellow_slime',
    Green_Slime: 'green_slime',
    Blue_Slime: 'blue_slime',
    Red_Slime: 'red_slime',
    Cow: 'cow',
    Mushmush: 'mushmush',
    Flying_Serpent: 'flying_serpent',
    Wolf: 'wolf',
    Skeleton: 'skeleton',
    Pig: 'pig',
    Ogre: 'ogre',
    Vampire: 'vampire',
    Bandit_Lizard: 'bandit_lizard',
    Death_Knight: 'death_knight',
    Imp: 'imp',
    Owlbear: 'owlbear',
    Demon: 'demon',
    Lich: 'lich',
    Cultist_Acolyte: 'cultist_acolyte',
    Cultist_Emperor: 'cultist_emperor',
    Bat: 'bat',
    Rosenblood: 'rosenblood',
} as const

export type MonsterEnum = (typeof MonsterEnum)[keyof typeof MonsterEnum]

export const ItemTypeEnum = {
    Weapon: 'weapon', // Keep weapon on top for changeEquipementForMonster()
    Shield: 'shield',
    Helmet: 'helmet',
    BodyArmor: 'body_armor',
    LegArmor: 'leg_armor',
    Boots: 'boots',
    Ring1: 'ring1',
    Ring2: 'ring2',
    Amulet: 'amulet',
    Artifact1: 'artifact1',
    Artifact2: 'artifact2',
    Artifact3: 'artifact3',
    Consumable1: 'consumable1',
    Consumable2: 'consumable2',
} as const

export type ItemTypeEnum = (typeof ItemTypeEnum)[keyof typeof ItemTypeEnum]

export const ItemEffectEnum = {
    Attack_Fire: 'attack_fire',
    Attack_Water: 'attack_water',
    Attack_Earth: 'attack_earth',
    Attack_Air: 'attack_air',
    Damage_Fire: 'dmg_fire',
    Damage_Water: 'dmg_water',
    Damage_Earth: 'dmg_earth',
    Damage_Air: 'dmg_air',
    Resistance_Fire: 'res_fire',
    Resistance_Water: 'res_water',
    Resistance_Earth: 'res_earth',
    Resistance_Air: 'res_air',
    Hit_Point: 'hp',
    Haste: 'haste',
    Mining: 'mining',
    Woodcutting: 'woodcutting',
    Fishing: 'fishing',
}
export type ItemEffectEnum = (typeof ItemEffectEnum)[keyof typeof ItemEffectEnum]
