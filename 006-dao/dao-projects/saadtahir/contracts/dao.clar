;; DAO Contract rules
;; The contract should take votes for a certain proposal to be accepted
;; There is a block-height time that executes the proposal
;; People who have the dao-token can vote only
;; On proposal completion (accepted/rejected), the dao-tokens are sent back to the people who voted yes/no
;; People can become a member by sending STX and becoming a member
;; The proposal can be a simple charity where a certain amount is transfered to a principal as charity if it is accepted
;; People who want to give charity can send STX to the contract which will then transfer that amount on propsal acceptance
;; All the proposals will have fixed time limit and when the time limit is reached, the proposal with
;; the most yes votes will get selected

(use-trait dao-token-trait .dao-token-trait.dao-token-trait)

(define-constant contract-owner tx-sender)
(define-constant stx-per-dao-token u1000000) ;; mints 1 dao token

(define-constant ERR_NOT_CONTRACT_OWNER (err u1000))
(define-constant ERR_NOT_A_MEMBER (err u1001))
(define-constant ERR_ALREADY_A_MEMBER (err u1002))
(define-constant ERR_INVALID_PROPOSAL_ID (err u1003))
(define-constant ERR_NOT_ENOUGH_STX_TO_REGISTER (err u1004))
(define-constant ERR_NOT_ENOUGH_DAO_IN_CONTRACT (err u1005))
(define-constant ERR_NOT_ENOUGH_DAO (err u1006))
(define-constant ERR_UNRECOGNIZED_CALL (err u1007))
(define-constant ERR_UNWRAPPING_FAILED (err u1008))
(define-constant ERR_PROPOSAL_NOT_READY (err u1009))
(define-constant ERR_PROPOSAL_ALREADY_IN_PROCESS (err u1010))
(define-constant ERR_MEMBER_ALREADY_VOTED (err u1011))
(define-constant ERR_PROPOSAL_NOT_PROCESSED (err u1012))
(define-constant ERR_CONTRACT_HAS_INSUFFICIENT_DAO_BALANCE (err u1013))
(define-constant ERR_NOT_ENOUGH_STX_TO_MINT_DAO (err u1014))

;; non resetable data
(define-data-var member-registration-cost-in-dao uint u10) ;; 10 DAO
(define-data-var time-for-proposal uint u10) ;; Proposal to be executed after these blocks
(define-data-var members (list 100 principal) (list))

;; resetable data
(define-data-var removing-member principal tx-sender)
(define-data-var proposal-id-count uint u0)
(define-data-var processed-proposals (list 100 uint) (list)) ;; this needs to be reseted after execution
(define-data-var removing-processed-proposals uint u0)
(define-data-var winning-proposal-id uint u0)

(define-map votes-by-member {proposal-id: uint, member: principal}
                            {vote: bool})
(define-map votes-on-proposal {proposal-id: uint} 
                              {votes: uint})
;; if we have more yes votes then vote-difference should be > 0 (vote-difference = (- yes no))
(define-map proposal-votes {proposal-id: uint} 
                           {vote-difference: int})
(define-map proposals-on-block-height {block: uint} 
                                      {proposal-ids: (list 100 uint)})

(define-map proposals {id: uint} 
        {proposer: principal,
        organisation: principal,
        charity-amount: uint,
        required-time: uint})

(define-read-only (get-time-for-proposal) 
    (var-get time-for-proposal)
)

(define-read-only (get-member-registration-cost-in-dao) 
    (var-get member-registration-cost-in-dao)
)

(define-read-only (get-members) 
    (var-get members)
)

(define-read-only (get-proposal (proposal-id uint))
    (map-get? proposals {id: proposal-id})
)

(define-read-only (get-vote-by-member (proposal-id uint))
    (map-get? votes-by-member {proposal-id: proposal-id, member: tx-sender})
)

(define-read-only (get-votes-on-proposal (proposal-id uint))
    (map-get? votes-on-proposal {proposal-id: proposal-id})
)

(define-read-only (get-proposals-on-block-height (block uint))
    (default-to (list) (get proposal-ids (map-get? proposals-on-block-height {block: block})))
)

(define-read-only (get-processed-proposals)
    (var-get processed-proposals)
)

(define-read-only (get-proposal-votes (proposal-id uint))
    (map-get? proposal-votes {proposal-id: proposal-id})
)

(define-public (set-time-for-proposal (time uint)) 
    (begin
        (asserts! (is-eq contract-owner tx-sender) ERR_NOT_CONTRACT_OWNER)
        (ok (var-set time-for-proposal time))
    )
)

(define-public (set-member-registration-cost-in-dao (amount uint))
    (begin
        (asserts! (is-eq contract-owner tx-sender) ERR_NOT_CONTRACT_OWNER)
        (ok (var-set member-registration-cost-in-dao amount))
    )
)

;; In order to become a member, you will have to transfer STX to the contract and mint dao-tokens in return
(define-public (register-member (token-trait <dao-token-trait>))
    (let
        (
            (required-stx (* stx-per-dao-token (var-get member-registration-cost-in-dao)))
        )
        (asserts! (not (is-some (index-of (var-get members) tx-sender))) ERR_ALREADY_A_MEMBER)
        (try! (stx-transfer? required-stx tx-sender (as-contract tx-sender)))
        (try! (contract-call? token-trait faucet (var-get member-registration-cost-in-dao)))
        (add-member tx-sender)
        (ok true)
    )
)

(define-public (get-dao 
                        (token-trait <dao-token-trait>)
                        (dao-token-amount uint))
    (let
        (
            (required-stx (* stx-per-dao-token dao-token-amount))
        )
        (asserts! (> (stx-get-balance tx-sender) required-stx) ERR_NOT_ENOUGH_STX_TO_MINT_DAO)
        (try! (stx-transfer? required-stx tx-sender (as-contract tx-sender)))
        (try! (contract-call? token-trait faucet dao-token-amount))
        (ok true)
    )
)

(define-public (transfer-dao-to-contract 
                                    (token-trait <dao-token-trait>)
                                    (dao-amount uint))
    (let
        (
            (user-dao (unwrap! (contract-call? token-trait get-balance tx-sender) ERR_UNRECOGNIZED_CALL))
        )
        (asserts! (>= user-dao dao-amount) ERR_NOT_ENOUGH_DAO)
        (try! (contract-call? token-trait transfer? dao-amount tx-sender (as-contract tx-sender)))
        (ok true)
    )
)

(define-public (propose-proposal
        (token-trait <dao-token-trait>)
        (organisation principal)
        (charity-amount uint)) 
    (let
        (
            (member-dao (unwrap! (contract-call? token-trait get-balance tx-sender) ERR_UNRECOGNIZED_CALL))
            (proposal-id (+ (var-get proposal-id-count) u1))
            (required-time (+ block-height (get-time-for-proposal)))
        )
        (asserts! (is-some (index-of (var-get members) tx-sender)) ERR_NOT_A_MEMBER)
        (asserts! (> member-dao u0) ERR_NOT_ENOUGH_DAO)
        (try! (transfer-dao-to-contract token-trait charity-amount))
        (var-set proposal-id-count proposal-id)
        (map-set proposals {id: proposal-id} 
                            {proposer: tx-sender, 
                            organisation: organisation, 
                            charity-amount: charity-amount, 
                            required-time: required-time})
        (map-set votes-on-proposal {proposal-id: proposal-id} {votes: u0})
        (map-set proposal-votes {proposal-id: proposal-id} {vote-difference: 0})
        (add-proposal-on-block-height proposal-id)
        (ok proposal-id)
    )
)

;; Only members can cast vote to valid unprocessed proposal
(define-public (cast-vote 
                        (token-trait <dao-token-trait>)
                        (vote bool)
                        (proposal-id uint))
    (let
        (
            (member-dao (unwrap! (contract-call? token-trait get-balance tx-sender) ERR_UNRECOGNIZED_CALL))
            (proposal-total-votes (unwrap! (get votes (get-votes-on-proposal proposal-id)) ERR_UNWRAPPING_FAILED))
            (proposal-vote-difference (unwrap! (get vote-difference (get-proposal-votes proposal-id)) ERR_UNWRAPPING_FAILED))
        )
        (asserts! (is-some (index-of (var-get members) tx-sender)) ERR_NOT_A_MEMBER)
        (asserts! (is-some (map-get? proposals {id: proposal-id})) ERR_INVALID_PROPOSAL_ID)
        (asserts! (> member-dao u0) ERR_NOT_ENOUGH_DAO)
        (asserts! (is-none (index-of (get-processed-proposals) proposal-id)) ERR_PROPOSAL_ALREADY_IN_PROCESS)
        (asserts! (or (is-none (get vote (get-vote-by-member proposal-id)))
                      (is-eq (get vote (get-vote-by-member proposal-id)) (some false))
                  ) ERR_MEMBER_ALREADY_VOTED)
        (try! (contract-call? token-trait transfer? u1 tx-sender (as-contract tx-sender)))
        (map-set votes-by-member {proposal-id: proposal-id, member: tx-sender} {vote: vote})
        (map-set votes-on-proposal {proposal-id: proposal-id} {votes: (+ u1 proposal-total-votes)})
        (if (is-eq vote true)
            (map-set proposal-votes {proposal-id: proposal-id} {vote-difference: (+ proposal-vote-difference 1)})
        (map-set proposal-votes {proposal-id: proposal-id} {vote-difference: (- proposal-vote-difference 1)})
        )
        (ok true)
    )
)

(define-public (process-proposal (proposal-id uint))
    (let
        (
            (proposal-time (unwrap! (get required-time (get-proposal proposal-id)) ERR_UNWRAPPING_FAILED))
        )
        (asserts! (is-some (map-get? proposals {id: proposal-id})) ERR_INVALID_PROPOSAL_ID)
        (asserts! (is-none (index-of (get-processed-proposals) proposal-id)) ERR_PROPOSAL_ALREADY_IN_PROCESS)
        (asserts! (>= block-height proposal-time) ERR_PROPOSAL_NOT_READY)
        (add-to-processed-proposals proposal-id)
        (ok true)
    )
)

;; Here you will have to process all proposals from processed-proposals map
;; and select the one with max votes
(define-public (evaluate-processed-proposal-votes (token-trait <dao-token-trait>))
    (let
        (
            (current-processed-proposals (get-processed-proposals))
            (processed-proposal-id (unwrap! (element-at (get-processed-proposals) u0) ERR_UNWRAPPING_FAILED))
        )
        (var-set winning-proposal-id processed-proposal-id)
        (fold find-winning-proposal current-processed-proposals u0)
        (try! (execute-proposal token-trait (var-get winning-proposal-id)))
        (ok (var-get winning-proposal-id))
    )
)

(define-private (find-winning-proposal (proposal-id uint) (inital-proposal-id uint))
    (let
        (
            (vote-difference (unwrap-panic (get vote-difference (get-proposal-votes proposal-id))))
            (winning-vote-difference (unwrap-panic (get vote-difference (get-proposal-votes (var-get winning-proposal-id)))))
        )
        ;; check the vote difference with the currently winning-proposal-id
        (if (> vote-difference winning-vote-difference)
            (begin
                (var-set winning-proposal-id proposal-id)
                proposal-id
            )
        (var-get winning-proposal-id)
        )
    )
)

(define-private (execute-proposal 
                                (token-trait <dao-token-trait>)
                                (proposal-id uint))
    (begin
        (asserts! (is-some (get-proposal proposal-id)) ERR_INVALID_PROPOSAL_ID)
        (let
            (
                (proposal-proposer (get proposer (unwrap! (get-proposal proposal-id) ERR_UNWRAPPING_FAILED)))
                (proposal-organisation (get organisation (unwrap! (get-proposal proposal-id) ERR_UNWRAPPING_FAILED)))
                (proposal-charity-amount-in-dao (get charity-amount (unwrap! (get-proposal proposal-id) ERR_UNWRAPPING_FAILED)))
                (proposal-required-time (get required-time (unwrap! (get-proposal proposal-id) ERR_UNWRAPPING_FAILED)))
                (contract-dao (unwrap! (as-contract (contract-call? token-trait get-balance tx-sender)) ERR_UNRECOGNIZED_CALL))
            )
            (asserts! (is-some (index-of (get-processed-proposals) proposal-id)) ERR_PROPOSAL_NOT_PROCESSED)
            ;; check if required time is reached
            (asserts! (>= block-height proposal-required-time) ERR_PROPOSAL_NOT_READY)
            ;; check if contract has enough money in dao-tokens
            (print contract-dao)
            (print proposal-charity-amount-in-dao)
            (asserts! (>= contract-dao proposal-charity-amount-in-dao) ERR_CONTRACT_HAS_INSUFFICIENT_DAO_BALANCE)
            ;; make transfer in dao tokens to organisation
            (try! (as-contract (contract-call? token-trait transfer? proposal-charity-amount-in-dao tx-sender proposal-organisation)))
            ;; reset lists and variables if necessary
            (var-set processed-proposals (list u100))
            (var-set proposal-id-count u0)
            (var-set removing-processed-proposals u0)
            (var-set winning-proposal-id u0)
            (ok true)
        )
    )
)

(define-public (convert (token-trait <dao-token-trait>) (dao-token-amount uint))
  (let
    (
      (sender tx-sender)
    )
    (try! (as-contract (stx-transfer? (* dao-token-amount stx-per-dao-token) tx-sender sender)))
    (try! (contract-call? token-trait burn dao-token-amount))
    (ok true)
  )
)

(define-private (add-proposal-on-block-height (proposal-id uint))
    (map-set proposals-on-block-height {block: block-height} {proposal-ids: (unwrap-panic (as-max-len? (append (get-proposals-on-block-height block-height) proposal-id) u100))})
)

(define-private (add-member (member principal))
    (var-set members (unwrap-panic (as-max-len? (append (get-members) member) u100)))
)

(define-private (add-to-processed-proposals (proposal-id uint))
    (var-set processed-proposals (unwrap-panic (as-max-len? (append (get-processed-proposals) proposal-id) u100)))
)

(define-private (remove-processed-proposals (proposal-id uint))
    (begin
        (var-set removing-processed-proposals proposal-id)
        (var-set processed-proposals (unwrap-panic (as-max-len? (filter remove-processed-proposals-filter (get-processed-proposals)) u100)))
    )
)

(define-private (remove-processed-proposals-filter (proposal-id uint))
    (if (is-eq proposal-id (var-get removing-processed-proposals))
        false
    true
    )
)