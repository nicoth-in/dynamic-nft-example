import React, { FormEvent, useEffect, useState } from "react";
import { useCeramic } from "use-ceramic";
import styles from "../../styles/mint.module.css";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { useWeb3 } from "../use-web3";
import { useRaribleTokens } from "../rarible-api";

export function CreateStream(props: {
  onCreate: (tile: TileDocument) => void;
}) {
  const ceramic = useCeramic();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contract, setContract] = useState({contract: "", tokenId: ""});
  const [tokenId, setTokenId] = useState("");
  const [progress, setProgress] = useState(false);
  const [streamId, setStreamId] = useState("");

  const { tokensAvailable } = useRaribleTokens();

  const web3 = useWeb3();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setProgress(true);

    if (!name) {
      setProgress(false);
      alert("Add name");
      return;
    }

    if (!description) {
      setProgress(false);
      alert("Add description");
      return;
    }

    if (!contract) {
      setProgress(false);
      alert("Add contract");
      return;
    }

    TileDocument.create(ceramic.client, {
      name: name,
      description: description,
      tokenId: contract.tokenId,
      contract: contract.contract,
    }).then(tile => {
      setProgress(false);
      setStreamId(tile.id.toString());
      props.onCreate(tile);
    })

    

  };

  const renderStreamId = () => {
    if (!streamId) {
      return <></>;
    } else {
      return (
        <div className={`${styles.inputGroup} mt-3 p-2 rounded-lg bg-gray-100`}>
          <label htmlFor="stream-id" className={styles.inputTextLabel}>
            StreamID
          </label>
          <input
            type="text"
            disabled={true}
            name="stream-id"
            id="stream-id"
            value={streamId}
          />
        </div>
      );
    }
  };

  const formClassName = progress ? styles.disabledForm : "";

  return (
    <>
      <h1>Create option bundle</h1>
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className={styles.inputGroup}>
          <label htmlFor="token-name" className={styles.inputTextLabel}>
            Name
          </label>
          <input
            disabled={progress}
            type="text"
            name="token-name"
            id="token-name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="token-description" className={styles.inputTextLabel}>
            Description
          </label>
          <input
            type="text"
            disabled={progress}
            name="token-description"
            id="token-description"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="token-contract" className={styles.inputTextLabel}>
            Contract
          </label>
          {/* <input
            type="text"
            disabled={progress}
            name="token-contract"
            id="token-contract"
            value={contract}
            placeholder="0x1234567.."
            
          /> */}
          <select
            name="token-contract"
            id="token-contract"
            disabled={progress}
            onChange={(event) => setContract(tokensAvailable[+event.currentTarget.value])}
          >
            {tokensAvailable.map((t: any, i) => (<option value={i} key={t.contract}>{t.meta.name} - {t.id}</option>))}
          </select>
        </div>

        {/* <div className={styles.inputGroup}>
          <label htmlFor="token-token-id" className={styles.inputTextLabel}>
            Token ID
          </label>
          <input
            type="text"
            disabled={progress}
            name="token-token-id"
            id="token-token-id"
            value={tokenId}
            placeholder="123"
            onChange={(event) => setTokenId(event.currentTarget.value)}
          />
        </div> */}
        <hr />
        <button type={"submit"} disabled={progress}>
          Create stream
        </button>
        {renderStreamId()}
      </form>
    </>
  );
}
