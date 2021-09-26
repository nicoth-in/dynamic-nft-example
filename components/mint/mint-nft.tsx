import React, { FormEvent, useState } from "react";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import { createRaribleSdk } from "@rarible/protocol-ethereum-sdk";
import { useWeb3 } from "../use-web3";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import styles from "../../styles/mint.module.css";
import * as ethers from "ethers";
import { RaribleContractArtifact } from "./rarible-contract-artifact";
import { ContractArtifact } from "./smart-contract";
import * as uint8arrays from "uint8arrays";
import BigNumber from "bignumber.js";

function StoreMetadata(props: {
  metadata: any;
  onMetadataCid: (cid: string) => void;
}) {
  const [progress, setProgress] = useState(false);
  const [metadataCid, setMetadataCid] = useState(null);

  const handleStoreMetadata = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProgress(true);
    const blob = JSON.stringify(props.metadata);
    const file = new File([blob], "metadata.json");
    const formData = new FormData();
    formData.set("file", file);
    fetch("/api/persist", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((response) => {
        const cid = response.cid;
        setMetadataCid(cid);
        props.onMetadataCid(cid);
      })
      .finally(() => {
        setProgress(false);
      });
  };

  const renderMetadataCid = () => {
    if (!metadataCid) {
      return <></>;
    } else {
      return (
        <div className={`${styles.inputGroup} mt-3 p-2 rounded-lg bg-gray-100`}>
          <label htmlFor="metadata-cid" className={styles.inputTextLabel}>
            Metadata CID
          </label>
          <input
            type="text"
            disabled={true}
            name="metadata-cid"
            id="metadata-cid"
            value={metadataCid}
          />
        </div>
      );
    }
  };

  const formClassName = progress ? styles.disabledForm : "";
  return (
    <form onSubmit={handleStoreMetadata} className={formClassName}>
      <div className={styles.inputGroup}>
        <label htmlFor="token-name" className={styles.inputTextLabel}>
          Metadata JSON
        </label>
        <textarea
          className={"mb-3"}
          disabled={true}
          value={JSON.stringify(props.metadata, null, 4)}
          rows={6}
        />
        <button type={"submit"} disabled={progress}>
          Store metadata on IPFS
        </button>
      </div>
      {renderMetadataCid()}
    </form>
  );
}

function MintToken(props: {
  metadata: any;
  metadataCid: string;
  onTokenId: (contract: string, tokenId: string) => void;
}) {
  const [progress, setProgress] = useState(false);
  const [txToken, setTxToken] = useState<
    { tokenId: string; txid: string; contract: string } | undefined
  >(undefined);
  const web3 = useWeb3();
  // const rarible = createRaribleSdk(new Web3Ethereum(web3), web3.networkName, {
  //   fetchApi: fetch.bind(window),
  // });
  // const contractAddress = "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"; // rinkeby
  const chainId = web3.chainId.toString();
  // @ts-ignore
  const contractAddress = "0xA1dD0141aE700F5444a1711081f136AAB7238c97";
  if (!contractAddress) {
    return <p>No Rarible contract found for chainId {chainId}</p>;
  }
  const minter = web3.account;

  // var safemathContract = new web3.web3.eth.Contract([]);
  // var safemath = safemathContract.deploy({
  //   data: '0x60566050600b82828239805160001a6073146043577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea2646970667358221220b1e2477b453b1e9203360d22dac66f60d63f8fa3b247a565e4be39f4a36d365f64736f6c63430008060033',
  //   arguments: [
  // ]
  // }).send({
  //   from: web3.account,
  //   gas: 4700000
  // }, function (e, contract){
  //   console.log(e, contract);
  // });

  // return;
  //const tokenIdEndpoint = `https://api-dev.rarible.com/protocol/v0.1/ethereum/nft/collections/${contractAddress}/generate_token_id?minter=${minter}`;

  const mintHandler = async () => {
    function packedTokenId(tokenId: number) {
      const minterBytes = uint8arrays.fromString(
        minter.toLowerCase().replace("0x", ""),
        "base16"
      );
      const tokenHex = tokenId.toString(16);
      const paddedTokenHex = tokenHex.length % 2 == 0 ? tokenHex : `0${tokenHex}`;
      const tokenBytes = uint8arrays.fromString(paddedTokenHex, "base16");
      const fullLength = 32; // uin256 in bytes
      const paddingLength =
        fullLength - tokenBytes.byteLength - minterBytes.byteLength;
      const padding = new Uint8Array(paddingLength);
      const resultingBytes = uint8arrays.concat([
        minterBytes,
        padding,
        tokenBytes,
      ]);
      return "0x" + uint8arrays.toString(resultingBytes, "base16");
    }


    // const mintResult = await rarible.nft.mint({
    //   lazy: false,
    //   collection: {
    //     id: contractAddress,
    //     type: "ERC721",
    //     supportsLazyMint: false,
    //   },
    //   uri: props.metadataCid,
    //   creators: [{ account: toAddress(minter), value: 10000 }],
    //   royalties: [{ account: toAddress(minter), value: 1000 }],
    // });
    // console.log('m', mintResult)
    const provider = new ethers.providers.Web3Provider(web3.provider);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      ContractArtifact.abi,
      signer
    );
    const uri = props.metadataCid;
    const tokenId = packedTokenId(Math.round(Math.random() * 1000) as number);

    console.log(contract);
    
    const tx = await contract.methods.transferFrom(
      0,
      {
        tokens: [],
        token_addr: contractAddress,
        price: 10000,
        token_price: [],
        numTokens: 0,
        eDateEnd: "",
        buyer: minter,
        owner: minter,
      },
      1,
      "my token",
      "ntd",
      // [
      //   tokenId,
      //   uri,
      //   [[minter, 10000]], // You can assign one or add multiple creators, but the value must total 10000
      //   [[minter, 1000]], // Royalties are set as basis point, so 1000 = 10%.
      //   ["0x"],
      // ],
      // minter
    ).call();
    const receipt = await tx.wait();
    const decimalTokenId = new BigNumber(tokenId).toString(10);
    setTxToken({
      tokenId: decimalTokenId,
      txid: receipt.transactionHash,
      contract: contract.address,
    });
    props.onTokenId(contract.address, decimalTokenId);

    setProgress(false);

  };

  const handleSubmit = () => {
    mintHandler().then(_ => {})
  }

  if (!props.metadataCid) {
    return <></>;
  }

  const renderResult = () => {
    if (!txToken) {
      return <></>;
    }

    return (
      <div className={`${styles.inputGroup} mt-3 p-2 rounded-lg bg-gray-100`}>
        <label htmlFor="transaction-txid" className={styles.inputTextLabel}>
          Transaction
        </label>
        <input
          type="text"
          disabled={true}
          name="transaction-txid"
          id="transaction-txid"
          className={"mb-2"}
          value={txToken.txid}
        />
        <label htmlFor="token-id" className={styles.inputTextLabel}>
          Token ID
        </label>
        <input
          type="text"
          disabled={true}
          name="token-id"
          id="token-id"
          className={"mb-2"}
          value={txToken.tokenId}
        />
        <label htmlFor="contract-address" className={styles.inputTextLabel}>
          Contract Address
        </label>
        <input
          type="text"
          disabled={true}
          name="contract-address"
          id="contract-address"
          value={txToken.contract}
        />
      </div>
    );
  };

  const formClassName = progress ? styles.disabledForm : "";
  return (
    <form onSubmit={handleSubmit} className={`mt-3 ${formClassName}`}>
      <button type={"submit"} disabled={progress}>
        Mint ERC721 token
      </button>
      {renderResult()}
    </form>
  );
}

export function MintNft(props: {
  tile: TileDocument;
  onDone: (contract: string, tokenId: string) => void;
}) {
  const [metadataCid, setMetadataCid] = useState("");

  const metadata = {
    name: props.tile.content.name,
    description: props.tile.content.description,
    subTokenId: props.tile.content.tokenId,
    subTokenontract: props.tile.content.contract,
    ceramicContent: `ceramic://${props.tile.id.toString()}`,
  };

  return (
    <>
      <h1>2. MintNFT</h1>
      <StoreMetadata
        metadata={metadata}
        onMetadataCid={(cid) => setMetadataCid(cid)}
      />
      <MintToken
        metadata={metadata}
        metadataCid={metadataCid}
        onTokenId={(contract, tokenId) => props.onDone(contract, tokenId)}
      />
    </>
  );
}
