from rest_framework import serializers
from .models import (
    Matchmakingqueue,
    Player,
    Gamemode,
    Blacklist,
    Gamesession,
    Sessionparticipant,
)
import bcrypt
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


class MatchmakingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matchmakingqueue
        fields = ["queueid", "playerid", "preferredgamemodelid", "jointime", "status"]


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"


class PlayerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Player
        fields = [
            "playerid",
            "username",
            "password",
            "skillrating",
            "gamesplayed",
            "winrate",
            "serverip",
        ]

    def create(self, validated_data):

        hashed_password = bcrypt.hashpw(
            validated_data.pop("password").encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

        validated_data.setdefault("skillrating", 0)
        validated_data.setdefault("gamesplayed", 0)
        validated_data.setdefault("winrate", 0.0)
        validated_data.setdefault("serverip", None)

        validated_data["password"] = hashed_password

        return Player.objects.create(**validated_data)


class PlayerLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data["username"]
        password = data["password"]

        try:
            player = Player.objects.get(username=username)
        except Player.DoesNotExist:
            raise AuthenticationFailed("Invalid username or password")

        if not bcrypt.checkpw(
            password.encode("utf-8"), player.password.encode("utf-8")
        ):
            raise AuthenticationFailed("Invalid username or password")

        return {
            "playerid": player.playerid,
        }


class BlacklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blacklist
        fields = "__all__"


class MatchmakingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matchmakingqueue
        fields = "__all__"


class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamesession
        fields = "__all__"


class GameSessionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamesession
        fields = "__all__"
        read_only_fields = [
            "Gamesessionid",
            "Starttime",
            "Gamemodeid",
            "Regionid",
        ]


class SessionParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sessionparticipant
        fields = "__all__"
