# Team TestMax

Fresh local test-series project with:

- Static frontend served from the same app
- File-based backend storage in `data/app-data.json`
- Signup OTP verification
- Login OTP verification
- Gmail SMTP delivery using the sender in `.env`

## Run

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Auth API

- `POST /api/auth/signup/request-otp`
- `POST /api/auth/signup/verify`
- `POST /api/auth/login/request-otp`
- `POST /api/auth/login/verify`
- `GET /api/auth/me`

## Notes

- Live SMTP uses the Gmail settings in `.env`.
- For local dry-run testing without sending real emails, set `SMTP_DISABLE=true`.
- User data and OTP requests are stored in `data/app-data.json`.
