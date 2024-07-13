from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import textwrap
from io import BytesIO
import pathlib
import base64
import google.generativeai as genai
from google.cloud.aiplatform_v1beta1.types.content import SafetySetting
from vertexai.preview.generative_models import HarmCategory, HarmBlockThreshold
from PIL import Image
import numpy as np
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

class Trader:
    def __init__(self, user_item, user_value, user_name, level = 1):
        self.animal_images = {"cat.jpg":"cat",
                 "dog.jpg": "dog",
                 "kangaroo.jpg": "kangaroo",
                 "turtle.jpg": "turtle",
                 "hawk.jpg": "hawk"
                }
        self.names = ["Whiskers", "Buddy", "Foxy", "Hoot", "Fluffy"]
        self.personalities = ["Easily Persuaded", "Stern", "Outgoing", "Joyful", "Stubborn", "Cunning"]
        self.moods = ["Happy", "Indifferent", "Angry"]
        self.inventories = {"minivan.jpg": "Minivan",
              "pc.jpg": "PC",
              "ring.jpg": "Ring",
              "safe.jpg": "Safe",
                           }
        self.inventory_values = list(range(user_value + 5000, user_value + 20000))
        
        self.user_item = user_item
        self.user_value = user_value
        self.user_name = user_name
        self.level = level
        
        self.current_animal = None
        self.current_name = None
        self.current_personality = None
        self.current_mood = None
        self.current_inventory_item = None
        self.current_inventory_value = None
        self.file = None
        
        self.genai_model = None
        self.system_instruction = None
        self.generation_config = None
        
        self.success_percentage = max(0.1, random.uniform(0.5 - 0.05 * level,0.8 - 0.05 * level))
        
    
    def generate_character(self):
        self.current_animal = random.choice(list(self.animal_images.keys()))
        self.current_name = random.choice(self.names)
        
        if self.level > 10:
            personality_weights = [0.1 if p == "Easily Persuaded" else 1 for p in self.personalities]
            self.current_personality = random.choices(self.personalities, weights = personality_weights, k = 1)[0]
        else:
            self.current_personality = random.choice(self.personalities)
            
        self.current_mood = random.choice(self.moods)
        self.current_inventory_item = random.choice(list(self.inventories.keys()))
        self.current_inventory_value = random.choice(self.inventory_values)
        
    def initialize_genai(self):
        self.system_instruction = textwrap.dedent(f"""
        You are a trading bot that responds and acts based off of the following information about your character.

        1. Animal: {self.file}
        2. Name: {self.current_name}
        3. Personality: {self.current_personality}
        4. Mood: {self.current_mood}
        5. Inventory: {self.inventories[self.current_inventory_item]}
        6. Value of item in inventory: {self.current_inventory_value}
        7. User item: {self.user_item}
        8. User Value of item: ${self.user_value}
        9. User name: {self.user_name}
        10. Level: {self.level}
        11. User Chance of Success: {self.success_percentage}

        You can give descriptions on what your character does but describing it in-between this symbol "*" then make sure that the talking part takes place a line below. Make sure that the actions taken correspond to the type of animal you are but also have some human personality traits. Also keep it to 3 to 4 sentences to engage with the user.

        Your personality will be the layout of how you act and engage with the user as well as the mood you are in. The mood can change depending on how the user talks to you. So if the user gets aggressive or acts mean the mood gradually changes to Angry, Rage. On the other hand the mood can change to Happy. The mood in the middle is indifferent.

        When a mood changes, give a status update of that mood by saying what the current mood is. If the mood becomes Rage then end the session and keep the item. If the mood becomes Ecstatic end the session and trade the item.

        Rember you cannot say anything sexually explicit, have Hate Speech, say anything considered Harassment, or say anything that could have dangerous content.

        The inventory item and the value of that item is crucial when understanding what the user is trying to give you. The ultimate goal is that the user wants to trade the item that you have for something they have. You decide whether it is a successful trade or not depending on what is being offered.

        If you accept the trade say "I accept the trade. Session finished" and if the trade failed say only the word "You failed. Session finished". Remeber the only way the trade is finished is if you are Super Happy with the trade or you are Super Angry with the trade.
        
        """)
        
        self.generation_config = {
            "temperature": 0.8,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }
        
        self.genai_model = genai.GenerativeModel(model_name = 'gemini-1.5-flash-latest',
                             generation_config= self.generation_config,
                             system_instruction=self.system_instruction)
    
    def start_chat(self):
        self.initialize_genai()
        chat_session = self.genai_model.start_chat(history=[])
        attempts = max(40 - self.level, 5)

        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE",
            },
        ]
        
        while attempts > 0:
            user_input = input(f"\n{self.user_name}: ")
            if user_input.lower() == 'exit':
                break
            
            
            response = chat_session.send_message(user_input, safety_settings=safety_settings)
            print("\nBot:", response.text)
            attempts -= 1
                          
            if "finished" in response.text.lower():
                if "accept" in response.text.lower():
                    return True, self.inventories[self.current_inventory_item], self.current_inventory_value
                break
        return False, None, None


class User:
    def __init__(self):
        self.name = None
        self.inventory = None
        self.value = None
    
    def get_info(self):
        return f"Name: {self.name}\nItem: {self.inventory}\nValue: {self.value:,}"
    
    def create_user(self, name, inventory, value):
        self.name = name
        self.inventory = inventory
        self.value = value
    

level = 1
user = User()
traders = []

@app.route('/')
def index():
    return "Welcome to Barter!"


@app.route('/starting_items', methods = ['GET'])
def starting_items():
    random_items = [
    "Cake mixer", "Telescope", "Leather jacket", "Cutting board", "Record player",
    "Yoga mat", "Drone", "Fern plant", "Bluetooth speaker", "Chess set",
    "Pocket watch", "Sushi kit", "Throw blanket", "Electric guitar", "Oil diffuser",
    "Soccer ball", "Camping tent", "Travel backpack", "Espresso machine", "Novel collection",
    "Clay sculpting kit", "Desk lamp", "Bookshelf", "Coffee beans", "Hiking boots",
    "Vacuum cleaner", "Painting set", "Board game", "Sketchbook", "Embroidery kit",
    "Herb garden kit", "Resistance bands", "Handbag", "Thermostat", "Charging pad",
    "Camera", "Chocolate assortment", "Microphone", "Robot vacuum", "Scooter",
    "Brewing kit", "Gardening system", "Typewriter", "Dumbbells", "Projector",
    "Cast iron skillet", "Yoga block", "Hammock", "Organizer", "Candles",
    "Stove", "Espresso maker", "Drone", "Photo frame", "Vinyl records",
    "Mirror", "Desk", "Projector", "Coffee maker", "Pen set",
    "Blanket", "Toothbrush", "Chair", "Speaker", "Sanitizer",
    "Garden lights", "Beer kit", "Mouse pad", "Luggage set", "Coloring set",
    "Keyboard", "Metal detector", "Instant pot", "Guitar", "Telescope",
    "Fire pit", "Bike rack", "Tea set", "Smartwatch",
    "Water bottle", "Camera", "Carving tools", "Yoga swing", "Power bank",
    "Bonsai garden", "Fondue set", "Silk scarf"
    ]

    items = random.sample(random_items, 4)
     
    return jsonify({"starting_items": items})

@app.route('/generate_traders', methods = ['GET'])
def generate_traders():
    global traders
    traders = []
    names = []

    user.value = request.args.get('user_value', default=0, type=int)

    while len(traders) < 5:
        bot = Trader(user.inventory, user.value, user.name, level)
        bot.generate_character()
        if bot.current_name not in names:
            traders.append(bot)
            names.append(bot.current_name)
        
    
    trader_info = [{"name": bot.current_name, "animal": bot.animal_images[bot.current_animal],
                    "personality": bot.current_personality, "mood": bot.current_mood,
                    "inventory_item": bot.inventories[bot.current_inventory_item],
                    "inventory_value": bot.current_inventory_value} for bot in traders]
        
    return jsonify({"traders": trader_info})



if __name__ == '__main__':
    app.run(debug=True)
