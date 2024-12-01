from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from .models import *
from .serializers import *
import uuid
from .serializers import *
from rest_framework import generics
from django.utils import timezone


class PlayerDetail(APIView):
    def get(self, request, id):

        try:

            player = Player.objects.get(playerid=id)

            serializer = PlayerSerializer(player)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Player.DoesNotExist:
            return Response(
                {"error": "Player not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, id):

        try:

            player = Player.objects.get(playerid=id)

            if Matchmakingqueue.objects.filter(playerid=player).exists():
                return Response(
                    {"error": "Player is already in the queue."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            queue_id = f"Q{uuid.uuid4().hex[:8].upper()}"

            queue_entry = Matchmakingqueue.objects.create(
                queueid=queue_id,
                playerid=player,
                preferredgamemodelid=Gamemode.objects.first(),
                jointime=now(),
                status="Waiting",
            )

            serializer = MatchmakingQueueSerializer(queue_entry)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Player.DoesNotExist:
            return Response(
                {"error": "Player not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, id):
        try:
            player = Player.objects.get(playerid=id)

            queue_entry = Matchmakingqueue.objects.filter(playerid=player)
            if queue_entry.exists():
                queue_entry.delete()
                return Response(
                    {"message": "Player removed from the matchmaking queue."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": "Player is not in the matchmaking queue."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        except Player.DoesNotExist:
            return Response(
                {"error": "Player not found."}, status=status.HTTP_404_NOT_FOUND
            )


class PlayerView(generics.ListAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer


class PlayerRegistrationView(APIView):
    def post(self, request):
        serializer = PlayerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Player registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlayerLoginView(APIView):
    def post(self, request):
        serializer = PlayerLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlacklistView(generics.ListCreateAPIView):
    queryset = Blacklist.objects.all()
    serializer_class = BlacklistSerializer


class MatchmakingView(generics.ListAPIView):
    queryset = Matchmakingqueue.objects.all()
    serializer_class = MatchmakingQueueSerializer


class GameSessionView(generics.ListCreateAPIView):
    queryset = Gamesession.objects.all()
    serializer_class = GameSessionSerializer


class GameSessionDetail(generics.RetrieveAPIView):
    queryset = Gamesession.objects.all()
    serializer_class = GameSessionDetailSerializer

    def post(self, request, *args, **kwargs):
        game_id = self.kwargs.get("pk")
        try:
            game = Gamesession.objects.get(gamesessionid=game_id)
        except Gamesession.DoesNotExist:
            return Response(
                {"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND
            )

        game.sessionstatus = "completed"
        game.endtime = timezone.now()
        game.save()

        serializer = self.serializer_class(game)
        return Response(serializer.data, status=status.HTTP_200_OK)
