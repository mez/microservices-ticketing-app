
export interface ErrorMessage {
    message: string;
    field?: string;
}

export abstract class BaseError extends Error {
    abstract statusCode: number;
    abstract getErrors() : ErrorMessage[];

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, BaseError.prototype);
    }
}