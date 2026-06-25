import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();
const MockS3Client = vi.fn(() => ({ send: mockSend }));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: MockS3Client,
  PutObjectCommand: vi.fn((params: unknown) => ({ type: "PutObject", ...(params as object) })),
  DeleteObjectCommand: vi.fn((params: unknown) => ({
    type: "DeleteObject",
    ...(params as object),
  })),
  HeadBucketCommand: vi.fn((params: unknown) => ({ type: "HeadBucket", ...(params as object) })),
}));

vi.mock("../utils/logger", () => ({
  logger: {
    r2: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    app: { warn: vi.fn() },
  },
}));

vi.mock("../utils/retry", () => ({
  retryOnce: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

const mockGetDecryptedCategory = vi.fn();
vi.mock("../storage/index", () => ({
  storage: {
    settings: {
      getDecryptedCategory: mockGetDecryptedCategory,
    },
  },
}));

describe("object storage service", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    MockS3Client.mockClear();
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    delete process.env.OBJECT_STORAGE_BUCKET;
    delete process.env.OBJECT_STORAGE_REGION;
    delete process.env.OBJECT_STORAGE_PUBLIC_URL;
    delete process.env.ENDPOINT;
    delete process.env.ACCESS_KEY_ID;
    delete process.env.SECRET_ACCESS_KEY;
    delete process.env.BUCKET;
    delete process.env.REGION;
    const mod = await import("../services/r2.service");
    mod.resetClient();
  });

  it("skips DB config fetch when client is already cached", async () => {
    mockGetDecryptedCategory.mockResolvedValue({
      r2_account_id: "acct",
      r2_access_key_id: "key",
      r2_secret_access_key: "secret",
      r2_bucket_name: "bucket",
      r2_public_url: "https://cdn.example.com",
    });
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    await mod.uploadFile("test.png", Buffer.from("data"), "image/png");
    expect(mockGetDecryptedCategory).toHaveBeenCalledTimes(1);

    await mod.uploadFile("test2.png", Buffer.from("data2"), "image/png");
    expect(mockGetDecryptedCategory).toHaveBeenCalledTimes(1);
  });

  it("re-fetches config after resetClient is called", async () => {
    mockGetDecryptedCategory.mockResolvedValue({
      r2_account_id: "acct",
      r2_access_key_id: "key",
      r2_secret_access_key: "secret",
      r2_bucket_name: "bucket",
      r2_public_url: "",
    });
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    await mod.uploadFile("a.png", Buffer.from("a"), "image/png");
    mod.resetClient();
    await mod.uploadFile("b.png", Buffer.from("b"), "image/png");

    expect(mockGetDecryptedCategory).toHaveBeenCalledTimes(2);
  });

  it("uses an app-served URL when no public URL is configured", async () => {
    mockGetDecryptedCategory.mockResolvedValue({
      r2_account_id: "acct",
      r2_access_key_id: "key",
      r2_secret_access_key: "secret",
      r2_bucket_name: "bucket",
      r2_public_url: "",
    });
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    const url = await mod.uploadFile("images/photo.jpg", Buffer.from("data"), "image/jpeg");
    expect(url).toBe("/object-storage/images/photo.jpg");
  });

  it("uses an app-served URL when the configured public URL is the private R2 API host", async () => {
    mockGetDecryptedCategory.mockResolvedValue({
      r2_account_id: "acct",
      r2_access_key_id: "key",
      r2_secret_access_key: "secret",
      r2_bucket_name: "bucket",
      r2_public_url: "https://acct.r2.cloudflarestorage.com/bucket",
    });
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    const url = await mod.uploadFile("images/photo.jpg", Buffer.from("data"), "image/jpeg");
    expect(url).toBe("/object-storage/images/photo.jpg");
  });

  it("uses Railway bucket environment variables before settings", async () => {
    process.env.ENDPOINT = "https://storage.railway.app";
    process.env.ACCESS_KEY_ID = "railway-key";
    process.env.SECRET_ACCESS_KEY = "railway-secret";
    process.env.BUCKET = "railway-bucket";
    process.env.REGION = "auto";
    mockGetDecryptedCategory.mockResolvedValue({});
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    const url = await mod.uploadFile("images/photo.jpg", Buffer.from("data"), "image/jpeg");

    expect(url).toBe("/object-storage/images/photo.jpg");
    expect(mockGetDecryptedCategory).not.toHaveBeenCalled();
    expect(MockS3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "https://storage.railway.app",
        region: "auto",
        credentials: {
          accessKeyId: "railway-key",
          secretAccessKey: "railway-secret",
        },
      }),
    );
  });

  it("returns null when object storage is not configured", async () => {
    mockGetDecryptedCategory.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    const result = await mod.uploadFile("test.png", Buffer.from("data"), "image/png");
    expect(result).toBeNull();
  });

  it("returns correct public URL on upload", async () => {
    mockGetDecryptedCategory.mockResolvedValue({
      r2_account_id: "acct",
      r2_access_key_id: "key",
      r2_secret_access_key: "secret",
      r2_bucket_name: "bucket",
      r2_public_url: "https://cdn.example.com/",
    });
    mockSend.mockResolvedValue({});

    const mod = await import("../services/r2.service");
    const url = await mod.uploadFile("images/photo.jpg", Buffer.from("data"), "image/jpeg");
    expect(url).toBe("https://cdn.example.com/images/photo.jpg");
  });
});
