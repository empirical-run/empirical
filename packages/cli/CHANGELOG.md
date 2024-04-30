# @empiricalrun/cli

## 0.9.1

### Patch Changes

- 2b0cc32: feat: add support for assistant run config defaults
- 51f2f52: fix: add retry logs for model api calls
- 5f043b6: feat: csv loader should parse numbers
- Updated dependencies [c7e5a4a]
- Updated dependencies [2b0cc32]
- Updated dependencies [51f2f52]
  - @empiricalrun/types@0.6.1
  - @empiricalrun/core@0.6.1

## 0.9.0

### Minor Changes

- 2517c74: feat: add support for openai assistants
- db945c2: feat: ability to add global scorers

### Patch Changes

- 3ed659b: feat: add telemetry for usage analytics
- bc3aa56: fix: py-script getting timed out
- 215c54a: chore: change scorer names to json-syntax and llm-critic
- Updated dependencies [3ed659b]
- Updated dependencies [2517c74]
- Updated dependencies [bc3aa56]
- Updated dependencies [215c54a]
  - @empiricalrun/core@0.6.0
  - @empiricalrun/types@0.6.0

## 0.8.0

### Minor Changes

- ba98ebb: feat: add support for chat format prompt

### Patch Changes

- d81cff4: fix: error messaging in case of request timeout
- 4150b1f: fix: typo in chat prompt type
- Updated dependencies [ba98ebb]
- Updated dependencies [d81cff4]
- Updated dependencies [4150b1f]
  - @empiricalrun/types@0.5.1
  - @empiricalrun/core@0.5.6
  - @empiricalrun/fetch@0.3.1

## 0.7.0

### Minor Changes

- 7a67267: feat: add azure-openai model provider

### Patch Changes

- Updated dependencies [7a67267]
  - @empiricalrun/fetch@0.3.0
  - @empiricalrun/types@0.5.0
  - @empiricalrun/core@0.5.5

## 0.6.0

### Minor Changes

- 65eec6a: feat: get aggregate latency and token numbers for the run

### Patch Changes

- Updated dependencies [65eec6a]
  - @empiricalrun/types@0.4.0
  - @empiricalrun/core@0.5.4

## 0.5.6

### Patch Changes

- 837528d: feat: add support for sharing results using empirical link

## 0.5.5

### Patch Changes

- @empiricalrun/core@0.5.3

## 0.5.4

### Patch Changes

- ebdc566: fix: ui breaking in case of too many sample inputs

## 0.5.3

### Patch Changes

- d62108b: feat: add cachedir to gitignore on init
- f51254f: feat: add support for runtime config options
- Updated dependencies [f51254f]
  - @empiricalrun/core@0.5.2
  - @empiricalrun/types@0.3.3

## 0.5.2

### Patch Changes

- 709f1f5: fix: cli not package not able to resolve fetch package
- Updated dependencies [709f1f5]
  - @empiricalrun/fetch@0.2.0

## 0.5.1

### Patch Changes

- 82739a9: feat: add fetch library which supports retry and timeouts
- a4805df: fix: duck db table error creating more than 1 run from web app
- Updated dependencies [82739a9]
- Updated dependencies [a4805df]
  - @empiricalrun/fetch@0.1.0
  - @empiricalrun/core@0.5.1

## 0.5.0

### Minor Changes

- d087119: feat: add support for dataset using csv and google sheet
- a8bc03a: feat: add support for duckdb for filtering and score summary

### Patch Changes

- 036c015: fix: update the tabs UI to a more minimal design
- 8ffc64e: feat: add or remove samples and run them on the comparison ui
- d3a24a6: feat: update scores UI to accomodate score message
- 2bc5465: fix: minor improvements for execution accuracy in spider example
- Updated dependencies [8ffc64e]
- Updated dependencies [9822db6]
- Updated dependencies [dd7af1f]
- Updated dependencies [a8bc03a]
  - @empiricalrun/types@0.3.2
  - @empiricalrun/core@0.5.0

## 0.4.1

### Patch Changes

- 0964efd: fix: added scorer progress bar and fix cli progress bar ui
- 3558afb: fix: python script logs are unreadable and breaks cli logs ui
- Updated dependencies [a94aa16]
  - @empiricalrun/core@0.4.0
  - @empiricalrun/types@0.3.1

## 0.4.0

### Minor Changes

- 879b971: feat: add support for interactivity in the UI

### Patch Changes

- 2866cef: feat: add support for showing output metadata on UI
- Updated dependencies [879b971]
  - @empiricalrun/types@0.3.0
  - @empiricalrun/core@0.3.0

## 0.3.1

### Patch Changes

- c8868d9: fix: top bar in UI is not sticky

## 0.3.0

### Minor Changes

- df65e07: feat: execution and reporting for github actions

### Patch Changes

- b354507: fix: change script value property to path in run
- 5ed6ca9: fix: add support for alternate port for web UI
- 17860b0: feat: add support for passthrough config for script executor
- Updated dependencies [b354507]
- Updated dependencies [90082c8]
- Updated dependencies [17860b0]
  - @empiricalrun/types@0.2.0
  - @empiricalrun/core@0.2.0

## 0.2.4

### Patch Changes

- f7de133: fix: reduce bundled size of cli package

## 0.2.3

### Patch Changes

- 571986a: chore: update npm package license
- Updated dependencies [571986a]
  - @empiricalrun/types@0.1.1
  - @empiricalrun/core@0.1.3

## 0.2.2

### Patch Changes

- @empiricalrun/core@0.1.2

## 0.2.1

### Patch Changes

- Updated dependencies [41e3e94]
  - @empiricalrun/core@0.1.1

## 0.2.0

### Minor Changes

- 844981c: feat: cli can use env vars from dotenv files in cwd or custom path

## 0.1.0

### Minor Changes

- 8787bf0: feat: add run summary in cli
- dbb2abb: first version of empirical package
- 234a5fd: feat: dataset loaders and auto-fill for missing sample ids

### Patch Changes

- 9aa825e: fix: update default config for init command
- Updated dependencies [8787bf0]
- Updated dependencies [dbb2abb]
- Updated dependencies [234a5fd]
  - @empiricalrun/types@0.1.0
  - @empiricalrun/core@0.1.0
