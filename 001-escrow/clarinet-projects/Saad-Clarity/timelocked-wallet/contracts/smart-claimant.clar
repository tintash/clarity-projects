(define-public (claim)
    (begin
        (try! (as-contract (contract-call? .timelocked-wallet claim)))
        (let
            (
                (total-balance (as-contract (stx-get-balance tx-sender)))
                (share (/ total-balance u4))
            )
            (try! (as-contract (stx-transfer? share tx-sender 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK)))
            (try! (as-contract (stx-transfer? share tx-sender 'ST20ATRN26N9P05V2F1RHFRV24X8C8M3W54E427B2)))
            (try! (as-contract (stx-transfer? share tx-sender 'ST21HMSJATHZ888PD0S0SSTWP4J61TCRJYEVQ0STB)))
            (try! (as-contract (stx-transfer? (stx-get-balance tx-sender) tx-sender 'ST2QXSK64YQX3CQPC530K79XWQ98XFAM9W3XKEH3N)))
            (ok true)
        )
    )
)

;; clarinet-console
;; #V2
;; (contract-call? .timelocked-wallet lock 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.smart-claimant u10 u1000)
;; ::get_assets_maps
;; (contract-call? .smart-claimant claim)
;; ::advance_chain_tip 10
;; (contract-call? .smart-claimant claim)
;; ::get_assets_maps
