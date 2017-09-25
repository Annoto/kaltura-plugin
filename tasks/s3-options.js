module.exports = {
  region: 'eu-central-1',
  accessKeyId: process.env.AWS_S3_ACCESS_ID,
  secretAccessKey: process.env.AWS_S3_SECRET,
  signatureVersion: 'v4',
  sslEnabled: true
};
