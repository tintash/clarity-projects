(define-constant TOKEN_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u2000))

(define-data-var tokenUri (optional (string-utf8 256)) (some u"https://tintash.com/"))


(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token omegacoins)


(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) ERR_UNAUTHORIZED)
    (if (is-some memo)
      (print memo)
      none
    )
    (ft-transfer? omegacoins amount from to)
  )
)

(define-read-only (get-name)
  (ok "omegacoins")
)

(define-read-only (get-symbol)
  (ok "OMC") 
)

(define-read-only (get-decimals)
  (ok u0)
)

(define-read-only (get-balance (user principal))
  (ok (ft-get-balance omegacoins user))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply omegacoins))
)

(define-read-only (get-token-uri)
  (ok (var-get tokenUri))
)
    
(define-public (mint (amount uint) (address principal))
  (begin
    ;; we don't want random people giving themselves tokens
    (asserts! (is-eq tx-sender TOKEN_OWNER) ERR_UNAUTHORIZED)
    (ft-mint? omegacoins amount address)))

(define-public (burn (amount uint) (address principal))
  (begin
    ;; we don't want random people destroying someone else's tokens
    (asserts! (is-eq tx-sender TOKEN_OWNER) ERR_UNAUTHORIZED)
    (ft-burn? omegacoins amount address)
    )
)

(ft-mint? omegacoins u1000 TOKEN_OWNER)