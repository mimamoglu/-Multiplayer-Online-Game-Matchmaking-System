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
import random
import requests
from rest_framework import status
from django.core.management import call_command
import io
from django.core.exceptions import ObjectDoesNotExist


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
            game_modes = Gamemode.objects.all()
            print("test")
            if not game_modes.exists():
                return Response(
                    {"error": "No game modes available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            requested_gamemode_id = request.data.get("gamemodeid")
            print("test")
            if requested_gamemode_id:
                try:
                    gamemode = Gamemode.objects.get(gamemodelid=requested_gamemode_id)
                except Gamemode.DoesNotExist:
                    return Response(
                        {
                            "error": f"Gamemode with ID {requested_gamemode_id} does not exist."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:

                gamemode = random.choice(game_modes)

            if Matchmakingqueue.objects.filter(playerid=player).exists():
                return Response(
                    {"error": "Player is already in the queue."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            queue_id = f"Q{uuid.uuid4().hex[:8].upper()}"
            print("test")
            queue_entry = Matchmakingqueue.objects.create(
                queueid=queue_id,
                playerid=player,
                preferredgamemodelid=gamemode,
                jointime=now(),
                status="Waiting",
            )
            print("test")
            serializer = MatchmakingQueueSerializer(queue_entry)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Player.DoesNotExist:
            return Response(
                {"error": f"Player with ID {id} does not exist."},
                status=status.HTTP_404_NOT_FOUND,
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


class MatchmakingList(generics.ListAPIView):
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


class MatchmakingView(APIView):
    def post(self, request, *args, **kwargs):

        output = io.StringIO()
        try:
            call_command("matchmaking", stdout=output)
            response_message = output.getvalue()
            return Response(
                {
                    "message": "Matchmaking script executed successfully.",
                    "details": response_message,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TestEndpointView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            start_id = request.data.get("start_id")
            stop_id = request.data.get("stop_id")

            if start_id is None or stop_id is None:
                return Response(
                    {"error": "start_id and stop_id are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if start_id < 0 or stop_id < start_id:
                return Response(
                    {"error": "Invalid start_id or stop_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            total_records = stop_id - start_id + 1
            players = Player.objects.all().order_by("playerid")[start_id : stop_id + 1]

            if not players.exists():
                return Response(
                    {"error": "No players found in the specified range."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            base_url = "http://127.0.0.1:8000/api/players"
            results = []

            for player in players:
                player_id = player.playerid
                url = f"{base_url}/{player_id}/"
                response = requests.post(url)
                results.append(
                    {
                        "player_id": player_id,
                        "status_code": response.status_code,
                        "response": response.json(),
                    }
                )

            return Response({"results": results}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
