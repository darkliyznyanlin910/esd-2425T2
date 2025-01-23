locals {
  environment_variables = { for tuple in regexall("(.*)=\"(.*)\"", file("../service-env/.env")) : tuple[0] => sensitive(tuple[1]) }
}
