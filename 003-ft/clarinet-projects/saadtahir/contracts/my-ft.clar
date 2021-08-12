(impl-trait .ft-trait.sip-010-trait)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant GOAL_SCORER_REWARD u1000000000)

(define-constant ERR_APP_CONTRACT_ONLY (err u100))
(define-constant ERR_CONTRACT_OWNER_ONLY (err u101))
(define-constant ERR_TOKEN_OWNER_ONLY (err u102))

(define-fungible-token my-token)

;; get the token balance of owner
(define-read-only (get-balance (owner principal))
    (ok (ft-get-balance my-token owner))
)

;; returns the total number of tokens
(define-read-only (get-total-supply)
    (ok (ft-get-supply my-token))
)

;; returns the token name
(define-read-only (get-name)
    (ok "My Token")
)

;; the symbol or 'ticker' for this token
(define-read-only (get-symbol)
    (ok "OhMy")
)

;; the number of decimals used
(define-read-only (get-decimals)
    (ok u8)
)

(define-read-only (get-token-uri)
    (ok (some u"https://ohmytoken.com"))
)

;; Transfers tokens to a recipient
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))    
    (begin
        ;; we don't want random people transferring someone else's tokens
        (asserts! (or (is-eq tx-sender sender)
                      (is-eq tx-sender CONTRACT_OWNER))
                    ERR_TOKEN_OWNER_ONLY)
        (try! (ft-transfer? my-token amount sender recipient))
        (print memo)
        (ok true)
    )
)

;; This method burns the tokens from the total supply
(define-public (destroy (amount uint) (address principal))
    (begin
        ;; we don't want random people destroying someone else's tokens
        (asserts! (or (is-eq tx-sender address)
                      (is-eq tx-sender CONTRACT_OWNER))
                    ERR_TOKEN_OWNER_ONLY)
        (try! (ft-burn? my-token amount address))
        (ok true)
    )
)

;; This method gives token to scorer who scored the goal in a match
(define-public (goal-scored (amount uint) (scorer principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_TOKEN_OWNER_ONLY)
        (try! (ft-mint? my-token amount scorer))
        (ok true)
    )
)
