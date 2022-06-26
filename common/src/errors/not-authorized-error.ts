import { BaseError, ErrorMessage} from "./base-error";

export class NotAuthorizedError extends BaseError {
    statusCode = 401;

    constructor() {
        super('Not Authorized.');

        Object.setPrototypeOf(this, NotAuthorizedError.prototype)
    }

    getErrors(): ErrorMessage[] {
        return [{message: 'Not Authorized.'}]
    }
}