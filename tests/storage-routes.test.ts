// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/applications/route";
import { PATCH, DELETE } from "@/app/api/applications/[id]/route";

const { authMock, collection } = vi.hoisted(() => ({
  authMock: vi.fn(),
  collection: {
    find: vi.fn(),
    insertOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/mongodb", () => ({
  getDatabase: () => ({ collection: () => collection }),
}));
const draft = {
  company: "Acme",
  title: "Engineer",
  location: "Toronto",
  workplaceType: "hybrid",
  skills: [],
  summary: "",
  status: "applied",
  jobDescription: "Original posting",
};
const context = { params: Promise.resolve({ id: "record-id" }) };
const request = (body: unknown) =>
  new Request("https://example.test/api/applications", {
    method: "POST",
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.resetAllMocks();
  authMock.mockResolvedValue({ userId: "owner" });
});

it("requires authentication for every storage operation", async () => {
  authMock.mockResolvedValue({ userId: null });
  for (const response of [
    await GET(),
    await POST(request(draft)),
    await PATCH(request(draft), context),
    await DELETE(request({}), context),
  ])
    expect(response.status).toBe(401);
  expect(collection.find).not.toHaveBeenCalled();
  expect(collection.insertOne).not.toHaveBeenCalled();
  expect(collection.findOneAndUpdate).not.toHaveBeenCalled();
  expect(collection.deleteOne).not.toHaveBeenCalled();
});
it("scopes listing to the session owner and excludes database metadata", async () => {
  collection.find.mockReturnValue({
    sort: () => ({
      toArray: async () => [
        {
          ...draft,
          id: "one",
          appliedAt: new Date().toISOString(),
          userId: "owner",
          _id: "private",
        },
      ],
    }),
  });
  const response = await GET();
  expect(collection.find).toHaveBeenCalledWith({ userId: "owner" });
  const data = await response.json();
  expect(data.applications[0]).not.toHaveProperty("userId");
  expect(data.applications[0]).not.toHaveProperty("_id");
});
it("ignores forged ownership, identity, and timestamps when creating", async () => {
  const response = await POST(
    request({ ...draft, userId: "victim", id: "forged", appliedAt: "forged" }),
  );
  expect(response.status).toBe(201);
  const record = collection.insertOne.mock.calls[0][0];
  expect(record.userId).toBe("owner");
  expect(record.id).not.toBe("forged");
  expect(record.appliedAt).not.toBe("forged");
});
it("does not update another user's record or overwrite immutable fields", async () => {
  collection.findOneAndUpdate.mockResolvedValue(null);
  expect(
    (
      await PATCH(
        request({
          ...draft,
          userId: "victim",
          id: "forged",
          appliedAt: "forged",
        }),
        context,
      )
    ).status,
  ).toBe(404);
  const [filter, update] = collection.findOneAndUpdate.mock.calls[0];
  expect(filter).toEqual({ id: "record-id", userId: "owner" });
  for (const key of ["userId", "id", "appliedAt", "jobDescription"])
    expect(update.$set).not.toHaveProperty(key);
});
it("does not delete another user's record", async () => {
  collection.deleteOne.mockResolvedValue({ deletedCount: 0 });
  expect((await DELETE(request({}), context)).status).toBe(404);
  expect(collection.deleteOne).toHaveBeenCalledWith({
    id: "record-id",
    userId: "owner",
  });
});
it("rejects invalid data before writing", async () => {
  expect((await POST(request({ ...draft, company: "" }))).status).toBe(400);
  expect(collection.insertOne).not.toHaveBeenCalled();
});
it("keeps connection details out of error responses", async () => {
  collection.insertOne.mockRejectedValue(new Error("secret URI"));
  const response = await POST(request(draft));
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("secret");
});
