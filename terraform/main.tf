terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}

# Additional provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias   = "us_east_1"
  profile = var.aws_profile
  region  = "us-east-1"
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# S3 bucket for hosting the static website
resource "aws_s3_bucket" "website" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "hackathon-2025-mmm"
    Environment = var.environment
    Project     = "mobile-mag-makeover"
  }
}

# Block all public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for the S3 bucket
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption for the S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOACAccess"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
      },
      {
        Sid    = "AllowGetBucketObjects"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.website.arn
      }
    ]
  })

  depends_on = [aws_cloudfront_origin_access_control.website]
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "website" {
  comment = "OAI for hackathon-2025-mmm"
}

# CloudFront Origin Access Control (preferred over OAI)
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "hackathon-2025-mmm-oac"
  description                       = "Origin Access Control for hackathon-2025-mmm S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ACM Certificate for the custom domain (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "website" {
  provider          = aws.us_east_1
  domain_name       = var.cloudfront_domain_name
  validation_method = var.certificate_validation_method

  tags = {
    Name        = "hackathon-2025-mmm-cert"
    Environment = var.environment
    Project     = "mobile-mag-makeover"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation records for ACM certificate
resource "aws_acm_certificate_validation" "website" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.website.arn

  timeouts {
    create = "5m"
  }

  depends_on = [aws_route53_record.certificate_validation]
}

# Route 53 DNS validation records
resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.website.zone_id
}

# Data source for Route 53 zone
data "aws_route53_zone" "website" {
  name = "hackathon-2025.product.which.co.uk"
}

# Update CloudFront distribution to use the certificate
resource "aws_cloudfront_distribution" "website" {
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  http_version        = "http2and3"

  # Custom domain alias
  aliases = [var.cloudfront_domain_name]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for JS and CSS files - longer TTL with versioning
  ordered_cache_behavior {
    path_pattern     = "*.js"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000 # 1 year
    max_ttl                = 31536000
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.css"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000 # 1 year
    max_ttl                = 31536000
    compress               = true
  }

  # Cache behavior for static assets
  ordered_cache_behavior {
    path_pattern     = "/public/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000 # 1 year
    max_ttl                = 31536000
    compress               = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.website.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  # Enable CloudFront logging - disabled due to ACL requirements
  # logging_config {
  #   include_cookies = false
  #   bucket          = aws_s3_bucket.cloudfront_logs.bucket_regional_domain_name
  #   prefix          = "cloudfront/"
  # }

  tags = {
    Name        = "hackathon-2025-mmm"
    Environment = var.environment
    Project     = "mobile-mag-makeover"
  }

  depends_on = [aws_s3_bucket_policy.website, aws_acm_certificate_validation.website]
}

# Route 53 CNAME record to point custom domain to CloudFront
resource "aws_route53_record" "cloudfront_alias" {
  zone_id = data.aws_route53_zone.website.zone_id
  name    = var.cloudfront_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_cloudfront_distribution.website.domain_name]
}
