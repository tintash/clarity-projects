(impl-trait .sip010-ft-trait.sip010-ft-trait)

(define-constant contract-owner tx-sender)

(define-fungible-token dao-token u1000000)

(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-NO-VALUE (err u102))
(define-constant ERR-CONTRIBUTORS-ONLY (err u103))
(define-constant ERR-STAKEHOLDERS-ONLY (err u104))
(define-constant ERR-SAME-VALUE (err u105))
(define-constant ERR-VOTE-EXPIRED (err u106))

; every block minned approximately each 10min,
; so 1 week will be approximately 60 * 24 * 7 / 10 = 1008 blocks
(define-constant minimum-voting-period u1008)

(define-constant stakeholder-level u100)

(define-data-var ft-price uint u100)
(define-data-var last-proposal-id uint u0)
(define-map proposals id uint
           {name: (string-ascii 64),
		    live-period: uint, votes-for: uint, votes-against: uint})
(define-map proposals-votes {stakeholder: principal, proposal-id: uint} bool)

(define-public (transfer (amount uint)
                         (sender principal)
						 (recipient principal)
						 (memo (optional (buff 34))))
	(begin
		(asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
		(ft-transfer? dao-token amount sender recipient)
	)
)

(define-read-only (get-name)
	(ok "DAO token")
)

(define-read-only (get-symbol)
	(ok "DAOT")
)

(define-read-only (get-decimals)
	(ok u0)
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance dao-token who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply dao-token))
)

(define-read-only (get-token-uri)
	(ok none)
)
;;;;;;; ft traits implementation end ;;;;;;;;;;;;

(define-read-only (get-ft-price)
    (var-get ft-price)
)

(define-read-only (get-proposal (proposal-id uint))
	(default-to none (map-get? proposals proposal-id))
)

(define-read-only (get-proposal-vote (who principal) (proposal-id uint))
	(default-to none (map-get? proposals-votes {stakeholder: who, proposal-id: proposal-id}))
)

(define-public (set-ft-price (amount uint)) 
    (begin
        (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY) 
        (ok (var-set ft-price amount))
    )
)

(define-public (mint (num-tokens uint))
	(begin
		(asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
		(asserts! (> num-tokens u0) ERR-NO-VALUE)
		(try! (ft-mint? dao-token amount recipient))
		(stx-transfer? (* num-tokens (var-get ft-price)) tx-sender (as-contract tx-sender))
	)
)

(define-public (create-proposal (name (string-ascii 64) (expire-at uint)))
	(begin
		(asserts! (> (get-balance tx-sender) u0) ERR-CONTRIBUTORS-ONLY)
		(asserts! (> (len name) u0) ERR-NO-VALUE)
		(let
			(
				(proposal-id (+ (var-get last-proposal-id) u1))
			)
			(var-set last-proposal-id proposal-id)
			(ok (map-set proposal-id
			             {name: name,
						  live-period: (+ minimum-voting-period expire-at),
						  votes-for: u0,
						  votes-against: u0
						 }))
		)
	)
)

(define-private (calculate-vote (proposal-vote bool) (vote bool))
	()
)

(define-public (vote-proposal (proposal-id uint) (vote bool))
	(begin
		(asserts! (>= (get-balance tx-sender) stakeholder-level) ERR-STAKEHOLDERS-ONLY)
		(let
			(
				(proposal (get-proposal proposal-id))
				(vote-for (default-to u0 (get proposal vote-for)))
				(vote-against (default-to u0 (get proposal vote-against)))
				(proposal-vote (get-proposal-vote tx-sender proposal-id))
				(vote-for-new (+ vote-for (if vote u1 u0)))
				(vote-against-new (+ vote-against (if vote u0 u1)))
				(live-period (default-to u0 (get proposal live-period)))
			)
			(asserts! (not (is-eq vote proposal-vote)) ERR-SAME-VALUE)
			(asserts! (> live-period block-height) ERR-VOTE-EXPIRED)
			(if (is-none proposal-vote)
				(map-set proposals (merge proposal
				                    {vote-for: vote-for-new, vote-against: vote-against-new}))
				(if proposal-vote
					(map-set proposals (merge proposal
				                       {vote-for: vote-for-new, vote-against: (- vote-against-new u1)}))
					(map-set proposals (merge proposal
									   {vote-for: (- vote-for-new u1), vote-against: vote-against-new}))
				)
			)
		)
		(ok (map-set proposals-votes {stakeholder: tx-sender, proposal-id: proposal-id} vote))
	)
)