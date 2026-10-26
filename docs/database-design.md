# AICTE Integrated Institution Complaint Monitoring & Status Dashboard
## Relational Database Design & ER Schema (Third Normal Form - 3NF)
**Target: MySQL 8.0+ | Database Name: `aicte_complaints`**

---

### 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    institutions ||--o{ cases : "references (1:N)"
    institutions ||--o{ overlap_alerts : "flags (1:N)"
    bureaus ||--o{ users : "affiliated with (1:N)"
    bureaus ||--o{ cases : "assigned to (1:N)"
    bureaus ||--o{ transfer_requests : "from / to (1:N)"
    users ||--o{ cases : "created by (1:N)"
    users ||--o{ case_actions : "logged by (1:N)"
    users ||--o{ transfer_requests : "requested / reviewed (1:N)"
    users ||--o{ overlap_alerts : "reviewed by (1:N)"
    users ||--o{ import_batches : "imported by (1:N)"
    users ||--o{ audit_logs : "performed by (1:N)"
    cases ||--o{ case_actions : "has immutable history (1:N)"
    cases ||--o{ transfer_requests : "transfers (1:N)"
    cases ||--o{ overlap_alerts : "participates in pair (1:N)"
    cases ||--o{ case_attachments : "has documents (1:N)"
    import_batches ||--o{ import_errors : "logs row errors (1:N)"

    institutions {
        BIGINT id PK
        VARCHAR permanent_id UK
        VARCHAR name
        VARCHAR region
        VARCHAR state
        VARCHAR city
        VARCHAR approval_status
        BOOLEAN is_verified
    }

    bureaus {
        BIGINT id PK
        VARCHAR code UK
        VARCHAR name
        BOOLEAN is_active
    }

    users {
        BIGINT id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR full_name
        VARCHAR role
        BIGINT bureau_id FK
        BOOLEAN is_active
    }

    cases {
        BIGINT id PK
        VARCHAR case_number UK
        VARCHAR source_case_id
        BIGINT institution_id FK
        BIGINT bureau_id FK
        VARCHAR title
        VARCHAR category
        VARCHAR priority
        VARCHAR status
        DATETIME receipt_date
        DATETIME expected_disposal_date
        DATETIME disposed_date
    }

    case_actions {
        BIGINT id PK
        BIGINT case_id FK
        BIGINT user_id FK
        VARCHAR action_type
        VARCHAR from_status
        VARCHAR to_status
        TEXT remarks
        VARCHAR next_action
        DATETIME next_action_due_date
        TIMESTAMP created_at
    }

    transfer_requests {
        BIGINT id PK
        BIGINT case_id FK
        BIGINT from_bureau_id FK
        BIGINT to_bureau_id FK
        BIGINT requested_by_user_id FK
        BIGINT reviewed_by_user_id FK
        TEXT reason
        VARCHAR status
        TEXT decision_remarks
    }

    overlap_alerts {
        BIGINT id PK
        BIGINT institution_id FK
        BIGINT case1_id FK
        BIGINT case2_id FK
        VARCHAR status
        VARCHAR classification
        TEXT review_remarks
        BIGINT reviewed_by_user_id FK
    }

    import_batches {
        BIGINT id PK
        VARCHAR batch_id UK
        VARCHAR filename
        INT total_rows
        INT valid_rows
        INT imported_rows
        INT failed_rows
        VARCHAR status
    }

    import_errors {
        BIGINT id PK
        BIGINT import_batch_id FK
        INT csv_row_number
        TEXT error_reason
    }

    audit_logs {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR user_email
        VARCHAR action
        VARCHAR entity_type
        VARCHAR entity_id
        TEXT details
        TIMESTAMP created_at
    }
```

---

### 2. Normalization & Integrity Principles

1. **Third Normal Form (3NF) Compliance:**
   - Every non-key attribute depends strictly on the primary key, whole key, and nothing but the key.
   - Institution and Bureau metadata are normalized into dedicated reference tables (`institutions`, `bureaus`), preventing data anomalies across case records.

2. **Immutable Append-Only Action History (`case_actions`):**
   - Case records in the `cases` table reflect current status and deadlines.
   - Any status transition or official comment appends a non-destructive row to `case_actions` with author credential, old status, new status, and timestamp. Rows in `case_actions` are never updated or deleted.

3. **Case Transfer Integrity Rule:**
   - When a case is transferred from one Bureau to another, its unique `case_number` is strictly preserved.
   - The transfer is logged in `transfer_requests` and appended to `case_actions`.
   - The original case file is never duplicated or prematurely closed.

4. **Rules-Based Cross-Bureau Overlap Engine (`overlap_alerts`):**
   - Flags active complaints (`status IN ('RECEIVED', 'UNDER_PROCESS')`) sharing the same verified `institution_id` across distinct `bureau_id`s.
   - An alert is created with status `DETECTED`.
   - Distinct case records are never merged; human officers classify alerts as `RELATED`, `UNRELATED`, or `REQUIRES_COORDINATION`.
