// ApolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';

export const getApolloLink = (token: string, uri = 'https://api.github.com/graphql')=>{
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return forward(operation);
  });
  const httpLink = createHttpLink({
    uri, // Replace with your GraphQL endpoint
  });
  return authLink.concat(httpLink)
}

export const client = new ApolloClient({
  link: getApolloLink(''),
  cache: new InMemoryCache(),
});
