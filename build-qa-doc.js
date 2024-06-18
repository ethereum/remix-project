const fs = require('fs')

let value = fs.readFileSync('./done.json')
value = JSON.parse(value)
const inDone = value.data.repository.projectV2.items.edges
let data = ''
console.log(inDone.length, 'PRs\n')
data = inDone.length + ' PRs\n'
for (let card of inDone) {
  if (card.node.content.url && card.node.content.merged && card.node.content.merged !== false) {
    data += `${card.node.content.title} - ${card.node.content.url}\n`
  }
}

fs.writeFileSync('./done.txt', data)
console.log('done.txt updated')

/*
 - go to https://docs.github.com/en/graphql/overview/explorer
 - set the correct project id
 - run the query (be careful, this only returns the first 100 elements)
 - save the JSON content as done.json
 - run this script
 - get the result in the file done.txt
/*


{
  repository(owner: "ethereum", name: "remix-project") {
    name
    projectV2(number: 52) {
      url
      items(first: 100) {
        totalCount
        edges {
          node {
            content {
              ... on PullRequest {
                            url
                            id
                            number
                            title
                            merged
                          }
            }
          }
        }
      }
    }
  }
}
*/
