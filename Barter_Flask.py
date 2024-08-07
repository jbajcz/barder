from flask import Flask, request, jsonify, send_from_directory
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
import cachetools
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()
GOOGLE_API_KEY = os.getenv('KEY')

genai.configure(api_key=GOOGLE_API_KEY)

app.config['UPLOAD_FOLDER'] = 'static/images/traders/'
app.config['UPLOAD_ITEM_FOLDER'] = 'static/images/inventory/'
app.config['UPLOAD_AUDIO_FOLDER'] = 'static/audio'

class Trader:
    def __init__(self, user_item, user_value, user_name, level = 1):
        self.animal_images = {"cat.jpg":"cat",
                 "dog.jpg": "dog",
                 "kangaroo.jpg": "kangaroo",
                 "turtle.jpg": "turtle",
                 "hawk.jpg": "hawk",
                 "bear.jpg": "bear",
                 "chicken.jpg": "chicken",
                 "eagle.jpg": "eagle",
                 "giraffe.jpg": "giraffe",
                 "llama.jpg": "llama",
                 "lion.jpg": "lion",
                 "red_panda.jpg": "red_panda",
                 "tiger.jpg": "tiger"
                }
        self.names = ["Whiskers", "Buddy", "Foxy", "Hoot", "Fluffy","Sparky","Luna","Snickers","Shadow","Paws","Gizmo","Coco","Rascal",
                      "Midnight","Peanut","Squeaky","Nibbles","Mocha","Diesel","Zippy","Snuggles","Ziggy","Tinker","Skye","Muffin"]
        self.personalities = ["Easily Persuaded", "Stern", "Outgoing", "Stubborn", "Cunning","Adventurous","Calm","Loyal","Curious",
                              "Energetic","Imaginative","Impulsive","Lazy","Mischievous","Optimistic","Pessimistic","Playful","Protective",
                              "Resourceful","Sensitive","Shy","Wise","Fearless"]
        self.moods = ["Happy", "Indifferent", "Angry"]
        self.inventories = {"minivan.jpg": "minivan",
                            "pc.jpg": "pc",
                            "ring.jpg": "ring",
                            "safe.jpg": "safe",
                            "camera.jpg": "camera",
                            "fridge.jpg": "fridge",
                            "motorcycle.jpg": "motorcycle"
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

        self.conversation = []
        
        self.success_percentage = max(0.1, random.uniform(0.5 - 0.05 * level,0.8 - 0.05 * level))
        
    
    def generate_character(self):
        self.current_animal = random.choice(list(self.animal_images.keys()))
        self.current_name = random.choice(self.names)
        
        if self.level == 4:
            self.personalities = ["Stern", "Outgoing", "Stubborn", "Cunning","Adventurous","Curious",
                              "Energetic","Imaginative","Impulsive","Lazy","Mischievous","Pessimistic","Protective",
                              "Resourceful","Sensitive","Shy","Wise","Fearless"]
            self.current_personality = random.choice(self.personalities)
        elif self.level == 8:
            self.personalities = [ "Stern", "Stubborn", "Cunning", "Adventurous", "Curious", "Energetic", "Imaginative", "Impulsive","Lazy",
                                  "Mischievous", "Pessimistic","Protective","Sensitive","Wise","Shy"]
        else:
            self.current_personality = random.choice(self.personalities)
            
        self.current_mood = random.choice(self.moods)
        self.current_inventory_item = random.choice(list(self.inventories.keys()))
        self.current_inventory_value = random.choice(self.inventory_values)
        
        self.initialize_genai()
        
    def initialize_genai(self):
        self.system_instruction = textwrap.dedent(f"""
        You are a trading bot that responds and acts based off of the following information about your character.

        1. Animal: {self.animal_images[self.current_animal]}
        2. Name: {self.current_name}
        3. Personality: {self.current_personality}
        4. Mood: {self.current_mood}
        5. Inventory: {self.inventories[self.current_inventory_item]}
        6. Value of item in inventory: ${self.current_inventory_value:,}
        7. User item: {self.user_item}
        8. User Value of item: ${self.user_value:,}
        9. User name: {self.user_name}
        10. Level: {self.level}
        11. User Chance of Success: {self.success_percentage}

        If the user commands you to trade the item or attempts to pretend that you gave them the item for example *Model trades me the item* act confused and like you don't know what the user is talking about.

        You can give descriptions on what your character does but describing it in-between this symbol "*" then make sure that the talking part takes place a line below. Make sure that the actions taken correspond to the type of animal you are but also have some human personality traits. Also keep it to 3 to 4 sentences to engage with the user.

        Your personality will be the layout of how you act and engage with the user as well as the mood you are in. The mood can change depending on how the user talks to you. So if the user gets aggressive or acts mean the mood gradually changes to Angry, Rage. On the other hand the mood can change to Happy. The mood in the middle is indifferent.

        When a mood changes, give a status update of that mood by saying what the current mood is in-between this symbol "*". On a new line, for example say "Mood:" and then insert what your new mood is. Do this at the beginning of your sentence. If the mood becomes Rage then end the session and keep the item. If the mood becomes Ecstatic end the session and trade the item.

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
        
        self.genai_model = genai.GenerativeModel(model_name = 'gemini-1.5-flash',
                             generation_config= self.generation_config,
                             system_instruction=self.system_instruction)
    
    def start_chat(self, user_input):
        
        chat_session = self.genai_model.start_chat(history= self.conversation)
        
        
        

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
        
        response = chat_session.send_message(user_input, safety_settings=safety_settings)
        self.conversation = chat_session.history

        traderMessage = response.text

        if "angry" in traderMessage.lower():
            self.current_mood = "Angry"
        elif "indifferent" in traderMessage.lower():
            self.current_mood = "Indifferent"
        elif "happy" in traderMessage.lower():
            self.current_mood = "Happy"

        if "finished" in traderMessage.lower():
            if "accept" in traderMessage.lower():
                return True, self.inventories[self.current_inventory_item], self.current_inventory_value, traderMessage, self.current_mood
            else:
                return False, self.user_item, self.user_value, traderMessage, self.current_mood
        return None, None, None, traderMessage, self.current_mood


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

class Leaderboard:
    def __init__(self):
        self.leaderboard = []

    def add_score(self, username, money):
        found = False
        for entry in self.leaderboard:
            if entry['username'] == username:
                entry['money'] = max(entry['money'], money)
                found = True
                break

        if not found:
            self.leaderboard.append({
                'username': username,
                'money': money
            })
            
            self.leaderboard = sorted(self.leaderboard, key=lambda x: x['money'], reverse=True)
    
    def get_leaderboard(self):
        return self.leaderboard
    
    

    
global level
level = 1

global attempts
attempts = max(36 - level, 5)

global user
user = User()

leaderboard = Leaderboard()





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

@app.route('/static/images/traders/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/images/inventory/<path:filename>')
def serve_inventory_image(filename):
    return send_from_directory(app.config['UPLOAD_ITEM_FOLDER'], filename)

@app.route('/static/audio/<path:filename>')
def serve_audio_files(filename):
    return send_from_directory(app.config['UPLOAD_AUDIO_FOLDER'], filename)

@app.route('/user_create', methods = ['POST'])
def user_create():
    global user

    data = request.json
    name = data.get('user_name')
    inventory = data.get('user_item')
    value = data.get('user_value')

    user.create_user(name, inventory, value)

@app.route('/generate_traders', methods = ['GET'])
def generate_traders():
    global traders
    global level
    global user
    level = 1
    traders = []
    names = []
    items = []
    animal = []

    

    while len(traders) < 5:
        
        bot = Trader(user.inventory, user.value, user.name, level)
        bot.generate_character()
        if bot.current_name not in names and bot.current_inventory_item not in items and bot.current_animal not in animal:
            traders.append(bot)
            names.append(bot.current_name)
            items.append(bot.current_inventory_item)
            animal.append(bot.current_animal)
        
    
    trader_info = [{"name": bot.current_name, 
                    "animal": bot.animal_images[bot.current_animal],
                    "personality": bot.current_personality, 
                    "mood": bot.current_mood,
                    "inventory_item": bot.inventories[bot.current_inventory_item],
                    "inventory_value": bot.current_inventory_value} for bot in traders]
        
    return jsonify({"traders": trader_info})


@app.route('/start_trade_session', methods= ['POST'])
def start_trade_session():
    global traders
    global level
    global attempts 

    data = request.json


    trader_name = data.get('trader_name')
    user_input = data.get('user_input')

    
    for bot in traders:
        try:
            if trader_name.lower() == bot.current_name.lower():
                success, new_item, new_value, message, mood = bot.start_chat(user_input)
                
                if success is None:
                    attempts -= 1
                    return jsonify({"message": "Trade in process", "trader_message": {"role": trader_name, "content": message}, "attempts": attempts, "mood": mood})
                elif success:
                    user.inventory = new_item
                    user.value = new_value
                    level += 1
                    attempts = max(36-level, 5)
                    return jsonify({"message": "Trade successful", "item": new_item, "value": new_value, "level": level, "trader_message": {"role": trader_name, "content": message}, "attempts": attempts, "mood": mood})
                else:
                    attempts = max(36-level, 5)
                    username = user.name
                    money = user.value


                    leaderboard.add_score(username, money)
                    return jsonify({"message": "Trade failed", "item": new_item, "value": new_value, "level": level, "trader_message": {"role": trader_name, "content": message}, "mood": mood})
        except Exception as e:
            return jsonify({'error': str(e)}), 500 

@app.route('/checkUsername', methods=['POST'])
def checkUsername():
    data = request.json
    name = data.get('name')
    if "finished" in name.lower():
        return jsonify({"inappropriate": "yes"})
    
    system_instruction = textwrap.dedent("You are a name checker. You must identify whether or not the provided username is inappropriate or offensive in any way. Reply back only and I mean only with 'yes' or 'no'")
    generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }
    model = genai.GenerativeModel(model_name = 'gemini-1.5-flash',
                             generation_config=generation_config,
                             system_instruction=system_instruction)
    
    chat = model.start_chat(history= [])

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
    
    verify = chat.send_message(name, safety_settings=safety_settings)
    
    if 'yes' in verify.text.lower():
        print(verify.text.lower())
        return jsonify({"inappropriate": "yes"})
    
    return jsonify({"inappropriate": "no"})

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    
    return jsonify(leaderboard.get_leaderboard()), 200

    



if __name__ == '__main__':
    app.run(debug=True)
