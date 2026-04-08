# Firestore Permissions Fix - Student Registration

## Overall Goal
Fix "Missing or insufficient permissions" on `students/ፍ/ሃ/ሰ/ት/00001` by flattening IDs, updating rules, ensuring admin user doc, and deploying.

## Breakdown Steps
- [x] 1. Create this TODO.md
- [x] 2. Edit src/components/Registration.tsx: Change generateStudentId() to flat "FHST00001" format; update bulk too
- [x] 3. Edit src/types.ts: Add ID regex const for validation
- [ ] 4. Edit firestore.rules: 
  - Student rule: allow create if isAdmin() || isSuperAdmin()
  - Update DEPARTMENTS() to match Amharic from types.ts
  - Add isValidStudentId() with regex ^[A-Z]{4}\d{5}$
  - Fix validation
- [ ] 5. Check/create users doc for burukmaedot16@gmail.com uid 36Tva9gO11MX3ABdcCa1N6ec81g2 with role: 'super_admin'
- [ ] 6. firebase deploy --only firestore:rules
- [ ] 7. Test single + bulk registration
- [ ] 8. Update TODO.md complete + attempt_completion

Current: Starting code edits.
