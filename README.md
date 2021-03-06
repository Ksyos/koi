# Koi

Some small extensions to Joi (in Typescript).

## Install

```
npm install @ksyos/koi
```

### Browser polyfills

Koi uses the new ES6 features, Promise, Iterable and Map, so you may need to add polyfills to use with older browsers.

## Usage

```ts
import { Koi } from '@ksyos/koi';

enum Action {
    start = 'start',
    stop = 'stop',
}

Koi.koi().enum(Action).validate('start');
// Validates

Koi.koi().enum(Status).validate('foo');
// Results in error with type 'koi.enum'

Koi.string().elfproef().validate('150668223');
// Validates

Koi.string().elfproef().validate('150668225');
// Results in error with type 'string.elfproef'
```
