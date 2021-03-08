import React, { useState, useEffect, useRef } from "react";
import { AppContext } from "../AppContext";
import { ContractName, Documentation } from "../types";
import { publish } from "../utils";
import { htmlTemplate } from "../utils/template";

export const HomeView: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [htmlDocumentation, setHtmlDocumentation] = useState("");
  const [hasErrorOnPublishing, setHasErrorOnPublishing] = useState(false);
  const [publishedURL, setPublishedURL] = useState("");
  const clearMessageFuncRef = useRef(undefined as any);

  useEffect(() => {
    const maxNumberOfRetries = 1;
    let retries = 0;

    const publishDocumentation = async () => {
      try {
        if (clearMessageFuncRef.current) {
          clearTimeout(clearMessageFuncRef.current);
        }
        const hash = await publish(htmlDocumentation);
        console.log("Hash", hash);
        setIsPublishing(false);

        const url = `https://ipfs.io/ipfs/${hash}`;

        window.open(url);
        setPublishedURL(url);
      } catch (error) {
        if (retries < maxNumberOfRetries) {
          console.log("Retrying...");
          retries++;
          publishDocumentation();
        } else {
          setIsPublishing(false);
          setHasErrorOnPublishing(true);

          clearMessageFuncRef.current = setTimeout(() => {
            setHasErrorOnPublishing(false);
          }, 5000);
        }
      }
    };

    if (isPublishing) {
      setHasErrorOnPublishing(false);
      publishDocumentation();
    }
  }, [isPublishing, htmlDocumentation]);

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
                        setPublishedURL("");
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
                    setPublishedURL("");
                  }}
                >
                  Clear
                </button>
              </div>
              <div>
                {activeItem !== "" && (
                  <PublishButton
                    isPublishing={isPublishing}
                    item={activeItem}
                    onClick={() => {
                      console.log("Is publishing");
                      setIsPublishing(true);
                    }}
                  />
                )}
              </div>
              {!isPublishing && publishedURL !== "" && (
                <>
                  <div className="small mt-1">
                    <a rel="noreferrer" href={publishedURL} target="_blank">
                      {publishedURL}
                    </a>
                  </div>
                </>
              )}

              {hasErrorOnPublishing && (
                <div>
                  <label>Something unexpected happen, Please try again</label>
                </div>
              )}
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
  item: string;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  isPublishing,
  onClick,
  item,
}) => {
  return (
    <button
      style={{ marginTop: "1em" }}
      className="btn btn-secondary btn-sm btn-block"
      disabled={isPublishing}
      onClick={onClick}
    >
      {!isPublishing && <span>Publish {item}</span>}

      {isPublishing && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            style={{ marginRight: "0.5em" }}
          />
          <p style={{ margin: "0" }}>Publishing...Please wait</p>
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
