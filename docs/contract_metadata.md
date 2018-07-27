Build Artifact
==============

As compilation succeed Remix create a JSON file for each compiled contract.
These JSON files contains several metadata

Library Deployment
------------------

By default Remix automatically deploy needed libraries.

`linkReferences` contains a map representing libraries which depend on the current contract. 
Values are addresses of libraries used for linking the contract.

`autoDeployLib` defines if the libraries should be auto deployed by Remix or if the contract should be linked with libraries described in `linkReferences`

```
{
	"linkReferences": {
		"browser/Untitled.sol": {
			"lib": "0x8c1ed7e19abaa9f23c476da86dc1577f1ef401f5"
		}
	},
	"autoDeployLib": false
}
```
