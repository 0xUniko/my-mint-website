import { useState } from "react";
import Web3 from "web3";

const is_development = process.env.NODE_ENV === "development";

declare global {
  interface Window {
    ethereum: any;
  }
}

type ValidChains =
  | "goerli"
  | "kovan"
  | "mainnet"
  | "rinkeby"
  | "ropsten"
  | "sepolia";

export default function BatchMint() {
  const [providerAddr, setProviderAddr] = useState(
    is_development ? process.env.NEXT_PUBLIC_GOERLI_PROVIDER : ""
  );
  let provider = providerAddr
    ? new Web3.providers.HttpProvider(providerAddr)
    : undefined;
  const [web3, setWeb3] = useState(provider ? new Web3(provider) : undefined);

  // connect metamask
  const [metamaskAccount, setMetamaskAccount] = useState();

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.enable();
        // 请求用户账号授权
        // 如果未授权就会弹出下图授权界面, 如果已授权就跳过了
        setMetamaskAccount(accounts[0]);
      } catch (error) {
        alert("User denied account access");
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  const MetaMaskConnector = (
    <div>
      <div>
        <button onClick={connectMetaMask}>connect metamask</button>
      </div>
      <div>metamask address: {metamaskAccount}</div>
    </div>
  );

  // private keys management
  const [privateKeys, setPrivateKeys] = useState<string[]>([
    //,
    //,
    is_development
      ? (process.env.NEXT_PUBLIC_PRIVATE_KEY_0 as string)
      : "private key0",
    is_development
      ? (process.env.NEXT_PUBLIC_PRIVATE_KEY_1 as string)
      : "private key1",
  ]);

  const Accounts = (
    <div>
      <div>
        private key0:{" "}
        <input
          value={privateKeys[0]}
          onChange={(e) =>
            setPrivateKeys((privateKeys) => [e.target.value, privateKeys[1]])
          }
        />
      </div>
      <div>
        private key1:{" "}
        <input
          value={privateKeys[1]}
          onChange={(e) =>
            setPrivateKeys((privateKeys) => [privateKeys[0], e.target.value])
          }
        />
      </div>
    </div>
  );

  // mint
  const [nftAddr, setNftAddr] = useState(
    "0x80300F48d9E0Cc51bfb57733ea947209b94737Cc"
  );
  const [inputEthValue, setInputEthValue] = useState(0);
  const [txData, setTxData] = useState(
    "0xa0712d680000000000000000000000000000000000000000000000000000000000000001"
  );

  const mint = async () => {
    if (web3) {
      const data = txData.replace(/^0x/, "");

      for (let key of privateKeys) {
        const acct = web3.eth.accounts.privateKeyToAccount(key).address;
        try {
          const nonce = await web3.eth.getTransactionCount(acct);
          const tx = {
            type: 2,
            chain: "mainnet" as ValidChains,
            from: acct,
            to: nftAddr,
            value: inputEthValue,
            nonce,
            gas: 100000,
            data,
          };

          console.log({ tx });

          const signedTx = await web3.eth.accounts.signTransaction(tx, key);

          const txSend = await web3.eth.sendSignedTransaction(
            signedTx.rawTransaction
          );

          console.log({ txSend });
        } catch (err) {
          alert(`error orcurs on account ${acct}`);
        }
      }
    }
  };

  const Mint = (
    <div>
      <div>
        nft address:{" "}
        <input value={nftAddr} onChange={(e) => setNftAddr(e.target.value)} />
      </div>
      <div>
        pay eth:{" "}
        <input
          value={inputEthValue}
          onChange={(e) => setInputEthValue(+e.target.value)}
          type="number"
        />
      </div>
      <div>
        data:{" "}
        <input value={txData} onChange={(e) => setTxData(e.target.value)} />
      </div>
      <button onClick={mint}>Mint</button>
    </div>
  );

  return (
    <div>
      {MetaMaskConnector}
      <div>
        http provider address:{" "}
        <input
          value={providerAddr}
          onChange={(e) => setProviderAddr(e.target.value)}
        />
        <button onClick={() => setWeb3(new Web3(providerAddr))}>
          set http provider
        </button>
      </div>
      <div>
        current http provider: {(web3?.eth.currentProvider as any)?.clientUrl}
      </div>
      {Accounts}
      {Mint}
    </div>
  );
}
