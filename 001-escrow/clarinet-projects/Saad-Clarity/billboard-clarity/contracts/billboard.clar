
;; billboard

;; constants
;;
(define-constant ERR_STX_TRANSFER u0)

;; data maps and vars
;;
(define-data-var billboard-message (string-utf8 500) u"Hello World!")
(define-data-var price uint u100) ;;100 microSTX or 0.0001STX

;; private functions
;;

;; public functions
;;
(define-read-only (get-message) 
     (var-get billboard-message))

(define-read-only (get-price)
    (ok (var-get price)))

(define-public (set-message (message (string-utf8 500)))
    (let ((current-price (var-get price))
        (new-price (+ current-price u10)))
         
        ;;pay the contract
        (unwrap! (stx-transfer? current-price tx-sender (as-contract tx-sender)) (err ERR_STX_TRANSFER))
         
        ;;update the billboard's message
        (var-set billboard-message message)

        ;;update the price
        (var-set price new-price)

        ;;return the updated price
        (ok new-price)
    )
)


