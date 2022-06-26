import {BaseError} from './base-error'

export class DatabaseConnectionError extends BaseError {
    statusCode = 500;
    reason = 'Error connecting to database';

    constructor() {
        super('Error connecting to database');

        // only because built in class
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    getErrors() {
        return [
            {message: this.reason}
        ]
    }
}