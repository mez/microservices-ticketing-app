import { ValidationError } from "express-validator";
import { BaseError } from './base-error'

export class RequestValidationError extends BaseError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters');


        // only because built in class
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    getErrors() {
        return this.errors.map( e => {
            return {
                message: e.msg,
                field: e.param
            }
        })
    }
}