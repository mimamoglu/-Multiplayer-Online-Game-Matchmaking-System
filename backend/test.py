import requests

BASE_URL = "http://127.0.0.1:8000/api/players"
START_ID = 1
END_ID = 100


def generate_player_id(index):
    return f"P{str(index).zfill(4)}"


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


def main():
    for i in range(START_ID, END_ID + 1):
        player_id = generate_player_id(i)
        add_player_to_queue(player_id)


if __name__ == "__main__":
    main()
