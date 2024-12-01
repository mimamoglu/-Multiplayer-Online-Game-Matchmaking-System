import requests

BASE_URL = "http://127.0.0.1:8000/api/players"


def add_player_to_queue(player_id):
    url = f"{BASE_URL}/{player_id}/"
    response = requests.post(url)
    if response.status_code == 201:
        print(f"Player {player_id} added to the queue: {response.json()}")
    elif response.status_code == 400:
        print(f"Player {player_id} already in queue: {response.json()}")
    elif response.status_code == 404:
        print(f"Player {player_id} not found: {response.json()}")
    else:
        print(
            f"Failed to add player {player_id}. HTTP {response.status_code}: {response.json()}"
        )


def process_players(player_ids, start_index, stop_index):
    for i in range(start_index, stop_index + 1):
        player_id = player_ids[i]
        add_player_to_queue(player_id)
