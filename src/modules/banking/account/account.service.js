import { HttpBadRequest, HttpNotFound } from "@httpx/exception";
import { z } from "zod";
import {
  createAccountInRepository,
  getAccountsInRepository,
  deleteAccountInRepository,
} from "./account.repository";

const CreateAccountSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number().nonnegative(),
});

const GetAccountsSchema = z.number().int().positive();

const DeleteAccountSchema = z.object({
  userId: z.number().int().positive(),
  accountId: z.number().int().positive(),
});

export async function createAccount(data) {
  const result = CreateAccountSchema.safeParse(data);
  if (!result.success) throw new HttpBadRequest(result.error);
  return createAccountInRepository(result.data);
}

export async function getAccounts(userId) {
  const result = GetAccountsSchema.safeParse(userId);
  if (!result.success) throw new HttpBadRequest(result.error);
  return getAccountsInRepository(result.data);
}

export async function deleteAccount(data) {
  const result = DeleteAccountSchema.safeParse(data);
  if (!result.success) throw new HttpBadRequest(result.error);

  const deleted = await deleteAccountInRepository(result.data);
  if (deleted === 0) {
    throw new HttpNotFound("Account not found.");
  }
  return true;
}
