from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Player


@receiver(post_save, sender=User)
def create_player_profile(sender, instance, created, **kwargs):
    if created and instance.user_type == "player":
        Player.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_player_profile(sender, instance, **kwargs):
    if instance.user_type == "player" and hasattr(instance, "player_profile"):
        instance.player_profile.save()
