;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ACHIEVEMENT_REWARD_TOKENS u1000)
(define-constant ACHIEVEMENT_COMPLETED "ACHIEVEMENT_COMPLETED")
(define-constant COSMETIC_BOUGHT "COSMETIC_BOUGHT")
(define-constant TOKENS_BOUGHT "TOKENS_BOUGHT")
(define-constant TOKENS_TRANSFERED_TO_FRIEND "TOKENS_TRANSFERED_TO_FRIEND")
(define-constant COSMETIC_BUYING_MEMO (some 0x42757920436f736d65746963)) ;; Buy Cosmetic

;; Errors
(define-constant ACHIEVEMENT_DOES_NOT_EXIST (err u100))
(define-constant COSMETIC_DOES_NOT_EXIST (err u101))
(define-constant INSUFFICIENT_BALANCE (err u102))
(define-constant UNWRAP_FAILED (err u103))
(define-constant BUYER_ONLY (err u104))
(define-constant CONTRACT_OWNER_ONLY (err u105))
(define-constant STORE_ITEM_DOES_NOT_EXIST (err u106))

;; Data
(define-map achievements {id: uint} {name: (string-ascii 50)})
(define-map cosmetics {id: uint} {name: (string-ascii 50), amount: uint})
(define-map store-item {id: uint} {stx: uint, token: uint})

;; Set Data
(map-set achievements {id: u0} {name: "First Blood"})
(map-set cosmetics {id: u0} {name: "Red Dress", amount: u100})
(map-set store-item {id: u0} {stx: u5000, token: u500})

(define-private (search-achievements (id uint))
    (map-get? achievements {id: id})
)

(define-private (search-cosmetics (id uint))
    (map-get? cosmetics {id: id})
)

(define-private (search-store-item (id uint))
    (map-get? store-item {id: id})
)

;; Function to trigger achievement completed. Called by contract owner only.
;; (contract-call? 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.vbucks-game achievement-completed u0 'STFCVYY1RJDNJHST7RRTPACYHVJQDJ7R1DWTQHQA)
(define-public (achievement-completed (id uint) (player principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) CONTRACT_OWNER_ONLY)
        (asserts! (is-some (search-achievements id)) ACHIEVEMENT_DOES_NOT_EXIST)
        (try! (contract-call? .velocity-ft give ACHIEVEMENT_REWARD_TOKENS player))
        (ok ACHIEVEMENT_COMPLETED)
    )
)

;; Function to buy a cosmetic from store . Can only be called by buyers.
;; (contract-call? 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.vbucks-game buy-cosmetics u0)
(define-public (buy-cosmetics (id uint))
    (begin
        (asserts! (not (is-eq contract-caller CONTRACT_OWNER)) BUYER_ONLY)
        (asserts! (is-some (search-cosmetics id)) COSMETIC_DOES_NOT_EXIST)
        (let
            (
                (cosmetic-amount (unwrap! (get amount (search-cosmetics id)) UNWRAP_FAILED))
            )
            (try! (contract-call? .velocity-ft transfer cosmetic-amount contract-caller (as-contract tx-sender) COSMETIC_BUYING_MEMO))
            (ok COSMETIC_BOUGHT)
        )
    )
)

;; Function to buy tokens from stx. Called by token owner.
(define-public (buy-tokens (id uint))
    (begin
        (asserts! (is-some (search-store-item id)) STORE_ITEM_DOES_NOT_EXIST)
        (let
            (
                (store-item-stx (unwrap! (get stx (search-store-item id)) UNWRAP_FAILED))
                (store-item-token (unwrap! (get token (search-store-item id)) UNWRAP_FAILED))
            )
            (try! (contract-call? .velocity-ft buy store-item-stx store-item-token tx-sender))
            (ok TOKENS_BOUGHT)
        )    
    )
)