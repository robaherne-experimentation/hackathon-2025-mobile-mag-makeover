# Terraform + npm Deployment - Complete Reference

## Overview

This project uses **Terraform** to manage AWS infrastructure and **npm scripts** for deployment. No manual certificate creation is needed - everything is automated.

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│  Your Domain: mmm.hackathon-2025.product.which.co.uk   │
└────────────────┬────────────────────────────────────────┘
                 │
       ┌─────────▼─────────┐
       │   CloudFront      │  (CDN with HTTPS)
       │  Distribution     │
       └─────────┬─────────┘
                 │
       ┌─────────▼─────────┐
       │  Origin Access    │  (Secure Access)
       │   Control (OAC)   │
       └─────────┬─────────┘
                 │
       ┌─────────▼─────────┐
       │   S3 Bucket       │  (Private - read-only to CF)
       │   (Static Files)  │
       └───────────────────┘

Additional Resources:
- ACM Certificate (mmm.hackathon-2025.product.which.co.uk) - Auto-created & validated
- Route 53 DNS validation records - Auto-created & verified
```

## File Structure

```
hackathon-2025-mobile-mag-makeover/
├── terraform/                          # Terraform infrastructure code
│   ├── main.tf                        # S3, CloudFront, Certificate, DNS
│   ├── variables.tf                   # Variable definitions
│   ├── outputs.tf                     # Output values
│   ├── locals.tf                      # Local values
│   ├── terraform.tfvars.example       # Example config (copy to create .tfvars)
│   ├── .gitignore                     # Ignore sensitive files
│   └── README.md                      # Full Terraform documentation
│
├── deploy.sh                          # Deployment helper script
├── package.json                       # npm scripts for deployment
├── TERRAFORM_SETUP.md                 # Setup overview (you are here)
├── TERRAFORM_QUICKSTART.md            # Quick start guide
├── src/                               # React source code
├── public/                            # Static assets
├── dist/                              # Built files (created by npm build)
└── ... (other project files)
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** - `aws --version`
3. **Terraform** >= 1.0 - `terraform --version`
4. **Node.js** & **npm** - `node --version` && `npm --version`
5. **AWS Profile** `hackathon` configured in `~/.aws/config`
6. **Route 53 Hosted Zone** for `product.which.co.uk` (pre-existing)

## Setup (5 minutes)

### 1. Verify Prerequisites

```bash
# Check AWS CLI
aws --version
AWS_PROFILE=hackathon aws sts get-caller-identity

# Check Terraform
terraform --version

# Check Node & npm
node --version && npm --version
```

### 2. Create Terraform Configuration

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# No need to edit - defaults will work!
```

### 3. Initialize Terraform

```bash
npm run terraform:init
# This downloads AWS provider and initializes .terraform/
```

## Deployment

### Quick Deploy (One Command)

```bash
npm run deploy:full
```

This does everything:
1. Builds React app
2. Creates AWS infrastructure
3. Uploads files to S3
4. Invalidates CloudFront cache

**Time:** ~3-5 minutes for infrastructure, ~1 minute for uploads

### Step-by-Step Deploy

```bash
# Step 1: Build the app
npm run build

# Step 2: Review what will be created
npm run terraform:plan

# Step 3: Create infrastructure
npm run terraform:apply

# Step 4: Upload files
npm run deploy:sync
```

## npm Scripts Reference

### Building
```bash
npm run build      # Build React app for production
npm run dev        # Start dev server locally
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

### Terraform Management
```bash
npm run terraform:init       # Initialize Terraform (first time only)
npm run terraform:validate   # Validate configuration syntax
npm run terraform:fmt        # Format Terraform files
npm run terraform:plan       # Show what will be created/changed
npm run terraform:apply      # Apply infrastructure changes
npm run terraform:show       # Show current infrastructure state
npm run terraform:destroy    # Delete all AWS resources
```

### Deployment
```bash
npm run deploy:infrastructure # Plan + Apply (create/update infrastructure)
npm run deploy:sync          # Sync files to S3 + invalidate CloudFront
npm run deploy:full          # Build + Infrastructure + Sync (complete)
npm run deploy:status        # Show deployment status
npm run deploy:invalidate    # Invalidate CloudFront cache (clear old files)
```

## Workflow: First Deployment

```bash
# 1. Configure
cd terraform
cp terraform.tfvars.example terraform.tfvars

# 2. Initialize
npm run terraform:init

# 3. Deploy everything
npm run deploy:full

# 4. Get CloudFront domain
npm run deploy:status

# 5. Configure DNS CNAME record in your registrar
# Name: mmm.hackathon-2025.product.which.co.uk
# Value: [CloudFront domain from step 4]

# 6. Wait for DNS propagation (5-30 minutes)

# 7. Test
curl -I https://mmm.hackathon-2025.product.which.co.uk/
```

## Workflow: Code Updates

After making changes to the React code:

```bash
npm run build        # Rebuild app
npm run deploy:sync  # Upload new files to S3
```

Files are automatically invalidated in CloudFront, so new content is served immediately.

## What Gets Created in AWS

### S3 Bucket
- Name: `hackathon-2025-mmm-website` (can be customized)
- Private (all public access blocked)
- Versioning enabled
- Server-side encryption enabled

### CloudFront Distribution
- Domain alias: `mmm.hackathon-2025.product.which.co.uk`
- HTTPS only (TLS 1.2+)
- Compression enabled (gzip/brotli)
- HTTP/2 and HTTP/3 support
- Caching strategy:
  - HTML files: No cache (always fresh)
  - JS/CSS: 1 year (content-hashed filenames)
  - Assets: 1 year cache

### ACM Certificate
- Domain: `mmm.hackathon-2025.product.which.co.uk`
- Validation: DNS (automatic via Route 53)
- Auto-renewal: Enabled

### Route 53 DNS Records
- Certificate validation records: Auto-created
- CNAME record: You create manually (points to CloudFront)

## Configuration (terraform.tfvars)

```hcl
# AWS Configuration
aws_profile = "hackathon"
aws_region  = "eu-west-1"

# Environment
environment = "dev"

# S3 Configuration
s3_bucket_name = "hackathon-2025-mmm-website"

# CloudFront Configuration
cloudfront_domain_name = "mmm.hackathon-2025.product.which.co.uk"

# Certificate Configuration
certificate_validation_method = "DNS"
```

All values have sensible defaults - only change if needed.

## Monitoring & Status

```bash
# Show everything
npm run deploy:status

# Or get specific outputs
AWS_PROFILE=hackathon terraform output cloudfront_distribution_id
AWS_PROFILE=hackathon terraform output s3_bucket_name
AWS_PROFILE=hackathon terraform output certificate_arn

# Check S3 contents
AWS_PROFILE=hackathon aws s3 ls s3://hackathon-2025-mmm-website/ --recursive

# View CloudFront distribution
AWS_PROFILE=hackathon aws cloudfront get-distribution --id <distribution-id>
```

## Cleanup & Destruction

Remove all AWS resources:

```bash
npm run terraform:destroy

# Confirm when prompted with 'yes'
```

This will:
- Delete S3 bucket (and all files)
- Delete CloudFront distribution
- Delete ACM certificate
- Delete Route 53 DNS records

**Warning**: This is irreversible without backups.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Access Denied" | Check AWS credentials: `AWS_PROFILE=hackathon aws sts get-caller-identity` |
| "S3 bucket already exists" | Change `s3_bucket_name` in `terraform.tfvars` |
| "Terraform lock file" | Delete `.terraform.lock.hcl` and re-init: `npm run terraform:init` |
| "Still seeing old content" | Invalidate cache: `npm run deploy:invalidate` |
| "Certificate validation stuck" | Check Route 53 zone exists for `product.which.co.uk` |
| "DNS not resolving" | Wait 5-30 minutes for propagation, then test: `nslookup mmm.hackathon-2025.product.which.co.uk` |

## Environment Variables

You can override the AWS profile:

```bash
AWS_PROFILE=my-profile npm run deploy:full
```

## Security Best Practices

✅ **Implemented**
- S3 bucket is private (blocked public access)
- Only CloudFront can access S3 (via OAC)
- HTTPS/TLS enforced
- All traffic redirects to HTTPS
- S3 versioning for recovery
- Server-side encryption enabled

✅ **Additional Recommendations**
- Store Terraform state remotely (S3 + DynamoDB)
- Use separate AWS accounts for prod/staging
- Enable CloudTrail for audit logging
- Set up CloudWatch alarms
- Rotate AWS credentials regularly

## Cost Estimation

| Service | Cost |
|---------|------|
| S3 Storage | ~$0.023/GB/month |
| CloudFront | ~$0.085/GB (varies by region) |
| ACM Certificate | Free |
| Route 53 | ~$0.50/month (zone) |
| **Total (small site)** | **$10-50/month** |

## Learning Resources

- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest
- AWS S3: https://docs.aws.amazon.com/s3/
- CloudFront: https://docs.aws.amazon.com/cloudfront/
- ACM: https://docs.aws.amazon.com/acm/

## Support & Documentation

- Full Terraform docs: `terraform/README.md`
- Quick start: `TERRAFORM_QUICKSTART.md`
- Deployment script: `deploy.sh` (read for details)

## Summary

✅ **Infrastructure as Code** - Version controlled, repeatable  
✅ **Automated Certificate** - No manual setup needed  
✅ **One-Command Deployment** - `npm run deploy:full`  
✅ **Easy Updates** - `npm run build && npm run deploy:sync`  
✅ **Secure** - Private S3, HTTPS only, OAC access control  
✅ **Scalable** - Built on AWS managed services  

**Next Steps:**
1. Run `npm run terraform:init`
2. Run `npm run deploy:full`
3. Configure DNS CNAME record
4. Test your site
