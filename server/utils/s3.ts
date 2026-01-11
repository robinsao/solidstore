import { S3Client } from "@aws-sdk/client-s3";

export default new S3Client({
  endpoint: process.env.AWS_S3_ENDPOINT,
  region: process.env.BUCKET_REGION,
});