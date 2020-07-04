import React, { useState, useEffect } from "react";
import { AppContext } from "../AppContext";
import { ContractName, Documentation } from "../types";
import { publish } from "../utils";
import { htmlTemplate } from "../utils/template";

export const HomeView: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [htmlDocumentation, setHtmlDocumentation] = useState("");

  useEffect(() => {
    async function publishDocumentation() {
      try {
        const hash = await publish(htmlDocumentation);
        console.log("Hash", hash);
        setIsPublishing(false);

        const url = `https://ipfs.io/ipfs/${hash}`;

        window.open(url);
      } catch (error) {
        setIsPublishing(false);
      }
    }

    if (isPublishing) {
      publishDocumentation();
    }
  }, [isPublishing]);

  const displayDocumentation = (
    client: any,
    contractName: ContractName,
    documentation: Documentation
  ) => {
    console.log("Display Documentation", contractName, documentation);

    client.emit("documentation-generated", documentation);
  };

  return (
    <AppContext.Consumer>
      {({ clientInstance, contracts, setContracts }) => (
        <div id="ethdoc">
          {[...contracts.keys()].length === 0 && (
            <p>Compile a contract with Solidity Compiler</p>
          )}

          {[...contracts.keys()].length > 0 && (
            <div>
              <div className="list-group">
                {[...contracts.keys()].map((item) => {
                  const documentation = contracts.get(item) as string;
                  return (
                    <button
                      key={item}
                      className={
                        activeItem === item
                          ? "list-group-item list-group-item-action active"
                          : "list-group-item list-group-item-action"
                      }
                      aria-pressed="false"
                      onClick={() => {
                        setActiveItem(item);
                        displayDocumentation(
                          clientInstance,
                          item,
                          documentation
                        );
                        const documentationAsHtml = htmlTemplate(documentation);
                        setHtmlDocumentation(documentationAsHtml);
                      }}
                    >
                      {item} Documentation
                    </button>
                  );
                })}
              </div>
              <div style={{ float: "right" }}>
                <button
                  type="button"
                  className="btn btn-sm btn-link"
                  onClick={() => {
                    setContracts(new Map());
                    displayDocumentation(clientInstance, "", "");
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ width: "15em" }}>
                {activeItem !== "" && (
                  <PublishButton
                    isPublishing={isPublishing}
                    onClick={() => {
                      console.log("Is publishing");
                      setIsPublishing(true);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppContext.Consumer>
  );
};

interface PublishButtonProps {
  isPublishing: boolean;
  onClick: any;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  isPublishing,
  onClick,
}) => {
  return (
    <button
      style={{ marginTop: "1em" }}
      className="btn btn-secondary btn-sm btn-block"
      disabled={isPublishing}
      onClick={onClick}
    >
      {!isPublishing && "Publish"}

      {isPublishing && (
        <div>
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            style={{ marginRight: "0.3em" }}
          />
          Publishing...Please wait
        </div>
      )}
    </button>
  );
};

// <label class="btn btn-secondary active">
//   <input type="radio" name="options" id="option1" checked> Active
//   </label>
//   <label class="btn btn-secondary">
//     <input type="radio" name="options" id="option2"> Radio
//   </label>
//     <label class="btn btn-secondary">
//       <input type="radio" name="options" id="option3"> Radio
//   </label>
