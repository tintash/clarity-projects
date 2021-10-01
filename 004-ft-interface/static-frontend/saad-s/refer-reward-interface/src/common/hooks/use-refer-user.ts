import React, { useCallback } from "react";
import { toast } from "react-hot-toast";
import { atom, useAtom } from "jotai";
// import { useLoading } from "./use-loading"; -- TODO: useLoading not working properly here
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
  // const { setIsLoading } = useLoading(LOADING_KEYS.AUTH);
  const { doContractCall } = useConnect();

  // const
  const network = useNetwork();

  const onCancel = useCallback(() => {
    toast.error("Cancelled!");
    // void setIsLoading(false);
  }, [toast]);

  const onFinish = useCallback(() => {
    toast.success("Transaction sent!");
    // void setIsLoading(false);
  }, [toast]);

  return useCallback(
    (userAddress: string, email: string) => {
      
      if (!userAddress || !email) {
        toast.error("input required!");
        return null;
      }
      
      if ((userAddress.length != address.length) || (!userAddress.startsWith("ST"))) {
        toast.error("invalid principal!");
        return null;
      }

      const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!reg.test(email.toLowerCase())) {
        toast.error("invalid email");
        return null;
      }
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
  // const { setIsLoading } = useLoading(LOADING_KEYS.AUTH);
  const { doContractCall } = useConnect();

  // const
  const network = useNetwork();

  const onCancel = useCallback(() => {
    toast.error("Cancelled!");
    // void setIsLoading(false);
  }, [toast]);

  const onFinish = useCallback(() => {
    toast.success("Transaction sent!");
    // void setIsLoading(false);
  }, [toast]);

  return useCallback(() => {
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
