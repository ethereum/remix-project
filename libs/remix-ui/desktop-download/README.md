# Desktop Download Component

A React component for downloading the latest Remix Desktop application from GitHub releases.

## Features

- **Auto OS Detection**: Automatically detects the user's operating system (Windows, macOS, Linux) and suggests the appropriate download
- **Architecture Support**: Detects Apple Silicon Macs and provides ARM64 builds when available
- **Smart Caching**: Caches release data for 30 minutes to reduce API calls
- **Internationalization**: Fully supports i18n with FormattedMessage components
- **Responsive Design**: Works on both desktop and mobile devices
- **Error Handling**: Graceful fallback when GitHub API is unavailable

## Usage

```tsx
import { DesktopDownload } from '@remix-ui/desktop-download'

function MyComponent() {
  return (
    <div>
      {/* Compact layout with tracking */}
      <DesktopDownload trackingContext="navbar" />
      
      {/* Full layout */}
      <DesktopDownload compact={false} trackingContext="home" />
      
      {/* Span variant for dropdowns */}
      <DesktopDownload variant="span" trackingContext="dropdown" />
    </div>
  )
}
```

### Compact Layout (Default)
Perfect for navigation bars, toolbars, or anywhere space is limited. Shows a button with "Download Remix Desktop {OS} {version}" and a small muted link to other releases below.

```tsx
<DesktopDownload />
<DesktopDownload compact={true} />
```

### Full Layout
Great for landing pages, cards, or dedicated download sections. Shows detailed information including release date, file size, and platform-specific icons.

```tsx
<DesktopDownload compact={false} />
```

### Span Variant
Perfect for dropdown items or anywhere you need a simple link without button styling.

```tsx
<DesktopDownload variant="span" />
```

### With custom styling

```tsx
<DesktopDownload className="my-custom-class" compact={false} />
<DesktopDownload style={{ color: '#007bff', fontSize: '14px' }} />
<DesktopDownload variant="span" style={{ fontWeight: 'bold' }} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes |
| `compact` | `boolean` | `true` | Use compact layout |
| `variant` | `'button' \| 'span'` | `'button'` | Display variant |
| `style` | `CSSProperties` | `{}` | Inline styles |
| `trackingContext` | `string` | `'unknown'` | Context for Matomo analytics (e.g., 'hometab', 'dropdown', 'navbar') |

## Analytics Tracking

The component includes automatic Matomo analytics tracking for all download interactions. Set the `trackingContext` prop to identify where the component is used:

```tsx
<DesktopDownload trackingContext="hometab" />
```

**Tracking Events:**
- Category: `desktopDownload`
- Action: `{context}-{variant}` (e.g., `hometab-compact`, `dropdown-span`)
- Name: `{platform}-{filename}` or `releases-page` for fallbacks

**Examples:**
- `['trackEvent', 'desktopDownload', 'hometab-compact', 'linux-remix-desktop_1.1.0_amd64.deb']`
- `['trackEvent', 'desktopDownload', 'dropdown-span', 'windows-remix-desktop-1.1.0-setup.exe']`
- `['trackEvent', 'desktopDownload', 'navbar-full-fallback', 'releases-page']`

## Platform Support

The component automatically detects and provides downloads for:

- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image (ARM64 for Apple Silicon, Intel for older Macs)
- **Linux**: `.deb` package (with `.AppImage` fallback)

## API

The component fetches release data from:
`https://api.github.com/repos/remix-project-org/remix-desktop/releases/latest`

## Caching

Release data is cached in localStorage for 30 minutes to reduce GitHub API calls and improve performance.

## Dependencies

- React 18+
- @remix-ui/helper (for CustomTooltip)
- react-intl (for internationalization)
- Bootstrap CSS classes (for styling)
- FontAwesome icons (for platform icons)

## Internationalization

The component is fully internationalized using react-intl. Translation strings are located in:

- `apps/remix-ide/src/app/tabs/locales/en/desktopDownload.json` - All translation keys for the component

### Translation Keys

| Key | Default Message | Description |
|-----|-----------------|-------------|
| `desktopDownload.loading` | "Loading desktop app info..." | Loading state message |
| `desktopDownload.error` | "Unable to load desktop app. Check the {link} for downloads." | Error fallback message |
| `desktopDownload.title` | "Remix Desktop" | Main title in full layout |
| `desktopDownload.releaseDate` | "Released {date}" | Release date display |
| `desktopDownload.downloadSpan` | "Download Remix Desktop {platform} {version}" | Span variant with platform |
| `desktopDownload.downloadSpanGeneric` | "Download Remix Desktop {version}" | Span variant without platform |
| `desktopDownload.downloadCompactFull` | "Download Remix Desktop {platform} {version}" | Compact button with platform |
| `desktopDownload.downloadCompactGeneric` | "Download Remix Desktop {version}" | Compact button without platform |
| `desktopDownload.downloadButton` | "Download for {platform}" | Full layout button text |
| `desktopDownload.viewReleases` | "View Downloads" | Fallback button text |
| `desktopDownload.otherVersions` | "Other versions and platforms" | Link to releases page |
| `desktopDownload.noAutoDetect` | "Available for Windows, macOS, and Linux" | Platform availability message |
