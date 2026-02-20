import pandas as pd
import email
from email.policy import default
from typing import List, Dict, Optional
import random

def parse_raw_message(raw_message: str) -> Dict[str, str]:
    """Parses a raw email message into a structured dictionary."""
    try:
        msg = email.message_from_string(raw_message, policy=default)
        
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
                cdispo = str(part.get('Content-Disposition'))
        
                # skip any text/plain (txt) attachments
                if ctype == 'text/plain' and 'attachment' not in cdispo:
                    body = part.get_payload(decode=True).decode(part.get_content_charset() or 'utf-8', errors='replace')  # decode
                    break
        else:
            body = msg.get_payload(decode=True).decode(msg.get_content_charset() or 'utf-8', errors='replace')

        return {
            "subject": msg.get("Subject", "(No Subject)"),
            "from": msg.get("From", "(Unknown Sender)"),
            "to": msg.get("To", "(Unknown Recipient)"),
            "date": msg.get("Date", ""),
            "body": body.strip()
        }
    except Exception as e:
        print(f"Error parsing email: {e}")
        return {
            "subject": "Error Parsing Email",
            "from": "",
            "to": "",
            "date": "",
            "body": raw_message[:500] # Return raw snippet on error
        }

def load_enron_sample(filepath: str, limit: int = 5000) -> List[Dict[str, str]]:
    """Loads a random sample of Enron emails from the CSV."""
    try:
        # Read a subset of columns to save memory
        df = pd.read_csv(filepath, usecols=['message'], nrows=limit * 2) # Read more to sample from
        
        # Sample if we have enough data
        if len(df) > limit:
            df = df.sample(n=limit)
        
        emails = []
        for raw_msg in df['message']:
            parsed = parse_raw_message(raw_msg)
            # Filter out empty bodies if desired, or keep them
            if parsed['body']: 
                emails.append(parsed)
                
        return emails
        
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}")
        return []
    except Exception as e:
        print(f"Error loading Enron dataset: {e}")
        return []
