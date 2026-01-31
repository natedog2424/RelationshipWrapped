import sqlite3
import sys
import emoji
import datetime

STOP_WORDS = set(["i", "i'm", "me", "my", "myself", "we", "w", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"])

def connect_and_query(db_path, phone_number):
    """
    Connect to a SQLite database and query by phone number.

    Args:
        db_path: Path to the SQLite database file
        phone_number: Phone number to search for
    """
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

    # Make sure phone number has country code prefix
    if not phone_number.startswith('+'):
        phone_number = '+1' + phone_number  # Assuming default country code is +1

    # Find the chat ROWID associated with the phone number
    cursor.execute("SELECT ROWID FROM chat WHERE chat_identifier = ?", (phone_number,))
    chat_row = cursor.fetchone()

    if not chat_row:
        print(f"No chat found for phone number: {phone_number}")
        return None

    chat_rowid = chat_row[0]

    # Find message ROWIDs associated with the chat ROWID
    cursor.execute("SELECT message_id FROM chat_message_join WHERE chat_id = ?", (chat_rowid,))
    message_rows = cursor.fetchall()
    message_ids = [row[0] for row in message_rows]

    if not message_ids:
        print(f"No messages found for chat ROWID: {chat_rowid}")
        return None

    # Retrieve messages using the message IDs
    cursor.execute(f"SELECT ROWID, text, date, is_from_me, cache_has_attachments  FROM message WHERE ROWID IN ({','.join(['?']*len(message_ids))})", message_ids)
    results = cursor.fetchall()

    # Analyze messages
    #   number of messages,
    #   num words,
    #   num emojis,
    #   top emoji by sender,
    #   num photos,
    #   num by dotw,
    #   num by hour of day
    #   Word/emoji frequency

    word_count = 0
    emoji_count = 0
    photo_count = 0
    dotw_count = [0] * 7  # Sunday to Saturday
    hour_count = [0] * 24  # 0 to 23 hours

    handle_1_emoji_freq = {}
    handle_2_emoji_freq = {}

    total_word_freq = {}

    print(f"Total messages found: {len(results)}")

    for row in results:
        msg_ROWID, text, date, is_from_me, cache_has_attachments = row

        # Date is in Mac Absolute Time (nanoseconds since 2001-01-01)
        # Convert to Unix timestamp
        date = date // 1_000_000_000  # Convert nanoseconds to seconds
        unix_timestamp = date + 978307200
        msg_datetime =  datetime.datetime.fromtimestamp(unix_timestamp)
        dotw = msg_datetime.weekday()  # Monday is 0 and Sunday is 6
        hour = msg_datetime.hour

        dotw_count[dotw] += 1
        hour_count[hour] += 1

        if cache_has_attachments:
            # Find attachment using join table
            cursor.execute("SELECT attachment_id FROM message_attachment_join WHERE message_id = ?", (msg_ROWID,))
            attachment_rows = cursor.fetchall()
            for att_row in attachment_rows:
                attachment_id = att_row[0]
                cursor.execute("SELECT mime_type FROM attachment WHERE ROWID = ?", (attachment_id,))
                att_data = cursor.fetchone()
                if att_data:
                    mime_type = att_data[0]
                    if mime_type and mime_type.startswith('image/'):
                        photo_count += 1

        if text:
            words = text.split()
            word_count += len(words)

            for word in words:
                # Update word count
                word_count += 1

                # Check for emojis in the word
                emojis = emoji.emoji_list(word)
                for emj in emojis:
                    emoji_char = emj['emoji']
                    emoji_count += 1
                    if is_from_me:
                        handle_1_emoji_freq[emoji_char] = handle_1_emoji_freq.get(emoji_char, 0) + 1
                    else:
                        handle_2_emoji_freq[emoji_char] = handle_2_emoji_freq.get(emoji_char, 0) + 1

                # Remove smart quotes and replace spart apostrophes
                word = word.replace("“", "").replace("”", "").replace("‘", "\'").replace("’", "\'").lower()

                # Remove punctuation
                word = word.strip('.,!?";:()[]{}')

                if word in STOP_WORDS or not word:
                    continue

                # Update total word frequency
                total_word_freq[word] = total_word_freq.get(word, 0) + 1

    print(f"Total words: {word_count}")
    print(f"Total emojis: {emoji_count}")
    print(f"Total photos: {photo_count}")
    print(f"Messages by day of week: {dotw_count}")
    print(f"Messages by hour of day: {hour_count}")
    print(f"Top emojis from handle 1: {sorted(handle_1_emoji_freq.items(), key=lambda x: x[1], reverse=True)[:5]}")
    print(f"Top emojis from handle 2: {sorted(handle_2_emoji_freq.items(), key=lambda x: x[1], reverse=True)[:5]}")

    # Print top words formatted as list of json objects like {key: 'word', value: count}
    top_words = sorted(total_word_freq.items(), key=lambda x: x[1], reverse=True)[:50]
    top_words_formatted = [{'key': word, 'value': count} for word, count in top_words]
    print(f"Top words: {top_words_formatted}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python messages.py <database_path> <phone_number>")
        sys.exit(1)

    db_path = sys.argv[1]
    phone_number = sys.argv[2]

    connect_and_query(db_path, phone_number)