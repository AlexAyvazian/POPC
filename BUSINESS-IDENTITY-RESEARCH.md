# Business identity research — November 24, 2026

The first research batch adds 71 source-backed business identities and 9 parent-company links to the separate business directory. The directory now contains 2,645 business/organization groups: 71 source-backed, 20 unresolved reported names, and 2,554 not yet reviewed. These statuses describe identity research, not contact research or sector verification.

`business-identities.js` stores exact aliases, the display name, identity scope, parent where established, a short evidence note, source URLs, and review date. The UI and CSV expose this information. A business-group or brand mapping identifies that group or brand; it does not establish the legal employing subsidiary of every individual donor. Parent relationships describe the cited corporate relationship, not necessarily ownership on each donation date.

Unresolved names are retained separately, including CREI, NEP, Patrick Partners, Leifer Capital Advisers, Mallard Investments, Stream Line Circle, Patterson Planning & Services, JRJ Construction, and the reported Amazon.com Services, Inc. form. Accenture, Coinbase, Delaware North, and Siemens variants are also retained separately where brand-versus-legal-entity identity remains unconfirmed. Links on unresolved entries are research leads, not confirmed matches.

Parents are searchable context, never aggregation keys. Microsoft and LinkedIn, Amazon and Amazon.com Services, and Warner Music Inc. and Warner Records remain separate entries. Raw reported employer/PAC names and donor records remain available in details and exports. No fuzzy alias matching is applied.

Validation: five Node tests pass; all eight committee datasets reconcile; 110,817 direct records and 111,022 memo records remain accounted for. Direct contribution totals are unchanged. Memo amounts remain excluded from totals. DOM checks pass for parent search, source links, unresolved filtering, and reset. Visual rendering and live deployment were not verified in this batch.

Run data tests with `node --test business-directory.test.mjs`.
