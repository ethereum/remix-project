const fs = require('fs')

let value = fs.readFileSync('./change-log.json')
value = JSON.parse(value)
const inDone = value.data.search.edges[0].node.project.columns.edges[0].node.cards.edges
let data = ''
const prCount = inDone.filter((card) => {
  return card.node.content.url
}).length
console.log(prCount, 'Prs\n')
data = prCount + ' Prs\n\n'
for (let card of inDone) {
    if (card.node.content.url) {
      console.log(card.node.content.title, `- ${card.node.content.url}\n`)
      data += ` - [${card.node.content.title}](${card.node.content.url}) (@${card.node.content.author.login})\n`
      data += `       participants: ${card.node.content.participants.edges.map((p) => { return `@(${p.node.login})` })}`
      data += '\n\n'
    }
}

fs.writeFileSync('./change-log.txt', data)

/*
 - go to https://docs.github.com/en/graphql/overview/explorer
 - set the correct project id
 - run the query (be careful, this only returns the first 100 elements)
 - save the JSON content as done.json
 - run this script
 - get the result in the file done.txt
*/
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
                          ... on PullRequest {
                            participants (last: 100) {
                              edges {
                                node {
                                  id
                                  login
                                }
                              }
                            }
                            author {
                              login
                            }
                            assignees (last: 100) {
                              edges {
                                node {
                                  id
                                  login
                                }
                              }
                            }
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
