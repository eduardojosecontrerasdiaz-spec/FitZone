"""Punto de entrada de producción: valida configuración e inicializa el esquema MySQL."""

from app import app, initialize_database, validate_environment

validate_environment()
initialize_database()
