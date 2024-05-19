# Contribution Guidelines

Follow these concise steps to set up and contribute to this monorepo:

### Setup

1. **Install Corepack**:
   ```
   corepack install
   ```

2. **Install Dependencies and Build**:
   ```
   pnpm install
   pnpm build
   ```

### Development

- **Start Development Server**:
  ```
  pnpm dev
  ```

- **Start Web App**:
  ```sh
  # Link CLI 
  pnpm link ./packages/empiricalrun
  # Navigate to an example
  cd ./examples/basic
  # Run against the example
  npx empiricalrun run
  # View the output on a web app
  npx empiricalrun ui
  ```

  The web app will be accessible at http://localhost:8000 after completing the above steps.

- **Adding a New Package**:
  To add a new package, execute:
  ```
  pnpm run gen:workspace
  ```

### JSON Schema

Enables auto-completion and linting inside VS Code.

## Development

1. Test the changes locally by changing the schema file in one of the examples to
    ```json
    "$schema": "../../packages/json-schema/dist/latest.json",
    ```
2. Upload the new version to Cloudflare using github action CI pipeline
3. Update the schema reference for the examples to the new version
4. Commit the updated schema file

### Testing

- **Run Tests**:
  ```
  pnpm test
  ```

- **Run Tests in Watch Mode**:
  ```
  pnpm test:watch
  ```

- **Run Specific Tests**:
  Use the `-t` flag to run specific tests. For example, to run tests from `script.test.ts`:
  ```
  pnpm test:watch -- -t script
  ```

### Pull Request Guidelines

Before creating a pull request (PR), follow these steps:

- **Generate a Changeset**: Include a changeset corresponding to the modifications made in your PR by running:
  ```
  pnpm changeset
  ```

  Follow the prompts presented by the changeset CLI to add the changeset to your PR.

  > Note: If the changes do not require a version upgrade for the packages, you may skip adding a changeset.

