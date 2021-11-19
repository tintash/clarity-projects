
(use-trait dao-token-trait .dao-token-trait.dao-token-trait)

(define-constant contract-owner tx-sender)
(define-constant stx-per-dao-token u1000000) ;; mints 1 dao token
(define-constant propose-proposal-amount u1)
(define-constant cast-vote-amount u1)

(define-constant ERR_NOT_CONTRACT_OWNER (err u1000))
(define-constant ERR_NOT_A_MEMBER (err u1001))
(define-constant ERR_ALREADY_A_MEMBER (err u1002))
(define-constant ERR_INVALID_PROPOSAL_ID (err u1003))
(define-constant ERR_NOT_ENOUGH_DAO (err u1006))
(define-constant ERR_UNRECOGNIZED_CALL (err u1007))
(define-constant ERR_PROPOSAL_ALREADY_PROCESSED (err u1008))
(define-constant ERR_PROPOSAL_NOT_READY (err u1009))
(define-constant ERR_PROPOSAL_CURRENTLY_IN_PROCESS (err u1010))
(define-constant ERR_MEMBER_ALREADY_VOTED (err u1011))
(define-constant ERR_PROPOSAL_NOT_PROCESSED (err u1012))
(define-constant ERR_CONTRACT_HAS_INSUFFICIENT_DAO_BALANCE (err u1013))
(define-constant ERR_NOT_ENOUGH_STX_TO_MINT_DAO (err u1014))
(define-constant ERR_NO_PROPOSAL_IN_PROCESS (err u1015))

(define-data-var member-registration-cost-in-dao uint u100)
(define-data-var time-for-proposal uint u10) ;; Proposal to be executed after these blocks

;; resetable data
(define-data-var proposal-id-count uint u0)
(define-data-var processed-proposals (list 100 uint) (list)) ;; this needs to be reseted after execution
(define-data-var removing-processed-proposals uint u0)
(define-data-var winning-proposal-id uint u0)

(define-map members {principal: principal} {isMember: bool})

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
        end-block-height: uint,
        processed: bool})

(define-read-only (get-time-for-proposal) 
    (var-get time-for-proposal)
)

(define-read-only (get-member-registration-cost-in-dao) 
    (var-get member-registration-cost-in-dao)
)

(define-read-only (get-member (principal principal)) 
    (default-to false (get isMember (map-get? members {principal: principal})))
)

(define-read-only (get-proposal (proposal-id uint))
    (map-get? proposals {id: proposal-id})
)

(define-read-only (get-vote-by-member (proposal-id uint))
    (map-get? votes-by-member {proposal-id: proposal-id, member: tx-sender})
)

(define-read-only (get-votes-on-proposal (proposal-id uint))
    (default-to u0 (get votes (map-get? votes-on-proposal {proposal-id: proposal-id})))
)

(define-read-only (get-proposals-on-block-height (block uint))
    (default-to (list) (get proposal-ids (map-get? proposals-on-block-height {block: block})))
)

(define-read-only (get-processed-proposals)
    (var-get processed-proposals)
)

(define-read-only (search-processed-proposal (proposal-id uint))
    (index-of (get-processed-proposals) proposal-id)
)

(define-read-only (get-proposal-in-process (proposal-id uint))
    (default-to false (get processed (map-get? proposals {id: proposal-id})))
)

(define-read-only (get-proposal-votes (proposal-id uint))
    (default-to 0 (get vote-difference (map-get? proposal-votes {proposal-id: proposal-id})))
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

(define-public (convert-dao-to-stx (token-trait <dao-token-trait>) (dao-token-amount uint))
  (let
    (
      (sender tx-sender)
    )
    (try! (as-contract (stx-transfer? (* dao-token-amount stx-per-dao-token) tx-sender sender)))
    (try! (contract-call? token-trait transfer? dao-token-amount tx-sender (as-contract tx-sender)))
    (ok true)
  )
)

(define-public (add-dao 
                        (token-trait <dao-token-trait>)
                        (dao-token-amount uint))
    (let
        (
            (required-stx (* stx-per-dao-token dao-token-amount))
        )
        (asserts! (>= (stx-get-balance tx-sender) required-stx) ERR_NOT_ENOUGH_STX_TO_MINT_DAO)
        (try! (stx-transfer? required-stx tx-sender (as-contract tx-sender)))
        (try! (as-contract (contract-call? token-trait mint dao-token-amount tx-sender)))
        (ok true)
    )
)

;; In order to become a member, you will have to transfer STX to the contract and mint dao-tokens in return
(define-public (register-member (token-trait <dao-token-trait>))
    (let
        (
            (required-stx (* stx-per-dao-token (var-get member-registration-cost-in-dao)))
        )
        (asserts! (not (get-member tx-sender)) ERR_ALREADY_A_MEMBER)
        (try! (stx-transfer? required-stx tx-sender (as-contract tx-sender)))
        (try! (contract-call? token-trait mint (var-get member-registration-cost-in-dao) tx-sender))
        (map-set members {principal: tx-sender} {isMember: true})
        (ok true)
    )
)

(define-public (propose-proposal
        (token-trait <dao-token-trait>)
        (organisation principal)
        (charity-amount uint)) 
    (let
        (
            (proposal-id (+ (var-get proposal-id-count) u1))
            (end-block-height (+ block-height (get-time-for-proposal)))
        )
        (asserts! (get-member tx-sender) ERR_NOT_A_MEMBER)
        (try! (transfer-dao-to-contract token-trait propose-proposal-amount))
        (var-set proposal-id-count proposal-id)
        (map-set proposals {id: proposal-id} 
                            {proposer: tx-sender, 
                            organisation: organisation, 
                            charity-amount: charity-amount, 
                            end-block-height: end-block-height,
                            processed: false})
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
    (begin
        (asserts! (is-some (map-get? proposals {id: proposal-id})) ERR_INVALID_PROPOSAL_ID)
        (let
            (
                (proposal-total-votes (get-votes-on-proposal proposal-id))
                (proposal-vote-difference (get-proposal-votes proposal-id))
            )
            (asserts! (get-member tx-sender) ERR_NOT_A_MEMBER)
            (asserts! (is-none (search-processed-proposal proposal-id)) ERR_PROPOSAL_CURRENTLY_IN_PROCESS)
            (asserts! (is-none (get-vote-by-member proposal-id)) ERR_MEMBER_ALREADY_VOTED)
            (try! (transfer-dao-to-contract token-trait cast-vote-amount))
            (map-set votes-by-member {proposal-id: proposal-id, member: tx-sender} {vote: vote})
            (map-set votes-on-proposal {proposal-id: proposal-id} {votes: (+ u1 proposal-total-votes)})
            (if vote
                (map-set proposal-votes {proposal-id: proposal-id} {vote-difference: (+ proposal-vote-difference 1)})
            (map-set proposal-votes {proposal-id: proposal-id} {vote-difference: (- proposal-vote-difference 1)})
            )
            (ok true)
        )
    )
)

(define-public (process-proposal (proposal-id uint))
    (begin
        (asserts! (is-some (map-get? proposals {id: proposal-id})) ERR_INVALID_PROPOSAL_ID)
        (let
            (
                (proposal-end-block-height (unwrap-panic (get end-block-height (get-proposal proposal-id))))
            )
            (asserts! (is-none (search-processed-proposal proposal-id)) ERR_PROPOSAL_CURRENTLY_IN_PROCESS)
            (asserts! (not (get-proposal-in-process proposal-id)) ERR_PROPOSAL_ALREADY_PROCESSED)
            (asserts! (>= block-height proposal-end-block-height) ERR_PROPOSAL_NOT_READY)
            (add-to-processed-proposals proposal-id)
            (ok true)
        )
    )
)

;; Here you will have to process all proposals from processed-proposals map
;; and select the one with max votes
(define-public (evaluate-processed-proposal-votes (token-trait <dao-token-trait>))
    (let
        (
            (current-processed-proposals (get-processed-proposals))
            (processed-proposal-id (unwrap! (element-at current-processed-proposals u0) ERR_NO_PROPOSAL_IN_PROCESS))
        )
        (var-set winning-proposal-id processed-proposal-id)
        (fold find-winning-proposal current-processed-proposals processed-proposal-id)
        (try! (execute-proposal token-trait))
        (ok (var-get winning-proposal-id))
    )
)

(define-private (find-winning-proposal (proposal-id uint) (winning-id uint))
    (let
        (
            (vote-difference (get-proposal-votes proposal-id))
            (winning-vote-difference (get-proposal-votes winning-id))
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

(define-private (execute-proposal (token-trait <dao-token-trait>))
    (let
        (
            (proposal-id (var-get winning-proposal-id))
            (proposal (unwrap-panic (get-proposal proposal-id)))
            (proposal-organisation (get organisation proposal))
            (proposal-charity-amount (get charity-amount proposal))
            (contract-dao (unwrap-panic (as-contract (contract-call? token-trait get-balance tx-sender))))
        )
        (asserts! (>= contract-dao proposal-charity-amount) ERR_CONTRACT_HAS_INSUFFICIENT_DAO_BALANCE)
        (try! (as-contract (contract-call? token-trait transfer? proposal-charity-amount tx-sender proposal-organisation)))
        (map-set proposals {id: proposal-id} (merge proposal {processed: true}))
        (var-set processed-proposals (list))
        (var-set proposal-id-count u0)
        (var-set removing-processed-proposals u0)
        (ok true)
    )
)

(define-private (transfer-dao-to-contract 
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

(define-private (add-proposal-on-block-height (proposal-id uint))
    (map-set proposals-on-block-height {block: block-height} {proposal-ids: (unwrap-panic (as-max-len? (append (get-proposals-on-block-height block-height) proposal-id) u100))})
)

(define-private (add-to-processed-proposals (proposal-id uint))
    (var-set processed-proposals (unwrap-panic (as-max-len? (append (get-processed-proposals) proposal-id) u100)))
)