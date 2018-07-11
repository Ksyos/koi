import * as Joi from 'joi';
import { values } from 'lodash';
import * as moment from 'moment';

export interface IKoi extends Joi.Root {
    string(): IStringSchema;
    koi(): IKoiSchema;
}

export interface IStringSchema extends Joi.StringSchema {
    newPasswordRepeat(): this;
    totpToken(): this;
    registrationCode(): this;
    elfproef(): this;
    numeric(): this;
    ledgerNumber(): this;
    rangeNumberWithTwoDecimals(): this;
    simpleEmail(): this;
}

export interface IKoiSchema extends Joi.AnySchema {
    time(): this;
    date(): this;
    endDate(): this;
    enum<E extends { [P in keyof E]: string }>(jsEnum: E): this;
    paging(): this;
}

export const Koi: IKoi = Joi.extend([
    {
        name: 'koi',
        language: {
            time: 'needs to be a valid time string',
            date: 'needs to be a valid date string',
            endDate: 'needs to be larger than or equal to start date',
            missingStartDate: 'a startDate field is missing',
            enum: 'needs to be an enum value',
            paging: 'needs to be a paging value',
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
                    if (values(params.jsEnum).includes(value)) {
                        return value;
                    } else {
                        return this.createError('koi.enum', {}, state, options);
                    }
                },
            },
            {
                name: 'paging',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (value && typeof value.limit === 'number' && typeof value.offset === 'number' &&
                        value.limit > 0 && value.offset >= 0) {
                        return value;
                    } else {
                        return this.createError('koi.paging', {}, state, options);
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
            rangeNumberWithTwoDecimals: 'needs to be a number between 0 and 9 with two decimals',
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
                name: 'rangeNumberWithTwoDecimals',
                validate(params: {}, value: any, state: Joi.State, options: Joi.ValidationOptions) {
                    if (typeof value === 'string' && /^[0-8],[0-9]{2}$|^9,00$/.test(value)) {
                        return value;
                    } else {
                        return this.createError('string.rangeNumberWithTwoDecimals', {}, state, options);
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
