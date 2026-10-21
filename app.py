from flask import Flask, jsonify, render_template

app = Flask(__name__)

SCENARIOS_DATA = [
    {
        "id": 1,
        "card": "Card 1: My Child Feels Unsafe",
        "category": "Safeguarding & Child Protection",
        "question": (
            "Your child tells you that an adult or another student has"
            " behaved in a way that makes them feel unsafe. Your child asks"
            " you not to tell anyone. What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Tell your child to forget about it."},
            {
                "key": "B",
                "text": (
                    "Listen calmly, reassure your child and report the concern"
                    " to the Safeguarding Lead."
                ),
            },
            {"key": "C", "text": "Confront the person immediately."},
        ],
        "correct": "B",
        "explanation": (
            "Listen without judgement, reassure your child that they did the"
            " right thing by telling you, and report the concern promptly. Do"
            " not promise secrecy or investigate independently."
        ),
    },
    {
        "id": 2,
        "card": "Card 2: Repeated Bullying",
        "category": "Student Protection",
        "question": (
            "Your child says that classmates repeatedly tease them, exclude"
            " them or send hurtful messages. What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Tell your child to fight back."},
            {
                "key": "B",
                "text": (
                    "Ignore it because children will sort it out."
                ),
            },
            {
                "key": "C",
                "text": (
                    "Listen, record relevant details and report the concern to"
                    " the school."
                ),
            },
        ],
        "correct": "C",
        "explanation": (
            "Take the concern seriously, preserve relevant evidence where"
            " applicable, and contact the class teacher, supervisor or"
            " appropriate school staff. Follow up if the behaviour continues."
        ),
    },
    {
        "id": 3,
        "card": "Card 3: An Online Secret",
        "category": "Digital Safeguarding",
        "question": (
            "An unknown person your child met online asks for personal"
            " photographs and tells your child to keep the conversation secret."
            " What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Allow the conversation to continue."},
            {
                "key": "B",
                "text": (
                    "Reassure your child, prevent further contact where safe,"
                    " preserve evidence and report the concern."
                ),
            },
            {
                "key": "C",
                "text": "Blame your child for talking to a stranger.",
            },
        ],
        "correct": "B",
        "explanation": (
            "Stay calm, avoid blaming the child, preserve relevant messages"
            " and report the concern to the appropriate safeguarding authority"
            " or school team. Seek urgent assistance if there is an immediate"
            " threat."
        ),
    },
    {
        "id": 4,
        "card": "Card 4: My Child Has Become Withdrawn",
        "category": "Mental Health & Wellbeing",
        "question": (
            "Your usually cheerful child has become quiet, irritable and"
            " withdrawn over the past few weeks. What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Assume it is just a phase."},
            {
                "key": "B",
                "text": "Punish your child for being uncommunicative.",
            },
            {
                "key": "C",
                "text": (
                    "Start a gentle conversation, listen and seek support if"
                    " needed."
                ),
            },
        ],
        "correct": "C",
        "explanation": (
            "Changes in behaviour may indicate stress or other difficulties."
            " Offer a safe space to talk and contact the school counsellor or"
            " an appropriate health professional if concerns persist or"
            " intensify."
        ),
    },
    {
        "id": 5,
        "card": "Card 5: Fear of Making Mistakes",
        "category": "Emotional Wellbeing",
        "question": (
            "Your child becomes extremely upset over low marks and says, “I am"
            " a failure. I can never make you proud.” What should you do?"
        ),
        "options": [
            {
                "key": "A",
                "text": (
                    "Compare your child with higher-performing students."
                ),
            },
            {
                "key": "B",
                "text": (
                    "Reassure your child that their worth is not based on marks"
                    " and discuss the pressure they feel."
                ),
            },
            {"key": "C", "text": "Increase study hours immediately."},
        ],
        "correct": "B",
        "explanation": (
            "Validate your child's feelings, encourage realistic goals and"
            " reinforce effort rather than perfection. Seek additional support"
            " if distress persists."
        ),
    },
    {
        "id": 6,
        "card": 'Card 6: “Nobody Likes Me”',
        "category": "Friendship & Belonging",
        "question": (
            "Your child says that nobody likes them and they have no friends at"
            " school. What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Tell your child to stop being sensitive."},
            {
                "key": "B",
                "text": (
                    "Listen, explore what is happening and work with the school"
                    " if support is needed."
                ),
            },
            {
                "key": "C",
                "text": "Immediately tell your child to change schools.",
            },
        ],
        "correct": "B",
        "explanation": (
            "Acknowledge the child's feelings without minimising them. Explore"
            " friendship difficulties and contact the teacher or counsellor if"
            " the child needs help developing social connections or addressing"
            " exclusion."
        ),
    },
    {
        "id": 7,
        "card": "Card 7: Learning Difficulties",
        "category": "Learning & Development",
        "question": (
            "Your child struggles to complete homework, follow instructions"
            " and keep up with classmates despite trying hard. What should"
            " you do?"
        ),
        "options": [
            {"key": "A", "text": "Assume your child is lazy."},
            {"key": "B", "text": "Punish your child for poor performance."},
            {
                "key": "C",
                "text": (
                    "Discuss your observations with the class teacher and"
                    " explore appropriate learning support."
                ),
            },
        ],
        "correct": "C",
        "explanation": (
            "Share specific examples with the teacher. The school may review"
            " the child's learning needs and consider suitable strategies,"
            " assessment or referral through the appropriate support team."
        ),
    },
    {
        "id": 8,
        "card": "Card 8: Repeated Behaviour Concerns",
        "category": "Behaviour & Self-Regulation",
        "question": (
            "The school reports that your child frequently gets into arguments"
            " and struggles to manage anger. What should you do?"
        ),
        "options": [
            {
                "key": "A",
                "text": (
                    "Blame the teacher or other children immediately."
                ),
            },
            {
                "key": "B",
                "text": (
                    "Work with the school to understand triggers and develop"
                    " consistent support strategies."
                ),
            },
            {
                "key": "C",
                "text": "Ignore the concern unless your child complains.",
            },
        ],
        "correct": "B",
        "explanation": (
            "Listen to the school's observations, understand the situations"
            " that trigger the behaviour and agree on practical strategies"
            " that can be reinforced at home and school."
        ),
    },
    {
        "id": 9,
        "card": "Card 9: My Child Is Afraid to Speak",
        "category": "Trust & Communication",
        "question": (
            "Your child says, “If I tell you what happened, you will get angry"
            " with me.” What should you do?"
        ),
        "options": [
            {"key": "A", "text": "Demand an explanation immediately."},
            {
                "key": "B",
                "text": (
                    "Reassure your child that you will listen calmly and help"
                    " them."
                ),
            },
            {"key": "C", "text": "Tell your child they should never keep secrets."},
        ],
        "correct": "B",
        "explanation": (
            "Create a non-judgemental environment. Thank your child for trusting"
            " you, avoid pressuring them for details and explain that you may"
            " need to involve a trusted professional to help keep them safe."
        ),
    },
    {
        "id": 10,
        "card": "Card 10: I Reported a Concern, but Nothing Seems to Change",
        "category": "Reporting & Follow-Up",
        "question": (
            "You reported a concern to the school, but the problem appears to"
            " be continuing. What should you do?"
        ),
        "options": [
            {
                "key": "A",
                "text": "Give up because you have already reported it.",
            },
            {"key": "B", "text": "Discuss it publicly in parent groups."},
            {
                "key": "C",
                "text": (
                    "Follow up directly with the appropriate school staff and"
                    " provide any new information."
                ),
            },
        ],
        "correct": "C",
        "explanation": (
            "Use the school's approved reporting channel, refer to the earlier"
            " concern and explain what has continued or changed. For an"
            " immediate safety risk, contact the School Safeguarding Lead or"
            " leadership directly."
        ),
    },
]


@app.route("/")
def index():
  return render_template("index.html")


@app.route("/api/scenarios")
def get_scenarios():
  return jsonify(SCENARIOS_DATA)


if __name__ == "__main__":
  app.run(debug=True, port=5000)