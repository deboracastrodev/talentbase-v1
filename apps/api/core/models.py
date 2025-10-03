"""
Core models module.
Provides abstract base model for all application models.
"""

import uuid

from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model com campos comuns a todos os models.

    Todos os models da aplicação (exceto User) devem herdar desta classe.
    Fornece: UUID PK, soft delete, timestamps automáticos.

    Attributes:
        id: UUID primary key (auto-generated, non-sequential for security)
        created_at: Timestamp de criação (auto-populated)
        updated_at: Timestamp de última atualização (auto-updated)
        is_active: Flag para soft delete (False = deleted)
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, help_text="Identificador único UUID"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Data/hora de criação")
    updated_at = models.DateTimeField(auto_now=True, help_text="Data/hora da última atualização")
    is_active = models.BooleanField(
        default=True, db_index=True, help_text="Soft delete: False = deletado"
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def soft_delete(self) -> None:
        """
        Perform soft delete by marking record as inactive.

        Sets is_active to False instead of deleting the record from database.
        This preserves data integrity and allows for audit trails.
        """
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])
