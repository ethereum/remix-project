// tslint:disable-next-line
const open = require("open");

import {
  getContractDoc,
  mergeParametersWithDevdoc,
  getFunctionDocumentation,
  getContractDocumentation,
} from "./utils";
import { FunctionDescription } from "@remixproject/plugin";
import { buildFakeArtifactWithComments, buildFakeABIParameter } from "./faker";

jest.setTimeout(10000);

describe("Publisher tests", () => {
  describe("getContractDocumentation", () => {
    test("getContractDocumentation", () => {
      const result = getContractDocumentation(buildFakeArtifactWithComments());

      const result2 = {
        methods: {
          "age(uint256)": {
            author: "Mary A. Botanist",
            details:
              "The Alexandr N. Tetearing algorithm could increase precision",
            params: [Object],
            return: "age in years, rounded up for partial years",
          },
        },
        notice: "You can use this contract for only the most basic simulation",
        author: "Larry A. Gardner",
        details:
          "All function calls are currently implemented without side effects",
        title: "A simulator for trees",
      };

      expect(result).toBeDefined();
    });
  });

  describe("getContractDoc", () => {
    test("getContractDoc", () => {
      const template = getContractDoc(
        "Fallout",
        buildFakeArtifactWithComments()
      );

      expect(template).toBeDefined();
    });

    test("getContractDoc", () => {
      const template = getContractDoc("Owner", {
        ...buildFakeArtifactWithComments(),
        abi: [
          {
            inputs: [],
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: "address",
                name: "oldOwner",
                type: "address",
              },
              {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
              },
            ],
            name: "OwnerSet",
            type: "event",
          },
          {
            inputs: [
              {
                internalType: "address",
                name: "newOwner",
                type: "address",
              },
            ],
            name: "changeOwner",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [],
            name: "getOwner",
            outputs: [
              {
                internalType: "address",
                name: "",
                type: "address",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ] as any,
        devdoc: {
          details: "Set & change owner",
          methods: {
            "changeOwner(address)": {
              details: "Change owner",
              params: {
                newOwner: "address of new owner",
              },
            },
            constructor: {
              details: "Set contract deployer as owner",
            },
            "getOwner()": {
              details: "Return owner address ",
              returns: {
                _0: "address of owner",
              },
            },
          },
          title: "Owner",
        } as any,
        userdoc: {
          methods: {},
        } as any,
      });

      expect(template).toBeDefined();
    });
  });

  describe("getFunctionDocumentation", () => {
    test("getFunctionDocumentation", () => {
      const abiItem: FunctionDescription = {
        constant: false,
        inputs: [],
        name: "Fal1out",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function",
      };

      const result = getFunctionDocumentation(abiItem, {});

      expect(result).toBeDefined();
    });
  });

  describe("mergeParametersWithDevdoc", () => {
    test("mergeParametersWithDevdoc", () => {
      const abiParameters = [buildFakeABIParameter()];
      const devParams = {};
      const result = mergeParametersWithDevdoc(abiParameters, devParams);

      expect(result.length).toEqual(1);
    });

    test("mergeParametersWithDevdoc with documentation", () => {
      const abiParameters = [buildFakeABIParameter()];
      const devParams = {};
      const result = mergeParametersWithDevdoc(abiParameters, devParams);

      expect(result.length).toEqual(1);
    });
  });

  test.skip("html generation", async () => {
    await open(
      "https://ipfs.io/ipfs/QmPYQyWyTrUZt3tjiPsEnkRQxedChYUjgEk9zLQ36SfpyW",
      { app: ["google chrome", "--incognito"] }
    );
    // start server
    // generate html
    // server it
  });
});
