import requests
import asyncio
from bs4 import BeautifulSoup
from telegram import Bot

# URL of the webpage
url = 'https://ft.org.ua/performances/konotopska-vidma'
bot_token = "6504868532:AAGTYzpH3-PXIiSAS493KOZUp-soFS_fRnA"  # Replace with your bot token
chat_id = "379066520"  # Replace with the chat ID where you want to receive notifications
lastWitch = "https://sales.ft.org.ua/events/5115"
bot = Bot(token=bot_token)
message = "New Tickets. Check https://ft.org.ua/performances/konotopska-vidma"

# Headers to mimic a real browser
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
    # Send a request with headers
response = requests.get(url, headers=headers)

    # Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(response.content, 'html.parser')

    # Open a text file in write mode
links = soup.find_all('a', class_='performanceHero__date')

    # Loop through each link and extract the href attribute
    # Send notification
async def send_notification(message):
        await bot.send_message(chat_id=chat_id, text=message)

    # Example of calling the asynchronous function
async def monitor_website():
        await send_notification(message)

if links[-2] != lastWitch:{
        asyncio.run(monitor_website())
    }
    # Initialize Telegram Bot with the token from BotFather

    # Asynchronous function to send a notification with website information
