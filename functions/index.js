
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const crypto = require("node:crypto");

initializeApp();

const db = getFirestore();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const OTP_HMAC_SECRET = defineSecret("OTP_HMAC_SECRET");
const OTP_FROM_EMAIL = defineSecret("OTP_FROM_EMAIL");

const OTP_COLLECTION = "emailOtpChallenges";
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_DAILY_SENDS = 5;
const MAX_ATTEMPTS = 5;

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(uid, code) {
  return crypto
    .createHmac("sha256", OTP_HMAC_SECRET.value())
    .update(`${uid}:${code}`)
    .digest("hex");
}

function safeCompare(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  return (
    left.length === right.length &&
    left.length > 0 &&
    crypto.timingSafeEqual(left, right)
  );
}

function invalidateChallenge(tx, ref) {
  tx.update(ref, {
    otpHash: null,
    expiresAt: Timestamp.fromMillis(0),
    attempts: MAX_ATTEMPTS,
  });
}

async function sendEmail(email, code) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: OTP_FROM_EMAIL.value(),
      to: [email],
      subject: "Your MANZILL 777 verification code",
      text:
        `Your verification code is ${code}.\n\n` +
        "It expires in 5 minutes. Do not share this code with anyone.",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:28px;color:#171321">
          <h2>Verify your email</h2>
          <p>Use the code below to verify your email address.</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:20px;background:#f4f0ff;border-radius:12px;text-align:center">
            ${code}
          </div>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not request this code, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Email provider request failed with status ${response.status}.`
    );
  }
}

exports.sendEmailOtp = onCall(
  {
    secrets: [RESEND_API_KEY, OTP_HMAC_SECRET, OTP_FROM_EMAIL],
    enforceAppCheck: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Sign in before requesting email verification."
      );
    }

    const uid = request.auth.uid;
    const user = await getAuth().getUser(uid);

    if (!user.email) {
      throw new HttpsError("failed-precondition", "No email is associated with this account.");
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified." };
    }

    const now = Date.now();
    const dayKey = new Date(now).toISOString().slice(0, 10);
    const ref = db.collection(OTP_COLLECTION).doc(uid);
    const code = createOtp();
    const otpHash = hashOtp(uid, code);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const previous = snap.exists ? snap.data() : {};

      if (
        previous.lastSentAt &&
        now - previous.lastSentAt.toMillis() < RESEND_COOLDOWN_MS
      ) {
        throw new HttpsError(
          "resource-exhausted",
          "Wait 60 seconds before requesting another code."
        );
      }

      const sendsToday =
        previous.dayKey === dayKey ? previous.sendsToday || 0 : 0;

      if (sendsToday >= MAX_DAILY_SENDS) {
        throw new HttpsError(
          "resource-exhausted",
          "Daily OTP limit reached. Try again tomorrow."
        );
      }

      tx.set(ref, {
        otpHash,
        email: user.email,
        expiresAt: Timestamp.fromMillis(now + OTP_EXPIRY_MS),
        attempts: 0,
        lastSentAt: Timestamp.fromMillis(now),
        dayKey,
        sendsToday: sendsToday + 1,
      });
    });

    try {
      await sendEmail(user.email, code);
    } catch (error) {
      // Invalidate this challenge if delivery fails.
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists && snap.data().otpHash === otpHash) {
          invalidateChallenge(tx, ref);
        }
      });

      console.error("OTP delivery failed:", error.message);
      throw new HttpsError(
        "internal",
        "Unable to send the email. Please try again later."
      );
    }

    return {
      success: true,
      message: "Verification code sent.",
      expiresInSeconds: 300,
    };
  }
);

exports.verifyEmailOtp = onCall(
  { secrets: [OTP_HMAC_SECRET], enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please sign in first.");
    }

    const code = String(request.data?.code || "").trim();

    if (!/^\d{6}$/.test(code)) {
      throw new HttpsError(
        "invalid-argument",
        "Enter the six-digit verification code."
      );
    }

    const uid = request.auth.uid;
    const ref = db.collection(OTP_COLLECTION).doc(uid);
    const suppliedHash = hashOtp(uid, code);
    const now = Date.now();
    const user = await getAuth().getUser(uid);

    if (!user.email) {
      throw new HttpsError(
        "failed-precondition",
        "No email is associated with this account."
      );
    }

    const verified = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists) {
        throw new HttpsError(
          "failed-precondition",
          "Code is invalid or expired. Request a new code."
        );
      }

      const challenge = snap.data();

      if (challenge.email !== user.email) {
        invalidateChallenge(tx, ref);
        return false;
      }

      if (challenge.expiresAt.toMillis() <= now) {
        invalidateChallenge(tx, ref);
        return false;
      }

      if (challenge.attempts >= MAX_ATTEMPTS) {
        invalidateChallenge(tx, ref);
        return false;
      }

      if (!safeCompare(challenge.otpHash, suppliedHash)) {
        const attempts = challenge.attempts + 1;

        if (attempts >= MAX_ATTEMPTS) {
          invalidateChallenge(tx, ref);
        } else {
          tx.update(ref, { attempts });
        }

        return false;
      }

      invalidateChallenge(tx, ref);
      return true;
    });

    if (!verified) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid or expired code. Request a new code if needed."
      );
    }

    // The Admin SDK, not the browser, changes this security attribute.
    await getAuth().updateUser(uid, { emailVerified: true });

    return {
      success: true,
      message: "Email verified successfully.",
    };
  }
);
