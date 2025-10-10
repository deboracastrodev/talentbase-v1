"""
Tests for SharingService.
Story 3.2: Public shareable candidate profile.
"""

import pytest
from unittest.mock import patch, MagicMock
from django.core.exceptions import ValidationError
from django.utils import timezone

from candidates.models import CandidateProfile
from candidates.services.sharing import SharingService
from authentication.models import User


@pytest.fixture
def candidate_user(db):
    """Create a candidate user."""
    return User.objects.create_user(
        email='candidate@test.com',
        password='testpass123',
        role='candidate'
    )


@pytest.fixture
def complete_candidate_profile(candidate_user):
    """Create a complete candidate profile with required fields."""
    return CandidateProfile.objects.create(
        user=candidate_user,
        full_name='João Silva',
        phone='11999999999',
        city='São Paulo',
        current_position='SDR/BDR',
        years_of_experience=3,
        pitch_video_url='https://youtube.com/watch?v=test123',
        pitch_video_type='youtube'
    )


@pytest.fixture
def incomplete_candidate_profile(candidate_user):
    """Create an incomplete candidate profile without pitch video."""
    return CandidateProfile.objects.create(
        user=candidate_user,
        full_name='Maria Santos',
        phone='11988888888',
        city='Rio de Janeiro',
        current_position='AE/Closer',
        years_of_experience=5
    )


@pytest.mark.django_db
class TestSharingServiceGenerateToken:
    """Tests for generate_share_token method."""

    def test_generate_token_creates_uuid(self, complete_candidate_profile):
        """Test that generate_share_token creates a UUID token."""
        result = SharingService.generate_share_token(complete_candidate_profile)

        assert 'share_token' in result
        assert 'share_url' in result
        assert 'generated_at' in result
        assert len(result['share_token']) == 36  # UUID format

    def test_generate_token_enables_sharing(self, complete_candidate_profile):
        """Test that generate_share_token enables public sharing."""
        assert complete_candidate_profile.public_sharing_enabled is False

        SharingService.generate_share_token(complete_candidate_profile)

        complete_candidate_profile.refresh_from_db()
        assert complete_candidate_profile.public_sharing_enabled is True

    def test_generate_token_sets_timestamp(self, complete_candidate_profile):
        """Test that generate_share_token sets share_link_generated_at."""
        assert complete_candidate_profile.share_link_generated_at is None

        before = timezone.now()
        SharingService.generate_share_token(complete_candidate_profile)
        after = timezone.now()

        complete_candidate_profile.refresh_from_db()
        assert complete_candidate_profile.share_link_generated_at is not None
        assert before <= complete_candidate_profile.share_link_generated_at <= after

    def test_generate_token_returns_valid_url(self, complete_candidate_profile, settings):
        """Test that generate_share_token returns a valid share URL."""
        settings.FRONTEND_URL = 'https://app.talentbase.com'

        result = SharingService.generate_share_token(complete_candidate_profile)

        assert result['share_url'].startswith('https://app.talentbase.com/share/candidate/')
        assert result['share_token'] in result['share_url']

    def test_regenerate_token_creates_new_token(self, complete_candidate_profile):
        """Test that regenerating token creates a new UUID."""
        result1 = SharingService.generate_share_token(complete_candidate_profile)
        old_token = result1['share_token']

        result2 = SharingService.generate_share_token(complete_candidate_profile)
        new_token = result2['share_token']

        assert old_token != new_token

    def test_generate_token_fails_without_pitch_video(self, incomplete_candidate_profile):
        """Test that generate_share_token fails if pitch video is missing."""
        with pytest.raises(ValidationError) as exc_info:
            SharingService.generate_share_token(incomplete_candidate_profile)

        assert 'Perfil deve estar completo' in str(exc_info.value)
        assert 'Vídeo pitch é obrigatório' in str(exc_info.value)

    def test_generate_token_uses_base_url_fallback(self, complete_candidate_profile, settings):
        """Test that BASE_URL is used when FRONTEND_URL is not set."""
        settings.FRONTEND_URL = None
        settings.BASE_URL = 'https://api.talentbase.com'

        result = SharingService.generate_share_token(complete_candidate_profile)

        assert result['share_url'].startswith('https://api.talentbase.com/share/candidate/')


@pytest.mark.django_db
class TestSharingServiceToggleSharing:
    """Tests for toggle_sharing method."""

    def test_toggle_sharing_enables(self, complete_candidate_profile):
        """Test that toggle_sharing can enable sharing."""
        complete_candidate_profile.public_sharing_enabled = False
        complete_candidate_profile.save()

        result = SharingService.toggle_sharing(complete_candidate_profile, True)

        assert result is True
        complete_candidate_profile.refresh_from_db()
        assert complete_candidate_profile.public_sharing_enabled is True

    def test_toggle_sharing_disables(self, complete_candidate_profile):
        """Test that toggle_sharing can disable sharing."""
        complete_candidate_profile.public_sharing_enabled = True
        complete_candidate_profile.save()

        result = SharingService.toggle_sharing(complete_candidate_profile, False)

        assert result is False
        complete_candidate_profile.refresh_from_db()
        assert complete_candidate_profile.public_sharing_enabled is False

    def test_toggle_sharing_keeps_token(self, complete_candidate_profile):
        """Test that disabling sharing keeps the token for re-enabling."""
        SharingService.generate_share_token(complete_candidate_profile)
        original_token = complete_candidate_profile.public_token

        SharingService.toggle_sharing(complete_candidate_profile, False)

        complete_candidate_profile.refresh_from_db()
        assert complete_candidate_profile.public_token == original_token


@pytest.mark.django_db
class TestSharingServiceGetPublicProfile:
    """Tests for get_public_profile method."""

    def test_get_public_profile_with_valid_token(self, complete_candidate_profile):
        """Test that get_public_profile returns profile with valid token."""
        SharingService.generate_share_token(complete_candidate_profile)
        token = str(complete_candidate_profile.public_token)

        result = SharingService.get_public_profile(token)

        assert result is not None
        assert result.id == complete_candidate_profile.id
        assert result.full_name == 'João Silva'

    def test_get_public_profile_with_invalid_token(self, complete_candidate_profile):
        """Test that get_public_profile returns None with invalid token."""
        # Test with malformed UUID string
        result = SharingService.get_public_profile('invalid-token-123')
        assert result is None

        # Test with valid UUID format but non-existent token
        import uuid
        non_existent_token = str(uuid.uuid4())
        result = SharingService.get_public_profile(non_existent_token)
        assert result is None

    def test_get_public_profile_when_sharing_disabled(self, complete_candidate_profile):
        """Test that get_public_profile returns None when sharing is disabled."""
        SharingService.generate_share_token(complete_candidate_profile)
        token = str(complete_candidate_profile.public_token)

        # Disable sharing
        SharingService.toggle_sharing(complete_candidate_profile, False)

        result = SharingService.get_public_profile(token)

        assert result is None

    def test_get_public_profile_when_inactive(self, complete_candidate_profile):
        """Test that get_public_profile returns None for inactive profiles."""
        SharingService.generate_share_token(complete_candidate_profile)
        token = str(complete_candidate_profile.public_token)

        # Soft delete
        complete_candidate_profile.soft_delete()

        result = SharingService.get_public_profile(token)

        assert result is None

    def test_get_public_profile_prefetches_relations(self, complete_candidate_profile, django_assert_num_queries):
        """Test that get_public_profile optimizes queries with prefetch."""
        from candidates.models import Experience

        # Create experiences
        Experience.objects.create(
            candidate=complete_candidate_profile,
            company_name='Company A',
            position='SDR',
            start_date='2020-01-01',
            end_date='2022-01-01'
        )

        SharingService.generate_share_token(complete_candidate_profile)
        token = str(complete_candidate_profile.public_token)

        # Should use only 2 queries: 1 for profile+user, 1 for experiences
        with django_assert_num_queries(2):
            result = SharingService.get_public_profile(token)
            # Access related objects - should not trigger additional queries
            _ = result.user
            _ = list(result.experiences.all())


@pytest.mark.django_db
class TestSharingServiceSendContactRequest:
    """Tests for send_contact_request method."""

    @patch('candidates.services.sharing.send_email_task')
    def test_send_contact_request_calls_email_task(
        self, mock_send_email, complete_candidate_profile, settings
    ):
        """Test that send_contact_request triggers email task."""
        settings.ADMIN_EMAIL = 'admin@talentbase.com'

        SharingService.send_contact_request(
            candidate=complete_candidate_profile,
            contact_name='João Recrutador',
            contact_email='joao@empresa.com',
            message='Gostaria de conversar sobre uma oportunidade...'
        )

        mock_send_email.delay.assert_called_once()
        call_args = mock_send_email.delay.call_args

        # Verify email parameters
        assert call_args.kwargs['to_email'] == 'admin@talentbase.com'
        assert 'João Silva' in call_args.kwargs['subject']
        assert call_args.kwargs['template_name'] == 'emails/candidate_contact_request.html'

    @patch('candidates.services.sharing.send_email_task')
    def test_send_contact_request_includes_context(
        self, mock_send_email, complete_candidate_profile
    ):
        """Test that send_contact_request includes all context data."""
        SharingService.send_contact_request(
            candidate=complete_candidate_profile,
            contact_name='João Recrutador',
            contact_email='joao@empresa.com',
            message='Gostaria de conversar...'
        )

        call_args = mock_send_email.delay.call_args
        context = call_args.kwargs['context']

        assert context['candidate_name'] == 'João Silva'
        assert context['candidate_position'] == 'SDR/BDR'
        assert context['contact_name'] == 'João Recrutador'
        assert context['contact_email'] == 'joao@empresa.com'
        assert context['message'] == 'Gostaria de conversar...'
        assert 'profile_admin_url' in context

    @patch('candidates.services.sharing.send_email_task')
    def test_send_contact_request_admin_url_format(
        self, mock_send_email, complete_candidate_profile, settings
    ):
        """Test that admin URL is correctly formatted."""
        settings.BASE_URL = 'https://api.talentbase.com'

        SharingService.send_contact_request(
            candidate=complete_candidate_profile,
            contact_name='Test',
            contact_email='test@test.com',
            message='Test message'
        )

        call_args = mock_send_email.delay.call_args
        context = call_args.kwargs['context']

        assert context['profile_admin_url'].startswith('https://api.talentbase.com/admin/candidate/')
        assert str(complete_candidate_profile.id) in context['profile_admin_url']


@pytest.mark.django_db
class TestSharingServiceIntegration:
    """Integration tests for complete sharing flow."""

    def test_complete_sharing_flow(self, complete_candidate_profile):
        """Test the complete flow: generate → get → disable → get."""
        # Generate token
        result = SharingService.generate_share_token(complete_candidate_profile)
        token = result['share_token']

        # Verify profile is accessible
        profile = SharingService.get_public_profile(token)
        assert profile is not None
        assert profile.public_sharing_enabled is True

        # Disable sharing
        SharingService.toggle_sharing(complete_candidate_profile, False)

        # Verify profile is not accessible
        profile = SharingService.get_public_profile(token)
        assert profile is None

        # Re-enable sharing
        SharingService.toggle_sharing(complete_candidate_profile, True)

        # Verify profile is accessible again (same token)
        profile = SharingService.get_public_profile(token)
        assert profile is not None

    def test_regenerate_token_invalidates_old(self, complete_candidate_profile):
        """Test that regenerating token invalidates the old one."""
        # Generate first token
        result1 = SharingService.generate_share_token(complete_candidate_profile)
        old_token = result1['share_token']

        # Verify old token works
        profile = SharingService.get_public_profile(old_token)
        assert profile is not None

        # Regenerate token
        result2 = SharingService.generate_share_token(complete_candidate_profile)
        new_token = result2['share_token']

        # Old token should not work
        profile = SharingService.get_public_profile(old_token)
        assert profile is None

        # New token should work
        profile = SharingService.get_public_profile(new_token)
        assert profile is not None
