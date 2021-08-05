;; product-app
;; This contract interacts with ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data  and utilizes the CRUDS operations related to product provided by it
;; It also stores the data in ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 

(use-trait product-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-trait.product-trait)

;; This function add the product to the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (add-product (data-contract <product-trait>) (product-name (string-ascii 50)) (price uint)) 
  (ok (try! (contract-call? data-contract add-product product-name price)))
)

;; This function deletes the product from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (delete-product (data-contract <product-trait>) (product-name (string-ascii 50)))
  (ok (try! (contract-call? data-contract delete-product product-name)))
)

;; This function gets the product price from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (get-product-price (data-contract <product-trait>) (product-name (string-ascii 50)))
  (ok (try! (contract-call? data-contract get-product-price product-name)))
)

;; This function updates the product price from the inventory of 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.product-data 
(define-public (update-product-price (data-contract <product-trait>) (product-name (string-ascii 50)) (price uint)) 
   (ok (try! (contract-call? data-contract update-product-price product-name price)))
)
