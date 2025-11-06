#!/bin/bash

# Deployment script for Hackathon 2025 Mobile Mag Makeover
# This script builds the project and deploys it to S3/CloudFront

set -e

export AWS_PROFILE=hackathon

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
TERRAFORM_DIR="$SCRIPT_DIR/terraform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
  fi
  
  if ! command -v terraform &> /dev/null; then
    log_error "Terraform is not installed"
    exit 1
  fi
  
  if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed"
    exit 1
  fi
  
  log_info "Prerequisites check passed"
}

# Build the project
build_project() {
  log_info "Building the project..."
  cd "$PROJECT_ROOT"
  npm install
  npm run build
  log_info "Build completed successfully"
}

# Deploy with Terraform
deploy_terraform() {
  local action=$1
  
  log_info "Running Terraform ${action}..."
  cd "$TERRAFORM_DIR"
  
  # Initialize Terraform if not already done
  if [ ! -d ".terraform" ]; then
    log_info "Initializing Terraform..."
    terraform init
  fi
  
  # Validate Terraform configuration
  log_info "Validating Terraform configuration..."
  terraform validate
  
  # Show plan
  log_info "Creating Terraform plan..."
  terraform plan -out=tfplan
  
  # Apply the plan
  if [ "$action" == "apply" ]; then
    read -p "Do you want to proceed with the deployment? (yes/no): " -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
      terraform apply tfplan
      log_info "Deployment completed successfully"
    else
      log_warn "Deployment cancelled"
      exit 1
    fi
  else
    log_info "Plan created. Review the plan and run 'terraform apply tfplan' to deploy"
  fi
}

# Sync files to S3
sync_to_s3() {
  log_info "Syncing files to S3..."
  
  cd "$TERRAFORM_DIR"
  S3_BUCKET=$(AWS_PROFILE=hackathon terraform output -raw s3_bucket_name)
  CLOUDFRONT_ID=$(AWS_PROFILE=hackathon terraform output -raw cloudfront_distribution_id)
  
  cd "$PROJECT_ROOT"
  
  log_info "Using S3 bucket: $S3_BUCKET"
  
  # Sync the dist folder to S3 (exclude all HTML to handle them separately)
  aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --delete \
    --cache-control "max-age=31536000,public" \
    --exclude "*.html" \
    --exclude "*.map"

  # Upload all HTML files (except index.html) with no-cache
  find dist -type f -name '*.html' ! -name 'index.html' | while read -r htmlfile; do
    relpath="${htmlfile#dist/}"
    aws s3 cp "$htmlfile" "s3://${S3_BUCKET}/$relpath" \
      --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
      --content-type "text/html; charset=utf-8"
  done

  # Always upload index.html with no-cache and correct content-type
  if [ -f dist/index.html ]; then
    aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
      --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
      --content-type "text/html; charset=utf-8"
  fi

  # Upload source maps with no-cache
  aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
    --include "*.map" \
    --exclude "*"

  # Invalidate CloudFront cache
  log_info "Invalidating CloudFront distribution: $CLOUDFRONT_ID"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_ID" \
    --paths "/*"

  log_info "Sync completed successfully"
}

# Show deployment status
show_status() {
  log_info "Deployment Status:"
  cd "$TERRAFORM_DIR"
  
  if [ ! -f "terraform.tfstate" ]; then
    log_warn "No terraform state found. Infrastructure may not be deployed."
    return
  fi
  
  echo ""
  echo "=== AWS Resources ==="
  S3_BUCKET=$(AWS_PROFILE=hackathon terraform output -raw s3_bucket_name 2>/dev/null || echo "")
  if [ -n "$S3_BUCKET" ]; then
    echo "S3 Bucket: $S3_BUCKET"
    FILE_COUNT=$(AWS_PROFILE=hackathon aws s3 ls "s3://${S3_BUCKET}/" --recursive --summarize --human-readable 2>/dev/null | grep "Total Objects:" || echo "")
    echo "$FILE_COUNT"
  fi
  
  CLOUDFRONT_ID=$(AWS_PROFILE=hackathon terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
  if [ -n "$CLOUDFRONT_ID" ]; then
    echo ""
    echo "CloudFront Distribution: $CLOUDFRONT_ID"
    DIST_DOMAIN=$(AWS_PROFILE=hackathon aws cloudfront get-distribution --id "$CLOUDFRONT_ID" --query 'Distribution.DomainName' --output text 2>/dev/null || echo "")
    echo "CloudFront Domain: $DIST_DOMAIN"
  fi
  
  DOMAIN=$(AWS_PROFILE=hackathon terraform output -raw cloudfront_custom_domain 2>/dev/null || echo "")
  if [ -n "$DOMAIN" ]; then
    echo "Custom Domain: $DOMAIN"
  fi
  
  echo ""
  echo "=== All Outputs ==="
  AWS_PROFILE=hackathon terraform output
}

# Main flow
main() {
  local command="${1:-deploy}"
  
  case "$command" in
    deploy)
      check_prerequisites
      build_project
      deploy_terraform "apply"
      sync_to_s3
      ;;
    plan)
      check_prerequisites
      deploy_terraform "plan"
      ;;
    sync)
      check_prerequisites
      sync_to_s3
      ;;
    status)
      show_status
      ;;
    destroy)
      log_warn "About to destroy infrastructure..."
      read -p "Are you sure? Type 'yes' to confirm: " -r
      echo
      if [[ $REPLY == "yes" ]]; then
        cd "$TERRAFORM_DIR"
        AWS_PROFILE=hackathon terraform destroy
      else
        log_warn "Destroy cancelled"
      fi
      ;;
    *)
      echo "Usage: $0 {deploy|plan|sync|status|destroy}"
      echo "  deploy  - Build and deploy to S3/CloudFront with Terraform"
      echo "  plan    - Show Terraform plan without applying"
      echo "  sync    - Sync already built files to S3 and invalidate CloudFront"
      echo "  status  - Show deployment status"
      echo "  destroy - Tear down the infrastructure"
      exit 1
      ;;
  esac
}

main "$@"
