(impl-trait .ft-trait.sip-010-trait)

;; Token owner
(define-constant CONTRACT_OWNER tx-sender)
;; Errors
(define-constant TOKEN_OWNER_ONLY (err u200))
(define-constant GAME_MANAGER_ONLY (err u201))
(define-constant STX_BALANCE_IS_LOW (err u202))
(define-constant CONTRACT_OWNER_ONLY (err u203))
(define-constant MANAGER_DOES_NOT_EXIST (err u204))
(define-constant UNWRAP_FAILED (err u205))
;; Token
(define-fungible-token velocity-bucks u10000000)
;; Data
(define-data-var game-manager (optional principal) none)

;; >> (contract-call? .velocity-ft set-game-manager (some 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE))
(define-public (set-game-manager (address (optional principal)))
    (begin
        (asserts! (is-eq CONTRACT_OWNER tx-sender) (err u203))
        (ok (var-set game-manager address))
    )
)

;; get the token balance of owner
(define-read-only (get-balance (owner principal))
    (ok (ft-get-balance velocity-bucks owner))
)

;; returns the total number of tokens
(define-read-only (get-total-supply)
    (ok (ft-get-supply velocity-bucks))
)

;; returns the token name
(define-read-only (get-name)
    (ok "Velocity Bucks")
)

;; the symbol or 'ticker' for this token
(define-read-only (get-symbol)
    (ok "Vbucks")
)

;; the number of decimals used
(define-read-only (get-decimals)
    (ok u8)
)

(define-read-only (get-token-uri)
    (ok (some u"https://velocityengine7.itch.io"))
)

;; Transfers tokens to a recipient
;; >> (contract-call? .velocity-ft transfer u1000 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK (some 0x48656c6c6f20576f726c64))
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))    
    (begin
        ;; we don't want random people transfering away someone else's tokens
        (asserts! (is-eq tx-sender sender) TOKEN_OWNER_ONLY)
        (try! (ft-transfer? velocity-bucks amount sender recipient))
        (print memo)
    (ok true))
)

;; Manager can give tokens to recipient. 
(define-public (give (amount uint) (recipient principal))
    (begin
        (asserts! (is-some (var-get game-manager)) MANAGER_DOES_NOT_EXIST)
        (asserts! (is-eq (unwrap-panic (var-get game-manager)) tx-sender) GAME_MANAGER_ONLY)        
        (try! (ft-mint? velocity-bucks amount recipient))
        (ok true)
    )
)

;; buy tokens for stx
(define-public (buy (store-item-stx uint) (store-item-token uint) (recipient principal))
    (begin
        (let
            (
                (recipient-stx-balance (stx-get-balance recipient))
            )
            (asserts! (is-eq recipient tx-sender) TOKEN_OWNER_ONLY)
            ;; checl if recipient has enough balance to buy tokens
            (asserts! (>= recipient-stx-balance store-item-stx) STX_BALANCE_IS_LOW) 
            ;; Transfer stx to the contract
            (try! (stx-transfer? store-item-stx tx-sender (as-contract tx-sender)))
            ;; Give tokens to sender
            (try! (ft-mint? velocity-bucks store-item-token recipient))
            (ok true)
        )
    )
)

;; Transfer STX to contract
(stx-transfer? u1000000 tx-sender (as-contract tx-sender))