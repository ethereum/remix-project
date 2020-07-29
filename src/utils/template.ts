import {
  FunctionDocumentation,
  TemplateDoc,
  MethodDoc,
  ContractDocumentation,
  ParameterDocumentation,
} from "./types";
type HTMLContent = string;

export const htmlTemplate = (content: HTMLContent) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="utf-8" />
  <meta
      name="description"
      content="Web site created with EthDoc"
  />
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  </head>
  <body>
      ${content}
  </body>
  </html>
`;
};

export const template = (
  name: string,
  contractDoc: ContractDocumentation,
  functions: FunctionDocumentation[]
) => `
    <style>
        #ethdoc-viewer{
            font-size: 0.8em;
            padding: 1em;
        }
        #ethdoc-viewer .lead{
            font-size: 1em;
        }
        #ethdoc-viewer table {
            width: 50%;
        }
        #ethdoc-viewer hr {
            margin: 0;
            margin-bottom: 0.5rem;
        }
        #ethdoc-viewer p{
            margin-bottom: 0.5rem;
        }
    </style>

    <div id="ethdoc-viewer">
    
        ${
          functions.length === 0
            ? "No contract to display"
            : renderHeader(name, contractDoc)
        }

        ${functions
          .map(
            (item) => `
          <hr>
            <h6>${item.name} - ${item.type} </h6>

            ${getMethodDetails(item.devdoc)}

            ${renderParameterDocumentation(item.inputs)}
                  
            <p>Returns:</p>
           
            ${renderParameterDocumentation(item.outputs)}
            `
          )
          .join("\n")}
    
    </div>
`;

const devMethodDocTemplate: Partial<TemplateDoc<MethodDoc>> = {
  author: (author: string) => `<p>Created By ${author}</p>`,
  details: (details: string) => `<p>${details}</p>`,
  return: (value: string) => `<p>Return : ${value}</p>`,
  notice: (notice: string) => (notice ? `<p>${notice}</p>` : ""),
  // returns: () => '', // Implemented by getParams()
  params: () => "", // Implemented by getParams()
};

export const renderHeader = (
  name: string,
  contractDoc: ContractDocumentation
) => `
    <h3>${name} ${
  contractDoc.title ? `<small>: ${contractDoc.title}</small>` : ""
}</h3>

    ${contractDoc.notice ? `<p class="lead">${contractDoc.notice}</p>` : ""}

    ${contractDoc.author ? `<p>Author: ${contractDoc.author}</p>` : ""}

    <p><strong>Functions</strong></p>
`;

export const renderParameterDocumentation = (
  parameters: ParameterDocumentation[]
) =>
  `${
    parameters.length > 0
      ? `<table class="table table-sm table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
    ${parameters
      .map(
        (output) => `<tr>
        <td>${output.name}</td>
        <td>${output.type}</td>
        <td>${output.description}</td>
        </tr>`
      )
      .join("")}
              </tbody>
      </table>`
      : "<p>No parameters</p>"
  }`;

export const getMethodDetails = (devMethod?: Partial<MethodDoc>) => {
  const finalResult = !devMethod
    ? "<p><strong>**Add Documentation for the method here**</strong></p>"
    : Object.keys(devMethod)
        .filter((key) => key !== "params")
        .map((key) => {
          const funcToGetTemplate = (devMethodDocTemplate as any)[key];

          if (!funcToGetTemplate) {
            return "";
          }
          const funcParameter = (devMethod as any)[key];
          const result = funcToGetTemplate(funcParameter);
          return result;
        })
        .join("\n");

  console.log("finalResult", finalResult);
  return finalResult;
};
