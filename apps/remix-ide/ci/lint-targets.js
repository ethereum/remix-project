const { spawnSync } = require('child_process')
const fs = require('fs')
const file = fs.readFileSync('projects.json')
const projects = JSON.parse(file)
console.log(Object.keys(projects.graph.nodes))
for(let node of Object.keys(projects.graph.nodes)){
 if(projects.graph.nodes[node].data.targets.lint){
    console.log(projects.graph.nodes[node].data.name)
    spawnSync('yarn', ['lint', projects.graph.nodes[node].data.name], { stdio: 'inherit' })
 }
}