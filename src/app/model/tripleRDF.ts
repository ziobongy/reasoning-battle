export class TripleRDF <T>{
    private subject: string;
    private condition: string;
    private value: () => T;
    private unaryCondition: ((x: T) => boolean) | ((x: T, y: T) => boolean) | undefined;
    private description: string | undefined;
    // @ts-ignore
    constructor(
        subject: string,
        condition: '<' | '>' |'<=' | '>=' | '==' | '!=' | 'isEmpty' | 'distance',
        value: () => T,
        unaryCondition?: ((x: T) => boolean) | ((x: T, y: T) => boolean),
        description?: string
    ) {
        this.subject = subject;
        this.condition = condition;
        this.value = value;
        this.unaryCondition = unaryCondition;
        this.description = description;
    }

    get resource(): string {
        return this.subject;
    }

    get getCondition(): string {
        return this.condition;
    }

    get getValue(): T {
        return this.value();
    }
    get isUnary(): boolean {
        return this.unaryCondition != null;
    }
    get getDescription() {
        return this.description;
    }

    compute(actualValueOfResource: T): boolean {
        // tslint:disable-next-line:no-eval
        return eval(actualValueOfResource + this.condition + this.value());
    }

    computeUNary(x: T, y?: T): boolean {
        if (this.unaryCondition == null) {
            return false;
        }
        if (y != null) {
            return this.unaryCondition(x, y);
        }
        // @ts-ignore
        return this.unaryCondition(x);
    }
}
