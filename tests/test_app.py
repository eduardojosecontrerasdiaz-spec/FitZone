"""Pruebas de API FitZone sin conexión a una base MySQL real.

Ejecutar con: python -m unittest discover -s tests -v
"""

import os
import unittest
from unittest.mock import patch

os.environ.setdefault("MYSQLHOST", "127.0.0.1")
os.environ.setdefault("MYSQLPORT", "3306")
os.environ.setdefault("MYSQLUSER", "fitzone_test")
os.environ.setdefault("MYSQLPASSWORD", "fitzone_test_password")
os.environ.setdefault("MYSQLDATABASE", "fitzone_test")
os.environ.setdefault("ADMIN_USERNAME", "admin_test")
os.environ.setdefault("ADMIN_PASSWORD", "admin_test_password_123")
os.environ.setdefault("SESSION_SECRET", "test-session-secret-with-at-least-32-chars")

import app as fitzone


class FakeCursor:
    def __init__(self, rowcount=1):
        self.rowcount = rowcount
        self.lastrowid = 7
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, query, params=()):
        self.queries.append((query, params))

    def fetchone(self):
        return {"id": 7}


class FakeConnection:
    def __init__(self, cursor):
        self.fake_cursor = cursor
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def cursor(self):
        return self.fake_cursor

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


class FitZoneApiTests(unittest.TestCase):
    def setUp(self):
        fitzone.app.config.update(TESTING=True)
        fitzone.RATE_LIMITS.clear()
        self.client = fitzone.app.test_client()

    def admin_headers(self):
        token = fitzone.create_token(os.environ["ADMIN_USERNAME"])
        return {"Authorization": "Bearer " + token}

    def test_health_returns_ok_when_database_is_reachable(self):
        with patch.object(fitzone, "fetch_one", return_value={"healthy": 1}):
            response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "ok", "database": "ok"})

    def test_health_returns_503_when_database_fails(self):
        with patch.object(fitzone, "fetch_one", side_effect=RuntimeError("offline")):
            response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["database"], "unavailable")

    def test_registration_rejects_invalid_data_without_database_access(self):
        response = self.client.post("/api/register", json={"nombre": "x"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_contact_rejects_invalid_data_without_database_access(self):
        response = self.client.post("/api/contact", json={"correo": "no-es-correo"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_admin_login_accepts_correct_credentials(self):
        response = self.client.post("/api/admin/login", json={
            "usuario": os.environ["ADMIN_USERNAME"],
            "clave": os.environ["ADMIN_PASSWORD"],
        })
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["token"])

    def test_admin_login_rejects_wrong_password(self):
        response = self.client.post("/api/admin/login", json={
            "usuario": os.environ["ADMIN_USERNAME"], "clave": "incorrecta",
        })
        self.assertEqual(response.status_code, 401)

    def test_admin_endpoints_require_token(self):
        response = self.client.get("/api/admin/members")
        self.assertEqual(response.status_code, 401)

    def test_admin_session_accepts_valid_token(self):
        response = self.client.get("/api/admin/session", headers=self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["ok"])

    def test_invalid_member_list_is_rejected_before_database_access(self):
        response = self.client.put(
            "/api/admin/members", headers=self.admin_headers(), json={"data": "no es una lista"}
        )
        self.assertEqual(response.status_code, 400)

    def test_saving_members_does_not_delete_records_missing_from_payload(self):
        cursor = FakeCursor(rowcount=1)
        connection = FakeConnection(cursor)
        payload = {"data": [{
            "id": 7, "nombre": "Persona Prueba", "correo": "persona@example.com",
            "plan": "Básico", "estado": "Activo",
        }]}
        with patch.object(fitzone, "database_connection", return_value=connection):
            response = self.client.put("/api/admin/members", headers=self.admin_headers(), json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(any("DELETE FROM members" in query for query, _ in cursor.queries))
        self.assertTrue(connection.committed)

    def test_explicit_member_delete_only_targets_requested_id(self):
        cursor = FakeCursor(rowcount=1)
        connection = FakeConnection(cursor)
        with patch.object(fitzone, "database_connection", return_value=connection):
            response = self.client.delete("/api/admin/members/7", headers=self.admin_headers())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(cursor.queries[0], ("DELETE FROM members WHERE id=%s", (7,)))
        self.assertTrue(connection.committed)

    def test_missing_member_delete_returns_404(self):
        cursor = FakeCursor(rowcount=0)
        connection = FakeConnection(cursor)
        with patch.object(fitzone, "database_connection", return_value=connection):
            response = self.client.delete("/api/admin/members/999", headers=self.admin_headers())
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
