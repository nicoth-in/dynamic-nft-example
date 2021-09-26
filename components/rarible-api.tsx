import React, { useEffect, useState } from "react";
import styles from "../styles/layout.module.css";
import Link from "next/link";
import { ActiveLink } from "./active-link";
import { useCeramic } from "use-ceramic";
import { useWeb3 } from "./use-web3";


const RARIBLE_ENDPOINT = "https://api-dev.rarible.com";

export function useRaribleTokens() {

    const [tokensAvailable, setTokensAvailable] = useState([]);
    const web3 = useWeb3();

    const getTokens = async () => {
        let accounts = await web3.web3.eth.getAccounts();
        let response = await fetch(
            `${RARIBLE_ENDPOINT}/protocol/v0.1/ethereum/nft/items/byOwner?owner=${accounts[0]}&includeMeta=true`
        );
        return await response.json();
      };

    useEffect(() => {
        getTokens()
          .then(tokens => {
            setTokensAvailable(tokens.items);
          });
    }, []);

    return { tokensAvailable };
}