// Example demonstrating sort-imports-off and sort-imports-on functionality
// These imports will be sorted normally
import axios from 'axios';
import lodash from 'lodash';
// These imports will also be sorted normally
import moment from 'moment';
import react from 'react';

import '../components/Button';
// This import will be sorted with the other normal imports
import './final-styles.css';
import './modern-styles.css';
import './styles.css';

// sort-imports-off
// These imports will NOT be sorted and will appear at the bottom
// They maintain their original order
import './legacy-styles.css';
import '../legacy/old-component';
import './another-legacy.css';
import '../vendor/old-library';
// sort-imports-on
// sort-imports-off
// Another ignore block - these also won't be sorted
import './debug-tools.css';
import '../debug/debug-helper';
// sort-imports-on

export default function ExampleComponent() {
    return 'This demonstrates the ignore blocks feature';
}
