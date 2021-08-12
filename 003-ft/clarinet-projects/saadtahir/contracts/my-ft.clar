(impl-trait .ft-trait.sip-010-trait)

(define-constant CONTRACT_OWNER tx-sender)
(define-constant TRANSFER_RATE u1000)

(define-constant ERR_CONTRACT_OWNER_ONLY (err u100))
(define-constant ERR_MANAGER_ONLY (err u101))
(define-constant ERR_TOKEN_OWNER_ONLY (err u102))
(define-constant ERR_NO_MANAGER (err u103))

(define-fungible-token my-token)

(define-data-var manager (optional principal) none)

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

;; Only admin can add a manager
(define-public (add-manager (user principal))
    (begin
        (asserts! (is-eq CONTRACT_OWNER tx-sender) ERR_CONTRACT_OWNER_ONLY)
        (var-set manager (some user))
        (ok true)
    )
)

;; convert tokens to stx
(define-public (convert-tokens (amount uint) (sender principal))
    (begin
        (asserts! (is-eq CONTRACT_OWNER tx-sender) ERR_CONTRACT_OWNER_ONLY)
        (try! (stx-transfer? (/ amount TRANSFER_RATE) tx-sender sender))
        (try! (destroy amount sender))
        (ok true)
    )
)

;; This method gives the tokens to the address
(define-public (give (amount uint) (address principal))
    (begin
        (asserts! (is-eq tx-sender (unwrap! (var-get manager) ERR_NO_MANAGER)) ERR_MANAGER_ONLY)
        (try! (ft-mint? my-token amount address))
        (ok true)
    )
)

;; This method burns the tokens from the total supply
(define-public (destroy (amount uint) (address principal))
    (begin        
        (asserts! (is-eq tx-sender (unwrap! (var-get manager) ERR_NO_MANAGER)) ERR_MANAGER_ONLY)
        (try! (ft-burn? my-token amount address))
        (ok true)
    )
)

;; Transfers tokens to a recipient
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))    
    (begin
        (asserts! (is-eq tx-sender sender) ERR_TOKEN_OWNER_ONLY)
        (try! (ft-transfer? my-token amount sender recipient))
        (print memo)
        (ok true)
    )
)

