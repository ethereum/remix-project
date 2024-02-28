import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://docs.github.com/public/schema.docs.graphql',
  // this assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure
  documents: ['./libs/remix-ui/git/src/**/*.{ts,tsx}'],
  generates: {
    './libs/remix-ui/git/src/types/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  overwrite: true,
  ignoreNoDocuments: true,
};

export default config;