-- Persist callback requests from sky-defence.ru so the bot can list them.
CREATE TABLE "lead_callbacks" (
    "id"         SERIAL PRIMARY KEY,
    "name"       TEXT NOT NULL,
    "phone"      TEXT NOT NULL,
    "message"    TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
