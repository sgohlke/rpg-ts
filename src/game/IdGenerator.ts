export class IdGenerator {
    public static getInstance(): IdGenerator {
        if (!IdGenerator.instance) {
            IdGenerator.instance = new IdGenerator()
        }
        return IdGenerator.instance
    }
    private static instance: IdGenerator
    private playerIdCounter: number = 1
    private unitIdCounter: number = 1
    private constructor() {}

    public resetCounters(): void {
        this.playerIdCounter = 1
        this.unitIdCounter = 1
    }

    public generatePlayerId(): string {
        return "p" + this.playerIdCounter++
    }

    public generateUnitId(): string {
        return "u" + this.unitIdCounter++
    }
}
