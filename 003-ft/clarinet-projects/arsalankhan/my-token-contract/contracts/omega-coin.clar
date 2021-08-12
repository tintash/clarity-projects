(define-constant TOKEN_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u2000))

(define-data-var price uint u1000) ;; price in uSTX for 1 OMEGA
(define-data-var tokenUri (optional (string-utf8 256)) (some u"https://tintash.com/"))


(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token omegacoins)


;; only contract-ownder will call this to deposit amount of "OMC tokens" to this contract.
(define-public (deposit-omega (amount uint))
    (begin
       (asserts! (is-eq contract-caller TOKEN_OWNER) ERR_UNAUTHORIZED)
        
        ;; send OMEGA to contract
        (try! (transfer amount contract-caller (as-contract tx-sender) none))
        (ok true)
    )
)

;; any principal buy OMC tokens by transfering stx tokens.
(define-public (buy-omega (amount uint))
  (let
    (
        (buyer tx-sender)
    )
    (asserts! (not (is-eq contract-caller TOKEN_OWNER)) ERR_UNAUTHORIZED)
    ;; transfer stx to deployer
    (try! (stx-transfer? (* amount (var-get price)) tx-sender TOKEN_OWNER))
    (try! (as-contract (transfer amount tx-sender buyer none)))
    (ok true)
  )
)

;; the price for omegacoin can be changed by the contract deployer
(define-public (change-price (newPrice uint)) ;; price in uSTX
    (begin
        (asserts! (is-eq contract-caller TOKEN_OWNER) ERR_UNAUTHORIZED)
        (if (or (is-eq newPrice u0) (> newPrice u0)) 
            (ok (var-set price newPrice))
            (err u101)
        )
    )
)


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

(define-read-only (get-price)
    (ok (var-get price))
)

(ft-mint? omegacoins u1000 TOKEN_OWNER)
(deposit-omega u100)