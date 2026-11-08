import { defineRailway, github, mongo, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const db = mongo("mongodb");

  // The backend needs the workspace packages (shared, dto, validators), so it
  // builds from the repo root. `tsc -b` in apps/backend also builds them.
  const backend = service("backend", {
    source: github("yagizerdem/DeuHackaton", { branch: "main" }),
    build: "npm run build -w @DeparkHackaton/backend",
    start: "npm run start -w @DeparkHackaton/backend",
    healthcheck: "/health",
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
