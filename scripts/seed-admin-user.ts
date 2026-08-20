import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as appSchema from "../src/db/app.schema";
import { user, account, organization, member } from "../src/db/better-auth-schema";

const schema = { ...appSchema, user, account, organization, member };

async function main() {
  console.log("Connecting to local D1...");
  const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();
  const db = drizzle(env.DB, { schema });

  try {
    const email = "qa@tester.com";
    const userId = "qa-admin-user";
    const orgId = "org-qa-admin";

    const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
    if (existingUser) {
      console.log("User already exists in local D1, updating role to admin...");
      await db.update(user).set({ role: "admin", emailVerified: true }).where(eq(user.email, email));
    } else {
      console.log("Inserting qa@tester.com admin user into local D1...");
      await db.insert(user).values({
        id: userId,
        name: "QA Admin",
        email,
        emailVerified: true,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(organization).values({
        id: orgId,
        name: "QA Admin Org",
        slug: "qa-admin-org",
        createdAt: new Date(),
      });

      await db.insert(member).values({
        id: "member-qa-admin",
        organizationId: orgId,
        userId: userId,
        role: "owner",
        createdAt: new Date(),
      });

      await db.insert(appSchema.projects).values({
        id: "prj-qa-demo",
        organizationId: orgId,
        name: "QA SeoTool Project",
        domain: "seotool.im",
      });
      console.log("QA Admin user and sample project seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  } finally {
    await dispose();
  }
}

main();
