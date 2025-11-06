locals {
  project_name = "hackathon-2025-mmm"
  
  tags = {
    Project     = "mobile-mag-makeover"
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedAt   = timestamp()
  }
}
