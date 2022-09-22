const fs = require('fs')

let value = fs.readFileSync('./done.json')
value = JSON.parse(value)
const inDone = value.data.search.edges[0].node.project.columns.edges[0].node.cards.edges
let data = 
console.log(inDone.length, 'issues/Prs\n')
data = inDone.length + ' issues/Prs\n'
for (let card of inDone) {
    console.log(card.node.content.title, `- ${card.node.content.url}\n`)
    data += `${card.node.content.title} - ${card.node.content.url}\n`
}

fs.writeFileSync('./done.txt', data)

/*
 - go to https://docs.github.com/en/graphql/overview/explorer
 - set the correct project id
 - run the query (be careful, this only returns the first 100 elements)
 - save the JSON content as done.json
 - run this script
 - get the result in the file done.txt
/*

{
  search(type: REPOSITORY, query: "remix-project", first: 1) {
    edges {
      node {
        __typename
        ... on Repository {
          owner {
            id
          }
          name
          project(number: 31) {
            number
            name
            columns(last: 1) {
              edges {
                node {
                  name
                  cards(first: 100) {
                    edges {
                      cursor
                      node {
                        id
                        note
                        state
                        content {
                          ... on Issue {
                            url
                            id
                            number
                            title
                          }
                          ... on PullRequest {
                            url
                            id
                            number
                            title
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
*/
