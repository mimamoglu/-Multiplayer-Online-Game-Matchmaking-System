from django.core.management.base import BaseCommand
from api.models import Matchmakingqueue, Gamesession, Gamemode, Sessionparticipant
from datetime import datetime
from django.utils import timezone
import random
import uuid


class Command(BaseCommand):
    help = "Run the matchmaking process"

    def handle(self, *args, **kwargs):
        print("Starting matchmaking process...")
        queues = Matchmakingqueue.objects.filter(status="Waiting")
        grouped_players = {}
        for queue in queues:
            gamemode = queue.preferredgamemodelid
            if gamemode not in grouped_players:
                grouped_players[gamemode] = []
            grouped_players[gamemode].append(queue)

        for gamemode, players in grouped_players.items():
            max_players = gamemode.maxplayers
            while len(players) >= max_players:
                matched_players = players[:max_players]
                players = players[max_players:]

                session = Gamesession.objects.create(
                    gamesessionid=f"GS{timezone.now().strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}",
                    starttime=timezone.now(),
                    gamemodelid=gamemode,
                    sessionstatus="active",
                )

                print(f"Created new game session: {session.gamesessionid}")

                for player_queue in matched_players:
                    uuid_short = str(uuid.uuid4()).replace("-", "")[:10]
                    sessionparticipant = Sessionparticipant.objects.create(
                        sessionid=session,
                        playerid=player_queue.playerid,
                        matchid=uuid_short,
                    )
                    player_queue.status = "matched"
                    player_queue.save()
                    print(
                        f"Matched Player: {player_queue.playerid.username} to session {session.gamesessionid}"
                    )

        print("Matchmaking process completed.")
