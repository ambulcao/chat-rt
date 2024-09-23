    import { CodegenConfig } from '@graphql-codegen/cli'

    const config: CodegenConfig = {
        schema: "http://localhost:3000/graphql",
        documents: ["src/graphql/**/*.ts"],
        ignoreNoDocuments: true,
        generates: {
            "./src/gql/": {
                preset: "client",
            },
        },
    }

    export default config
