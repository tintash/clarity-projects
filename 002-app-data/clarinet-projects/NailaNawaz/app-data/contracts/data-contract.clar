;; data-contract
;; this contract implements the data-trait contract and is used by app-contract 
;; and updated app contract

(impl-trait .data-trait.sum)
;; constants
(define-constant CONTRACT_OWNER 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE) ;; data-contract owner
(define-constant ERR_NOT_OWNER u0)
(define-constant ERR_DUPLICATE_RECORD u1)
(define-constant ERR_INVALID_CALLER u2)

;; maps and variables
(define-map valid-callers { valid-caller-id: principal} {is-valid: bool})

;;private functions

;;this method will be called by the other functions of data-contract to check if that
;;method is being called by a valid caller or not
(define-public (check-valid-caller (caller principal))
  (ok (is-some (map-get? valid-callers {valid-caller-id: caller})))
)

;;pubic functions

;; this function takes two uint type params and returns their sum
;; the contract can be called only by valid app contract
(define-public (get-sum (num1 uint) (num2 uint) ) 
  (begin
    (asserts! (unwrap! (check-valid-caller contract-caller) (err ERR_INVALID_CALLER)) (err ERR_INVALID_CALLER))
    (ok (+ num1 num2))
  )
)

;; CONTRACT_OWNER IS THE OWNER OF DATA-CONTRACT, and only this one can add the other valid callers
(define-public (add-valid-caller (valid-caller principal))
  (begin 
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err ERR_NOT_OWNER)) 
    (asserts! (map-insert valid-callers { valid-caller-id: valid-caller } {is-valid: true }) (err ERR_DUPLICATE_RECORD))
    (ok true)     
  )
)