import {
  CompilationResult,
  CompiledContract,
  FunctionDescription,
  ABIParameter,
  ABIDescription,
} from "@remixproject/plugin";

import { FileName, Documentation, ContractName } from "../types";
import { template } from "./template";
import {
  ContractDocumentation,
  MethodDoc,
  FunctionDocumentation,
  ParameterDocumentation,
  MethodsDocumentation,
} from "./types";

export const createDocumentation = (
  fileName: FileName,
  compilationResult: CompilationResult
) => {
  console.log("Filename", fileName);
  const result = new Map<ContractName, Documentation>();

  const contracts = compilationResult.contracts[fileName];
  console.log("Contracts", contracts);

  Object.keys(contracts).forEach((name) => {
    console.log("CompiledContract", JSON.stringify(contracts[name]));
    result.set(name, getContractDoc(name, contracts[name]));
  });

  return result;
};

export const getContractDoc = (name: string, contract: CompiledContract) => {
  const contractDoc: ContractDocumentation = getContractDocumentation(contract);

  const onlyFunctions = contract.abi.filter((item) => {
    return item.type !== "event";
  });

  const functionsDocumentation = onlyFunctions.map((def: ABIDescription) => {
    if (def.type === "constructor") {
      def.name = "constructor";
      // because "constructor" is a string and not a { notice } object for userdoc we need to do that
      const methodDoc = {
        ...(contract.devdoc.methods.constructor || {}),
        notice:
          Object.keys(contract.userdoc.methods.constructor).length > 0
            ? (contract.userdoc.methods.constructor as string)
            : "",
      };
      return getFunctionDocumentation(def, methodDoc);
    } else {
      if (def.type === "fallback") {
        def.name = "fallback";
      }
      const method = Object.keys(contractDoc.methods).find((key) =>
        key.includes(def.name as string)
      ) as string;
      const methodDoc = contractDoc.methods[method];
      return getFunctionDocumentation(def as FunctionDescription, methodDoc);
    }
  });

  // console.log("contractDoc", contractDoc)
  // console.log("functionsDocumentation", functionsDocumentation)

  try {
    const finalResult = template(name, contractDoc, functionsDocumentation);
    return finalResult

  } catch (error) {
    console.log("ERROR", error)
    return ''
  }

};

export const getContractDocumentation = (contract: CompiledContract) => {
  const methods = { ...contract.userdoc.methods, ...contract.devdoc.methods }
  const contractDoc = { ...contract.userdoc, ...contract.devdoc, ...methods };

  return contractDoc;
};

export const getFunctionDocumentation = (
  def: FunctionDescription,
  devdoc?: Partial<MethodDoc>
) => {
  const doc = devdoc || {};
  const devparams = doc.params || {};
  const inputsWithDescription = mergeParametersWithDevdoc(
    def.inputs || [],
    devparams
  );
  const outputsWithDescription = mergeParametersWithDevdoc(
    def.outputs || [],
    devparams
  );
  const type = def.constant ? "view" : "read";

  return {
    name: def.name,
    type,
    devdoc,
    inputs: inputsWithDescription,
    outputs: outputsWithDescription,
  } as FunctionDocumentation;
};

export const mergeParametersWithDevdoc = (
  params: ABIParameter[],
  devparams: any
) => {
  return params.map((input) => {
    const description = devparams[input.name] || "";
    return {
      name: input.name,
      type: input.type,
      description,
    } as ParameterDocumentation;
  });
};
