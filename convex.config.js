module.exports = {
    auth: {
      providers: [
        // You can pick one or more providers; below is password & magic link
        { type: "password" },
        { type: "email_link" },
        // Or add "github", "google", etc. for social login:
        // { type: "github", clientId: "...", clientSecret: "..." },
      ],
    },
  };
  