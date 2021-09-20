;; refer-reward-ft
;; this contract will offer token rewards to referrer 
;; tokens are defined using SIP-10 
(impl-trait .ft-trait.ft-trait)

;; constants
(define-constant contract-owner tx-sender)

(define-constant token-reward u10)
(define-constant num-transactions-for-reward u1)

(define-constant err-invalid-caller (err u100))
(define-constant err-invalid-call (err u110))
(define-constant err-unauthorized-caller (err u99))

;; data maps and vars
(define-fungible-token refer-reward)
;; registered user info map 
(define-map users 
    principal { email: (string-ascii 200), num-transactions: uint, referrer: (optional principal)})

;; read-only functions 
(define-read-only (get-name) (ok "Refer rewards"))

(define-read-only (get-symbol) (ok "RR"))

(define-read-only (get-decimals) (ok u2))

(define-read-only (get-balance-of (account principal))
    (ok (ft-get-balance refer-reward account))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply refer-reward))
)

(define-read-only (get-token-uri)
    (ok (some u"https://www.tintash.com/"))
)

(define-read-only (get-user (user principal)) 
    (map-get? users user) 
)

(define-read-only (get-referrer (user principal)) 
    (default-to none (get referrer (get-user user)))
)

(define-read-only (get-num-transactions (user principal))
    (default-to u0 (get num-transactions (get-user user)))
)

;; private functions
(define-private (remove-referrer (user principal)) 
    (map-set users user (merge (unwrap! (get-user user) false) {referrer: none}))
)

;; public functions
(define-public (transfer (amount uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-invalid-caller)
        (ft-transfer? refer-reward amount sender recipient)
    )
)

(define-public (create-ft-by-owner (amount uint) (recipient principal))
    (begin 
        (asserts! (is-eq tx-sender contract-owner) err-invalid-caller)
        (ft-mint? refer-reward amount recipient)
    )
)

(define-public (destroy-ft (amount uint)) 
    (ft-burn? refer-reward amount tx-sender)
)

;; signup by referrer
(define-public (signup-by-referrer (email (string-ascii 200)) (user principal))
    (begin
        ;; !self refer  
        (asserts! (not (is-eq tx-sender user)) err-invalid-call)
        (asserts! (map-insert users user 
            {email: email, num-transactions: u0, referrer: (some tx-sender)}) err-invalid-call)
        (ok true)
    )
)

;; self signup w/o referrer
(define-public (signup-self (email (string-ascii 200))) 
    (begin 
        (asserts! (map-insert users tx-sender 
            {email: email, num-transactions: u0, referrer: none}) err-invalid-call)
        (ok true)
    )
)

;; new user completes transactions 
(define-public (complete-transaction) 
    (let
        (
            (transactions (+ (get-num-transactions tx-sender) u1))
            (referrer (get-referrer tx-sender))
        )
        (map-set users tx-sender 
            (merge (unwrap! (get-user tx-sender) err-invalid-call)
                    {num-transactions: transactions}))
        ;; reward to referer if required number of transactions  
        (if (is-eq transactions num-transactions-for-reward) 
            (begin 
                (remove-referrer tx-sender)
                (ft-mint? refer-reward token-reward (unwrap! referrer (ok true)))
            ) 
            (ok true)
        )
    )
)