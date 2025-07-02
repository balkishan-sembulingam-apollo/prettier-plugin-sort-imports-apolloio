// These imports should be sorted (third-party first, then relative)
import lodash from 'lodash';
import react from 'react';
import './styles.css';
import '../components/Button';

// sort-imports-off
// These imports should remain unsorted and appear at the bottom
import './unsorted-z.css';
import '../unsorted-a';
import './unsorted-m.css';
// sort-imports-on

// These imports should also be sorted
import axios from 'axios';
import './component.css';

function MyComponent() {
    return "Test";
} 