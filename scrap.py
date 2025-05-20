import requests
from bs4 import BeautifulSoup

print("Scraping League of Legends audio files...")

champion = "Aphelios"
url = f"https://wiki.leagueoflegends.com/en-us/{champion}/Audio"

response = requests.get(url)
print(f"Status code: {response.status_code}")
soup = BeautifulSoup(response.content, "html.parser")
print(f"Title: {soup.title.string}")
print(f"URL: {soup.find_all("i")}")

for block in soup.select(".audio-button + div"):
    print(block.text.strip())
