# Terraform Deployment Setup - Summary

## What Has Been Created

Your Terraform infrastructure-as-code is now ready to deploy this Vite React application to AWS with the following setup:

### 🏗️ Infrastructure Components

1. **ACM Certificate** (`terraform/main.tf`)
   - Automatically created for `mmm.hackathon-2025.product.which.co.uk`
   - DNS validation via Route 53
   - Auto-validated and renewed

2. **S3 Bucket** (`terraform/main.tf`)
   - Private bucket (all public access blocked)
   - Versioning enabled for easy rollbacks
   - Server-side encryption (AES256)
   - Bucket policy restricts access to CloudFront only

3. **CloudFront Distribution** (`terraform/main.tf`)
   - Uses Origin Access Control (OAC) for secure S3 access
   - Custom domain: `mmm.hackathon-2025.product.which.co.uk`
   - HTTPS/TLS 1.2+
   - Intelligent caching:
     - HTML files: No cache (always fresh)
     - JS/CSS: 1 year cache (hashed filenames)
     - Static assets: 1 year cache
   - SPA routing support (404 errors serve index.html)
   - Compression enabled
   - HTTP/2 and HTTP/3 support

### 📁 Files Created

```
terraform/
├── main.tf                    # S3, CloudFront, Certificate, DNS
├── variables.tf               # Input variables with defaults
├── outputs.tf                 # Output values for reference
├── locals.tf                  # Common tags and local values
├── terraform.tfvars.example   # Example configuration (copy & edit)
├── .gitignore                 # Terraform files to ignore
└── README.md                  # Detailed documentation

deploy.sh                       # Deployment script
TERRAFORM_QUICKSTART.md         # Quick start guide
package.json                    # npm scripts for deployment
```

## Getting Started

### Step 1: Configure Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

The defaults should work! Key variables:
- `aws_profile`: `hackathon` (uses AWS_PROFILE environment variable)
- `s3_bucket_name`: `hackathon-2025-mmm-website` (change if taken)
- `cloudfront_domain_name`: `mmm.hackathon-2025.product.which.co.uk`
- `certificate_validation_method`: `DNS` (automatic validation)

### Step 2: Initialize Terraform

```bash
npm run terraform:init
# or
cd terraform && AWS_PROFILE=hackathon terraform init
```

### Step 3: Deploy

**Option A: Full automated deployment**
```bash
npm run deploy:full
```

**Option B: Step-by-step**
```bash
# Review what will be created
npm run terraform:plan

# Deploy infrastructure
npm run terraform:apply

# Sync files to S3
npm run deploy:sync
```

## After Deployment

### Configure DNS

Your domain registrar needs a CNAME record pointing to CloudFront:

```bash
# Get CloudFront domain name
npm run deploy:status

# Create CNAME record:
# Name: mmm.hackathon-2025.product.which.co.uk
# Value: [CloudFront domain name from above]
```

### Verify It Works

```bash
# After DNS propagates (5-30 minutes):
curl -I https://mmm.hackathon-2025.product.which.co.uk/
```

## npm Scripts Available

### Terraform Management
```bash
npm run terraform:init       # Initialize Terraform
npm run terraform:validate   # Validate configuration
npm run terraform:fmt        # Format files
npm run terraform:plan       # Show Terraform plan
npm run terraform:apply      # Apply infrastructure
npm run terraform:show       # Show current state
npm run terraform:destroy    # Remove all AWS resources
```

### Deployment
```bash
npm run build                # Build React app
npm run deploy:infrastructure # Plan + Apply
npm run deploy:sync          # Sync to S3 and invalidate CloudFront
npm run deploy:full          # Build + Infrastructure + Sync (complete)
npm run deploy:status        # Show deployment status
npm run deploy:invalidate    # Invalidate CloudFront cache
```

## Key Features

✅ **Automatic Certificate Creation** - No manual certificate creation needed  
✅ **Private S3 bucket** - All public access blocked  
✅ **CloudFront CDN** - Global content delivery  
✅ **Custom HTTPS domain** - Certificate validated automatically  
✅ **Smart caching** - Optimal performance for static assets  
✅ **SPA support** - React routing works correctly  
✅ **Easy deployments** - Simple npm scripts  
✅ **Infrastructure as Code** - Version controlled, repeatable  

## Important Notes

### 🔐 Security
- S3 bucket is completely private
- Only CloudFront can access S3 via OAC
- All traffic is HTTPS only
- Versioning enabled for rollback capability
- DNS validation automated

### 💾 Terraform State
- State files stored locally in `.terraform/`
- Added to `.gitignore` - never commit
- For production, consider remote state (S3 + DynamoDB, Terraform Cloud)

### 🚀 Performance
- Files with content hashes cache for 1 year
- HTML caches with short TTL for fresh content
- CloudFront compression enabled
- Vite's build hashing ensures cache busting

### 💰 Cost Estimation
- **S3**: ~$0.023/GB stored
- **CloudFront**: ~$0.085/GB served
- **ACM**: Free
- **Route 53**: ~$0.50/month (existing zone)
- Typical small site: $10-50/month

## Troubleshooting

**"Access Denied"**
```bash
AWS_PROFILE=hackathon aws sts get-caller-identity
```

**"S3 bucket name taken"**
- Edit `terraform/terraform.tfvars`
- Change `s3_bucket_name` to something unique

**"DNS validation failing"**
- Ensure Route 53 zone `product.which.co.uk` exists
- Check DNS validation records: `npm run terraform:show`

**"Still seeing old content"**
```bash
npm run deploy:invalidate
```

## Next Steps

1. ✅ Verify AWS credentials: `AWS_PROFILE=hackathon aws sts get-caller-identity`
2. ✅ Create `terraform/terraform.tfvars` from example
3. ✅ Run `npm run terraform:init`
4. ✅ Run `npm run deploy:full` to create infrastructure and deploy
5. ✅ Get CloudFront domain: `npm run deploy:status`
6. ✅ Configure DNS CNAME record
7. ✅ Test the site

For more details, see:
- `TERRAFORM_QUICKSTART.md` - Quick start
- `terraform/README.md` - Full documentation
- `deploy.sh` - Deployment script

