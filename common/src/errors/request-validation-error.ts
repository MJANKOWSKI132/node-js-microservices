import { ValidationError } from 'express-validator';
import { CommonErrorStructure } from './common-error-structure';
import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters');
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors(): CommonErrorStructure[] {
        return this.errors
            .map(error => {
                if (error.param === '_error') {
                    return { message: error.msg, field: error.location } as CommonErrorStructure;
                }
                return undefined;
            })
            .filter((item): item is CommonErrorStructure => item !== undefined);
    }
}