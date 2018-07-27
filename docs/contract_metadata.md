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

Note that Remix will resolve addresses corresponding to the current network.
By default, a configuration key follow the form: `<network_name>:<networkd_id>`, but it is also possible
to define `<network_name>` or `<network_id>` as keys.

```
{
	"VM:-": {
		"linkReferences": {
			"browser/Untitled.sol": {
				"lib": "<address>",
				"lib2": "<address>"
			}
		},
		"autoDeployLib": true
	},
	"main:1": {
		"linkReferences": {
			"browser/Untitled.sol": {
				"lib": "<address>",
				"lib2": "<address>"
			}
		},
		"autoDeployLib": true
	},
	"ropsten:3": {
		"linkReferences": {
			"browser/Untitled.sol": {
				"lib": "<address>",
				"lib2": "<address>"
			}
		},
		"autoDeployLib": true
	},
	"rinkeby:4": {
		"linkReferences": {
			"browser/Untitled.sol": {
				"lib": "<address>",
				"lib2": "<address>"
			}
		},
		"autoDeployLib": true
	},
	"kovan:42": {
		"linkReferences": {
			"browser/Untitled.sol": {
				"lib": "<address>",
				"lib2": "<address>"
			}
		},
		"autoDeployLib": true
	}
}
```
