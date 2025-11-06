# Terraform Deployment Guide

This directory contains Terraform configuration to deploy the Hackathon 2025 Mobile Mag Makeover project to AWS using S3 (private) and CloudFront.

## Architecture

- **S3 Bucket**: Private bucket to store static website files
- **CloudFront**: Distribution serving content via custom domain with HTTPS
- **Origin Access Control (OAC)**: Restricts S3 access to CloudFront only
- **ACM Certificate**: Automatically created and validated via DNS
- **Custom Domain**: mmm.hackathon-2025.product.which.co.uk

## Prerequisites

1. **Terraform** >= 1.0 installed
2. **AWS CLI** installed and configured
3. **AWS Account** with appropriate permissions and Route 53 zone access
4. **AWS Profile** named `hackathon` configured
5. **Route 53 Hosted Zone** for `product.which.co.uk` domain

## Setup

### 1. Configure AWS Profile

Add the `hackathon` profile to your `~/.aws/config`:

```ini
[profile hackathon]
region = eu-west-1
```

And ensure your AWS credentials are configured (via `~/.aws/credentials` or environment variables).

### 2. Create Terraform Variables File

Copy the example file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

The defaults should work for most cases. You can customize:
- `s3_bucket_name` - Change if bucket name is already taken
- `cloudfront_domain_name` - Change if using a different domain
- `certificate_validation_method` - DNS (default) or EMAIL

**Important**: Never commit `terraform.tfvars` to version control (it's in `.gitignore`)

### 3. Initialize Terraform

```bash
npm run terraform:init
```

Or manually:
```bash
cd terraform
AWS_PROFILE=hackathon terraform init
```

## Deployment

### Using npm scripts (Recommended)

#### Quick Deployment

Deploy everything (build + Terraform + sync to S3):

```bash
npm run deploy:full
```

#### Step-by-Step

```bash
# Review what will be created
npm run terraform:plan

# Apply infrastructure
npm run terraform:apply

# Sync files to S3 (after build is complete)
npm run deploy:sync
```

### Using deploy.sh script

```bash
# Full deployment
AWS_PROFILE=hackathon ./deploy.sh deploy

# Plan only
AWS_PROFILE=hackathon ./deploy.sh plan

# Sync files (if infrastructure already exists)
AWS_PROFILE=hackathon ./deploy.sh sync

# Check status
AWS_PROFILE=hackathon ./deploy.sh status
```

### Manual Terraform commands

```bash
cd terraform
export AWS_PROFILE=hackathon

# Initialize (first time only)
terraform init

# Validate configuration
terraform validate

# Format files
terraform fmt -recursive

# Review changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# Destroy infrastructure
terraform destroy
```

## What Happens During Deployment

1. **ACM Certificate Creation**: Terraform creates an SSL/TLS certificate for `mmm.hackathon-2025.product.which.co.uk`
2. **DNS Validation**: Route 53 DNS validation records are automatically created and verified
3. **S3 Bucket**: Private S3 bucket is created with versioning and encryption enabled
4. **CloudFront Distribution**: CDN distribution is created with the custom domain
5. **Origin Access Control**: OAC is configured so only CloudFront can access S3
6. **Files Synced**: Your built files are uploaded to S3 with intelligent caching

## After Deployment

### Configure DNS

Your domain registrar needs a CNAME record pointing to CloudFront:

```bash
# Get CloudFront domain name
npm run deploy:status
# or
AWS_PROFILE=hackathon terraform output cloudfront_domain_name
```

Create CNAME record:
- **Name**: `mmm.hackathon-2025.product.which.co.uk`
- **Value**: CloudFront domain name (from above)

**Note**: DNS propagation can take 5-30 minutes.

### Verify Deployment

```bash
# Check deployment status
npm run deploy:status

# Test the site (after DNS propagates)
curl -I https://mmm.hackathon-2025.product.which.co.uk/

# View S3 contents
AWS_PROFILE=hackathon aws s3 ls s3://hackathon-2025-mmm-website/ --recursive

# View CloudFront distribution
AWS_PROFILE=hackathon terraform output cloudfront_distribution_id
```

## Common Operations

### Deploy Code Updates

```bash
npm run build
npm run deploy:sync
```

### Invalidate CloudFront Cache

```bash
npm run deploy:invalidate
```

### View All Resources and Outputs

```bash
npm run terraform:show
# or
AWS_PROFILE=hackathon terraform output
```

### Tear Down Infrastructure

```bash
npm run terraform:destroy
```

## File Structure

```
terraform/
├── main.tf              # S3, CloudFront, Certificate, DNS validation
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── locals.tf            # Local values and common tags
├── terraform.tfvars.example  # Example configuration
├── .gitignore          # Git ignore patterns
└── README.md           # This file
```

## Important Notes

### Security

- ✅ S3 bucket is completely private
- ✅ Only CloudFront can access S3 via Origin Access Control
- ✅ All traffic forced to HTTPS
- ✅ S3 versioning enabled for rollback capability
- ✅ Server-side encryption enabled (AES256)

### Terraform State

- State files stored locally in `.terraform/` (added to `.gitignore`)
- For production, consider remote state (S3 + DynamoDB, Terraform Cloud, etc.)

### Performance

- Files with content hashes cache for 1 year (Vite's build hashing enables cache busting)
- HTML files cache with short TTL (always fresh)
- CloudFront compression enabled (gzip/brotli)
- HTTP/2 and HTTP/3 support

### Cost Estimation

- **S3**: ~$0.023/GB stored + data transfer costs
- **CloudFront**: ~$0.085/GB served (varies by region)
- **ACM**: Free
- **Route 53**: Small cost for hosted zone (~$0.50/month) + DNS queries

Typical small website: $10-50/month

## Troubleshooting

### AWS Credentials Error

```bash
# Verify credentials
AWS_PROFILE=hackathon aws sts get-caller-identity

# Check profile exists
cat ~/.aws/config | grep hackathon
```

### S3 Bucket Name Already Taken

Edit `terraform.tfvars`:
```hcl
s3_bucket_name = "hackathon-2025-mmm-website-unique-suffix"
```

### Certificate Validation Failing

- Ensure Route 53 zone `product.which.co.uk` exists and is accessible
- Check DNS validation records are created: `npm run terraform:show`
- Wait up to 5 minutes for DNS validation to complete

### CloudFront Returns 403

- CloudFront Origin Access Control takes a few minutes to sync
- Verify S3 bucket policy: `AWS_PROFILE=hackathon aws s3api get-bucket-policy --bucket <bucket-name>`
- Check S3 bucket isn't blocking public access (it should be)

### Still Seeing Old Content

```bash
# Invalidate CloudFront cache
npm run deploy:invalidate
```

### Terraform Lock Error

```bash
# Remove lock file if stuck
cd terraform
rm -f .terraform.lock.hcl
```

## Monitoring

### View Deployment Info

```bash
npm run deploy:status
```

### Check S3 Bucket Contents

```bash
AWS_PROFILE=hackathon aws s3 ls s3://hackathon-2025-mmm-website/ --recursive
```

### Monitor CloudFront Invalidations

```bash
DIST_ID=$(cd terraform && AWS_PROFILE=hackathon terraform output -raw cloudfront_distribution_id)
AWS_PROFILE=hackathon aws cloudfront list-invalidations --distribution-id $DIST_ID
```

### View CloudFront Logs

```bash
DIST_ID=$(cd terraform && AWS_PROFILE=hackathon terraform output -raw cloudfront_distribution_id)
AWS_PROFILE=hackathon aws cloudfront get-distribution-config --id $DIST_ID
```

## Next Steps

1. ✅ Configure AWS profile: `cat ~/.aws/config`
2. ✅ Verify credentials: `AWS_PROFILE=hackathon aws sts get-caller-identity`
3. ✅ Create variables: `cp terraform.tfvars.example terraform.tfvars`
4. ✅ Initialize: `npm run terraform:init`
5. ✅ Deploy: `npm run deploy:full`
6. ✅ Get CloudFront domain: `npm run deploy:status`
7. ✅ Configure DNS CNAME record
8. ✅ Test site (after DNS propagates)

## Support

For issues, check:
- AWS Console → Certificate Manager (check cert status)
- AWS Console → Route 53 (verify zone and DNS records)
- AWS Console → CloudFront (check distribution status)
- AWS Console → S3 (verify bucket and bucket policy)
- Terraform docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
