import { MainModule } from "./main-module";

export interface IModuleConstructor<T extends ModuleBase> {
    new (mm: MainModule): T
}

export abstract class ModuleBase {
    mainModule: MainModule

    constructor(mm: MainModule) {
        this.mainModule = mm
    }

    abstract initialize(): void
}