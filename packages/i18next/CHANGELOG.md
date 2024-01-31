# @squide/i18next

## 1.1.0

### Minor Changes

- [#140](https://github.com/gsoft-inc/wl-squide/pull/140) [`6eaf4ac3`](https://github.com/gsoft-inc/wl-squide/commit/6eaf4ac3f6ac88b62045ce280562a5887589026b) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Now throwing an Error when an instance is registered with an existing key

## 1.0.4

### Patch Changes

- [`2f077119`](https://github.com/gsoft-inc/wl-squide/commit/2f0771194fd2034602955b8d3f72e1cc43e20e64) Thanks [@patricklafrance](https://github.com/patricklafrance)! - Added a check to the `changeLanguage` function to prevent updating the language when the language argument value is the current language.

## 1.0.3

### Patch Changes

- Updated dependencies [[`1cda1be`](https://github.com/gsoft-inc/wl-squide/commit/1cda1be30779d1a1d5d2e21eac043baff20c0f7e)]:
  - @squide/core@3.2.1

## 1.0.2

### Patch Changes

- Updated dependencies [[`7caa44b`](https://github.com/gsoft-inc/wl-squide/commit/7caa44ba81a97d0705caf2f56e6536ae285c920d)]:
  - @squide/core@3.2.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`4c3b6f1`](https://github.com/gsoft-inc/wl-squide/commit/4c3b6f1929364844dda6c1190fc45c3b037e8df9)]:
  - @squide/core@3.1.1

## 1.0.0

### Major Changes

- [#115](https://github.com/gsoft-inc/wl-squide/pull/115) [`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4) Thanks [@patricklafrance](https://github.com/patricklafrance)! - This a new package to support [i18next](https://www.i18next.com/) for a federated application.

  It includes:

  - `i18nextPlugin`
  - `useChangeLanguage`
  - `useCurrentLanguage`
  - `useI18nextInstance`
  - `I18nextNavigationLabel`

### Patch Changes

- Updated dependencies [[`568255a`](https://github.com/gsoft-inc/wl-squide/commit/568255a50a519e7d19c8c2b03909559686cd24c4)]:
  - @squide/core@3.1.0