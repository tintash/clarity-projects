
;; product-trait
;; It defines the set of functions must be implemented by another contract using this trait

(define-trait product-trait
( 
 (get-product-price ((string-ascii 50)) (response uint uint))
 (add-product ((string-ascii 50) uint) (response uint uint))
 (update-product-price ((string-ascii 50) uint) (response uint uint))
 (delete-product ((string-ascii 50)) (response uint uint))
 (add-valid-contract-caller (principal) (response uint uint))
)
)