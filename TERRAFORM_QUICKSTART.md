# Quick Start Guide - Terraform Deployment

## 1. Prerequisites

Before starting, ensure you have:
- AWS CLI installed: `aws --version`
- Terraform installed: `terraform --version`
- AWS profile `hackathon` configured

Verify AWS credentials:
```bash
AWS_PROFILE=hackathon aws sts get-caller-identity
```

## 2. Setup

### Copy Variables Template
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

The defaults should work! The certificate will be created automatically.

### Initialize Terraform
```bash
npm run terraform:init
# or
cd terraform && AWS_PROFILE=hackathon terraform init
```

## 3. Deploy

### Full Deployment (Recommended)
```bash
npm run deploy:full
```

This will:
1. Build the React app
2. Create AWS infrastructure (S3, CloudFront, Certificate)
3. Upload files to S3
4. Invalidate CloudFront cache

### Step-by-Step Deployment
```bash
# Review what will be created
npm run terraform:plan

# Apply infrastructure
npm run terraform:apply

# Sync files to S3
npm run deploy:sync
```

## 4. Configure DNS (After Infrastructure is Created)

Get your CloudFront domain:
```bash
npm run deploy:status
```

Or manually:
```bash
AWS_PROFILE=hackathon terraform output cloudfront_domain_name
```

Create a CNAME record in your DNS provider:
- **Name**: `mmm.hackathon-2025.product.which.co.uk`
- **Value**: CloudFront domain name (from above)

**Note**: DNS propagation takes 5-30 minutes.

## 5. Verify It Works

After DNS propagates:
```bash
curl -I https://mmm.hackathon-2025.product.which.co.uk/
```

Should return 200 OK.

## npm Scripts Available

```bash
# Terraform management
npm run terraform:init       # Initialize Terraform
npm run terraform:validate   # Validate configuration
npm run terraform:fmt        # Format files
npm run terraform:plan       # Show plan
npm run terraform:apply      # Apply infrastructure
npm run terraform:show       # Show current state
npm run terraform:destroy    # Tear down infrastructure

# Deployment
npm run build                # Build React app
npm run deploy:infrastructure # Plan + Apply
npm run deploy:sync          # Sync to S3 + invalidate CloudFront
npm run deploy:full          # Build + Infrastructure + Sync (complete deployment)
npm run deploy:status        # Show deployment status
npm run deploy:invalidate    # Invalidate CloudFront cache
```

## What Gets Created

✅ **ACM Certificate** - Automatically created and validated via DNS  
✅ **S3 Bucket** - Private bucket with versioning & encryption  
✅ **CloudFront Distribution** - CDN with custom domain  
✅ **Origin Access Control** - Secure S3 access  
✅ **DNS Records** - For certificate validation  

## After Deployment - Update Code

```bash
npm run build        # Rebuild app
npm run deploy:sync  # Upload and invalidate cache
```

## Troubleshooting

**"Access Denied"**
```bash
AWS_PROFILE=hackathon aws sts get-caller-identity
# Verify you have the right AWS profile configured
```

**"S3 bucket already exists"**
- Edit `terraform/terraform.tfvars`
- Change `s3_bucket_name` to something unique

**"Terraform lock error"**
```bash
cd terraform
rm -f .terraform.lock.hcl
npm run terraform:init
```

**"Still seeing old content"**
```bash
npm run deploy:invalidate
```

## Cleanup

To remove all AWS resources:
```bash
npm run terraform:destroy
```

## More Info

- Full documentation: `terraform/README.md`
- Deployment script: `deploy.sh`
- Terraform config: `terraform/main.tf`
