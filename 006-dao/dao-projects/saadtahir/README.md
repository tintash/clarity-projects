## Overview

An implementation of DAO contract in clarity language. Users can register as a member and can propose a proposal. Only charity proposals are accepted as proposal. Proposal structure contains `organisation` and `charity-amount`. `organisation` should be a valid **Stacks Address** because DAO tokens will be transferred to this address on proposal execution. `chaity-amount` is an amount in DAO tokens which is an equivalent of `1 STX per 1 DAO token`. It takes **10 STX** to register as a member and get **10 DAO** tokens in return, **1 DAO** token to cast a vote (true for yes, false for no) and to propose a proposal; user should have **charity-amount** as DAO tokens in wallet. There is a fixed time limit in blocks for proposals to be executed which is `10 blocks`. After this time, all the proposals in the `processed-proposals` list are evaluated and the winning proposal with most votes is executed. After execution, the `processed-proposals` list is reseted along with winning-proposal. User votes are tracked for each proposal so no more than one votes can be casted for each proposal. Only **100 members** can join the dao members list. User can also see `proposals-on-block-height` meaning which proposals are present at 225 block-height. If a User is already registered as a member, he cannot call `register-member` function twice. In this case, user will have to use `get-dao` to mint dao tokens for STX. You will have to call `register-member` once in order to get registered and can use `get-dao` to mint as many coins as you want. Users can `convert` dao tokens to STX at any time using the `convert` method.

## How to run it

1. `clainet check` to check for errors if any.
2. `clarinet console` and use the following commands on clarinet console
3. `clarinet test` to run all the tests.

## clarinet console commands

Following set of commands can be run on clarinet console using `clarinet console` command on terminal. The commands registers the deployer as member, creates a proposal that transfers 10STX to the organisation as charity, casts a yes vote, advances the chain tip to 20 to process the required proposal in the required time of 10 blocks, evaluates all the proposals in the processed-proposals list and executes the transaction on success. Your output should be 10 DAO tokens in the organisation's stacks address which can then be converted by that organisation principal using `convert` function in dao contract.

(contract-call? .dao register-member .dao-token)
(contract-call? .dao get-dao .dao-token u10)
(contract-call? .dao propose-proposal .dao-token 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6 u10)
(contract-call? .dao cast-vote .dao-token true u1)
(contract-call? .dao process-proposal u1)
::advance_chain_tip 20
(contract-call? .dao process-proposal u1)
(contract-call? .dao evaluate-processed-proposal-votes .dao-token)
::set_tx_sender STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6
(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao convert 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-token u10)
::get_assets_maps

## Remarks

1. Test cases are yet to be implemented.
2. Contract not audited yet.
