import { assert } from 'chai';
import { ValidationResult } from 'joi';
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

describe('Range number with two decimals validation', () => {
    it('should validate number in range 0-9 with two decimals 8,90', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('8,90');
        assert.isNull(result.error);
    });

    it('should validate the last option in the possible range 9,00', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('9,00');
        assert.isNull(result.error);
    });

    it('should not validate number with three decimals 8,908', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('8,908');
        assertErrorType(result, 'string.rangeNumberWithTwoDecimals');
    });

    it('should not validate whole number 9', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('9');
        assertErrorType(result, 'string.rangeNumberWithTwoDecimals');
    });

    it('should not validate number with one decimal 7,1', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('7,1');
        assertErrorType(result, 'string.rangeNumberWithTwoDecimals');
    });

    it('should not validate number above 9', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('9,01');
        assertErrorType(result, 'string.rangeNumberWithTwoDecimals');
    });

    it('should not validate negative number -5,08', () => {
        const result = Koi.string().rangeNumberWithTwoDecimals().validate('-5,08');
        assertErrorType(result, 'string.rangeNumberWithTwoDecimals');
    });
});
