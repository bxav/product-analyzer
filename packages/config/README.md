# @repo/config

This package contains shared configurations for the monorepo.

## Usage

### ESLint

In your package's `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@repo/config/eslint-preset'],
};