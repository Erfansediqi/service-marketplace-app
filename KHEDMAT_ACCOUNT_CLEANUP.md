# Khedmat account cleanup

Updated: 2026-08-05

## Progress

- [x] Signup credentials appear in the customer Account header.
- [x] Personal Information updates the Account header name and avatar.
- [x] Contact Support opens a dedicated account screen instead of Messages.
- [x] Customer profile, avatar, support draft, and support requests persist locally.

## Local storage keys

- `@khedmat_customer_profile`
- `@khedmat_support_draft`
- `@khedmat_support_requests`

## Main files

- `src/context/customer-profile-context.tsx`
- `src/app/signup.tsx`
- `src/app/verify-code.tsx`
- `src/app/_layout.tsx`
- `src/app/(tabs)/profile.tsx`
- `src/app/account/personal-information.tsx`
- `src/app/account/contact-support.tsx`

## Manual test flow

1. Start with cleared application data.
2. Sign up with a non-default customer name and phone number.
3. Enter a four-digit verification code and finish the customer flow.
4. Open Account and confirm the signup name and phone are displayed.
5. Open Personal Information, edit the name and email, select an avatar, and save.
6. Return to Account and confirm the name and avatar update immediately.
7. Restart the application and confirm the profile still appears.
8. Open Contact Support and confirm it does not open Messages.
9. Enter a partial support request, leave the screen, reopen it, and confirm the draft returns.
10. Submit the request and confirm the local-save message appears.

## Current backend limitation

Support requests are queued on the device only. A backend/API integration is still required to deliver them to a real support team.
