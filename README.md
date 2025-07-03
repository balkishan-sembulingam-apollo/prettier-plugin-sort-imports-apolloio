# Prettier plugin sort imports

This is a fork of [@trivago/prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports) created by [Ayush Sharma](https://github.com/ayusharma) and the Trivago team. All credit for the original implementation goes to them.

<!-- Pre-commit hooks are configured to run build and tests before commits -->

---

A prettier plugin to sort import declarations by provided Regular Expression order.

**Note: If you are migrating from v2.x.x to v3.x.x, [Please Read Migration Guidelines](./docs/MIGRATION.md)**

### Input

```javascript
import React, {
    FC,
    useEffect,
    useRef,
    ChangeEvent,
    KeyboardEvent,
} from 'react';
import { logger } from '@core/logger';
import { reduce, debounce } from 'lodash';
import { Message } from '../Message';
import { createServer } from '@server/node';
import { Alert } from '@ui/Alert';
import { repeat, filter, add } from '../utils';
import { initializeApp } from '@core/app';
import { Popup } from '@ui/Popup';
import { createConnection } from '@server/database';
```


### Output

```javascript
import { debounce, reduce } from 'lodash';
import React, {
    ChangeEvent,
    FC,
    KeyboardEvent,
    useEffect,
    useRef,
} from 'react';

import { createConnection } from '@server/database';
import { createServer } from '@server/node';

import { initializeApp } from '@core/app';
import { logger } from '@core/logger';

import { Alert } from '@ui/Alert';
import { Popup } from '@ui/Popup';

import { Message } from '../Message';
import { add, filter, repeat } from '../utils';
```

### Install

npm

```shell script
npm install --save-dev prettier-plugin-sort-imports-apolloio
```

or, using yarn

```shell script
yarn add --dev prettier-plugin-sort-imports-apolloio
```

**Note: If formatting `.vue` sfc files please install `@vue/compiler-sfc` if not in your dependency tree - this normally is within Vue projects.**

### Usage

Add an order in prettier config file.

```ecmascript 6
module.exports = {
  "printWidth": 80,
  "tabWidth": 4,
  "trailingComma": "all",
  "singleQuote": true,
  "semi": true,
  "importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

**Note: There may be an issue with some package managers, such as `pnpm`. You can solve it by providing additional configuration option in prettier config file.

```js
module.exports = {
    ...
    "plugins": ["prettier-plugin-sort-imports-apolloio"]
}
```

### APIs

#### **`importOrder`**

**type**: `Array<string>`

A collection of Regular expressions in string format.

```
"importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
```

_Default behavior:_ The plugin moves the third party imports to the top which are not part of the `importOrder` list.
To move the third party imports at desired place, you can use `<THIRD_PARTY_MODULES>` to assign third party imports to the appropriate position:

```
"importOrder": ["^@core/(.*)$", "<THIRD_PARTY_MODULES>", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
```

#### `importOrderSeparation`

**type**: `boolean`

**default value**: `false`

A boolean value to enable or disable the new line separation
between sorted import declarations group. The separation takes place according to the `importOrder`.

```
"importOrderSeparation": true,
```

#### `importOrderSortSpecifiers`

**type**: `boolean`

**default value:** `false`

A boolean value to enable or disable sorting of the specifiers in an import declarations.

#### `importOrderGroupNamespaceSpecifiers`

**type**: `boolean`

**default value:** `false`

A boolean value to enable or disable sorting the namespace specifiers to the top of the import group.

#### `