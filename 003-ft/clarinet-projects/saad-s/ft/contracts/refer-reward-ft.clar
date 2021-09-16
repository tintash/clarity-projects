;; refer-reward-ft
(impl-trait .ft-trait.ft-trait)

;; constants
(define-constant contract-owner tx-sender)

(define-constant err-invalid-caller (err u100))
(define-constant err-invalid-call (err u110))
(define-constant err-unauthorized-caller (err u99))

;; data maps and vars
(define-fungible-token refer-reward)

;; contract owner can add /remove callers for traits 
(define-map valid-callers { caller: principal } bool)

;; read-only functions 
(define-read-only (get-name) 
    (ok "Refer rewards")
)

(define-read-only (get-symbol) 
    (ok "RR")
)

(define-read-only (get-decimals)
    (ok u2)
)

(define-read-only (get-balance-of (account principal))
    (ok (ft-get-balance refer-reward account))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply refer-reward))
)

(define-read-only (get-token-uri)
    (ok (some u"https://www.tintash.com/"))
)

(define-read-only (is-valid-caller (caller principal)) 
    (map-get? valid-callers {caller: caller})
)

;; public functions
(define-public (add-caller (caller principal)) 
    (begin
        ;; only contract owner 
        (asserts! (is-eq tx-sender contract-owner) err-invalid-caller) 
        (ok (map-set valid-callers {caller: caller} true))
    )
)

(define-public (remove-caller (caller principal)) 
    (begin 
        ;; only contract owner 
        (asserts! (is-eq tx-sender contract-owner) err-invalid-caller)
        (asserts! (map-delete valid-callers {caller: caller}) err-invalid-call)
        (ok true)
    )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
    (begin
        ;; only valid contract principal
        (asserts! (is-some (is-valid-caller contract-caller)) err-unauthorized-caller)
        (ft-transfer? refer-reward amount sender recipient)
    )
)

(define-public (create-ft (amount uint) (recipient principal)) 
    (begin
        ;; only valid contract principal
        (asserts! (is-some (is-valid-caller contract-caller)) err-unauthorized-caller)
        (ft-mint? refer-reward amount recipient) 
    )
)

(define-public (destroy-ft (amount uint) (owner principal)) 
    (begin 
        ;; only valid contract principal
        (asserts! (is-some (is-valid-caller contract-caller)) err-unauthorized-caller)
        (ft-burn? refer-reward amount owner)
    )
)