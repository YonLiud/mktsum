import { customAlphabet } from 'nanoid'

// URL-friendly alphabet (no special chars, case-sensitive for shorter IDs)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// Generate 12-character nanoid (collision-resistant for practical purposes)
export const generateId = customAlphabet(alphabet, 12)
