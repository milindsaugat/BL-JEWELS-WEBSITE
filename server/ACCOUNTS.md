# Account and email setup

Set these in server/.env, then restart the Node server:

    EMAIL_USER=your-gmail-address
    EMAIL_APP_PASSWORD=your-google-app-password
    JWT_SECRET=a-long-random-private-secret
    MONGO_URI=your-mongodb-connection

No credentials are included in the repository. Gmail is used by Nodemailer. Without credentials, email sign-in and password recovery report unavailability; no dummy OTP is accepted. Delivery must be tested after credentials are added.

Customer /auth uses email OTP for sign-in and registration. Codes expire in 10 minutes, are HMAC hashed in MongoDB, purpose separated, and consumed once. Five attempts are allowed per code, with a 60-second resend cooldown and IP rate limiting. MongoDB must build the unique EmailChallenge index before production traffic. Distributed deployments also need a shared IP rate limiter for global rate limits.

/account includes real orders, statuses, payment state, receipts, tracking references, profile edits, address CRUD/default selection, wishlist and help links. Saved addresses are available at checkout. Checkout requires sign-in to keep orders private. Cancellation is allowed before processing; delivered orders may request a return. Neither action automatically issues a payment refund: administrators must review requests and process refunds with their payment provider.

Admin password login remains available. Forgot-password uses the same protected code delivery with a separate reset purpose and an 8-character minimum password. Gold API configuration failures return 503, without clearing the admin session. Invalid/expired sessions still require signing in again.

Admin sidebar collapse is saved locally. Storefront link can be set with admin VITE_STOREFRONT_URL.

Newsletter subscriptions persist in MongoDB (Subscriber collection); campaign sending/unsubscribe management is not implemented here.

Validation:

    cd server
    node --test test/customerAccount.test.js test/goldRateRoutes.test.js test/goldRateService.test.js

Client and admin: npm run build. SMTP delivery and end-to-end MongoDB workflows require configured services and should be verified before release.
