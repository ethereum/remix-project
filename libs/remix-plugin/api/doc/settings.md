# Settings

- Name in Remix: `settings`
- kind: `settings`

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_method_ |`getGithubAccessToken` |Returns the current Github Access Token provided in settings

## Examples

### Methods
`getGithubAccessToken`: Returns the current Github Access Token provided in settings
```typescript
const token = await client.call('settings', 'getGithubAccessToken')
// OR
const token = await client.settings.getGithubAccessToken()
```