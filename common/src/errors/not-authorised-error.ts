import { CommonErrorStructure } from "./common-error-structure";
import { CustomError } from "./custom-error";

export class NotAuthorisedError extends CustomError {
    statusCode = 401;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotAuthorisedError.prototype);
    }

    serializeErrors(): CommonErrorStructure[] {
        return [
            {
                message: 'Not Authorised'
            }
        ];
    }
}