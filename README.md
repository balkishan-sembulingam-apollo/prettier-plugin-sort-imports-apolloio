# Prettier plugin sort imports

This is a fork of [@trivago/prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports) created by [Ayush Sharma](https://github.com/ayusharma) and the Trivago team. All credit for the original implementation goes to them.

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

#### `importOrderCaseInsensitive`

**type**: `boolean`

**default value**: `false`

A boolean value to enable case-insensitivity in the sorting algorithm
used to order imports within each match group.

For example, when false (or not specified):

```ecmascript 6
import ExampleView from './ExampleView';
import ExamplesList from './ExamplesList';
```

compared with `"importOrderCaseInsensitive": true`:

```ecmascript 6
import ExamplesList from './ExamplesList';
import ExampleView from './ExampleView';
```

#### `importOrderParserPlugins`

**type**: `Array<string>`

**default value**: `["typescript", "jsx"]`

Previously known as `experimentalBabelParserPluginsList`.

A collection of plugins for babel parser. The plugin passes this list to babel parser, so it can understand the syntaxes
used in the file being formatted. The plugin uses prettier itself to figure out the parser it needs to use but if that fails,
you can use this field to enforce the usage of the plugins' babel parser needs.

**To pass the plugins to babel parser**:

```
  "importOrderParserPlugins" : ["classProperties", "decorators-legacy"]
```

**To pass the options to the babel parser plugins**: Since prettier options are limited to string, you can pass plugins
with options as a JSON string of the plugin array:
`"[\"plugin-name\", { \"pluginOption\": true }]"`.

```
  "importOrderParserPlugins" : ["classProperties", "[\"decorators\", { \"decoratorsBeforeExport\": true }]"]
```

**To disable default plugins for babel parser, pass an empty array**:

```
importOrderParserPlugins: []
```

### Ignore Import Blocks

Sometimes you may want to preserve the original order of certain import statements while still allowing others to be sorted. You can use special comments to mark these blocks:

#### `sort-imports-off` and `sort-imports-on`

Use these comments to mark import blocks that should not be sorted. These imports will:
- Preserve their original order
- Be placed at the bottom of all import statements
- Not interfere with the sorting of other imports

**Example:**

```javascript
// These imports will be sorted normally  
import lodash from 'lodash';
import react from 'react';
import './styles.css';

// sort-imports-off
// These imports will remain unsorted and appear at the bottom
import './legacy-styles.css';
import '../legacy/old-component';
import './another-legacy.css';
// sort-imports-on

// These imports will also be sorted normally
import moment from 'moment';
import './modern-styles.css';
```

**Output:**

```javascript
// These imports will be sorted normally
import lodash from 'lodash';
import moment from 'moment';
import react from 'react';

import './modern-styles.css';
import './styles.css';

// sort-imports-off
// These imports will remain unsorted and appear at the bottom
import './legacy-styles.css';
import '../legacy/old-component';
import './another-legacy.css';
// sort-imports-on
```

**Note:** If you forget to close an ignore block with `sort-imports-on`, all remaining imports will be treated as ignored and placed at the bottom.

#### `sort-imports-ignore`

Use this comment at the top of your file to completely disable import sorting for the entire file:

```javascript
// sort-imports-ignore
import './commands';
import b from 'b';
import a from 'a';
```

### How does import sort work ?

The plugin extracts the imports which are defined in `importOrder`. These imports are considered as _local imports_.
The imports which are not part of the `importOrder` is considered as _third party imports_.

After, the plugin sorts the _local imports_ and _third party imports_ using [natural sort algorithm](https://en.wikipedia.org/wiki/Natural_sort_order).

In the end, the plugin returns final imports with _third party imports_ on top and _local imports_ at the end.

The _third party imports_ position (it's top by default) can be overridden using the `<THIRD_PARTY_MODULES>` special word in the `importOrder`.

### FAQ / Troubleshooting

Having some trouble or an issue ? You can check [FAQ / Troubleshooting section](./docs/TROUBLESHOOTING.md).

### Compatibility

| Framework              | Supported                | Note                                             |
| ---------------------- | ------------------------ | ------------------------------------------------ |
| JS with ES Modules     | ✅ Everything            | -                                                |
| NodeJS with ES Modules | ✅ Everything            | -                                                |
| React                  | ✅ Everything            | -                                                |
| Angular                | ✅ Everything            | Supported through `importOrderParserPlugins` API |
| Vue                    | ✅ Everything            | `@vue/compiler-sfc` is required                  |
| Svelte                 | ⚠️ Soon to be supported.  | Any contribution is welcome.                    |

### Disclaimer

This plugin modifies the AST which is against the rules of prettier.
