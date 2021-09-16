;; user-mgmt

;; constants
(define-constant contract-owner tx-sender)

(define-constant token-reward u10)
(define-constant num-transactions-for-reward u1)

(define-constant err-invalid-caller (err u100))
(define-constant err-invalid-call (err u110))
(define-constant err-unauthorized-caller (err u99))

;; data maps and vars
(define-map users principal 
    {username: (string-ascii 50), num-transactions: uint, referrer: (optional principal)})

;; private functions
(define-private (remove-referrer (user principal)) 
    (map-set users user (merge (unwrap! (get-user user) false) {referrer: none}))
)

;; read-only functions
(define-read-only (get-user (user principal))
    (map-get? users user) 
)

(define-read-only (get-referrer (user principal)) 
    (default-to none (get referrer (map-get? users user)))
)

(define-read-only (get-num-transactions (user principal))
    (default-to u0 (get num-transactions (map-get? users user)))
)

;; public functions
(define-public (signup (user principal) (name (string-ascii 50)) (referrer principal)) 
    (begin 
        ;; own principal
        (asserts! (not (is-eq tx-sender referrer)) err-invalid-call)
        (asserts! (map-insert users user {username: name, num-transactions: u0, referrer: (some referrer)}) err-invalid-call)
        (ok true)
    )
)

(define-public (complete-transaction (user principal)) 
    (let
        (
            (transactions (+ (get-num-transactions user) u1))
            (user-info (get-user user))
            (referrer (get-referrer user))
        )
        (asserts! (is-eq tx-sender user) err-invalid-caller)
        ;; verify user
        (asserts! (is-some user-info) err-invalid-call)
        (map-set users user 
            (merge (unwrap! user-info err-invalid-call) {num-transactions: transactions}))
        ;; reward to referer if required number of transactions  
        (asserts! (is-eq transactions num-transactions-for-reward) (ok true))
        
        (asserts! (remove-referrer user) (ok true))
        (contract-call? .refer-reward-ft create-ft token-reward (unwrap! referrer (ok true)))
    )
)

(define-public (destroy-ft (amount uint) (owner principal)) 
    (begin 
        ;; only contract or token owner 
        (asserts! (or (is-eq tx-sender contract-owner) 
                    (is-eq tx-sender owner)) err-invalid-caller)
        (contract-call? .refer-reward-ft destroy-ft amount owner)
    )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) err-invalid-caller)
        (contract-call? .refer-reward-ft transfer amount sender recipient)
    )
)