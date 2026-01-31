import json

def count_reels(json_file_path):
    """
    Count the number of reels (messages with share links) sent by each person.

    Args:
        json_file_path: Path to the Instagram messages JSON file
    """
    # Read the JSON file
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Initialize counters
    reel_counts = {}

    # Count reels for each sender
    for message in data['messages']:
        # Check if message has a share link (indicates a reel)
        if 'share' in message and 'link' in message['share']:
            sender = message['sender_name']
            reel_counts[sender] = reel_counts.get(sender, 0) + 1

    # Print results
    print("Reels sent by each person:")
    print("-" * 40)
    for sender, count in sorted(reel_counts.items()):
        print(f"{sender}: {count} reels")

    print("-" * 40)
    print(f"Total reels: {sum(reel_counts.values())}")

    return reel_counts

if __name__ == "__main__":
    # Path to the messages file
    json_file = "../ig_messages.json"

    # Count and display reels
    count_reels(json_file)
