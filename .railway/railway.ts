import { defineRailway, empty, mongo, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const db = mongo("mongodb");

  // The code is not pulled from GitHub: the ci-backend workflow uploads it with
  // `railway up` when a backend-v*.*.* tag is pushed. Two deploy sources would
  // build every release twice, so the service has an empty source.
  //
  // The backend needs the workspace packages (shared, dto, validators), so it
  // builds from the repo root and compiles them first.
  const backend = service("backend", {
    source: empty(),
    build: {
      builder: "RAILPACK",
      buildCommand:
        "npx tsc -b packages/shared packages/dto packages/validators && npm run build -w @DeparkHackaton/backend",
    },
    start: "npm run start -w @DeparkHackaton/backend",
    healthcheck: "/health",
    deploy: { restartPolicyType: "ON_FAILURE", restartPolicyMaxRetries: 3 },
    env: {
      NODE_ENV: "production",
      MONGODB_URI: db.env.MONGO_URL,
      // secrets: set them once in the Railway dashboard, apply keeps them
      JWT_SECRET: preserve(),
      ACCESS_TOKEN_EXPIRATION: preserve(),
      REFRESH_TOKEN_EXPIRATION: preserve(),
      GEMINI_API_KEY: preserve(),
      // the web app's origin, e.g. https://depark.example.com
      CORS_ORIGIN: preserve(),
    },
  });

  return project("Depark-Hackaton", {
    resources: [db, backend],
  });
});
