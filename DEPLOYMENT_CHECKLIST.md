# Deployment Checklist

## ✅ Terraform Setup Complete

Your project now has full Infrastructure-as-Code for AWS S3 + CloudFront deployment.

## Pre-Deployment Checklist

- [ ] **AWS Credentials Configured**
  ```bash
  AWS_PROFILE=hackathon aws sts get-caller-identity
  ```
  Should show your AWS account details without errors

- [ ] **Terraform Installed**
  ```bash
  terraform --version
  ```
  Should show version >= 1.0

- [ ] **Node & npm Installed**
  ```bash
  node --version && npm --version
  ```

- [ ] **Route 53 Zone Exists**
  - Verify `product.which.co.uk` hosted zone exists in Route 53
  - Your AWS account must have access to manage it

## Deployment Steps

### Step 1: Initialize Terraform (One-time)
```bash
npm run terraform:init
```
⏱️ Time: ~30 seconds

### Step 2: Review Infrastructure Plan
```bash
npm run terraform:plan
```
📋 This shows what AWS resources will be created. Review output.

### Step 3: Deploy Everything
```bash
npm run deploy:full
```
⏱️ Time: ~3-5 minutes

**What this does:**
1. Builds React app (`npm run build`)
2. Creates AWS infrastructure (S3, CloudFront, Certificate)
3. Uploads files to S3
4. Invalidates CloudFront cache

### Step 4: Get CloudFront Domain
```bash
npm run deploy:status
```
📝 Note the CloudFront domain name (e.g., `d123456.cloudfront.net`)

### Step 5: Configure DNS (In Your Registrar)

Create a CNAME record:
- **Name**: `mmm.hackathon-2025.product.which.co.uk`
- **Value**: CloudFront domain from Step 4
- **TTL**: 300 (or default)

### Step 6: Wait for DNS Propagation
⏳ This takes 5-30 minutes (typically 5-10 minutes)

Test DNS resolution:
```bash
nslookup mmm.hackathon-2025.product.which.co.uk
```

### Step 7: Verify Live Site
```bash
curl -I https://mmm.hackathon-2025.product.which.co.uk/
```

Should return `HTTP/2 200 OK`

## After Deployment

### Update Code
After making changes to React code:

```bash
npm run build
npm run deploy:sync
```

### Check Status Anytime
```bash
npm run deploy:status
```

### View S3 Contents
```bash
AWS_PROFILE=hackathon aws s3 ls s3://hackathon-2025-mmm-website/ --recursive
```

### View CloudFront Distribution
```bash
npm run deploy:status
```

## Troubleshooting During Deployment

| Issue | Solution |
|-------|----------|
| `AWS provider version conflict` | Delete `.terraform/` and run `npm run terraform:init` again |
| `Bucket already exists` | Edit `terraform/terraform.tfvars` and change `s3_bucket_name` |
| `Access denied` | Check AWS profile: `AWS_PROFILE=hackathon aws sts get-caller-identity` |
| `Certificate validation timeout` | Ensure Route 53 zone `product.which.co.uk` is accessible |
| `Route 53 zone not found` | Add Route 53 permissions to IAM user or ensure zone exists |

## DNS Configuration Verification

```bash
# Check DNS is configured
dig mmm.hackathon-2025.product.which.co.uk

# Should show CNAME pointing to CloudFront domain

# Test HTTPS connection
curl -v https://mmm.hackathon-2025.product.which.co.uk/

# Should show certificate for mmm.hackathon-2025.product.which.co.uk
```

## Performance Verification

```bash
# Check page load
curl -w "Time: %{time_total}s\n" https://mmm.hackathon-2025.product.which.co.uk/

# Check cache headers
curl -I https://mmm.hackathon-2025.product.which.co.uk/index.html
# Should show cache-control: max-age=0 (no cache for HTML)

curl -I https://mmm.hackathon-2025.product.which.co.uk/assets/index-*.js
# Should show cache-control: max-age=31536000 (1 year for JS)
```

## Cleanup (If Needed)

To remove all AWS resources:

```bash
npm run terraform:destroy
```

⚠️ **Warning**: This will delete:
- S3 bucket and all files
- CloudFront distribution
- ACM certificate
- Route 53 DNS records

## Commands Reference

### Deployment
```bash
npm run deploy:full              # Complete deployment
npm run deploy:infrastructure    # Plan + Apply
npm run deploy:sync             # Sync code updates
npm run deploy:status           # Show status
npm run deploy:invalidate       # Clear cache
```

### Terraform
```bash
npm run terraform:init          # Initialize (one-time)
npm run terraform:plan          # Review changes
npm run terraform:apply         # Apply changes
npm run terraform:destroy       # Remove all
npm run terraform:validate      # Check config
npm run terraform:fmt           # Format code
npm run terraform:show          # Show current state
```

### Development
```bash
npm run build                   # Build for production
npm run dev                     # Dev server
npm run lint                    # Check code
npm run preview                 # Preview build
```

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `README_TERRAFORM.md` | Quick overview (start here!) |
| `TERRAFORM_QUICKSTART.md` | Quick start guide |
| `TERRAFORM_SETUP.md` | Setup overview |
| `DEPLOYMENT_REFERENCE.md` | Complete reference |
| `terraform/README.md` | Full Terraform documentation |

## Success Indicators

✅ **Infrastructure Created**
- No terraform errors in `npm run terraform:plan`
- All resources show in `npm run deploy:status`

✅ **Files Uploaded**
- `npm run deploy:sync` completes without errors
- S3 bucket contains your built files

✅ **DNS Working**
- `nslookup mmm.hackathon-2025.product.which.co.uk` returns CloudFront IP
- No DNS resolution errors

✅ **Site Live**
- `curl https://mmm.hackathon-2025.product.which.co.uk/` returns 200 OK
- Page loads in browser
- Certificate is valid

## Maintenance

### Weekly
- Monitor CloudFront performance: `npm run deploy:status`

### Monthly
- Update dependencies: `npm update`

### Quarterly
- Review costs in AWS Console
- Check certificate expiration (auto-renewed)

## Support Resources

- Terraform Docs: https://www.terraform.io/docs
- AWS S3: https://docs.aws.amazon.com/s3/
- AWS CloudFront: https://docs.aws.amazon.com/cloudfront/
- AWS ACM: https://docs.aws.amazon.com/acm/

---

**Ready?** Start with: `npm run terraform:init` ➜ `npm run deploy:full`

Good luck! 🚀
