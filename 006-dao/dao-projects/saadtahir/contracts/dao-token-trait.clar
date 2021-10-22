(define-trait dao-token-trait
  (
    (transfer? (uint principal principal) (response bool uint))
    (get-balance (principal) (response uint uint))
    (faucet (uint) (response bool uint))
    (burn (uint) (response bool uint))
  )
)