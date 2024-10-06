import { CooldownSchema, DestinationSchema, EquipSchemaSlotEnum, GetAllItemsItemsGetTypeEnum, ItemEffectSchema, ItemSchema, UnequipSchemaSlotEnum } from 'artifactsmmo-sdk'
import { ItemEffectEnum, ItemTypeEnum } from './Const'

export const fromCoordinatesToDestination = (x: number, y: number): DestinationSchema => {
    return { x: x, y: y } as DestinationSchema
}

export const waitForCooldown = (cooldown: CooldownSchema): Promise<void> => {
    console.log(`Waiting ${cooldown.reason} cooldown for ${cooldown.remaining_seconds}sec`)
    return new Promise(resolve => setTimeout(resolve, (cooldown.remaining_seconds + 1) * 1000))
}

export const getLowestTenOfLevel = (level: number) => {
    const lowestTen = Math.trunc(level / 10) * 10
    return lowestTen === 0 ? 1 : lowestTen
}

export const equipementFromSlotToType = (equipementSlotName: EquipSchemaSlotEnum | UnequipSchemaSlotEnum | ItemTypeEnum): GetAllItemsItemsGetTypeEnum => {
    switch (equipementSlotName) {
        case EquipSchemaSlotEnum.Weapon:
        case EquipSchemaSlotEnum.BodyArmor:
        case EquipSchemaSlotEnum.LegArmor:
        case EquipSchemaSlotEnum.Helmet:
        case EquipSchemaSlotEnum.Boots:
        case EquipSchemaSlotEnum.Shield:
        case EquipSchemaSlotEnum.Amulet:
            return equipementSlotName
        case EquipSchemaSlotEnum.Ring1:
        case EquipSchemaSlotEnum.Ring2:
            return GetAllItemsItemsGetTypeEnum.Ring
        case EquipSchemaSlotEnum.Artifact1:
        case EquipSchemaSlotEnum.Artifact2:
        case EquipSchemaSlotEnum.Artifact3:
            return GetAllItemsItemsGetTypeEnum.Artifact
        case EquipSchemaSlotEnum.Consumable1:
        case EquipSchemaSlotEnum.Consumable2:
            return GetAllItemsItemsGetTypeEnum.Consumable
        default:
            console.error(`Could not convert slot name '${equipementSlotName}' to item name`)
            return GetAllItemsItemsGetTypeEnum.Currency // whatever that is not an equipement
    }
}

export const getItemEffectByName = (item: ItemSchema, effectName: ItemEffectEnum): ItemEffectSchema | null => {
    for (const itemEffect of item.effects ?? []) {
        if (itemEffect.name === effectName) return itemEffect
    }
    return null
}
