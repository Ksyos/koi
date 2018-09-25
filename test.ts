import { assert } from 'chai';
import { AnySchema, ValidationResult } from 'joi';
import 'mocha';
import * as moment from 'moment';
import { Koi } from './lib';

function assertErrorType(result: ValidationResult<any>, errorType: string) {
    assert.isNotNull(result.error);
    assert.lengthOf(result.error.details, 1);
    assert.equal(result.error.details[0].type, errorType);
}

describe('Date validation', () => {
    it('should validate a good date', () => {
        const result = Koi.koi().date().validate('2010-07-01');
        assert.isNull(result.error);
    });

    it('should require date to not be an empty string', () => {
        const result = Koi.koi().date().validate('');
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be a date object', () => {
        const result = Koi.koi().date().validate(new Date());
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be a moment object', () => {
        const result = Koi.koi().date().validate(moment());
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be a plain year', () => {
        const result = Koi.koi().date().validate('2010');
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be a date time', () => {
        const result = Koi.koi().date().validate('2010-07-01 10:00:00');
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be an exclamation', () => {
        const result = Koi.koi().date().validate('yeah');
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be an iso date', () => {
        const result = Koi.koi().date().validate('2010-07-01T10:00:00Z');
        assertErrorType(result, 'koi.date');
    });

    it('should require date to not be non-existent', () => {
        const result = Koi.koi().date().validate('2010-02-31');
        assertErrorType(result, 'koi.date');
    });
});

describe('End date validation', () => {
    it('should validate a good end date, when the end date is equal to the start date', () => {
        const result = Koi
            .object({ startDate: Koi.koi().date(), endDate: Koi.koi().date().endDate() })
            .validate({ startDate: '2018-01-10', endDate: '2018-01-10' });
        assert.isNull(result.error);
    });

    it('should validate a good end date, when the end date is larger than the start date', () => {
        const result = Koi
            .object({ startDate: Koi.koi().date(), endDate: Koi.koi().date().endDate() })
            .validate({ startDate: '2018-01-10', endDate: '2018-01-13' });
        assert.isNull(result.error);
    });

    it('should require end date to be larger than or equal to start date', () => {
        const result = Koi
            .object({ startDate: Koi.koi().date(), endDate: Koi.koi().date().endDate() })
            .validate({ startDate: '2018-01-11', endDate: '2018-01-10' });
        assertErrorType(result, 'koi.endDate');
    });

    it('should validate a good end date, when the start date is null', () => {
        const result = Koi
            .object({ startDate: Koi.koi().date().allow(null), endDate: Koi.koi().date().endDate() })
            .validate({ startDate: null, endDate: '2018-01-10' });
        assert.isNull(result.error);
    });

    it('should validate a good end date, when the end date is null', () => {
        const result = Koi
            .object({ startDate: Koi.koi().date(), endDate: Koi.koi().date().endDate().allow(null) })
            .validate({ startDate: '2018-01-10', endDate: null });
        assert.isNull(result.error);
    });

    it('should require a startDate to not be undefined', () => {
        const result = Koi
            .object({ endDate: Koi.koi().date().endDate() })
            .validate({ endDate: '2018-01-10' });
        assertErrorType(result, 'koi.missingStartDate');
    });
});

describe('New password repeat validation', () => {
    it('should validate a correctly repeated new password', () => {
        const result = Koi
            .object({ newPassword: Koi.string(), newPasswordRepeat: Koi.string().newPasswordRepeat() })
            .validate({ newPassword: 'foo', newPasswordRepeat: 'foo' });
        assert.isNull(result.error);
    });

    it('should require a correctly repeated new password', () => {
        const result = Koi
            .object({ newPassword: Koi.string(), newPasswordRepeat: Koi.string().newPasswordRepeat() })
            .validate({ newPassword: 'foo', newPasswordRepeat: 'bar' });
        assertErrorType(result, 'string.newPasswordRepeat');
    });
});

describe('Totp token validation', () => {
    it('should validate a good totp token', () => {
        const result = Koi.string().totpToken().validate('012345');
        assert.isNull(result.error);
    });

    it('should require a totp token to be of length 6', () => {
        const result = Koi.string().totpToken().validate('01234');
        assertErrorType(result, 'string.totpToken');
    });

    it('should require a totp token to be just digits', () => {
        const result = Koi.string().totpToken().validate('01234a');
        assertErrorType(result, 'string.totpToken');
    });
});

describe('Simple email validation', () => {
    it('should validate a good email address', () => {
        const result = Koi.string().simpleEmail().validate('test@example.com');
        assert.isNull(result.error);
    });

    it('should validate an email address with weird characters', () => {
        const result = Koi.string().simpleEmail().validate('teઞȹ3@லstދ@eષxaǭĕǮݩݪmpl@e.com');
        assert.isNull(result.error);
    });

    it('should require a simpleEmail to have an @ symbol', () => {
        const result = Koi.string().simpleEmail().validate('testexample.com');
        assertErrorType(result, 'string.simpleEmail');
    });

    it('should require a char before the @ symbol', () => {
        const result = Koi.string().simpleEmail().validate('@testexample.com');
        assertErrorType(result, 'string.simpleEmail');
    });

    it('should require a char after the @ symbol', () => {
        const result = Koi.string().simpleEmail().validate('testexample.com@');
        assertErrorType(result, 'string.simpleEmail');
    });
});

describe('Registration code validation', () => {
    it('should validate a good registration code', () => {
        const result = Koi.string().registrationCode().validate('ABCDEFGHJKMN');
        assert.isNull(result.error);
    });

    it('should require a registration code to be of length 12', () => {
        const result = Koi.string().registrationCode().validate('ABCDEFGHJKM');
        assertErrorType(result, 'string.registrationCode');
    });

    it('should require a registration code to be just upper case letters', () => {
        const result = Koi.string().registrationCode().validate('ABCDEFGHJKMn');
        assertErrorType(result, 'string.registrationCode');
    });
});

describe('Elfproef validation', () => {
    it('should validate a good BSN', () => {
        const result = Koi.string().elfproef().validate('150668223');
        assert.isNull(result.error);
    });

    it('should not validate a bad BSN ', () => {
        const result = Koi.string().elfproef().validate('150668225');
        assertErrorType(result, 'string.elfproef');
    });
});

describe('Numeric string validation', () => {
    it('should validate a good numeric string', () => {
        const result = Koi.string().numeric().validate('12345678');
        assert.isNull(result.error);
    });

    it('should require a numeric string to be just numbers', () => {
        const result = Koi.string().numeric().validate('1234567a');
        assertErrorType(result, 'string.numeric');
    });

    it('should require a numeric string to be just numbers', () => {
        const result = Koi.string().numeric().validate('1234&678');
        assertErrorType(result, 'string.numeric');
    });
});

describe('Ledger number string validation', () => {
    it('should validate a good ledger number string', () => {
        const result = Koi.string().ledgerNumber().validate('1234');
        assert.isNull(result.error);
    });

    it('should require a ledger number string to be just numbers', () => {
        const result = Koi.string().ledgerNumber().validate('127a');
        assertErrorType(result, 'string.ledgerNumber');
    });

    it('should require a ledger number string to be just numbers', () => {
        const result = Koi.string().ledgerNumber().validate('124&678');
        assertErrorType(result, 'string.ledgerNumber');
    });
});

describe('Enum validation', () => {
    enum Status {
        started = 'started',
        running = 'running',
        stopped = 'stopped',
    }

    it('should validate a good enum value', () => {
        const result = Koi.koi().enum(Status).validate('started');
        assert.isNull(result.error);
    });

    it('should not validate null', () => {
        const result = Koi.koi().enum(Status).validate(null);
        assertErrorType(result, 'koi.enum');
    });

    it('should not validate an enum object', () => {
        const result = Koi.koi().enum(Status).validate(Status);
        assertErrorType(result, 'koi.enum');
    });

    it('should not validate an empty object', () => {
        const result = Koi.koi().enum(Status).validate({});
        assertErrorType(result, 'koi.enum');
    });

    it('should not validate another random object', () => {
        const result = Koi.koi().enum(Status).validate({ foo: 'bar' });
        assertErrorType(result, 'koi.enum');
    });

    it('should not validate an empty string', () => {
        const result = Koi.koi().enum(Status).validate('');
        assertErrorType(result, 'koi.enum');
    });

    it('should not validate a bad enum value', () => {
        const result = Koi.koi().enum(Status).validate('foo');
        assertErrorType(result, 'koi.enum');
    });
});

describe('Number as string validation', () => {
    describe('edge cases', () => {
        function edgeCase(validator: AnySchema, value: any, errorType?: string) {
            it(errorType ? `should not validate ${value} but error ${errorType}` : `should validate ${value}`, () => {
                const result = validator.validate(value);
                if (errorType) {
                    assertErrorType(result, errorType);
                } else {
                    assert.isNull(result.error);
                }
            });
        }

        edgeCase(Koi.numberAsString(), '0');
        edgeCase(Koi.numberAsString(), '1');
        edgeCase(Koi.numberAsString(), '2');
        edgeCase(Koi.numberAsString(), '10');
        edgeCase(Koi.numberAsString(), '11');
        edgeCase(Koi.numberAsString(), '123456789');
        edgeCase(Koi.numberAsString(), '-1');
        edgeCase(Koi.numberAsString(), '-10');
        edgeCase(Koi.numberAsString(), '-123456789');
        edgeCase(Koi.numberAsString(), 1, 'numberAsString.notAString');
        edgeCase(Koi.numberAsString(), [], 'numberAsString.notAString');
        edgeCase(Koi.numberAsString(), {}, 'numberAsString.notAString');
        edgeCase(Koi.numberAsString(), true, 'numberAsString.notAString');
        edgeCase(Koi.numberAsString(), null, 'numberAsString.notAString');
        edgeCase(Koi.numberAsString(), '', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), '-', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), 'a', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), '0a', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), 'a0', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), '0a0', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString(), '-0', 'numberAsString.negativeZero');
        edgeCase(Koi.numberAsString(), '-00', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString(), '00', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString(), '01', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString(), '01234', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString(), '-01', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString(), '-01234', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '0');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '0.0');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.0');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.00');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '1.2');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '0.1');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.1');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.12');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.120');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-1.2');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-0.1');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.1');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.12');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.120');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '00.01', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '01.234', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '012.34', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-012.34', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '001.234', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '0012.34', 'numberAsString.leadingZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '0.', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.a', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.a1', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.1a', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '.1a2', 'numberAsString.notANumber');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-0', 'numberAsString.negativeZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-0.0', 'numberAsString.negativeZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.0', 'numberAsString.negativeZero');
        edgeCase(Koi.numberAsString().decimalSeparator('.'), '-.00', 'numberAsString.negativeZero');
    });

    describe('base', () => {
        it('should validate a good number as string', () => {
            const result = Koi.numberAsString().validate('42');
            assert.isNull(result.error);
        });

        it('should trim spacing with the convert option', () => {
            const result = Koi.numberAsString().validate('\t 42\r\n');
            assert.isNull(result.error);
            assert.equal(result.value, '42');
        });

        it('should not trim spacing without the convert option', () => {
            const result = Koi.numberAsString().validate('\t 42\r\n', { convert: false });
            assertErrorType(result, 'numberAsString.notANumber');
        });

        it('should not validate a number with a decimal point', () => {
            const result = Koi.numberAsString().validate('4.2');
            assertErrorType(result, 'numberAsString.decimalSeparator');
        });

        it('should not validate a number with a decimal comma', () => {
            const result = Koi.numberAsString().validate('4,2');
            assertErrorType(result, 'numberAsString.decimalSeparator');
        });
    });

    describe('decimal', () => {
        it('should validate a number with a decimal point and the exact amount of decimals', () => {
            const result = Koi.numberAsString().decimal('.', 2).validate('42.00');
            assert.isNull(result.error);
        });

        it('should validate a number with a decimal comma and the exact amount of decimals', () => {
            const result = Koi.numberAsString().decimal(',', 2).validate('42,00');
            assert.isNull(result.error);
        });

        it('should not validate a number with a comma when we require a point', () => {
            const result = Koi.numberAsString().decimal('.', 2).validate('42,00');
            assertErrorType(result, 'numberAsString.decimalSeparator');
        });

        it('should not validate a number with a point when we require a comma', () => {
            const result = Koi.numberAsString().decimal(',', 2).validate('42.00');
            assertErrorType(result, 'numberAsString.decimalSeparator');
        });

        it('should not validate a number with fewer decimals', () => {
            const result = Koi.numberAsString().decimal('.', 2).validate('42.0');
            assertErrorType(result, 'numberAsString.minDecimals');
        });

        it('should not validate a number with more decimals', () => {
            const result = Koi.numberAsString().decimal('.', 2).validate('42.000');
            assertErrorType(result, 'numberAsString.maxDecimals');
        });
    });

    describe('minDecimals', () => {
        it('should validate a number with the exact amount of decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').minDecimals(3).validate('42.123');
            assert.isNull(result.error);
        });

        it('should validate a number with more decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').minDecimals(3).validate('42.1234');
            assert.isNull(result.error);
        });

        it('should not validate a number with fewer decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').minDecimals(3).validate('42.12');
            assertErrorType(result, 'numberAsString.minDecimals');
        });
    });

    describe('maxDecimals', () => {
        it('should validate a number with the exact amount of decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').maxDecimals(3).validate('42.123');
            assert.isNull(result.error);
        });

        it('should validate a number with fewer decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').maxDecimals(3).validate('42.12');
            assert.isNull(result.error);
        });

        it('should not validate a number with more decimals', () => {
            const result = Koi.numberAsString().decimalSeparator('.').maxDecimals(3).validate('42.1234');
            assertErrorType(result, 'numberAsString.maxDecimals');
        });
    });

    describe('min/max/greater/less', () => {
        function testLimit(limiter: 'min' | 'max' | 'greater' | 'less', limit: number, value: string, valid: boolean) {
            it(`should ${valid ? 'not ' : ''}limit ${value} to ${limiter} ${limit}`, () => {
                const result = Koi.numberAsString().decimalSeparator(',')[limiter](limit).validate(value);
                if (valid) {
                    assert.isNull(result.error);
                } else {
                    assertErrorType(result, `numberAsString.${limiter}`);
                }
            });
        }

        testLimit('min', 10.2, '42,00', true);
        testLimit('min', 10.2, '10,20', true);
        testLimit('min', 10.2, '4,2', false);
        testLimit('min', 10.2, '10,19999', false);
        testLimit('max', 10.2, '4,2', true);
        testLimit('max', 10.2, '10,20', true);
        testLimit('max', 10.2, '42,00', false);
        testLimit('max', 10.2, '10,200000001', false);
        testLimit('greater', -10.2, '-4,20', true);
        testLimit('greater', -10.2, '-10,19999', true);
        testLimit('greater', -10.2, '-42,00', false);
        testLimit('greater', -10.2, '-10,20', false);
        testLimit('less', 10.2, '4,2', true);
        testLimit('less', 10.2, '10,19999', true);
        testLimit('less', 10.2, '42,00', false);
        testLimit('less', 10.2, '10,20', false);
    });
});
