variable "aws_profile" {
  description = "AWS Profile to use"
  type        = string
  default     = "hackathon"
}

variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for the website"
  type        = string
  default     = "hackathon-2025-mmm-website"
}

variable "cloudfront_domain_name" {
  description = "Custom domain name for the CloudFront distribution"
  type        = string
  default     = "mmm.hackathon-2025.product.which.co.uk"
}

variable "certificate_validation_method" {
  description = "Method for validating the ACM certificate (DNS or EMAIL)"
  type        = string
  default     = "DNS"

  validation {
    condition     = contains(["DNS", "EMAIL"], var.certificate_validation_method)
    error_message = "Certificate validation method must be DNS or EMAIL."
  }
}
