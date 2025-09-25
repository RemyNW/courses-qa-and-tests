import { sql } from "../../../infrastructure/db";

export async function createAccountInRepository({ userId, amount }) {
  const rows = await sql`
    INSERT INTO accounts (userId, amount)
    VALUES (${userId}, ${amount})
    RETURNING *
  `;
  return rows[0];
}

export async function getAccountsInRepository(userId) {
  const rows = await sql`
    SELECT * FROM accounts
    WHERE userId = ${userId}
    ORDER BY id
  `;
  return rows;
}

export async function deleteAccountInRepository({ userId, accountId }) {
  const rows = await sql`
    DELETE FROM accounts
    WHERE id = ${accountId} AND userId = ${userId}
    RETURNING id
  `;
  return rows.length;
}
