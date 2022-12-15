// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { EnvironmentProps } from "../types";
import { Dropdown, Button } from "react-bootstrap";
import { CustomMenu, CustomToggle, CustomTooltip } from "@remix-ui/helper";
import { HashConnect, HashConnectTypes } from "hashconnect";

const appMetaData = {
  name: "Remix dApp",
  description: "Hedera Remix dApp",
  icon: "http://accubits.com/wp-content/uploads/2017/06/logo.png",
};

export function EnvironmentUI(props: EnvironmentProps) {
  const hashconnect = new HashConnect();
  const [hasExtension, setHasExtension] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [initData, setInitData] =
    useState<HashConnectTypes.InitilizationData>();

  const init = async () => {
    const _initData = await hashconnect.init(appMetaData, "testnet", true);
    setInitData(_initData);
    hashconnect.foundExtensionEvent.once((walletMetadata) => {
      setHasExtension(true);
      console.log("walletMetadata", walletMetadata);
    });

    hashconnect.pairingEvent.once((pairingData) => {
      console.log("pairingData", pairingData);
    });
    hashconnect.acknowledgeMessageEvent.once((acknowledgeData) => {
      console.log("acknowledgeData", acknowledgeData);
    });
  };

  const handleChangeExEnv = async () => {
    await init();
    if (initData.savedPairings.length === 0) {
      hashconnect.connectToLocalWallet();
    }
  };

  useEffect(() => {
    if (initData?.savedPairings.length > 0) {
      setAccountId(initData.savedPairings[0].accountIds[0]);
    }
  }, [initData]);

  useEffect(()=>{
    init();
  },[])

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        <FormattedMessage id="udapp.environment" />
      </label>
      <div className="udapp_environment">
        {accountId ? <a>{accountId}</a> : hasExtension && (
          <Button onClick={handleChangeExEnv}>
              { "Connect Hashpack Wallet"}
          </Button>
         )}

      </div>
    </div>
  );
}
