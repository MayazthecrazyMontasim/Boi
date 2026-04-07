from flask import Flask, render_template

app = Flask(__name__)

# Controller Route: Handles the main entry point
@app.route('/')
def index():
    # Renders the main View for the user
    return render_template('index.html')

# Vercel requires the app variable to be available for the serverless function.
if __name__ == '__main__':
    app.run(debug=True)
