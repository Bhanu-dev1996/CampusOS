from enum import StrEnum


class AppRole(StrEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    PRINCIPAL = "PRINCIPAL"
    FACULTY = "FACULTY"
    STUDENT = "STUDENT"
    PARENT = "PARENT"
    FINANCE_ADMIN = "FINANCE_ADMIN"