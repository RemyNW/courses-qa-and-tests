import { describe, it, expect, vi, afterEach, assert } from "vitest";
import { HttpForbidden } from "@httpx/exception";

vi.mock("./user.repository", async (importOriginal) => ({
  ...(await importOriginal()),
  createUserInRepository: vi.fn((data) => {
    return {
      id: 4,
      name: data.name,
      birthday: data.birthday,
    };
  }),
}));

import { createUser, MIN_USER_AGE } from "./user.service";
import { createUserInRepository } from "./user.repository";

function birthdateForAge(age) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d;
}

describe("User Service", () => {
  afterEach(() => vi.clearAllMocks());

  it("should create an user", async () => {
    const input = {
      name: "Valentin R",
      birthday: new Date(1997, 8, 13), 
    };

    const user = await createUser(input);

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.id).toBeTypeOf("number");
    expect(user).toHaveProperty("name", "Valentin R");
    expect(user.birthday).toBeDefined();
    expect(user.birthday.getFullYear()).toBe(1997);
    expect(user.birthday.getMonth()).toBe(8);

    expect(createUserInRepository).toBeCalledTimes(1);
    expect(createUserInRepository).toBeCalledWith({
      name: "Valentin R",
      birthday: new Date(1997, 8, 13),
    });
  });

  it("should trigger a bad request error when user creation", async () => {
    try {
      await createUser({
        name: "Valentin R",
      });
      assert.fail("createUser should trigger an error.");
    } catch (e) {
      expect(e.name).toBe("HttpBadRequest");
      expect(e.statusCode).toBe(400);
    }
  });

  it("should forbid creation when user is too young", async () => {
    const birthday = birthdateForAge(MIN_USER_AGE - 1); 
    const promise = createUser({ name: "Kid", birthday });

    await expect(promise).rejects.toBeInstanceOf(HttpForbidden);
    await expect(promise).rejects.toMatchObject({
      name: "HttpForbidden",
      statusCode: 403,
      message: "User is too young.",
    });

    expect(createUserInRepository).not.toHaveBeenCalled();
  });
});
