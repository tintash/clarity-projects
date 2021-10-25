(impl-trait .dao-token-trait.dao-token-trait)

(define-constant ERR_NOT_TOKEN_OWNER (err u2000))

(define-fungible-token dao-token)

(define-public (transfer? (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq sender tx-sender) ERR_NOT_TOKEN_OWNER)
    (ft-transfer? dao-token amount sender recipient)
  )
)

(define-read-only (get-balance (principal principal))
  (ok (ft-get-balance dao-token principal))
)

(define-public (mint (dao-token-amount uint) (sender principal))
  (ft-mint? dao-token dao-token-amount sender)
)

(define-public (burn (dao-token-amount uint))
  (ft-burn? dao-token dao-token-amount tx-sender)
)