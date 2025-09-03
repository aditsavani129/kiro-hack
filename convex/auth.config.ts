export default {
    providers: [
      {
        domain: process.env.CLERK_JWT_ISSUER_DOMAIN, // Should match your Clerk JWT template issuer
        applicationID: "convex", // or your own app ID as needed
      },
    ],
  };
  