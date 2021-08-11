
;; escrow-payment
;; A basic escrow payment contract which requires seller to add an order using details of buyer and item for depositing security amount.
;;The buyer then provides the details of seller and item. After validation the order amount and security fee is deducted. 
;;The contract holds the amount while order is being shipped to buyer safely.
;; When the buyer receives the item, the security fee to both parties is returned and the order amount is transferred to the seller.

;; constants
;;
(define-constant contract-owner tx-sender)
(define-constant success u0)
(define-constant payment-error u1)
(define-constant record-update-error u2)
(define-constant duplicate-record-error u3)
(define-constant no-record-error u4)

;; data maps and vars
;;
(define-map orders {buyer: principal, seller: principal, item: (string-ascii 40)} {price: uint})

;; private functions
;;
(define-private (get-item-price (buyer principal) (seller principal) (item-name (string-ascii 40)))
    (default-to u0 (get price (map-get? orders {buyer: buyer, seller: seller, item: item-name})))
)


;; public functions
;;Sellers will use this function to insert an order record and deposit security amount.
(define-public (pay-as-seller (buyer-address principal) (item-name (string-ascii 40)) (price uint))
(begin
   (if 
   (and (> price u0)  (is-none (map-get? orders {buyer: buyer-address, seller: tx-sender, item:  item-name})))
   (let ((doubled-price (* u2 price)))
      (unwrap! (stx-transfer? doubled-price tx-sender (as-contract  tx-sender)) (err payment-error))
      (map-set orders {buyer: buyer-address, seller: tx-sender, item: item-name} {price: price})
      (ok success)
   )  
   (err duplicate-record-error) 
  )
)
)

;;Buyers will use this method to pay item fee and security fee for the item set up the seller.
(define-public (pay-as-buyer (seller-address principal) (item-name (string-ascii 40)))
(begin
   (let ((item-price (* u2 (get-item-price tx-sender seller-address item-name))))
      (if (> item-price u0)
       (begin 
          (unwrap! (stx-transfer? item-price tx-sender (as-contract tx-sender)) (err payment-error))
          (ok success)
       )
       (err no-record-error) 
      )
   )
)
)

;;When the item received by the buyer, he will call this function so that the funds and security fee can be discharged to both parties.
(define-public (item-received (seller-address principal) (item-name (string-ascii 40)))
(begin
   (let
      (
       (item-price (get-item-price tx-sender seller-address item-name))
       (seller-funds (* u3 item-price))
       (buyer-address tx-sender)
      )
      (if (> item-price u0)
       (begin 
          (unwrap! (as-contract (stx-transfer? item-price tx-sender buyer-address)) (err payment-error))
          (unwrap! (as-contract (stx-transfer? seller-funds tx-sender seller-address)) (err payment-error))
          (map-delete orders { buyer: tx-sender, seller: seller-address, item: item-name })
          (print { buyer: tx-sender, seller: seller-address, item: item-name })
          (ok success)
       )
       (err no-record-error) 
      ) 
   )
)
)