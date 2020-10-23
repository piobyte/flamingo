export interface S3Bucket {
  name: string;
  path: string;
}

export interface S3Input {
  bucket: S3Bucket;
  key: string;
}
