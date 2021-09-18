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
;; new user signup and mentions referrer (if any)
(define-public (signup (name (string-ascii 50)) (referrer principal)) 
    (begin 
        ;; own principal
        (asserts! (not (is-eq tx-sender referrer)) err-invalid-call)
        (asserts! (map-insert users tx-sender {username: name, num-transactions: u0, referrer: (some referrer)}) err-invalid-call)
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
                (contract-call? .refer-reward-ft create-ft token-reward 
                    (unwrap! referrer (ok true)))
            ) 
            (ok true)
        )
    )
)

(define-public (destroy-ft (amount uint)) 
    (contract-call? .refer-reward-ft destroy-ft amount tx-sender)
)

(define-public (transfer (amount uint) (recipient principal))
    (contract-call? .refer-reward-ft transfer amount tx-sender recipient)
)