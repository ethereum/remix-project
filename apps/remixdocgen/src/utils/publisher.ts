import { HTMLContent } from "./types";

// tslint:disable-next-line
const IpfsClient = require("ipfs-mini");

export const publish = async (content: HTMLContent) => {
  const ipfs = new IpfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });

  const documentHash = await ipfs.add(content);

  console.log("Document hash", documentHash);

  return documentHash;
};
