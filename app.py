import json
from flask import Flask, jsonify, render_template

app = Flask(__name__)


def load_scenarios():
  with open('scenarios.json', 'r', encoding='utf-8') as f:
    return json.load(f)


@app.route('/')
def index():
  return render_template('index.html')


@app.route('/api/scenarios')
def get_scenarios():
  return jsonify(load_scenarios())


if __name__ == '__main__':
  app.run(debug=True, port=5000)