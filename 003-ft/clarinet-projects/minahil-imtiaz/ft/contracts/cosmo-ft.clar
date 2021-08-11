;; cosmo-nft

(impl-trait 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.ft-trait.ft-trait)

(define-fungible-token cosmo-ft)
(define-constant contract-owner tx-sender)
(define-constant ERR_UNAUTHORIZED_CALLER u400)
(define-constant ERR_DUPLICATE_RECORD u504)
(define-constant SUCCESS u200)

(define-map valid-contract-callers { contract-identifier: principal} {valid-caller: bool})

(define-private (is-valid-contract-caller (caller principal))
  (is-some (map-get? valid-contract-callers { contract-identifier: caller }))
)


(define-read-only (get-name) 
  (ok "Cosmo Token")
)

(define-read-only (get-symbol) 
  (ok "CTX")
)

(define-read-only (get-decimals)
  (ok u4)
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply cosmo-ft))
)

(define-read-only (get-token-uri)
  (ok  (some u"\u{1F30C}"))  
)

(define-read-only (get-balance-of (owner-identifier principal))
  (ok (ft-get-balance cosmo-ft owner-identifier))
)

(define-public (transfer ( amount uint) (sender principal) (recipient principal))
  (ft-transfer? cosmo-ft amount sender recipient)
)

(define-public (issue-token ( amount uint) (recipient principal))
   (begin 
      (asserts! (or (is-eq tx-sender contract-owner) (is-valid-contract-caller contract-caller)) (err ERR_UNAUTHORIZED_CALLER)) 
      (ft-mint? cosmo-ft amount recipient)
   )
)

(define-public (destroy-token (amount uint) (owner principal))
   (begin 
      (asserts! (or (is-eq tx-sender contract-owner) (is-eq tx-sender owner)) (err ERR_UNAUTHORIZED_CALLER)) 
      (ft-burn? cosmo-ft amount owner)
   )
)

(define-public (add-valid-contract-caller (app-contract-identifier principal))
  (begin 
    (asserts! (is-eq tx-sender contract-owner) (err ERR_UNAUTHORIZED_CALLER)) 
    (asserts! (map-insert valid-contract-callers { contract-identifier: app-contract-identifier } {valid-caller: true }) (err ERR_DUPLICATE_RECORD))
    (ok SUCCESS)     
  )
)