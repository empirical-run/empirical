# JSON Schema

Enables auto-completion and linting inside VS Code.

## Development

1. Edit the the schema file if the config file has changed
2. Test the changes locally by changing the schema file in one of the examples
    ```json
    "$schema": "../../development/schema/schema.json",
    ```

3. Upload the new version to Cloudflare (after renaming the file to the next version): [location](https://dash.cloudflare.com/6f3f2ef0dbeefd01119c8818ed8e3dfe/r2/default/buckets/empirical-assets-production)
4. Update the schema reference for the examples to the new version
5. Commit the updated schema file
