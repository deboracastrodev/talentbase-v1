"""
CSV Import Service for Candidate Profiles - Story 3.3

Handles CSV parsing, column mapping, and bulk candidate import from Notion export.
Supports all 36 Notion fields with specialized parsers for boolean, currency, date, and list types.
"""

import io
from decimal import Decimal, InvalidOperation
from typing import Any

import pandas as pd
from django.core.files.uploadedfile import UploadedFile

from authentication.models import User
from candidates.models import CandidateProfile

# Default column mapping for Notion CSV export (36 columns)
DEFAULT_COLUMN_MAPPING = {
    "Nome": "full_name",
    "CPF": "cpf",
    "LinkedIn": "linkedin",
    "Aceita ser PJ?": "accepts_pj",
    "CEP": "zip_code",
    "Cidade": "city",
    "Contrato Assinado?": "contract_signed",
    "Data da Entrevista": "interview_date",
    "Disp. p/ Mudança?": "relocation_availability",
    "Disponibilidade para viagem?": "travel_availability",
    "Formação Acadêmica": "academic_degree",
    "Idiomas": "languages",
    "Modelo de Trabalho": "work_model",
    "Mín Mensal Remuneração Total": "minimum_salary",
    "Obs. Remuneração": "salary_notes",
    "PCD?": "is_pcd",
    "Posições de Interesse": "positions_of_interest",
    "Possui CNH?": "has_drivers_license",
    "Possui veículo próprio?": "has_vehicle",
    "Prospecção Ativa": "active_prospecting_experience",
    "Qualificação de Leads Inbound": "inbound_qualification_experience",
    "Retenção de Carteira de Clientes": "portfolio_retention_experience",
    "Expansão/Venda pra carteira de clientes": "portfolio_expansion_experience",
    "Tamanho da carteira gerida": "portfolio_size",
    "Venda p/ Leads Inbound": "inbound_sales_experience",
    "Venda p/ Leads Outbound": "outbound_sales_experience",
    "Vendas em Field Sales": "field_sales_experience",
    "Vendas em Inside Sales": "inside_sales_experience",
    "Softwares de Vendas": "tools_software",
    "Soluções que já vendeu": "solutions_sold",
    "Departamentos que já vendeu": "departments_sold_to",
    "[Vendas/Closer] Ciclo de vendas": "sales_cycle",
    "[Vendas/Closer] Ticket Médio": "avg_ticket",
    "Status/Contrato": "status",
    # Email is typically not in the Notion export but may be added manually
    "Email": "email",
    "E-mail": "email",
}


class CSVImportService:
    """Service for handling CSV import operations for candidate profiles."""

    @staticmethod
    def parse_bool(value: Any) -> bool:
        """
        Parse boolean values from CSV (Sim/Não → True/False).

        Args:
            value: Value from CSV cell

        Returns:
            bool: Parsed boolean value
        """
        # Handle pandas NA explicitly
        try:
            if pd.isna(value):
                return False
        except (TypeError, ValueError):
            pass

        if not value:
            return False

        return str(value).strip().lower() in ["sim", "yes", "true", "s", "y", "1"]

    @staticmethod
    def parse_currency(value: Any) -> Decimal | None:
        """
        Parse currency values (R$ 7.500,00 → Decimal(7500.00)).

        Args:
            value: Value from CSV cell (e.g., "R$ 7.500,00")

        Returns:
            Optional[Decimal]: Parsed decimal value or None
        """
        if not value or pd.isna(value):
            return None
        try:
            # Remove R$, dots (thousand separator), and replace comma with dot
            cleaned = str(value).replace("R$", "").replace(".", "").replace(",", ".").strip()
            return Decimal(cleaned)
        except (InvalidOperation, ValueError):
            return None

    @staticmethod
    def parse_list(value: Any) -> list[str]:
        """
        Parse comma-separated lists from CSV.

        Args:
            value: Value from CSV cell (e.g., "Python, JavaScript, Go")

        Returns:
            List[str]: List of trimmed items
        """
        if not value or pd.isna(value):
            return []
        return [item.strip() for item in str(value).split(",") if item.strip()]

    @staticmethod
    def parse_date(value: Any) -> str | None:
        """
        Parse date strings to ISO format.

        Args:
            value: Value from CSV cell

        Returns:
            Optional[str]: ISO formatted date string or None
        """
        if not value or pd.isna(value):
            return None
        try:
            parsed_date = pd.to_datetime(value)
            return parsed_date.date().isoformat()
        except (ValueError, TypeError):
            return None

    @staticmethod
    def auto_detect_columns(csv_columns: list[str]) -> dict[str, str]:
        """
        Auto-detect column mapping using fuzzy matching.

        Args:
            csv_columns: List of column names from CSV

        Returns:
            Dict[str, str]: Mapping of CSV columns to model fields
        """
        detected_mapping = {}

        for csv_col in csv_columns:
            csv_col_normalized = csv_col.strip()

            # Exact match first
            if csv_col_normalized in DEFAULT_COLUMN_MAPPING:
                detected_mapping[csv_col_normalized] = DEFAULT_COLUMN_MAPPING[csv_col_normalized]
                continue

            # Case-insensitive fuzzy matching
            csv_col_lower = csv_col_normalized.lower()
            for notion_col, model_field in DEFAULT_COLUMN_MAPPING.items():
                if csv_col_lower == notion_col.lower():
                    detected_mapping[csv_col_normalized] = model_field
                    break

        return detected_mapping

    @staticmethod
    def parse_csv_file(file: UploadedFile, encoding: str = "utf-8") -> dict[str, Any]:
        """
        Parse uploaded CSV file and return headers, preview, and suggested mapping.

        Args:
            file: Uploaded CSV file
            encoding: File encoding (default: utf-8)

        Returns:
            Dict containing:
                - columns: List of column names
                - preview_rows: First 5 rows as list of dicts
                - suggested_mapping: Auto-detected column mapping
                - total_rows: Total number of data rows
        """
        try:
            # Read CSV file
            df = pd.read_csv(io.BytesIO(file.read()), encoding=encoding)

            # Get columns
            columns = df.columns.tolist()

            # Auto-detect mapping
            suggested_mapping = CSVImportService.auto_detect_columns(columns)

            # Get preview (first 5 rows)
            preview_df = df.head(5)
            preview_rows = preview_df.to_dict(orient="records")

            # Convert NaN to None for JSON serialization
            for row in preview_rows:
                for key, value in row.items():
                    if pd.isna(value):
                        row[key] = None

            return {
                "columns": columns,
                "preview_rows": preview_rows,
                "suggested_mapping": suggested_mapping,
                "total_rows": len(df),
            }

        except Exception as e:
            raise ValueError(f"Erro ao processar CSV: {str(e)}") from e

    @staticmethod
    def validate_required_fields(column_mapping: dict[str, str]) -> list[str]:
        """
        Validate that required fields are mapped.

        Args:
            column_mapping: Mapping of CSV columns to model fields

        Returns:
            List[str]: List of missing required fields
        """
        required_fields = ["full_name", "email"]
        mapped_fields = set(column_mapping.values())

        missing_fields = [field for field in required_fields if field not in mapped_fields]
        return missing_fields

    @staticmethod
    def _extract_email(row: pd.Series, column_mapping: dict[str, str]) -> str | None:
        """Extract and validate email from CSV row."""
        for csv_col, model_field in column_mapping.items():
            if model_field == "email":
                email = row.get(csv_col, "").strip()
                return email if email else None
        return None

    @staticmethod
    def _handle_duplicate(
        candidate_exists: bool, duplicate_strategy: str, email: str
    ) -> dict[str, Any] | None:
        """Handle duplicate candidate logic. Returns error dict if should skip/error."""
        if not candidate_exists:
            return None

        if duplicate_strategy == "skip":
            return {
                "success": False,
                "error": f"Email já cadastrado: {email}",
                "action": "skipped",
            }

        if duplicate_strategy == "error":
            return {
                "success": False,
                "error": f"Duplicata encontrada: {email}",
                "action": "error",
            }

        return None  # Allow update

    @staticmethod
    def _parse_field_value(field_name: str, value: Any) -> Any:
        """Parse field value based on field type."""
        # Boolean fields
        if field_name in [
            "accepts_pj",
            "contract_signed",
            "is_pcd",
            "has_drivers_license",
            "has_vehicle",
        ]:
            return CSVImportService.parse_bool(value)

        # Currency fields
        if field_name == "minimum_salary":
            return CSVImportService.parse_currency(value)

        # Date fields
        if field_name == "interview_date":
            return CSVImportService.parse_date(value)

        # List fields
        if field_name in [
            "languages",
            "positions_of_interest",
            "tools_software",
            "solutions_sold",
            "departments_sold_to",
        ]:
            return CSVImportService.parse_list(value)

        # Text fields
        if pd.isna(value):
            return ""
        return str(value).strip()

    @staticmethod
    def _build_profile_data(row: pd.Series, column_mapping: dict[str, str]) -> dict[str, Any]:
        """Build profile data dict from CSV row."""
        profile_data = {}
        for csv_col, model_field in column_mapping.items():
            if model_field == "email":
                continue  # Email handled separately
            value = row.get(csv_col)
            profile_data[model_field] = CSVImportService._parse_field_value(model_field, value)
        return profile_data

    @staticmethod
    def process_row(
        row: pd.Series,
        column_mapping: dict[str, str],
        duplicate_strategy: str = "skip",
    ) -> dict[str, Any]:
        """
        Process a single CSV row and create/update candidate.

        Args:
            row: pandas Series representing one CSV row
            column_mapping: Mapping of CSV columns to model fields
            duplicate_strategy: How to handle duplicates ('skip', 'update', 'error')

        Returns:
            Dict with keys:
                - success: bool
                - candidate_id: UUID if successful
                - error: str if failed
                - action: 'created' | 'updated' | 'skipped'
        """
        try:
            # Extract and validate email
            email = CSVImportService._extract_email(row, column_mapping)
            if not email:
                return {
                    "success": False,
                    "error": "Email obrigatório",
                    "action": "skipped",
                }

            # Get or create user
            user, _ = User.objects.get_or_create(email=email, defaults={"role": "candidate"})

            # Check for duplicate
            candidate_exists = CandidateProfile.objects.filter(user=user).exists()
            duplicate_result = CSVImportService._handle_duplicate(
                candidate_exists, duplicate_strategy, email
            )
            if duplicate_result:
                return duplicate_result

            # Build profile data
            profile_data = CSVImportService._build_profile_data(row, column_mapping)

            # Create or update profile
            if candidate_exists and duplicate_strategy == "update":
                candidate = CandidateProfile.objects.get(user=user)
                for field, value in profile_data.items():
                    setattr(candidate, field, value)
                candidate.save()
                action = "updated"
            else:
                candidate = CandidateProfile.objects.create(user=user, **profile_data)
                action = "created"

            return {
                "success": True,
                "candidate_id": str(candidate.user.id),
                "action": action,
            }

        except Exception as e:
            return {"success": False, "error": str(e), "action": "error"}
