# Content Import

- Name in Remix: `solidityUnitTesting`
- kind: `unitTesting`

|Type     |Name                   |Description |
|---------|-----------------------|------------|
|_method_ |`testFromPath`         |Run a solidity test that is inside the file system
|_method_ |`testFromSource`       |Run a solidity test file from the source

## Examples

### Methods
`testFromPath`: Run a solidity test that is inside the file system
```typescript
const path = "browser/ballot_test.sol"

const result = await client.call('solidityUnitTesting', 'testFromPath', path)
// OR
const result = await client.solidityUnitTesting.testFromPath(path)
```

`testFromSource`: Run a solidity test file from the source
```typescript
const testFile = `
pragma solidity >=0.5.0 <0.6.0;
import "remix_tests.sol";
import "./HelloWorld.sol";  // HelloWorl.sol must be in "browser"

contract HelloWorldTest {
  HelloWorld helloWorld;
  function beforeEach() public {
    helloWorld = new HelloWorld();
  }

  function checkPrint () public {
    string memory result = helloWorld.print();
    Assert.equal(result, string('Hello World!'), "Method 'print' should return 'Hello World!'");
  }
}
`

const result = await client.call('solidityUnitTesting', 'testFromSource', testFile)
// OR
const result = await client.solidityUnitTesting.testFromSource(testFile)
```

## Types
`ContentImport`: An object that describes the returned file
```typescript
export interface UnitTestResult {
  totalFailing: number
  totalPassing: number
  totalTime: number
  errors: UnitTestError[]
}
```

> Type Definitions can be found [here](../src/lib/unit-testing/type.ts)