export default async () => {
    return {
        // @ts-ignore
        '.prettierrc.json': (await import('raw-loader!./.prettierrc')).default
    }
}