import { ApolloClient, InMemoryCache, ApolloLink, from, Observable, split, gql } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Função para renovar o token de autenticação
async function refreshToken(client) {
  try {
    const { data } = await client.mutate({
      mutation: gql`
        mutation RefreshToken {
          refreshToken
        }
      `,
    });
    const newAccessToken = data?.refreshToken;
    if (!newAccessToken) {
      throw new Error("Novo token de acesso não recebido.");
    }
    return `Bearer ${newAccessToken}`;
  } catch (err) {
    throw new Error("Erro ao obter novo token de acesso");
  }
}

let retryCount = 0;
const maxRetry = 3;

// URL do servidor GraphQL
const httpLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    uri: 'http://localhost:3000/graphql',
    credentials: 'include',
  });
  return forward(operation);
});

// Contexto de autenticação
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket Link para assinaturas
const wsLink = new WebSocketLink({
  uri: `wss://localhost:3000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem('auth-token'),
    },
  },
});

// Lógica de divisão para usar WebSocket em assinaturas e HTTP para queries/mutações
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, httpLink])
);

// Link para manipulação de erros com lógica de reautenticação
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED' && retryCount < maxRetry) {
        retryCount++;
        return new Observable(observer => {
          refreshToken(client)
            .then((token) => {
              operation.setContext((previousContext) => ({
                headers: {
                  ...previousContext.headers,
                  authorization: token,
                },
              }));
              const forward$ = forward(operation);
              forward$.subscribe(observer);
            })
            .catch((error) => observer.error(error));
        });
      }

      console.error(`[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`);
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Configurando Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache(),
});
