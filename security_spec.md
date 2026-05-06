# Security Specification & Threat Model

## Data Invariants
1. An **Investor** must always belong to an authenticated user (`ownerId`).
2. An **Investor** status and stage must be from the allowed enum set.
3. **Updates** and **Metrics** must always be linked to the user who created them.
4. Timestamps (`createdAt`, `updatedAt`) must be server-generated and immutable (for `createdAt`).

## The "Dirty Dozen" Payloads (Red Team Payloads)

### 1. Identity Spoofing (Investor)
Attempt to create an investor for another user.
```json
{
  "name": "Target Investor",
  "firm": "Target VC",
  "stage": "Leads",
  "status": "Active",
  "ownerId": "ANOTHER_USER_ID"
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `incoming().ownerId == request.auth.uid`).

### 2. Shadow Field Injection (Investor)
Attempt to inject an unvalidated field.
```json
{
  "name": "Injection Test",
  "firm": "Test VC",
  "stage": "Leads",
  "status": "Active",
  "ownerId": "MY_ID",
  "isAdmin": true
}
```
**Expected Result:** PERMISSION_DENIED (rule must use strict key count or `hasOnly`).

### 3. Resource Poisoning (ID Injection)
Attempt to use a massive/malicious document ID.
**Path:** `/investors/VERY_LONG_STRING_OVER_128_CHARS_OR_SPECIAL_CHARS_...`
**Expected Result:** PERMISSION_DENIED (rule must use `isValidId(investorId)`).

### 4. Privilege Escalation (Owner Change)
Attempt to change ownerId of an existing record.
```json
{
  "ownerId": "ATTACKER_ID"
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `incoming().ownerId == existing().ownerId`).

### 5. Type Poisoning (String vs Boolean)
Attempt to set a string field to a boolean.
```json
{
  "name": true
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `is string`).

### 6. Boundary Violation (String Size)
Attempt to inject a 1MB string into the `name` field.
```json
{
  "name": "A".repeat(1000000)
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `.size() <= 100`).

### 7. State Shortcut (Status Injection)
Attempt to set an invalid status.
```json
{
  "status": "EXFILTRATED"
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `in [...]`).

### 8. Timestamp Forgery (Create)
Attempt to set `createdAt` back in time.
```json
{
  "createdAt": "2000-01-01T00:00:00Z"
}
```
**Expected Result:** PERMISSION_DENIED (rule must check `== request.time`).

### 9. Unauthenticated Write
Attempt to write without being signed in.
**Expected Result:** PERMISSION_DENIED.

### 10. Unverified Email Access
Attempt to write with an unverified email.
**Expected Result:** PERMISSION_DENIED (if `email_verified == true` is enforced).

### 11. PII Leak (List Query)
Attempt to list all investors without filtering by `ownerId`.
**Query:** `db.collection('investors').get()`
**Expected Result:** PERMISSION_DENIED (rule must check `resource.data.ownerId == request.auth.uid`).

### 12. Immutable Field Update
Attempt to change `createdAt` on an update.
```json
{
  "createdAt": "2025-01-01T00:00:00Z"
}
```
**Expected Result:** PERMISSION_DENIED.
