import { configure } from '@storybook/react';
import '../src/index.css';

configure(require.context('../src', true, /\.stories\.js$/), module);
