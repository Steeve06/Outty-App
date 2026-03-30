import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util'
global.fetch = jest.fn();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;