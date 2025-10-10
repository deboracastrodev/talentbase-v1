"""
Tests for CSV Import functionality - Story 3.3

Tests cover:
- AC1-2: File upload validation (format, size)
- AC3-4: CSV parsing and column mapping
- AC5-6: Import processing with duplicate handling
- AC7-9: Progress tracking, results, error logging
- AC10: Imported candidates visibility
"""

import io
import os
import tempfile
from decimal import Decimal
from unittest.mock import patch, MagicMock

import pandas as pd
import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from candidates.models import CandidateProfile
from candidates.services.csv_import import CSVImportService

User = get_user_model()


@pytest.fixture
def admin_user(db):
    """Create admin user for testing."""
    return User.objects.create_user(
        email="admin@test.com", password="testpass123", role="admin", is_staff=True
    )


@pytest.fixture
def api_client():
    """Create API client."""
    return APIClient()


@pytest.fixture
def auth_client(api_client, admin_user):
    """Create authenticated API client."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def sample_csv_content():
    """Sample CSV content with Notion format."""
    return """Nome,Email,CPF,Cidade,Aceita ser PJ?,PCD?,Idiomas,Softwares de Vendas
João Silva,joao@test.com,12345678900,São Paulo,Sim,Não,"Português, Inglês","Salesforce, HubSpot"
Maria Santos,maria@test.com,98765432100,Rio de Janeiro,Não,Sim,Português,Salesforce"""


@pytest.fixture
def sample_csv_file(sample_csv_content):
    """Create temporary CSV file."""
    csv_file = io.BytesIO(sample_csv_content.encode("utf-8"))
    csv_file.name = "test.csv"
    csv_file.seek(0)
    return csv_file


# Test CSV Service Functions


@pytest.mark.django_db
class TestCSVImportService:
    """Test CSV Import Service methods."""

    def test_parse_bool_true_values(self):
        """Test boolean parsing for true values."""
        assert CSVImportService.parse_bool("Sim") is True
        assert CSVImportService.parse_bool("sim") is True
        assert CSVImportService.parse_bool("Yes") is True
        assert CSVImportService.parse_bool("true") is True
        assert CSVImportService.parse_bool("1") is True

    def test_parse_bool_false_values(self):
        """Test boolean parsing for false values."""
        assert CSVImportService.parse_bool("Não") is False
        assert CSVImportService.parse_bool("No") is False
        assert CSVImportService.parse_bool("") is False
        assert CSVImportService.parse_bool(None) is False
        assert CSVImportService.parse_bool(pd.NA) is False

    def test_parse_currency_valid(self):
        """Test currency parsing with valid values."""
        assert CSVImportService.parse_currency("R$ 7.500,00") == Decimal("7500.00")
        assert CSVImportService.parse_currency("R$ 10.000,50") == Decimal("10000.50")
        assert CSVImportService.parse_currency("1500,00") == Decimal("1500.00")

    def test_parse_currency_invalid(self):
        """Test currency parsing with invalid values."""
        assert CSVImportService.parse_currency("") is None
        assert CSVImportService.parse_currency(None) is None
        assert CSVImportService.parse_currency("invalid") is None

    def test_parse_list_valid(self):
        """Test list parsing."""
        result = CSVImportService.parse_list("Python, JavaScript, Go")
        assert result == ["Python", "JavaScript", "Go"]

        result = CSVImportService.parse_list("Salesforce")
        assert result == ["Salesforce"]

    def test_parse_list_empty(self):
        """Test list parsing with empty values."""
        assert CSVImportService.parse_list("") == []
        assert CSVImportService.parse_list(None) == []

    def test_auto_detect_columns(self):
        """Test automatic column mapping detection."""
        csv_columns = ["Nome", "Email", "CPF", "Aceita ser PJ?"]
        mapping = CSVImportService.auto_detect_columns(csv_columns)

        assert mapping["Nome"] == "full_name"
        assert mapping["Email"] == "email"
        assert mapping["CPF"] == "cpf"
        assert mapping["Aceita ser PJ?"] == "accepts_pj"

    def test_parse_csv_file(self, sample_csv_file):
        """Test CSV file parsing - AC3, AC4."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        # Convert BytesIO to Django's UploadedFile
        uploaded_file = SimpleUploadedFile(
            "test.csv", sample_csv_file.read(), content_type="text/csv"
        )

        result = CSVImportService.parse_csv_file(uploaded_file)

        assert "columns" in result
        assert "preview_rows" in result
        assert "suggested_mapping" in result
        assert "total_rows" in result

        assert result["total_rows"] == 2
        assert len(result["preview_rows"]) == 2
        assert "Nome" in result["columns"]
        assert result["suggested_mapping"]["Nome"] == "full_name"

    def test_validate_required_fields(self):
        """Test required fields validation."""
        # Valid mapping
        mapping = {"Nome": "full_name", "Email": "email"}
        missing = CSVImportService.validate_required_fields(mapping)
        assert len(missing) == 0

        # Missing email
        mapping = {"Nome": "full_name"}
        missing = CSVImportService.validate_required_fields(mapping)
        assert "email" in missing


# Test API Endpoints


@pytest.mark.django_db
class TestCSVImportEndpoints:
    """Test CSV import API endpoints."""

    def test_parse_csv_requires_admin(self, api_client, db):
        """Test that parse CSV requires admin auth - AC Security."""
        url = "/api/v1/candidates/admin/parse-csv"
        response = api_client.post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_parse_csv_valid_file(self, auth_client, sample_csv_content):
        """Test parsing valid CSV file - AC2, AC3."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        url = "/api/v1/candidates/admin/parse-csv"

        csv_file = SimpleUploadedFile(
            "test.csv", sample_csv_content.encode("utf-8"), content_type="text/csv"
        )

        response = auth_client.post(url, {"file": csv_file}, format="multipart")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "columns" in data
        assert "preview_rows" in data
        assert "suggested_mapping" in data
        assert "file_id" in data

    def test_parse_csv_invalid_format(self, auth_client):
        """Test CSV upload with invalid format - AC2."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        url = "/api/v1/candidates/admin/parse-csv"

        txt_file = SimpleUploadedFile("test.txt", b"invalid content", content_type="text/plain")

        response = auth_client.post(url, {"file": txt_file}, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "csv" in str(response.json()).lower()

    def test_parse_csv_too_large(self, auth_client):
        """Test CSV upload with file too large - AC2."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        url = "/api/v1/candidates/admin/parse-csv"

        # Create file larger than 10MB
        large_content = "a" * (11 * 1024 * 1024)
        large_file = SimpleUploadedFile(
            "large.csv", large_content.encode(), content_type="text/csv"
        )

        response = auth_client.post(url, {"file": large_file}, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "tamanho" in str(response.json()).lower() or "grande" in str(response.json()).lower()

    @patch("candidates.tasks.process_csv_import.delay")
    def test_import_csv_triggers_task(self, mock_task, auth_client):
        """Test that import endpoint triggers Celery task - AC5."""
        url = "/api/v1/candidates/admin/import"

        mock_task.return_value = MagicMock(id="test-task-id")

        data = {
            "file_id": "test-file-id",
            "column_mapping": {"Nome": "full_name", "Email": "email"},
            "duplicate_strategy": "skip",
        }

        # Create temp file
        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as f:
            f.write(b"Nome,Email\nTest,test@test.com")
            temp_path = f.name

        try:
            # Mock file path
            with patch("os.path.exists", return_value=True):
                with patch("os.path.join", return_value=temp_path):
                    response = auth_client.post(url, data, format="json")

            assert response.status_code == status.HTTP_202_ACCEPTED
            data = response.json()
            assert "task_id" in data
            assert data["task_id"] == "test-task-id"

            # Verify task was called
            mock_task.assert_called_once()

        finally:
            os.unlink(temp_path)


# Test Import Processing


@pytest.mark.django_db
class TestCSVImportProcessing:
    """Test CSV import processing logic."""

    def test_process_row_creates_user_and_candidate(self):
        """Test processing single row creates User and CandidateProfile - AC6."""
        row_data = {
            "Nome": "João Silva",
            "Email": "joao@test.com",
            "CPF": "12345678900",
            "Cidade": "São Paulo",
            "Aceita ser PJ?": "Sim",
        }

        row = pd.Series(row_data)
        column_mapping = {
            "Nome": "full_name",
            "Email": "email",
            "CPF": "cpf",
            "Cidade": "city",
            "Aceita ser PJ?": "accepts_pj",
        }

        result = CSVImportService.process_row(row, column_mapping, "skip")

        assert result["success"] is True
        assert result["action"] == "created"

        # Verify User created
        user = User.objects.get(email="joao@test.com")
        assert user.role == "candidate"

        # Verify CandidateProfile created
        profile = CandidateProfile.objects.get(user=user)
        assert profile.full_name == "João Silva"
        assert profile.cpf == "12345678900"
        assert profile.city == "São Paulo"
        assert profile.accepts_pj is True

    def test_process_row_skip_duplicate(self):
        """Test duplicate handling with skip strategy - AC6."""
        # Create existing user
        user = User.objects.create_user(email="existing@test.com", role="candidate")
        CandidateProfile.objects.create(user=user, full_name="Existing User", phone="11999999999")

        row_data = {"Nome": "New Name", "Email": "existing@test.com"}

        row = pd.Series(row_data)
        column_mapping = {"Nome": "full_name", "Email": "email"}

        result = CSVImportService.process_row(row, column_mapping, "skip")

        assert result["success"] is False
        assert result["action"] == "skipped"
        assert "já cadastrado" in result["error"]

    def test_process_row_update_duplicate(self):
        """Test duplicate handling with update strategy - AC6."""
        # Create existing user
        user = User.objects.create_user(email="existing@test.com", role="candidate")
        profile = CandidateProfile.objects.create(
            user=user, full_name="Old Name", phone="11999999999"
        )

        row_data = {
            "Nome": "Updated Name",
            "Email": "existing@test.com",
            "Cidade": "Rio de Janeiro",
        }

        row = pd.Series(row_data)
        column_mapping = {"Nome": "full_name", "Email": "email", "Cidade": "city"}

        result = CSVImportService.process_row(row, column_mapping, "update")

        assert result["success"] is True
        assert result["action"] == "updated"

        # Verify profile was updated
        profile.refresh_from_db()
        assert profile.full_name == "Updated Name"
        assert profile.city == "Rio de Janeiro"

    def test_process_row_missing_email(self):
        """Test row processing fails without required email."""
        row_data = {"Nome": "João Silva"}

        row = pd.Series(row_data)
        column_mapping = {"Nome": "full_name"}

        result = CSVImportService.process_row(row, column_mapping, "skip")

        assert result["success"] is False
        assert "obrigatório" in result["error"].lower()
