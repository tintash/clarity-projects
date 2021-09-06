;; escrow contract, price is negotiated outside of contract and double amount is expected
;; seller sets the price by first sending STX double the price, buyer does the same  

;; constants
(define-constant contract-owner tx-sender)
(define-constant contract (as-contract tx-sender))

(define-constant err-invalid-caller (err u100))
(define-constant err-invalid-amount (err u110))
(define-constant err-invalid-call (err u120))

;; data maps and vars
(define-data-var purchase 
    {price: uint, deposit: uint, buyer: (optional principal), seller: (optional principal)} 
    {price: u0, deposit: u0, buyer: none, seller: none}
)

;; read-only functions
(define-read-only (get-buyer)
    (get buyer (var-get purchase))
)

(define-read-only (get-seller)
    (get seller (var-get purchase))
)

;; public functions
(define-public (seller-deposit (amount uint))
    (begin 
        ;; only contract owner can call this -- needed ??
        (asserts! (is-eq contract-owner tx-sender) err-invalid-caller)
        ;; call only once -- to avoid changes in future 
        (asserts! (is-eq (get-seller) none) err-invalid-call)
        ;; deposit/price should not be 0
        (asserts! (> (/ amount u2) u0) err-invalid-amount) 
        (var-set purchase 
            (merge 
                (var-get purchase) 
                {price: (/ amount u2), deposit: amount, seller: (some tx-sender)}
            )
        )
        (stx-transfer? amount tx-sender contract)
    )
)

(define-public (buyer-deposit (amount uint))
    (begin
        ;; no seller
        (unwrap! (get-seller) err-invalid-call)
        ;; call only once -- to avoid changes in future
        (asserts! (is-eq (get-buyer) none) err-invalid-call)
        ;; deposit must be same as sellers deposit
        (asserts! (is-eq (get deposit (var-get purchase)) amount) err-invalid-amount)
        (var-set purchase 
            (merge (var-get purchase) {buyer: (some tx-sender)})
        )
        (stx-transfer? amount tx-sender contract)
    )
)

(define-public (item-received)
    (begin 
        ;; verify buyer 
        (asserts! (is-eq (get-buyer) (some tx-sender)) err-invalid-caller)
        ;; verify deposit exists!
        (asserts! (> (get deposit (var-get purchase)) u0) err-invalid-call)
        ;; transfers
        (try! (as-contract (stx-transfer? 
            (- (get deposit (var-get purchase)) (get price (var-get purchase))) 
            tx-sender (unwrap! (get-buyer) (err u121))
        )))
        (try! (as-contract (stx-transfer? 
            (+ (get deposit (var-get purchase)) (get price (var-get purchase))) 
            tx-sender (unwrap! (get-seller) (err u122))
        )))
        (ok true)
    )
)