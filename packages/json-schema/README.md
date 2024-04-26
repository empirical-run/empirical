# json-schema

Generates schema store format json for `empiricalrc.json`. Visit https://www.schemastore.org/json/ to understand more on schema store format.

## Development

Add this to your VS Code settings.json to use the latest schema file during development.

```json
{
    "json.schemas": [
        {
            "fileMatch": [
                "empiricalrc.json"
            ],
            "url": "file:///<PATH_TO_REPO>/empirical/packages/json-schema/dist/latest.json"
        }
    ]
}
```
