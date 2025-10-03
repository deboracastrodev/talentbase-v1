# Generated manually for Story 2.1: User Registration (Candidate)
# Make CandidateProfile fields optional except user, full_name, phone
# Per constraint dev2: minimal profile on registration

from django.db import migrations, models
import candidates.models


class Migration(migrations.Migration):
    dependencies = [
        ("candidates", "0001_initial"),
    ]

    operations = [
        # Make CPF optional (will be filled in onboarding)
        migrations.AlterField(
            model_name="candidateprofile",
            name="cpf",
            field=models.CharField(
                help_text="CPF (será encriptado)", max_length=255, blank=True, default=""
            ),
        ),
        # Make LinkedIn optional
        migrations.AlterField(
            model_name="candidateprofile",
            name="linkedin",
            field=models.URLField(help_text="URL do perfil LinkedIn", blank=True, default=""),
        ),
        # Make current_position optional
        migrations.AlterField(
            model_name="candidateprofile",
            name="current_position",
            field=models.CharField(
                choices=[
                    ("SDR/BDR", "SDR/BDR"),
                    ("AE/Closer", "Account Executive/Closer"),
                    ("CSM", "Customer Success Manager"),
                ],
                db_index=True,
                help_text="Posição atual na carreira de vendas",
                max_length=50,
                blank=True,
                default="",
            ),
        ),
        # Make years_of_experience optional
        migrations.AlterField(
            model_name="candidateprofile",
            name="years_of_experience",
            field=models.PositiveIntegerField(
                help_text="Anos de experiência em vendas", null=True, blank=True
            ),
        ),
    ]
