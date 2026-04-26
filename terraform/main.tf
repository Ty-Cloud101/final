provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

resource "aws_key_pair" "foodexpress_key" {
  key_name   = "foodexpress-key"
  public_key = trimspace(file("/var/lib/jenkins/.ssh/id_rsa.pub"))
}

resource "aws_security_group" "foodexpress_sg" {
  name        = "foodexpress-sg"
  description = "Allow SSH and HTTP"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
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

resource "aws_instance" "foodexpress_ec2" {
  ami                    = "ami-0ec10929233384c7f"
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.foodexpress_key.key_name
  vpc_security_group_ids = [aws_security_group.foodexpress_sg.id]

  tags = {
    Name = "FoodExpress-Server"
  }
}

output "ec2_public_ip" {
  value = aws_instance.foodexpress_ec2.public_ip
}