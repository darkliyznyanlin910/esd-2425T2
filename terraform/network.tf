resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

# Create public subnets for ALB
resource "aws_subnet" "main_1" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  # Keep this true since ALB needs to be in public subnet
  map_public_ip_on_launch = true
}

resource "aws_subnet" "main_2" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true
}

# Create private subnets for ECS tasks
resource "aws_subnet" "private_1" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"
}

resource "aws_subnet" "private_2" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"
}

# NAT Gateway for private subnets
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.main_1.id
}

# Internet Gateway (needed for ALB)
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

# Private Route Table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.main_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.main_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

