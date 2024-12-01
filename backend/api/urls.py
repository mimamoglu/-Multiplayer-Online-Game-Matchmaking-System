from django.urls import path
from .views import (
    PlayerDetail,
    BlacklistView,
    MatchmakingView,
    GameSessionView,
    GameSessionDetail,
    PlayerView,
)

urlpatterns = [
    path("players/<id>/", PlayerDetail.as_view(), name="add_to_queue"),
    path("players/", PlayerView.as_view(), name="players"),
    path("blacklist/", BlacklistView.as_view(), name="blacklist"),
    path("queue/", MatchmakingView.as_view(), name="matchmakingqueue"),
    path("gamesession/", GameSessionView.as_view(), name="gamesession"),
    path("gamesession/<pk>/", GameSessionDetail.as_view(), name="gamesessiondetail"),
]
