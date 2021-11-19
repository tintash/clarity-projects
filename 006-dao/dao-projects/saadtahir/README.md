# Overview

An implementation of DAO contract in clarity language.
Users can register as a member and can propose a proposal.
Only charity proposals are accepted as proposal.
Proposal structure contains `organisation` and `charity-amount`. `organisation` should be a valid **Stacks Address** because DAO tokens will be transferred to this address on proposal execution. `chaity-amount` is an amount in DAO tokens which is an equivalent of `1 STX per 1 DAO token`.
It takes **10 STX** to register as a member and get **10 DAO** tokens in return, **1 DAO** token to cast a vote (true for yes, false for no) and to propose a proposal.
There is a fixed time limit in blocks for proposals to be executed which is `10 blocks`. After this time, all the proposals in the `processed-proposals` list are evaluated and the winning proposal with most votes is executed.
User votes are tracked for each proposal so no more than one votes can be casted for each proposal.
Only **100 members** can join the dao members list.
User can also see `proposals-on-block-height` meaning which proposals are present at 225 block-height.
If a User is already registered as a member, he cannot call `register-member` function twice.
Users can `convert-dao-to-stx` dao tokens to STX at any time using the `convert-dao-to-stx` method.

# Remarks

We are taking an assumption that the contract deployer will add funds and mint tokens in the contract

# How to run it

1. `clainet check` to check for errors if any.
2. `clarinet console` and use the following commands on clarinet console
3. `clarinet test` to run all the tests.

# Clarinet console commands

Following set of commands can be run on clarinet console using `clarinet console` command on terminal. The commands registers the deployer as member, creates a proposal that transfers 10STX to the organisation as charity, casts a yes vote, advances the chain tip to 20 to process the required proposal in the required time of 10 blocks, evaluates all the proposals in the processed-proposals list and executes the transaction on success. Your output should be 10 DAO tokens in the organisation's stacks address which can then be converted by that organisation principal using `convert-dao-to-stx` function in dao contract.

`(contract-call? .dao add-dao .dao-token u100000)`

`(contract-call? .dao register-member .dao-token)`

`(contract-call? .dao propose-proposal .dao-token 'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6 u10)`

`(contract-call? .dao cast-vote .dao-token true u1)`

`(contract-call? .dao process-proposal u1)`

`::advance_chain_tip 20`

`(contract-call? .dao process-proposal u1)`

`(contract-call? .dao evaluate-processed-proposal-votes .dao-token)`

`::set_tx_sender STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6`

`(contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao convert-dao-to-stx 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dao-token u10)`

`::get_assets_maps`

# Diagrams

## Register Member

sequenceDiagram
participant Dao_Token
participant Dao
participant Member
Member ->> Dao: Register Member
Member -->> Dao: Transfer 10 STX
Dao -->> Dao_Token: Mint 10 Dao Tokens
Dao ->> Member: Transfer 10 Dao Tokens

## Propose Proposal

sequenceDiagram<br />
participant Dao<br />
participant Member<br />
Member ->> Dao: Propose Proposal<br />
Member -->> Dao: Transfer 1 Dao Token<br />
Dao -->> Dao: Creates Proposal at +10 block-height<br />

## Cast Vote

sequenceDiagram<br />
participant Dao<br />
participant Member<br />
Member ->> Dao: Cast Vote (Yes, No)<br />
Member -->> Dao: Transfer 1 Dao Token<br />
Dao -->> Dao: (++, --) vote-difference against proposal-id<br />

## Process Proposal

sequenceDiagram<br />
participant Dao<br />
participant Member<br />
Member ->> Dao: Process Proposal<br />
Dao -->> Dao: Validate block height reached<br />
Dao -->> Dao: Add proposal id to processed-proposals<br />

## Evaluate Proposal

sequenceDiagram<br />
participant Organisation<br />
participant Dao<br />
participant Member<br />
Member ->> Dao: Evaluate Proposal<br />
Dao -->> Dao: Loop through the processed proposals list<br />
Dao -->> Dao: Find the winning proposal-id with greatest vote-difference<br />
Dao -->> Dao: Execute the winning proposal<br />
Dao ->> Organisation: Transfer charity-amount<br />

## Convert Dao to STX

sequenceDiagram<br />
participant Organisation<br />
participant Dao<br />
Organisation ->> Dao: Convert Tokens to STX<br />
Dao -->> Organisation: Receive STX (1 STX per Token)<br />

```

```
