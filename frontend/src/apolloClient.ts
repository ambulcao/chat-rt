import { ApolloClient, InMemoryCache, ApolloLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { split } from '@apollo/client/link/core';
import { Kind } from 'graphql';

// URL do servidor GraphQL
const httpLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    uri: 'http://localhost:3000/graphql', // Atualizar a URL do GraphQL
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
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([authLink, httpLink]) // HTTP para queries e mutações
);

// Link para manipulação de erros
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Lógica para manipular erros de autenticação
        console.log('Usuário não autenticado');
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