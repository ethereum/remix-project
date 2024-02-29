import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_COMMITS = gql(/* GraphQL */`
  query GetCommits($name: String!, $owner: String!, $cursor: String, $limit: Int = 10) {
    repository(name: $name, owner: $owner) {
      ref(qualifiedName: "master") {
        target {
          ... on Commit {
            history(first: $limit, after: $cursor) {
              pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                node {
                  oid
                  messageHeadline
                  message
                  committedDate
                  author {
                    name
                    email
                    date
                  }
                  parents(first: 1) {
                    edges {
                      node {
                        oid
                      }
                    }
                  }
                  tree {
                    oid
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);


export const BranchCommits = ({ owner, name }) => {
  const { data, loading, fetchMore } = useQuery(GET_COMMITS, {
    variables: { owner, name },
  });

  if (loading) return <p>Loading...</p>;

  const { edges, pageInfo } = (data.repository.ref.target.__typename === "Commit")? data.repository.ref.target.history : { edges: [], pageInfo: { endCursor: null, hasNextPage: false } };

  const loadNextPage= ()=>{
    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        const newEdges = (fetchMoreResult.repository.ref.target.__typename === "Commit"? fetchMoreResult.repository.ref.target.history.edges : [])
        const pageInfo = (fetchMoreResult.repository.ref.target.__typename === "Commit"? fetchMoreResult.repository.ref.target.history.pageInfo : {})
        
        return newEdges.length && prevResult.repository.ref.target.__typename === "Commit"
          ? {
              repository: {
                __typename: prevResult.repository.__typename,
                ref: {
                  __typename: prevResult.repository.ref.__typename,
                  target: {
                    __typename: prevResult.repository.ref.target.__typename,
                    history: {
                      __typename: prevResult.repository.ref.target.history.__typename,
                      edges: [...prevResult.repository.ref.target.history.edges, ...newEdges],
                      pageInfo,
                    },
                  },
                },
              },
            } as any
          : prevResult;
      },
    });
  }

  return (
    <div>
      <ul>
        {edges.map(({ node }) => {
          console.log(node)
          return(
          <li key={node.oid}>
            <p>{node.messageHeadline} - {node.author.name} ({new Date(node.author.date).toLocaleDateString()})</p>
          </li>
          )
          })}
      </ul>
      {pageInfo.hasNextPage && (
        <button
          onClick={() => loadNextPage()}
        >
          Load More
        </button>
      )}
    </div>
  );
};
