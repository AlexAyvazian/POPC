# Master sectors

All Jeffries and Schumer tables, charts, research queries and memo views use `assets/js/master-sectors.js`.

The vocabulary contains 37 labels. Employer status and unresolved classification are separate from business industries.

Priority: explicit source-backed research sector; existing exact-name research overrides; consistent direct-receipt source classifications; researched business description; shared name rules; unresolved. Memo rows never supply classification hints. Original source datasets remain unchanged. Parent-company relationships are not aggregation keys.

The same type-aware resolver handles both networks and verified aliases. Source sectors with conflicting labels fall back to the shared research/rules instead of choosing a committee-specific label.

## Labels

- Aerospace & defense
- Agriculture, food & beverage
- Cannabis
- Construction & infrastructure
- Diversified business group
- Education
- Energy & utilities
- Facilities & environmental services
- Finance & investment
- Foreign policy & advocacy
- Furniture & woodworking
- Government & public sector
- Health insurance
- Healthcare
- Hospitality & gaming
- Insurance
- Labor unions
- Legal services
- Lobbying & public affairs
- Manufacturing & automotive
- Media & entertainment
- Metals & materials processing
- Nonprofit & philanthropy
- Other advocacy
- Pharmaceuticals & biotechnology
- Political committees & advocacy
- Professional services
- Real estate & housing
- Retail & consumer
- Security services
- Technology
- Telecommunications
- Trade associations
- Transportation
- Tribal nations & governments
- Personal status / unreported employer
- Sector unresolved / ambiguous
