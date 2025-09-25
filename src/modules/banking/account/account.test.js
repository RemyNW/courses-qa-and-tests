import { describe, it, expect, vi, afterEach } from "vitest";
import { HttpBadRequest, HttpNotFound } from "@httpx/exception";

vi.mock("./account.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createAccountInRepository: vi.fn(async ({ userId, amount }) => ({
    id: 10,
    userId,
    amount,
  })),
  getAccountsInRepository: vi.fn(async (userId) => ([
    { id: 1, userId, amount: 100 },
    { id: 2, userId, amount: 50.5 },
  ])),
  deleteAccountInRepository: vi.fn(async () => 1), 
}));

import { createAccount, getAccounts, deleteAccount } from "./account.service";
import * as repo from "./account.repository";

describe("Account Service", () => {
  afterEach(() => vi.clearAllMocks());

  it("createAccount réussi", async () => {
    const input = { userId: 1, amount: 250.75 };
    const acc = await createAccount(input);
    expect(acc).toEqual({ id: 10, userId: 1, amount: 250.75 });
    expect(repo.createAccountInRepository).toHaveBeenCalledTimes(1);
    expect(repo.createAccountInRepository).toHaveBeenCalledWith(input);
  });

  it("createAccount échoue avec de mauvais paramètres", async () => {
    await expect(createAccount({ userId: "oops", amount: "NaN" }))
      .rejects.toBeInstanceOf(HttpBadRequest);
    await expect(createAccount({ userId: 1 })) 
      .rejects.toBeInstanceOf(HttpBadRequest);
  });

  it("getAccounts réussi en vérifiant chaque élément", async () => {
    const userId = 42;
    const list = await getAccounts(userId);
    expect(repo.getAccountsInRepository).toHaveBeenCalledWith(userId);
    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(2);
    list.forEach((a) => {
      expect(a).toHaveProperty("id");
      expect(a.userId).toBe(userId);
      expect(typeof a.amount).toBe("number");
    });
  });

  it("deleteAccount réussi", async () => {
    const ok = await deleteAccount({ userId: 1, accountId: 2 });
    expect(ok).toBe(true);
    expect(repo.deleteAccountInRepository).toHaveBeenCalledWith({ userId: 1, accountId: 2 });
  });

  it("deleteAccount échoue avec un mauvais id d'Account", async () => {
    repo.deleteAccountInRepository.mockResolvedValueOnce(0); 
    await expect(deleteAccount({ userId: 1, accountId: 999 }))
      .rejects.toBeInstanceOf(HttpNotFound);
    expect(repo.deleteAccountInRepository).toHaveBeenCalledWith({ userId: 1, accountId: 999 });
  });

  it("getAccounts échoue avec mauvais paramètre", async () => {
  await expect(getAccounts("oops")).rejects.toBeInstanceOf(HttpBadRequest);
  });

  it("deleteAccount échoue avec payload invalide", async () => {
await expect(deleteAccount({ userId: 0, accountId: -1 }))
    .rejects.toBeInstanceOf(HttpBadRequest);
  });
});
