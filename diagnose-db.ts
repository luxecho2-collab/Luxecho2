
import { db } from './src/lib/db';

async function diagnose() {
    try {
        console.log("Checking sessions table...");
        const sessionCols = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sessions'
    `;
        console.log("Sessions columns:", JSON.stringify(sessionCols, null, 2));

        console.log("\nChecking users table...");
        const userCols = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
        console.log("Users columns:", JSON.stringify(userCols, null, 2));

    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        process.exit();
    }
}

diagnose();
