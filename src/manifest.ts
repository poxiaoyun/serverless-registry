import { z } from "zod";

// OCI descriptor: used for config, layers, subject, and manifest list entries
const descriptorSchema = z
  .object({
    mediaType: z.string(),
    digest: z.string(),
    size: z.number().int(),
  })
  .passthrough();

// https://github.com/opencontainers/image-spec/blob/main/manifest.md
// OCI Image Manifest / Docker Manifest v2
const ociManifestSchema = z
  .object({
    schemaVersion: z.literal(2),
    mediaType: z.string().optional(),
    artifactType: z.string().optional(),
    config: descriptorSchema,
    layers: z.array(descriptorSchema),
    annotations: z.record(z.string()).optional(),
    subject: descriptorSchema.optional(),
  })
  .passthrough();

// Docker Manifest Schema v1
const v1ManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    fsLayers: z.array(z.object({ blobSum: z.string() }).passthrough()),
    architecture: z.string().optional(),
    tag: z.string().optional(),
    name: z.string().optional(),
    history: z.array(z.unknown()).optional(),
    signatures: z.array(z.unknown()).optional(),
  })
  .passthrough();

// OCI Image Index / Docker Manifest List
const ociIndexSchema = z
  .object({
    schemaVersion: z.literal(2),
    mediaType: z.string().optional(),
    artifactType: z.string().optional(),
    manifests: z.array(
      z
        .object({
          mediaType: z.string(),
          digest: z.string(),
          size: z.number().int(),
          platform: z
            .object({
              architecture: z.string(),
              os: z.string(),
              "os.version": z.string().optional(),
              variant: z.string().optional(),
              features: z.array(z.string()).optional(),
            })
            .passthrough()
            .optional(),
          annotations: z.record(z.string()).optional(),
        })
        .passthrough(),
    ),
    annotations: z.record(z.string()).optional(),
    subject: descriptorSchema.optional(),
  })
  .passthrough();

export const manifestSchema = ociManifestSchema.or(v1ManifestSchema).or(ociIndexSchema);

export type ManifestSchema = z.infer<typeof manifestSchema>;
