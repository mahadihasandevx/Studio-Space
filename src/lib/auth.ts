import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { createAuthMiddleware } from "better-auth/api";

const uri = process.env.MONGODB_URI;
const secret = process.env.BETTER_AUTH_SECRET;

let client: MongoClient | undefined;

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

function missingConfigurationMessage() {
  const missing = [
    !uri && "MONGODB_URI",
    !secret && "BETTER_AUTH_SECRET",
    !process.env.BETTER_AUTH_URL && "BETTER_AUTH_URL",
  ].filter(Boolean);
  return `Authentication is not configured. Add ${missing.join(", ")} to studiospace-client/.env.`;
}

export function getAuth() {
  if (!uri || !secret || !process.env.BETTER_AUTH_URL) {
    throw new AuthConfigurationError(missingConfigurationMessage());
  }

  const socialProviders =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  const mongoClient = (client ??= new MongoClient(uri));
  return betterAuth({
    appName: "StudioSpace",
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    secret,
    database: mongodbAdapter(mongoClient.db("studiospace"), {
      client: mongoClient,
    }),
    trustedOrigins: [process.env.BETTER_AUTH_URL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      autoSignIn: false,
    },
    socialProviders,
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== "/sign-up/email") return;
        const password = context.body?.password;
        if (
          typeof password !== "string" ||
          password.length < 6 ||
          !/[A-Z]/.test(password) ||
          !/[a-z]/.test(password)
        ) {
          return context.json(
            {
              message:
                "Password must be at least 6 characters and include an uppercase and lowercase letter.",
            },
            { status: 400 },
          );
        }
      }),
    },
  });
}
