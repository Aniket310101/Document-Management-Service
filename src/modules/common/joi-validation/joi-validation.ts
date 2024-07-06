import { Schema, ValidationResult } from 'joi';
import ErrorHandler from '../errors/error-handler';
import { ErrorCodeEnums } from '../errors/error.enums';

class JoiValidation {
  public extractAndValidate<T>(requestBody: any, schema: Schema): T {
    console.log('Bode: ', requestBody);
    const result: ValidationResult = schema.validate(requestBody, {abortEarly: false});
    console.log('Result: ', result);
    if (result.error) {
      throw new ErrorHandler(ErrorCodeEnums.BAD_REQUEST, `Validation failed: ${result.error.details.map(x => x.message).join(', ')}`);
    }
    
    return result.value as T;
  }
}

export default JoiValidation;