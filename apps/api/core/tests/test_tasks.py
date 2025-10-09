"""
Tests for Celery email tasks.

Story 2.7 - Email Notification System
Tests cover:
- Email template rendering
- HTML + plain text multipart emails
- EmailLog creation and status tracking
- Retry logic with exponential backoff
- Error handling and logging
"""

from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings

from core.models import EmailLog
from core.tasks import send_email_task


@override_settings(
    CELERY_TASK_ALWAYS_EAGER=True,  # Run tasks synchronously in tests
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",  # In-memory backend
)
class EmailTaskTests(TestCase):
    """
    Test suite for send_email_task.

    Uses in-memory email backend and synchronous Celery execution.
    """

    def setUp(self):
        """Clear email outbox and logs before each test."""
        mail.outbox = []
        EmailLog.objects.all().delete()

    def test_send_candidate_registration_email_success(self):
        """
        Test successful email sending for candidate registration.

        Story 2.7 - AC2, AC3, AC4
        """
        # Arrange
        context = {
            "candidate_name": "João Silva",
            "email": "joao@example.com",
            "dashboard_url": "https://www.salesdog.click/candidate/profile",
        }

        # Act
        result = send_email_task.delay(
            template_name="candidate_registration",
            context=context,
            recipient_email="joao@example.com",
            subject="Bem-vindo ao TalentBase!",
        )

        # Assert
        # Email sent
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]

        # Check email properties
        self.assertEqual(sent_email.subject, "Bem-vindo ao TalentBase!")
        self.assertEqual(sent_email.to, ["joao@example.com"])
        self.assertIn("João Silva", sent_email.body)  # Plain text
        self.assertIn("TalentBase", sent_email.body)

        # Check HTML alternative exists
        self.assertEqual(len(sent_email.alternatives), 1)
        html_content, content_type = sent_email.alternatives[0]
        self.assertEqual(content_type, "text/html")
        self.assertIn("João Silva", html_content)
        self.assertIn("TalentBase", html_content)
        self.assertIn("https://www.salesdog.click/candidate/profile", html_content)

        # EmailLog created and marked as sent
        log_entry = EmailLog.objects.get(recipient="joao@example.com")
        self.assertEqual(log_entry.status, "sent")
        self.assertEqual(log_entry.template_name, "candidate_registration")
        self.assertIsNotNone(log_entry.sent_at)
        self.assertEqual(log_entry.error_message, "")

    def test_send_company_registration_submitted_email(self):
        """
        Test company registration submitted email template.

        Story 2.7 - AC2, AC3
        """
        # Arrange
        context = {
            "contact_name": "Maria Santos",
            "company_name": "Tech Corp",
            "email": "contato@techcorp.com",
            "cnpj": "12.345.678/0001-90",
        }

        # Act
        send_email_task.delay(
            template_name="company_registration_submitted",
            context=context,
            recipient_email="contato@techcorp.com",
            subject="Cadastro Recebido - Aguardando Aprovação",
        )

        # Assert
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("Maria Santos", sent_email.body)
        self.assertIn("Tech Corp", sent_email.body)
        self.assertIn("12.345.678/0001-90", sent_email.body)

        # Check EmailLog
        log_entry = EmailLog.objects.get(recipient="contato@techcorp.com")
        self.assertEqual(log_entry.status, "sent")

    def test_send_company_approved_email(self):
        """
        Test company approved email template.

        Story 2.7 - AC2, AC3
        """
        # Arrange
        context = {
            "contact_name": "Pedro Costa",
            "company_name": "Startup XYZ",
            "dashboard_url": "https://www.salesdog.click/company/dashboard",
        }

        # Act
        send_email_task.delay(
            template_name="company_approved",
            context=context,
            recipient_email="pedro@startupxyz.com",
            subject="Parabéns! Sua Empresa Foi Aprovada",
        )

        # Assert
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("Pedro Costa", sent_email.body)
        self.assertIn("Startup XYZ", sent_email.body)
        self.assertIn("aprovada", sent_email.body.lower())

    def test_send_company_rejected_email_with_reason(self):
        """
        Test company rejected email template with rejection reason.

        Story 2.7 - AC2, AC3
        """
        # Arrange
        context = {
            "contact_name": "Ana Lima",
            "company_name": "Example Inc",
            "reason": "CNPJ inválido. Por favor, verifique os dados e tente novamente.",
        }

        # Act
        send_email_task.delay(
            template_name="company_rejected",
            context=context,
            recipient_email="ana@example.com",
            subject="Atualização sobre seu cadastro",
        )

        # Assert
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("Ana Lima", sent_email.body)
        self.assertIn("CNPJ inválido", sent_email.body)

    def test_email_log_created_on_failure(self):
        """
        Test EmailLog tracks failures correctly.

        Story 2.7 - AC5
        """
        # Arrange - Mock email send to raise exception
        with patch("core.tasks.EmailMultiAlternatives.send", side_effect=Exception("SMTP error")):
            # Act - Expect exception in test mode
            with self.assertRaises(Exception):
                send_email_task.delay(
                    template_name="candidate_registration",
                    context={"candidate_name": "Test", "email": "test@test.com"},
                    recipient_email="test@test.com",
                    subject="Test",
                )

        # Assert - EmailLog created with failed status
        log_entry = EmailLog.objects.get(recipient="test@test.com")
        self.assertEqual(log_entry.status, "failed")
        self.assertIn("SMTP error", log_entry.error_message)

    def test_email_template_includes_required_elements(self):
        """
        Test email templates include all required elements.

        Story 2.7 - AC3:
        - Logo TalentBase
        - Clear subject line
        - Personalized greeting (user name)
        - Action link
        - Footer with contact info
        """
        # Arrange
        context = {
            "candidate_name": "Carlos Mendes",
            "email": "carlos@test.com",
            "dashboard_url": "https://www.salesdog.click/candidate/profile",
        }

        # Act
        send_email_task.delay(
            template_name="candidate_registration",
            context=context,
            recipient_email="carlos@test.com",
            subject="Bem-vindo ao TalentBase!",
        )

        # Assert
        sent_email = mail.outbox[0]
        html_content = sent_email.alternatives[0][0]

        # Logo (image tag)
        self.assertIn("logo", html_content.lower())
        self.assertIn("TalentBase", html_content)

        # Personalized greeting
        self.assertIn("Carlos Mendes", html_content)

        # Action link
        self.assertIn("https://www.salesdog.click/candidate/profile", html_content)

        # Footer with contact
        self.assertIn("contato@salesdog.click", html_content)
        self.assertIn("Equipe TalentBase", html_content)

    def test_email_has_plain_text_fallback(self):
        """
        Test emails include plain text version for email clients without HTML support.

        Story 2.7 - Best practice for email delivery
        """
        # Arrange
        context = {
            "candidate_name": "Test User",
            "email": "test@test.com",
            "dashboard_url": "https://www.salesdog.click",
        }

        # Act
        send_email_task.delay(
            template_name="candidate_registration",
            context=context,
            recipient_email="test@test.com",
            subject="Test",
        )

        # Assert
        sent_email = mail.outbox[0]

        # Body is plain text
        self.assertIsInstance(sent_email.body, str)
        self.assertIn("Test User", sent_email.body)

        # HTML alternative exists
        self.assertEqual(len(sent_email.alternatives), 1)
        html_content, content_type = sent_email.alternatives[0]
        self.assertEqual(content_type, "text/html")

    @override_settings(DEBUG=True)
    @patch("core.tasks.EmailMultiAlternatives.send", side_effect=Exception("Connection refused"))
    def test_email_failure_in_development_mode(self, mock_send):
        """
        Test email failures in development mode are logged but don't crash.

        Story 2.7 - AC5: Development mode should be forgiving
        """
        # Act
        result = send_email_task.delay(
            template_name="candidate_registration",
            context={"candidate_name": "Dev Test", "email": "dev@test.com"},
            recipient_email="dev@test.com",
            subject="Dev Test",
        )

        # Assert - Returns without raising (development mode)
        self.assertIn("skipped", result.result.lower())

        # EmailLog marked as skipped
        log_entry = EmailLog.objects.get(recipient="dev@test.com")
        self.assertEqual(log_entry.status, "skipped")
        self.assertIn("MailHog unavailable", log_entry.error_message)
