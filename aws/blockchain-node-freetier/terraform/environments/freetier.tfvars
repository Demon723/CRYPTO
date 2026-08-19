aws_region            = "us-east-1"
environment           = "freetier"
instance_type         = "t2.micro"        # Free Tier: 750 hours/month
root_volume_size      = 15                # Free Tier: 30GB/month
data_volume_size      = 15                # Free Tier: 30GB/month
chain_id              = 1
rpc_ingress_cidr      = ["0.0.0.0/0"]

# Set via environment or terraform.tfvars.local:
# alert_email           = "your@email.com"
# key_pair_name         = "your-ec2-key"
# validator_address     = "0x..."
# validator_key         = "0x..."
# genesis_time          = 1704067200
