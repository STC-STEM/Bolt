export interface IServiceConstructor<T extends ServiceBase> {
    new (): T
}

export abstract class ServiceBase {
    constructor() {

    }

    abstract initialize(): void
}
