#!/bin/bash

# If you plan to run this locally, make sure that
# 1. LocalStack is running
# 2. You have AWS CLI installed or the aws-wrapper localstack CLI installed and configured with a profile named 'localstack'

# Note: as of localstack v4.10.0, persistence is only for pro users.

export FRONTEND_URL=${FRONTEND_URL:-https://localhost:5213}
export BACKEND_URL=${BACKEND_URL:-https://localhost:5313}
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export BUCKET_REGION=${BUCKET_REGION:-ap-southeast-2}

export AWS_PROFILE=${AWS_PROFILE:-localstack}
export BUCKET_NAME=${BUCKET_NAME:-solidstore}

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile $AWS_PROFILE
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile $AWS_PROFILE
aws configure set region $BUCKET_REGION --profile $AWS_PROFILE
aws configure set output json --profile $AWS_PROFILE

if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "Bucket $BUCKET_NAME already exists."
    exit 0;
fi

aws s3api create-bucket \
  --profile $AWS_PROFILE \
  --create-bucket-configuration LocationConstraint=$BUCKET_REGION \
  --region $BUCKET_REGION \
  --bucket $BUCKET_NAME \

aws s3api put-bucket-cors \
  --profile $AWS_PROFILE \
  --region $BUCKET_REGION \
  --bucket $BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "PUT",
                "POST",
                "DELETE",
                "GET"
            ],
            "AllowedOrigins": [
                "'${FRONTEND_URL}'", "'${BACKEND_URL}'"
            ],
            "ExposeHeaders": [],
            "MaxAgeSeconds": 3000
        }
    ]
}'