provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

# ──────────────────────────────────────────
# SSH Key Pair
# ──────────────────────────────────────────
resource "aws_key_pair" "honeypot_key" {
  key_name   = "honeypot-key"
  public_key = trimspace(file("/var/lib/jenkins/.ssh/id_rsa.pub"))
}

# ──────────────────────────────────────────
# Security Group
# ──────────────────────────────────────────
resource "aws_security_group" "honeypot_sg" {
  name        = "honeypot-sg"
  description = "Allow SSH and App port"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Honeypot App"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ──────────────────────────────────────────
# EC2 Instance
# ──────────────────────────────────────────
resource "aws_instance" "honeypot_ec2" {
  ami                    = "ami-0ec10929233384c7f"
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.honeypot_key.key_name
  vpc_security_group_ids = [aws_security_group.honeypot_sg.id]

  tags = {
    Name = "Honeypot-Server"
  }
}

# ──────────────────────────────────────────
# Outputs
# ──────────────────────────────────────────
output "ec2_public_ip" {
  value = aws_instance.honeypot_ec2.public_ip
}

output "app_url" {
  value = "http://${aws_instance.honeypot_ec2.public_ip}:5000"
}
