import * as Joi from 'joi';
import { values } from 'lodash';
import * as moment from 'moment';

export interface IKoi extends Joi.Root {
    string(): IStringSchema;
    koi(): IKoiSchema;
    numberAsString(): INumberAsStringSchema;
}

export interface IStringSchema extends Joi.StringSchema {
    newPasswordRepeat(): this;
    totpToken(): this;
    registrationCode(): this;
    elfproef(): this;
    numeric(): this;
    ledgerNumber(): this;
    simpleEmail(): this;
}

export interface IKoiSchema extends Joi.AnySchema {
    time(): this;
    timeWithoutSeconds(): this;
    date(): this;
    datetime(): this;
    endDate(): this;
    enum<E extends { [P in keyof E]: string }>(jsEnum: E): this;
}

export interface INumberAsStringSchema extends Joi.AnySchema {
    min(limit: number): this;
    max(limit: number): this;
    greater(limit: number): this;
    less(limit: number): this;
    decimal(decimalSeparator: '.' | ',', digits: number): this;
    decimalSeparator(decimalSeparator: '.' | ','): this;
    minDecimals(digits: number): this;
    maxDecimals(digits: number): this;
}

export const Koi: IKoi = Joi.extend([
    {
        name: 'koi',
        language: {
            time: 'needs to be a valid time string',
            timeWithoutSeconds: 'needs to be a valid time without seconds string',
            date: 'needs to be a valid date string',
            datetime: 'needs to be a valid datetime string',
            endDate: 'needs to be larger than or equal to start date',
            missingStartDate: 'a startDate field is missing',
            enum: 'needs to be an enum value',
        },
        rules: [
            {
                name: 'time',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && moment(value, 'HH:mm:ss', true).isValid()) {
                        return value;
                    } else {
                        return this.createError('koi.time', {}, state, options);
                    }
                },
            },
            {
                name: 'timeWithoutSeconds',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && moment(value, 'HH:mm', true).isValid()) {
                        return value;
                    } else {
                        return this.createError('koi.timeWithoutSeconds', {}, state, options);
                    }
                },
            },
            {
                name: 'date',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && moment(value, 'YYYY-MM-DD', true).isValid()) {
                        return value;
                    } else {
                        return this.createError('koi.date', {}, state, options);
                    }
                },
            },
            {
                name: 'datetime',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && moment(value, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                        return value;
                    } else {
                        return this.createError('koi.datetime', {}, state, options);
                    }
                },
            },
            {
                name: 'endDate',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (state.parent.startDate === undefined) {
                        return this.createError('koi.missingStartDate', {}, state, options);
                    } else if (state.parent.startDate === null || value === null) {
                        return value;
                    } else if (moment(value).isSameOrAfter(state.parent.startDate)) {
                        return value;
                    } else {
                        return this.createError('koi.endDate', {}, state, options);
                    }
                },
            },
            {
                name: 'enum',
                params: { jsEnum: Joi.object().pattern(/.*/, Joi.string().required()) },
                validate(params: { jsEnum: { [key: string]: string } }, value: any, state: Joi.State,
                         options: Joi.ValidationOptions) {
                    if (values(params.jsEnum).indexOf(value) >= 0) {
                        return value;
                    } else {
                        return this.createError('koi.enum', {}, state, options);
                    }
                },
            },
        ],
    },
    {
        name: 'string',
        base: Joi.string(),
        language: {
            newPasswordRepeat: 'needs to match the new password',
            totpToken: 'needs to be a string of six digits',
            registrationCode: 'needs to be a string of 12 upper case letters',
            elfproef: 'needs to pass the elfproef',
            numeric: 'needs to be a string consisting of only numbers',
            ledgerNumber: 'needs to be a string consisting of 4 digits',
            simpleEmail: 'needs to be a valid email address',
        },
        rules: [
            {
                name: 'newPasswordRepeat',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (value === state.parent.newPassword) {
                        return value;
                    } else {
                        return this.createError('string.newPasswordRepeat', {}, state, options);
                    }
                },
            },
            {
                name: 'totpToken',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^\d{6}$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.totpToken', {}, state, options);
                    }
                },
            },
            {
                name: 'registrationCode',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^[A-Z]{12}$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.registrationCode', {}, state, options);
                    }
                },
            },
            {
                name: 'elfproef',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && elfproef(value)) {
                        return value;
                    } else {
                        return this.createError('string.elfproef', {}, state, options);
                    }
                },
            },
            {
                name: 'numeric',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^[0-9]*$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.numeric', {}, state, options);
                    }
                },
            },
            {
                name: 'ledgerNumber',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^[0-9]{4}$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.ledgerNumber', {}, state, options);
                    }
                },
            },
            {
                name: 'simpleEmail',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^.+@.+$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.simpleEmail', {}, state, options);
                    }
                },
            },
        ],
    },
    {
        name: 'numberAsString',
        language: {
            notAString: 'needs to be a number as a string',
            notANumber: 'needs to be a number',
            leadingZero: 'must not have a leading zero',
            negativeZero: 'must not be negative zero',
            decimalSeparator: 'needs the correct decimal separator',
            minDecimals: 'needs to have more decimals',
            maxDecimals: 'needs to have fewer decimals',
            min: 'needs to be higher',
            max: 'needs to be lower',
            greater: 'needs to be higher',
            less: 'needs to be lower',
        },
        pre(value: any, state: Joi.State, options: Joi.ValidationOptions) {
            if (typeof value !== 'string') {
                return this.createError('numberAsString.notAString', {}, state, options);
            }

            if (options.convert) {
                value = value.trim();
            }

            let i = 0;
            let negative = false;
            if (value[i] === '-') {
                negative = true;
                i++;
            }

            if (i === value.length) {
                return this.createError('numberAsString.notANumber', {}, state, options);
            }

            const wrongLeadingZero = value[i] === '0' && i + 1 < value.length && !/[.,]/.test(value[i + 1]);

            let decimalSeparator;
            while (i < value.length) {
                if (/[.,]/.test(value[i])) {
                    decimalSeparator = value[i];
                    i++;
                    break;
                } else if (/[0-9]/.test(value[i])) {
                    i++;
                } else {
                    return this.createError('numberAsString.notANumber', {}, state, options);
                }
            }

            const indexBeforeDecimals = i;
            while (i < value.length) {
                if (/[0-9]/.test(value[i])) {
                    i++;
                } else {
                    return this.createError('numberAsString.notANumber', {}, state, options);
                }
            }
            const decimals = i - indexBeforeDecimals;

            if (decimalSeparator && decimals === 0) {
                return this.createError('numberAsString.notANumber', {}, state, options);
            }
            if (decimalSeparator && decimalSeparator !== (this as any)._flags._decimalSeparator) {
                return this.createError('numberAsString.decimalSeparator', {}, state, options);
            }
            if (wrongLeadingZero) {
                return this.createError('numberAsString.leadingZero', {}, state, options);
            }
            if (negative && numberFromString(value, this) === 0) {
                return this.createError('numberAsString.negativeZero', {}, state, options);
            }
            if (decimals > (this as any)._flags._maxDecimals) {
                return this.createError('numberAsString.maxDecimals', {}, state, options);
            }
            if (decimals < (this as any)._flags._minDecimals) {
                return this.createError('numberAsString.minDecimals', {}, state, options);
            }

            return value as any;
        },
        rules: [
            {
                name: 'decimal',
                params: { decimalSeparator: Joi.only('.', ','), digits: Joi.number() },
                setup(params: { decimalSeparator: '.' | ',', digits: number }) {
                    (this as any)._flags._decimalSeparator = params.decimalSeparator;
                    (this as any)._flags._minDecimals = params.digits;
                    (this as any)._flags._maxDecimals = params.digits;
                },
            },
            {
                name: 'decimalSeparator',
                params: { decimalSeparator: Joi.only('.', ',') },
                setup(params: { decimalSeparator: '.' | ',' }) {
                    (this as any)._flags._decimalSeparator = params.decimalSeparator;
                },
            },
            {
                name: 'minDecimals',
                params: { digits: Joi.number() },
                setup(params: { digits: number }) {
                    (this as any)._flags._minDecimals = params.digits;
                },
            },
            {
                name: 'maxDecimals',
                params: { digits: Joi.number() },
                setup(params: { digits: number }) {
                    (this as any)._flags._maxDecimals = params.digits;
                },
            },
            {
                name: 'min',
                params: { limit: Joi.number() },
                validate(params: { limit: number }, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (numberFromString(value, this) >= params.limit) {
                        return value as any;
                    } else {
                        return this.createError('numberAsString.min', {}, state, options);
                    }
                },
            },
            {
                name: 'max',
                params: { limit: Joi.number() },
                validate(params: { limit: number }, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (numberFromString(value, this) <= params.limit) {
                        return value as any;
                    } else {
                        return this.createError('numberAsString.max', {}, state, options);
                    }
                },
            },
            {
                name: 'greater',
                params: { limit: Joi.number() },
                validate(params: { limit: number }, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (numberFromString(value, this) > params.limit) {
                        return value as any;
                    } else {
                        return this.createError('numberAsString.greater', {}, state, options);
                    }
                },
            },
            {
                name: 'less',
                params: { limit: Joi.number() },
                validate(params: { limit: number }, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (numberFromString(value, this) < params.limit) {
                        return value as any;
                    } else {
                        return this.createError('numberAsString.less', {}, state, options);
                    }
                },
            },
        ],
    },
]);

function elfproef(bsn: string): boolean {
    if (bsn.length < 8 || bsn.length > 9) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < bsn.length; i++) {
        sum += parseInt(bsn[i], 10) * (i === bsn.length - 1 ? -1 : (bsn.length - i));
    }

    return sum % 11 === 0;
}

function numberFromString(value: string, joi: any) {
    if (joi._flags._decimalSeparator === ',') {
        return Number(value.replace(',', '.'));
    } else {
        return Number(value);
    }
}
