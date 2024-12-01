from django.urls import path
from .views import (
    PlayerDetail,
    BlacklistView,
    MatchmakingList,
    GameSessionView,
    GameSessionDetail,
    PlayerView,
    TestEndpointView,
    MatchmakingView,
    SessionparticipantByGameSessionView,
)

urlpatterns = [
    path("players/<id>/", PlayerDetail.as_view(), name="add_to_queue"),
    path("players/", PlayerView.as_view(), name="players"),
    path("blacklist/", BlacklistView.as_view(), name="blacklist"),
    path("queue/", MatchmakingList.as_view(), name="matchmakingqueue"),
    path("gamesession/", GameSessionView.as_view(), name="gamesession"),
    path("gamesession/<pk>/", GameSessionDetail.as_view(), name="gamesessiondetail"),
    path("matchmaking/", MatchmakingView.as_view(), name="matchmaking"),
    path("test/", TestEndpointView.as_view(), name="test_endpoint"),
    path(
        "sessionparticipant/gamesession/<playerid>/",
        SessionparticipantByGameSessionView.as_view(),
        name="sessionparticipant-detail",
    ),
]
