import { Unit } from "../../index.ts"

// export const slimeOneUnit = { joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}}
// export const slimeTwoUnit = { joinNumber: 2, name: "OPSlime", defaultStatus: {hp: 6, atk: 2, def: 1}}

export const DEFAULT_UNITS = new Map<string, Unit>([
    ["1", { joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}}],
    ["2", { joinNumber: 2, name: "OPSlime", defaultStatus: {hp: 6, atk: 2, def: 1}}]
]);

export function getDefaultUnit(unitId: string): Unit {
    return DEFAULT_UNITS.get(unitId) || { joinNumber: 0, name: "Broken", defaultStatus: {hp: 1, atk: 1, def: 1}}
}