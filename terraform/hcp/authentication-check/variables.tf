variable "resource_group_name" {
  description = "Azure resource group containing the existing pilot virtual machine."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9._()-]{1,90}$", var.resource_group_name))
    error_message = "resource_group_name is not a valid Azure resource group name."
  }
}

variable "vm_name" {
  description = "Name of the existing pilot virtual machine to read."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9._()-]{1,64}$", var.vm_name))
    error_message = "vm_name is not a valid Azure VM name."
  }
}
