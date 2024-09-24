/* eslint-disable */
import * as types from './graphql';
/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n    mutation LoginUser($email: String!, $password: String!) {\n        login(loginInput: { email: $email, password: $password }) {\n            user {\n                email\n                id\n                fullname\n                avatarUrl\n            }\n        }\n    }\n": types.LoginUserDocument,
    "\n    mutation LogoutUser {\n        logout\n    }\n": types.LogoutUserDocument,
    "\n    mutation RegisterUser(\n        $fullname: String!\n        $email: String!\n        $password: String!\n        $confirmPassword: String!\n    ) {\n        register(\n            registerInput: {\n                fullname: $fullname\n                email: $email\n                password: $password\n                confirmPassword: $confirmPassword\n            }\n        ) {\n            user {\n                id\n                fullname\n                email\n            }\n        }   \n    }\n": types.RegisterUserDocument,
};
export function graphql(source) {
    return documents[source] ?? {};
}
