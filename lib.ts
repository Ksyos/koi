import * as Joi from 'joi';
import { CustomHelpers } from 'joi';
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

const koiExtension: Joi.ExtensionFactory = (joi) => {
    return {
        type: 'koi',
        messages: {
            'koi.time': 'needs to be a valid time string',
            'koi.timeWithoutSeconds': 'needs to be a valid time without seconds string',
            'koi.date': 'needs to be a valid date string',
            'koi.datetime': 'needs to be a valid datetime string',
            'koi.endDate': 'needs to be larger than or equal to start date',
            'koi.missingStartDate': 'a startDate field is missing',
            'koi.enum': 'needs to be an enum value',
        },
        rules: {
            time: {
                method() {
                    return this.$_addRule('time');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && moment(value, 'HH:mm:ss', true).isValid()) {
                        return value;
                    } else {
                        return helpers.error('koi.time');
                    }
                },
            },
            timeWithoutSeconds: {
                method() {
                    return this.$_addRule('timeWithoutSeconds');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && moment(value, 'HH:mm', true).isValid()) {
                        return value;
                    } else {
                        return helpers.error('koi.timeWithoutSeconds');
                    }
                },
            },
            date: {
                method() {
                    return this.$_addRule('date');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && moment(value, 'YYYY-MM-DD', true).isValid()) {
                        return value;
                    } else {
                        return helpers.error('koi.date');
                    }
                },
            },
            datetime: {
                method() {
                    return this.$_addRule('datetime');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && moment(value, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
                        return value;
                    } else {
                        return helpers.error('koi.datetime');
                    }
                },
            },
            endDate: {
                method() {
                    return this.$_addRule('endDate');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    const ancestors = helpers.state.ancestors;
                    const startDate = ancestors.length > 0 ? ancestors[0].startDate : undefined;

                    if (startDate === undefined) {
                        return helpers.error('koi.missingStartDate');
                    } else if (startDate === null || value === null) {
                        return value;
                    } else if (moment(value).isSameOrAfter(startDate)) {
                        return value;
                    } else {
                        return helpers.error('koi.endDate');
                    }
                },
            },
            enum: {
                method(jsEnum: any) {
                    return this.$_addRule({ name: 'enum', args: { jsEnum } });
                },
                args: [
                    {
                        name: 'jsEnum',
                        ref: true,
                        assert: Joi.object().pattern(/.*/, Joi.string().required()),
                        message: 'needs to be an enum',
                    },
                ],
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (values(args.jsEnum).indexOf(value) >= 0) {
                        return value;
                    } else {
                        return helpers.error('koi.enum');
                    }
                },
            },
        },
    };
};

const stringExtension: Joi.ExtensionFactory = (joi) => {
    return {
        type: 'string',
        base: joi.string(),
        messages: {
            'string.newPasswordRepeat': 'needs to match the new password',
            'string.totpToken': 'needs to be a string of six digits',
            'string.registrationCode': 'needs to be a string of 12 upper case letters',
            'string.elfproef': 'needs to pass the elfproef',
            'string.numeric': 'needs to be a string consisting of only numbers',
            'string.ledgerNumber': 'needs to be a string consisting of 4 digits',
            'string.simpleEmail': 'needs to be a valid email address',
        },
        rules: {
            newPasswordRepeat: {
                method() {
                    return this.$_addRule('newPasswordRepeat');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    const ancestors = helpers.state.ancestors;
                    const newPassword = ancestors.length > 0 ? ancestors[0].newPassword : undefined;

                    if (value === newPassword) {
                        return value;
                    } else {
                        return helpers.error('string.newPasswordRepeat');
                    }
                },
            },
            totpToken: {
                method() {
                    return this.$_addRule('totpToken');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && /^\d{6}$/.test(value)) {
                        return value;
                    } else {
                        return helpers.error('string.totpToken');
                    }
                },
            },
            registrationCode: {
                method() {
                    return this.$_addRule('registrationCode');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && /^[A-Z]{12}$/.test(value)) {
                        return value;
                    } else {
                        return helpers.error('string.registrationCode');
                    }
                },
            },
            elfproef: {
                method() {
                    return this.$_addRule('elfproef');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && elfproef(value)) {
                        return value;
                    } else {
                        return helpers.error('string.elfproef');
                    }
                },
            },
            numeric: {
                method() {
                    return this.$_addRule('numeric');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && /^[0-9]*$/.test(value)) {
                        return value;
                    } else {
                        return helpers.error('string.numeric');
                    }
                },
            },
            ledgerNumber: {
                method() {
                    return this.$_addRule('ledgerNumber');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && /^[0-9]{4}$/.test(value)) {
                        return value;
                    } else {
                        return helpers.error('string.ledgerNumber');
                    }
                },
            },
            simpleEmail: {
                method() {
                    return this.$_addRule('simpleEmail');
                },
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (typeof value === 'string' && /^.+@.+$/.test(value)) {
                        return value;
                    } else {
                        return helpers.error('string.simpleEmail');
                    }
                },
            },
        },
    };
};

const limitArg = {
    name: 'limit',
    ref: true,
    assert: Joi.number(),
    message: 'needs to be a number',
};

const decimalSeparatorArg = {
    name: 'decimalSeparator',
    ref: true,
    assert: Joi.valid('.', ','),
    message: 'needs to be a decimal separator',
};

const digitsArg = { ...limitArg, name: 'digits' };

const numberAsStringExtension: Joi.ExtensionFactory = (joi) => {
    return {
        type: 'numberAsString',
        messages: {
            'numberAsString.notAString': 'needs to be a number as a string',
            'numberAsString.notANumber': 'needs to be a number',
            'numberAsString.leadingZero': 'must not have a leading zero',
            'numberAsString.negativeZero': 'must not be negative zero',
            'numberAsString.noDecimals': 'must not have decimals',
            'numberAsString.decimalComma': 'must have a decimal comma',
            'numberAsString.decimalPoint': 'must have a decimal point',
            'numberAsString.minDecimals': 'needs to have more decimals',
            'numberAsString.maxDecimals': 'needs to have fewer decimals',
            'numberAsString.min': 'needs to be higher',
            'numberAsString.max': 'needs to be lower',
            'numberAsString.greater': 'needs to be higher',
            'numberAsString.less': 'needs to be lower',
        },
        flags: {
            decimalSeparator: {
                setter: '_decimalSeparator',
            },
            minDecimals: {
                default: 0,
                setter: '_minDecimals',
            },
            maxDecimals: {
                default: 0,
                setter: '_minDecimals',
            },
        },
        validate(value: any, helpers: CustomHelpers) {
            if (typeof value !== 'string') {
                return { value, errors: helpers.error('numberAsString.notAString') };
            }

            if (helpers.prefs.convert) {
                value = value.trim();
            }

            let i = 0;
            let negative = false;
            if (value[i] === '-') {
                negative = true;
                i++;
            }

            if (i === value.length) {
                return { value, errors: helpers.error('numberAsString.notANumber') };
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
                    return { value, errors: helpers.error('numberAsString.notANumber') };
                }
            }

            const indexBeforeDecimals = i;
            while (i < value.length) {
                if (/[0-9]/.test(value[i])) {
                    i++;
                } else {
                    return { value, errors: helpers.error('numberAsString.notANumber') };
                }
            }
            const decimals = i - indexBeforeDecimals;

            if (decimalSeparator) {
                if (decimals === 0) {
                    return { value, errors: helpers.error('numberAsString.notANumber') };
                }

                const flag = helpers.schema.$_getFlag('_decimalSeparator');
                if (flag === undefined) {
                    return { value, errors: helpers.error('numberAsString.noDecimals') };
                }
                if (flag === ',' && decimalSeparator !== flag) {
                    return { value, errors: helpers.error('numberAsString.decimalComma') };
                }
                if (flag === '.' && decimalSeparator !== flag) {
                    return { value, errors: helpers.error('numberAsString.decimalPoint') };
                }
            }
            if (wrongLeadingZero) {
                return { value, errors: helpers.error('numberAsString.leadingZero') };
            }
            if (negative && numberFromString(value, helpers) === 0) {
                return { value, errors: helpers.error('numberAsString.negativeZero') };
            }
            if (decimals > helpers.schema.$_getFlag('_maxDecimals')) {
                return { value, errors: helpers.error('numberAsString.maxDecimals') };
            }
            if (decimals < helpers.schema.$_getFlag('_minDecimals')) {
                return { value, errors: helpers.error('numberAsString.minDecimals') };
            }

            return { value };
        },
        rules: {
            decimal: {
                method(decimalSeparator: '.' | ',', digits: number) {
                    return (this as any)
                        .decimalSeparator(decimalSeparator)
                        .minDecimals(digits)
                        .maxDecimals(digits);
                },
                args: [
                    decimalSeparatorArg,
                    digitsArg,
                ],
            },
            decimalSeparator: {
                method(value: '.' | ',') {
                    return this.$_setFlag('_decimalSeparator', value);
                },
                args: [
                    decimalSeparatorArg,
                ],
            },
            minDecimals: {
                method(digits: number) {
                    return this.$_setFlag('_minDecimals', digits);
                },
                args: [
                    digitsArg,
                ],
            },
            maxDecimals: {
                method(digits: number) {
                    return this.$_setFlag('_maxDecimals', digits);
                },
                args: [
                    digitsArg,
                ],
            },
            min: {
                method(limit: number) {
                    return this.$_addRule({ name: 'min', args: { limit } });
                },
                args: [
                    limitArg,
                ],
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (numberFromString(value, helpers) >= args.limit) {
                        return value;
                    } else {
                        return helpers.error('numberAsString.min');
                    }
                },
            },
            max: {
                method(limit: number) {
                    return this.$_addRule({ name: 'max', args: { limit } });
                },
                args: [
                    limitArg,
                ],
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (numberFromString(value, helpers) <= args.limit) {
                        return value;
                    } else {
                        return helpers.error('numberAsString.max');
                    }
                },
            },
            greater: {
                method(limit: number) {
                    return this.$_addRule({ name: 'greater', args: { limit } });
                },
                args: [
                    limitArg,
                ],
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (numberFromString(value, helpers) > args.limit) {
                        return value;
                    } else {
                        return helpers.error('numberAsString.greater');
                    }
                },
            },
            less: {
                method(limit: number) {
                    return this.$_addRule({ name: 'less', args: { limit } });
                },
                args: [
                    limitArg,
                ],
                validate(value: any, helpers: any, args: Record<string, any>, options: any) {
                    if (numberFromString(value, helpers) < args.limit) {
                        return value;
                    } else {
                        return helpers.error('numberAsString.less');
                    }
                },
            },
        },
    };
};

export const Koi: IKoi = Joi.extend(koiExtension, stringExtension, numberAsStringExtension);

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

function numberFromString(value: string, helpers: CustomHelpers) {
    if (helpers.schema.$_getFlag('_decimalSeparator') === ',') {
        return Number(value.replace(',', '.'));
    } else {
        return Number(value);
    }
}
