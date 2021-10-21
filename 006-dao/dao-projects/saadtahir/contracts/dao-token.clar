(impl-trait .dao-token-trait.dao-token-trait)

(define-constant contract-owner tx-sender)

(define-constant ERR_NOT_CONTRACT_OWNER (err u2000))
(define-constant ERR_NOT_TOKEN_OWNER (err u2001))

(define-fungible-token dao-token)

(define-data-var member-registration-dao-tokens uint u10) ;; 10 dao tokens

(define-read-only (get-member-registration-dao-tokens) 
    (var-get member-registration-dao-tokens)
)

(define-public (set-member-registration-dao-tokens (amount uint))
    (begin
        (asserts! (is-eq contract-owner tx-sender) ERR_NOT_CONTRACT_OWNER)
        (ok (var-set member-registration-dao-tokens amount))
    )
)

(define-public (transfer? (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq sender tx-sender) ERR_NOT_TOKEN_OWNER)
    (ft-transfer? dao-token amount sender recipient)
  )
)

(define-public (convert (dao-token-amount uint) (sender principal))
  (begin
    (asserts! (is-eq sender tx-sender) ERR_NOT_TOKEN_OWNER)
    (ok true)

  )
)

(define-read-only (get-balance (principal principal))
  (ok (ft-get-balance dao-token principal))
)

;; Don't use faucet from here because you won't get registered even you have the tokens
(define-public (faucet (stx-cost uint))
  (begin
    (try! (stx-transfer? stx-cost tx-sender (as-contract tx-sender)))
    (ft-mint? dao-token u10 tx-sender)
  )
)