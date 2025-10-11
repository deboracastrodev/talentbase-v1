"""
Celery tasks for candidate operations - Story 3.3

Async tasks for CSV import processing with progress tracking and error logging.
"""

import csv
import os
from typing import Any

import pandas as pd
from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf import settings

from candidates.services.csv_import import CSVImportService

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=3)
def process_csv_import(
    self,
    file_path: str,
    column_mapping: dict[str, str],
    duplicate_strategy: str = "skip",
    admin_user_id: str = None,
) -> dict[str, Any]:
    """
    Process CSV import asynchronously with progress tracking.

    Args:
        self: Celery task instance (for progress updates)
        file_path: Path to uploaded CSV file
        column_mapping: Mapping of CSV columns to model fields
        duplicate_strategy: How to handle duplicates ('skip', 'update', 'error')
        admin_user_id: ID of admin who initiated import (for logging)

    Returns:
        Dict with import results:
            - total: Total rows processed
            - success: Number of successful imports
            - skipped: Number of skipped rows
            - errors: List of error details
            - error_file_path: Path to error log CSV (if errors exist)
    """
    logger.info(f"Starting CSV import task {self.request.id} from file: {file_path}")

    results = {
        "total": 0,
        "success": 0,
        "skipped": 0,
        "errors": [],
        "error_file_path": None,
    }

    try:
        # Read CSV file
        df = pd.read_csv(file_path, encoding="utf-8")
        results["total"] = len(df)

        logger.info(f"Processing {results['total']} rows from CSV")

        # Process rows in batches of 100
        batch_size = 100
        processed_count = 0

        for batch_start in range(0, len(df), batch_size):
            batch_end = min(batch_start + batch_size, len(df))
            batch_df = df.iloc[batch_start:batch_end]

            for index, row in batch_df.iterrows():
                try:
                    result = CSVImportService.process_row(row, column_mapping, duplicate_strategy)

                    if result["success"]:
                        results["success"] += 1
                    else:
                        if result["action"] == "skipped":
                            results["skipped"] += 1
                        results["errors"].append(
                            {
                                "row": index + 2,  # +2 for 1-indexing and header row
                                "nome": row.get("Nome", "Unknown"),
                                "email": row.get("Email", row.get("E-mail", "")),
                                "error": result.get("error", "Erro desconhecido"),
                            }
                        )

                except Exception as e:
                    logger.error(f"Error processing row {index + 2}: {str(e)}")
                    results["errors"].append(
                        {
                            "row": index + 2,
                            "nome": row.get("Nome", "Unknown"),
                            "email": row.get("Email", row.get("E-mail", "")),
                            "error": str(e),
                        }
                    )

                processed_count += 1

                # Update progress every 10 rows or every 10%
                if (
                    processed_count % 10 == 0
                    or processed_count % max(1, results["total"] // 10) == 0
                ):
                    progress = int((processed_count / results["total"]) * 100)
                    self.update_state(
                        state="PROGRESS",
                        meta={
                            "current": processed_count,
                            "total": results["total"],
                            "progress": progress,
                            "success": results["success"],
                            "errors": len(results["errors"]),
                        },
                    )

            # Commit batch (Django ORM already commits each save)
            logger.info(
                f"Completed batch {batch_start}-{batch_end}: "
                f"{results['success']} successful, {len(results['errors'])} errors"
            )

        # Generate error log CSV if there are errors
        if results["errors"]:
            error_file_path = os.path.join(
                settings.MEDIA_ROOT or "/tmp",
                f"import_errors_{self.request.id}.csv",
            )

            with open(error_file_path, "w", newline="", encoding="utf-8") as csvfile:
                fieldnames = ["row", "nome", "email", "error"]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results["errors"])

            results["error_file_path"] = error_file_path
            logger.info(f"Error log created at: {error_file_path}")

        # Clean up uploaded CSV file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up file {file_path}: {str(e)}")

        logger.info(
            f"CSV import task {self.request.id} completed: "
            f"{results['success']} successful, "
            f"{results['skipped']} skipped, "
            f"{len(results['errors'])} errors"
        )

        return results

    except Exception as e:
        logger.error(f"Fatal error in CSV import task {self.request.id}: {str(e)}")
        raise self.retry(exc=e, countdown=60) from e  # Retry after 60 seconds
