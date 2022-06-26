import { BaseError, ErrorMessage} from "./base-error";

export class BadRequestError extends BaseError {
    statusCode = 400;

    constructor(public message: string) {
        super(message);

        Object.setPrototypeOf(this, BadRequestError.prototype)
    }

    getErrors(): ErrorMessage[] {
        return [{message: this.message}]
    }
}