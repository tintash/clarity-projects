;; updated-product-app
;; It is an updated version of  'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-app
;; It is good to log events on blockchain so they can be referred in future
;; So this contract logs events on blockchain along with basic CRUDs related to product


(use-trait product-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-trait.product-trait)

;; This function add the product to the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (add-product (data-contract <product-trait>) (product-name (string-ascii 50)) (price uint)) 
  (begin 
     (print { type: "add product", product: product-name, data-contract: data-contract, caller: tx-sender })
     (ok (try! (contract-call? data-contract add-product product-name price)))
  )
)

;; This function deletes the product from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (delete-product (data-contract <product-trait>) (product-name (string-ascii 50)))
   (begin 
     (print { type: "delete product", product: product-name, data-contract: data-contract, caller: tx-sender })
     (ok (try! (contract-call? data-contract delete-product product-name)))
   )
)

;; This function gets the product price from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (get-product-price (data-contract <product-trait>) (product-name (string-ascii 50)))
  (begin
    (print { type: "get-product-price", product: product-name, data-contract: data-contract, caller: tx-sender})
    (ok (try! (contract-call? data-contract get-product-price product-name)))
  ) 
)

;; This function updates the product price from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (update-product-price (data-contract <product-trait>) (product-name (string-ascii 50)) (price uint)) 
  (begin 
    (print { type: "update-product-price", product: product-name, updated-price: price, data-contract: data-contract, caller: tx-sender })
    (ok (try! (contract-call? data-contract update-product-price product-name price)))
  )
)
