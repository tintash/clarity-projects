(impl-trait .dao-token-trait.dao-token-trait)

(define-constant contract-owner tx-sender)

(define-constant ERR_NOT_CONTRACT_OWNER (err u2000))
(define-constant ERR_NOT_TOKEN_OWNER (err u2001))
(define-constant ERR_NOT_ENOUGH_STX_TO_MINT_DAO (err u2002))

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

(define-read-only (get-balance (principal principal))
  (ok (ft-get-balance dao-token principal))
)

;; Don't use faucet from here because you won't get registered even you have the tokens
(define-public (faucet (dao-token-amount uint))
  (ft-mint? dao-token dao-token-amount tx-sender)
)

(define-public (burn (dao-token-amount uint))
  (ft-burn? dao-token dao-token-amount tx-sender)
)