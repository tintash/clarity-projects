import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import { atom, useAtom } from "jotai";
import { useLoading } from "./use-loading";
import { LOADING_KEYS } from "../../store/ui";
import { useConnect } from "@stacks/connect-react";
import { useNetwork } from "./use-network";
import { useCurrentAddress } from "./use-current-address";
import {
  RR_REFER_USER,
  REFER_REWARD_CONTRACT,
  RR_PERFORM_TRANSACTION,
} from "../constants";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";
import { stringAsciiCV } from "@stacks/transactions";

// import {
//   cvToHex,
//   cvToJSON,
//   cvToString,
//   hexToCV,
//   uintCV,
// } from "@stacks/transactions";
// import BN from "bn.js";

export const userPrincipalAtom = atom("");
export const userEmailAtom = atom("");

export function useUserPrincipalForm() {
  const [principalValue, setPrincipalValue] = useAtom<string, string>(
    userPrincipalAtom
  );

  const onChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setPrincipalValue(event.currentTarget.value);
    },
    [setPrincipalValue]
  );

  return {
    principalValue,
    onChange,
  };
}

export function useUserEmailForm() {
  const [emailValue, setEmailValue] = useAtom<string, string>(userEmailAtom);

  const onChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setEmailValue(event.currentTarget.value);
    },
    [setEmailValue]
  );

  return {
    emailValue,
    onChange,
  };
}

export function useReferUserButton() {
  const address = useCurrentAddress();
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const { setIsLoading } = useLoading(LOADING_KEYS.AUTH);
  const { doContractCall } = useConnect();

  // const
  const network = useNetwork();

  const onCancel = useCallback(() => {
    toast.success("Cancelled!");
    // void setIsLoading(false);
  }, [toast]);

  const onFinish = useCallback(() => {
    toast.success("Transaction sent!");
    // void setIsLoading(false);
  }, [toast]);

  return useCallback(
    (userAddress: string, email: string) => {
      if (!userAddress || !email) return null;
      console.log(userAddress, email);
      // void setIsLoading(true);

      void doContractCall({
        contractAddress,
        contractName,
        functionName: RR_REFER_USER,
        functionArgs: [stringAsciiCV(email), principalCV(userAddress || "")],
        onCancel,
        network,
        stxAddress: address,
      });
    },
    [network, onFinish, onCancel, address, doContractCall]
  );
}

export function usePerformTransaction() {
  const address = useCurrentAddress();
  const [contractAddress, contractName] = REFER_REWARD_CONTRACT.split(".");
  const { setIsLoading } = useLoading(LOADING_KEYS.AUTH);
  const { doContractCall } = useConnect();

  // const
  const network = useNetwork();

  const onCancel = useCallback(() => {
    toast.success("Cancelled!");
    // void setIsLoading(false);
  }, [toast]);

  const onFinish = useCallback(() => {
    toast.success("Transaction sent!");
    // void setIsLoading(false);
  }, [toast]);

  return useCallback(() => {
    console.log("performing trasaction");
    // void setIsLoading(true);

    void doContractCall({
      contractAddress,
      contractName,
      functionName: RR_PERFORM_TRANSACTION,
      functionArgs: [],
      onCancel,
      network,
      stxAddress: address,
    });
  }, [network, onFinish, onCancel, address, doContractCall]);
}
